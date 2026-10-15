import type { RichTextField } from '@tinacms/schema-tools';
import { describe, expect, it } from 'vitest';
import { parseMDX } from './parse';
import { serializeMDX } from './stringify';

const passthrough = (value: string) => value;
const mdxField: RichTextField = { name: 'body', type: 'rich-text' };
const templateField = {
  name: 'body',
  type: 'rich-text',
  templates: [
    {
      name: 'Cta',
      label: 'Cta',
      fields: [{ name: 'children', type: 'rich-text' }],
    },
  ],
} as unknown as RichTextField;

const item = (text: string) => ({
  type: 'li',
  children: [{ type: 'lic', children: [{ type: 'text', text }] }],
});
const ul = (...items: string[]) => ({ type: 'ul', children: items.map(item) });
const ol = (...items: string[]) => ({ type: 'ol', children: items.map(item) });
const root = (...children: unknown[]) => ({ type: 'root', children }) as never;

const roundTrip = (tree: never) => {
  const markdown = serializeMDX(tree, mdxField, passthrough) as string;
  return { markdown, parsed: parseMDX(markdown, mdxField, passthrough) };
};

describe('adjacent lists in an mdx field', () => {
  it('separates two bullet lists by switching the bullet', () => {
    const { markdown, parsed } = roundTrip(root(ul('A'), ul('B')));
    expect(markdown).toBe('* A\n\n- B\n');
    expect(parsed.children.map((c) => c.type)).toEqual(['ul', 'ul']);
  });

  it('separates two ordered lists by switching the delimiter', () => {
    const { markdown, parsed } = roundTrip(root(ol('A'), ol('B')));
    expect(markdown).toBe('1. A\n\n1) B\n');
    expect(parsed.children.map((c) => c.type)).toEqual(['ol', 'ol']);
  });

  it('alternates across three bullet lists', () => {
    const { markdown, parsed } = roundTrip(root(ul('A'), ul('B'), ul('C')));
    expect(markdown).toBe('* A\n\n- B\n\n* C\n');
    expect(parsed.children.map((c) => c.type)).toEqual(['ul', 'ul', 'ul']);
  });

  it('writes the parsed result back unchanged', () => {
    const { markdown, parsed } = roundTrip(root(ul('A'), ul('B'), ul('C')));
    expect(serializeMDX(parsed, mdxField, passthrough)).toBe(markdown);
  });

  it('separates two bullet lists inside a template', () => {
    const embed = {
      type: 'mdxJsxFlowElement',
      name: 'Cta',
      props: { children: root(ul('A'), ul('B')) },
      children: [{ type: 'text', text: '' }],
    };
    expect(serializeMDX(root(embed), templateField, passthrough)).toBe(
      '<Cta>\n  * A\n\n  - B\n</Cta>\n'
    );
  });
});
