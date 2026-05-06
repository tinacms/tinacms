import { describe, expect, it } from 'vitest';
import type { RichTextField } from '@tinacms/schema-tools';
import { parseMDX } from './index';

// parseMDX and serializeMDX require an image URL callback to transform image src values.
// In tests we don't worry about image transformation, so we pass this no-op that returns the URL unchanged.
const passthrough = (value: string) => value;

const field: RichTextField = {
  name: 'body',
  type: 'rich-text',
  parser: { type: 'mdx' },
  templates: [
    {
      name: 'Cta',
      label: 'Call to action',
      fields: [
        { name: 'text', type: 'string' },
        { name: 'children', type: 'rich-text' },
      ],
    },
  ],
};

describe('parseMDX', () => {
  describe('parser type routing — markdown vs mdx', () => {
    it('parser.type markdown treats JS expressions as plain text; parser.type mdx fails on the same input', () => {
      // This input is valid markdown but invalid MDX (JS expression inside {…} is not valid JS)
      const input = '{ import { foo } from "bar.js"\n\nHello, {world!}';
      const markdownField = { ...field, parser: { type: 'markdown' } } as const;
      const mdxField = { ...field, parser: { type: 'mdx' } } as const;
      const markdownTree = parseMDX(input, markdownField, passthrough);
      const mdxTree = parseMDX(input, mdxField, passthrough);
      // 'markdown' parser (next/parse/index.ts) treats { as plain text
      expect(markdownTree.children[0]?.type).toBe('p');
      // 'mdx' parser (legacy path in parse/index.ts) tries to evaluate the JS expression and fails
      expect(mdxTree.children[0]?.type).toBe('invalid_markdown');
    });
  });
});
