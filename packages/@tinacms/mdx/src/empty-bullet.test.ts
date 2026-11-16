import type { RichTextField } from '@tinacms/schema-tools';
import { describe, expect, it } from 'vitest';
import { parseMDX } from './parse';
import { serializeMDX } from './stringify';

const passthrough = (value: string) => value;

const fields: Record<string, RichTextField> = {
  markdown: { name: 'body', type: 'rich-text', parser: { type: 'markdown' } },
  mdx: { name: 'body', type: 'rich-text' },
};

const list = (type: 'ul' | 'ol', children: unknown[]) =>
  ({
    type: 'root',
    children: [{ type, children }],
  }) as Parameters<typeof serializeMDX>[0];

describe.each(Object.entries(fields))('empty bullet (%s field)', (_, field) => {
  const save = (tree: Parameters<typeof serializeMDX>[0]) =>
    serializeMDX(tree, field, passthrough);

  it('writes an li with only an empty text child as an empty bullet', () => {
    const out = save(list('ul', [{ type: 'li', children: [{ text: '' }] }]));
    expect(out).toMatch(/^[*-]\n?$/);
  });

  it('writes an li with no children without throwing', () => {
    expect(() =>
      save(list('ul', [{ type: 'li', children: [] }]))
    ).not.toThrow();
  });

  it('keeps non-empty bare text', () => {
    expect(
      save(list('ul', [{ type: 'li', children: [{ text: 'x' }] }]))
    ).toMatch(/^[*-] x\n$/);
    expect(
      save(
        list('ul', [{ type: 'li', children: [{ type: 'text', text: 'x' }] }])
      )
    ).toMatch(/^[*-] x\n$/);
  });

  it('is stable across repeated saves with an empty middle bullet', () => {
    const first = save(
      list('ul', [
        { type: 'li', children: [{ type: 'lic', children: [{ text: 'a' }] }] },
        { type: 'li', children: [{ text: '' }] },
        { type: 'li', children: [{ type: 'lic', children: [{ text: 'b' }] }] },
      ])
    ) as string;
    const tree = parseMDX(first, field, passthrough);
    const second = save(tree);
    expect(second).toBe(first);
    expect((tree.children[0] as { children: unknown[] }).children).toHaveLength(
      3
    );
  });

  it('saves an empty bullet nested in another list', () => {
    expect(() =>
      save(
        list('ul', [
          {
            type: 'li',
            children: [
              { type: 'lic', children: [{ text: 'a' }] },
              list('ul', [{ type: 'li', children: [{ text: '' }] }])
                .children[0],
            ],
          },
        ])
      )
    ).not.toThrow();
  });

  it('saves an empty numbered item', () => {
    expect(() =>
      save(list('ol', [{ type: 'li', children: [{ text: '' }] }]))
    ).not.toThrow();
  });
});
