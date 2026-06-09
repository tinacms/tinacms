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

const slateField: RichTextField = {
  name: 'body',
  type: 'rich-text',
  parser: { type: 'slatejson' },
};

describe('parseMDX', () => {
  describe('slatejson URL sanitization', () => {
    it('clears an unsafe URL stored on a link node', () => {
      const input = {
        type: 'root',
        children: [
          {
            type: 'a',
            url: 'javascript:alert(1)',
            children: [{ type: 'text', text: 'link' }],
          },
        ],
      };
      const tree = parseMDX(input as any, slateField, passthrough);
      expect((tree.children[0] as any).url).toBe('');
    });

    it('clears an unsafe URL stored on an image node', () => {
      const input = {
        type: 'root',
        children: [
          { type: 'img', url: 'javascript:alert(1)', children: [] },
        ],
      };
      const tree = parseMDX(input as any, slateField, passthrough);
      expect((tree.children[0] as any).url).toBe('');
    });

    it('clears an unsafe URL on a link nested inside other nodes', () => {
      const input = {
        type: 'root',
        children: [
          {
            type: 'p',
            children: [
              {
                type: 'a',
                url: 'data:text/html,<p>hi</p>',
                children: [{ type: 'text', text: 'link' }],
              },
            ],
          },
        ],
      };
      const tree = parseMDX(input as any, slateField, passthrough);
      expect((tree.children[0] as any).children[0].url).toBe('');
    });

    it('clears an unsafe URL nested under props.children', () => {
      const input = {
        type: 'root',
        children: [
          {
            type: 'mdxJsxFlowElement',
            name: 'Cta',
            props: {
              children: {
                type: 'root',
                children: [
                  {
                    type: 'a',
                    url: 'javascript:alert(1)',
                    children: [{ type: 'text', text: 'link' }],
                  },
                  { type: 'img', url: 'javascript:alert(1)', children: [] },
                ],
              },
            },
            children: [{ type: 'text', text: '' }],
          },
        ],
      };
      const tree = parseMDX(input as any, slateField, passthrough);
      const nested = (tree.children[0] as any).props.children.children;
      expect(nested[0].url).toBe('');
      expect(nested[1].url).toBe('');
    });

    it('leaves arbitrary props untouched', () => {
      const input = {
        type: 'root',
        children: [
          {
            type: 'mdxJsxFlowElement',
            name: 'Embed',
            props: {
              // A prop literally named `url` is not a slate node and must be left as-is
              url: 'javascript:alert(1)',
              // A `children` prop that is not slate content must be left as-is
              children: 'javascript:alert(1)',
            },
            children: [{ type: 'text', text: '' }],
          },
        ],
      };
      const tree = parseMDX(input as any, slateField, passthrough);
      const props = (tree.children[0] as any).props;
      expect(props.url).toBe('javascript:alert(1)');
      expect(props.children).toBe('javascript:alert(1)');
    });

    it('preserves a safe link URL', () => {
      const input = {
        type: 'root',
        children: [
          {
            type: 'a',
            url: 'https://example.com/path',
            children: [{ type: 'text', text: 'link' }],
          },
        ],
      };
      const tree = parseMDX(input as any, slateField, passthrough);
      expect((tree.children[0] as any).url).toBe('https://example.com/path');
    });
  });

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
