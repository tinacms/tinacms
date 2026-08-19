import type { RichTextField } from '@tinacms/schema-tools';
import { describe, expect, it } from 'vitest';
import { parseMDX } from './parse';
import { serializeMDX } from './stringify';

/**
 * Link children go through `staticPhrasingContent`, a narrower switch than the
 * `phrasingContent` one used everywhere else. Anything it is missing throws,
 * and the whole rich-text field renders as an `invalid_markdown` blob — so a
 * gap here costs the document, not just the link.
 */

const passthrough = (value: string) => value;

const markdownField: RichTextField = {
  name: 'body',
  type: 'rich-text',
  parser: { type: 'markdown' },
};

const mdxField: RichTextField = {
  name: 'body',
  type: 'rich-text',
};

const INSIDE_A_LINK = {
  'a hard break': '[a\\\nb](/x)\n',
  strikethrough: '[~~a~~](/x)\n',
  bold: '[**a**](/x)\n',
  italic: '[_a_](/x)\n',
  'inline code': '[`a`](/x)\n',
  'an image': '[![alt](/i.png)](/x)\n',
};

describe.each([
  ['markdown', markdownField],
  ['mdx', mdxField],
])('%s parser, link children', (_name, field) => {
  it.each(Object.entries(INSIDE_A_LINK))('parses %s', (_label, source) => {
    const tree = parseMDX(source, field, passthrough);
    expect(tree.children[0]).not.toMatchObject({ type: 'invalid_markdown' });
  });

  it.each(Object.entries(INSIDE_A_LINK))(
    'round-trips %s to a fixed point',
    (_label, source) => {
      const written = serializeMDX(
        parseMDX(source, field, passthrough),
        field,
        passthrough
      ) as string;
      const again = serializeMDX(
        parseMDX(written, field, passthrough),
        field,
        passthrough
      ) as string;
      expect(again).toBe(written);
    }
  );
});
