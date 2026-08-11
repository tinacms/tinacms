import type { RichTextField } from '@tinacms/schema-tools';
import { describe, expect, it } from 'vitest';
import { parseMDX } from '../parse';
import type * as Plate from '../parse/plate';
import { serializeMDX } from './index';

const passthrough = (value: string) => value;

const fields: [string, RichTextField][] = [
  ['mdx', { name: 'body', type: 'rich-text' }],
  [
    'markdown',
    { name: 'body', type: 'rich-text', parser: { type: 'markdown' } },
  ],
];

const paragraph = (children: Plate.InlineElement[]): Plate.RootElement => ({
  type: 'root',
  children: [{ type: 'p', children }],
});

const serialize = (
  children: Plate.InlineElement[],
  field: RichTextField
): string => {
  const result = serializeMDX(paragraph(children), field, passthrough);
  if (typeof result !== 'string') {
    throw new Error(`Expected a string, received ${typeof result}`);
  }
  return result;
};

const boldTextsOf = (markdown: string, field: RichTextField): string[] => {
  const bolds: string[] = [];
  const walk = (nodes: { bold?: boolean; text?: string; children?: any[] }[]) =>
    nodes?.forEach((node) => {
      if (node.bold) {
        bolds.push(node.text ?? '');
      }
      if (node.children) {
        walk(node.children);
      }
    });
  walk((parseMDX(markdown, field, passthrough) as Plate.RootElement).children);
  return bolds;
};

describe.each(fields)('bold with edge whitespace (%s parser)', (_, field) => {
  it('keeps a trailing space outside the bold markers', () => {
    expect(
      serialize(
        [
          { type: 'text', text: 'Some ' },
          { type: 'text', text: 'word ', bold: true },
          { type: 'text', text: 'more' },
        ],
        field
      )
    ).toBe('Some **word** more\n');
  });

  it('keeps a leading space outside the bold markers', () => {
    expect(
      serialize(
        [
          { type: 'text', text: 'Some' },
          { type: 'text', text: ' word', bold: true },
          { type: 'text', text: ' more' },
        ],
        field
      )
    ).toBe('Some **word** more\n');
  });

  it('keeps whitespace on both sides outside the bold markers', () => {
    expect(
      serialize(
        [
          { type: 'text', text: 'Some' },
          { type: 'text', text: ' word ', bold: true },
          { type: 'text', text: 'more' },
        ],
        field
      )
    ).toBe('Some **word** more\n');
  });

  it('emits markdown that reparses as bold', () => {
    const markdown = serialize(
      [
        { type: 'text', text: 'Some ' },
        { type: 'text', text: 'word ', bold: true },
        { type: 'text', text: 'more' },
      ],
      field
    );
    expect(boldTextsOf(markdown, field)).toEqual(['word']);
  });
});
