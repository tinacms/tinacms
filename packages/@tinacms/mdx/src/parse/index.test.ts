import { describe, expect, it } from 'vitest';
import type { RichTextField } from '@tinacms/schema-tools';
import { parseMDX } from './index';
import { serializeMDX } from '../stringify';

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
  describe('error recovery — unsupported or malformed input', () => {
    it('returns invalid_markdown for JSX child expressions in registered components', () => {
      // User writes <Cta>{name}</Cta> — {name} is a JS expression, not supported
      const input = '<Cta>{name}</Cta>';
      const tree = parseMDX(input, field, passthrough);

      expect(tree.children).toHaveLength(1);
      expect(tree.children[0]).toMatchObject({
        type: 'invalid_markdown',
        value: input,
        message: 'Unexpected expression name.',
      });
    });

    it('preserves the original string when serializing an invalid_markdown node', () => {
      // After parsing fails, saving the file must not lose the original content
      const input = '<Cta>{name}</Cta>';
      const tree = parseMDX(input, field, passthrough);

      expect(serializeMDX(tree, field, passthrough)).toBe(input);
    });

    it('returns invalid_markdown for malformed MDX and preserves the original input', () => {
      // User's file has a broken/truncated tag on disk
      const input = '<Cta';
      const tree = parseMDX(input, field, passthrough);

      expect(tree.children).toHaveLength(1);
      expect(tree.children[0]).toMatchObject({
        type: 'invalid_markdown',
        value: input,
      });
      expect(tree.children[0]).toHaveProperty('message');
      expect(serializeMDX(tree, field, passthrough)).toBe(input);
    });
  });
});
