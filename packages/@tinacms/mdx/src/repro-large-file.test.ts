import { describe, it, expect } from 'vitest';
import type { RichTextField } from '@tinacms/schema-tools';
import { parseMDX } from './parse';
import { serializeMDX } from './stringify';

const field: RichTextField = {
  name: '_body',
  type: 'rich-text',
  parser: { type: 'mdx' },
  templates: [
    {
      name: 'BlockQuote',
      label: 'Block Quote',
      fields: [
        { name: 'children', label: 'Quote', type: 'rich-text' },
        { name: 'authorName', label: 'Author', type: 'string' },
      ],
    },
    {
      name: 'DateTime',
      label: 'Date & Time',
      inline: true,
      fields: [
        {
          name: 'format',
          label: 'Format',
          type: 'string',
          options: ['utc', 'iso', 'local'],
        },
      ],
    },
    {
      name: 'NewsletterSignup',
      label: 'Newsletter Sign Up',
      fields: [
        { name: 'children', label: 'CTA', type: 'rich-text' },
        { name: 'placeholder', label: 'Placeholder', type: 'string' },
        { name: 'buttonText', label: 'Button Text', type: 'string' },
        { name: 'disclaimer', label: 'Disclaimer', type: 'rich-text' },
      ],
    },
  ],
};

const SECTION = `
# Vote For Pedro

Hello, the current date is <DateTime format="local" />. Some text after.

***

\`\`\`graphql
query MyQuery($relativePath: String!) {
  page(relativePath: $relativePath) {
    title
  }
}
\`\`\`

> A blockquote.

![alt](/uploads/x.jpg)

Some more text.

<NewsletterSignup
  placeholder="Enter your email"
  buttonText="Notify Me"
  disclaimer={<>
    We care. Read our [Privacy Policy](http://example.com).
  </>}
>
  ## Stay in touch!

  Anim aute id magna aliqua.
</NewsletterSignup>

### A list heading

* item 1
* item 2

***

<BlockQuote authorName="Uncle Rico">
  How much you wanna bet?
</BlockQuote>
`;

describe('large-file round trip', () => {
  it('preserves the first DateTime inline embed', () => {
    const input = SECTION + SECTION; // two sections, like the real file
    const tree = parseMDX(input, field, (v) => v);
    const result = serializeMDX(tree, field, (v) => v);
    const out = typeof result === 'string' ? result : '';

    const datetimeCount = (out.match(/<DateTime/g) ?? []).length;
    expect(datetimeCount).toBe(2);
  });

  it('preserves NewsletterSignup blocks unescaped', () => {
    const input = SECTION;
    const tree = parseMDX(input, field, (v) => v);
    const result = serializeMDX(tree, field, (v) => v);
    const out = typeof result === 'string' ? result : '';

    expect(out).not.toContain('\\<NewsletterSignup');
    expect(out).toContain('<NewsletterSignup');
  });

  it('shows the first parsed paragraph contents', () => {
    const tree = parseMDX(SECTION, field, (v) => v);
    // print so we can inspect what the parser thinks the first paragraph is
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(tree, null, 2));
  });
});
