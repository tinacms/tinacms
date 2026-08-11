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

describe.each(fields)(
  'other marks with edge whitespace (%s parser)',
  (_, field) => {
    it('keeps whitespace outside the emphasis markers', () => {
      expect(
        serialize(
          [
            { type: 'text', text: 'Some ' },
            { type: 'text', text: 'word ', italic: true },
            { type: 'text', text: 'more' },
          ],
          field
        )
      ).toBe('Some *word* more\n');
    });

    it('keeps whitespace outside the strikethrough markers', () => {
      expect(
        serialize(
          [
            { type: 'text', text: 'Some ' },
            { type: 'text', text: 'word ', strikethrough: true },
            { type: 'text', text: 'more' },
          ],
          field
        )
      ).toBe('Some ~~word~~ more\n');
    });

    it('keeps whitespace outside combined bold and emphasis markers', () => {
      expect(
        serialize(
          [
            { type: 'text', text: 'Some ' },
            { type: 'text', text: 'word ', bold: true, italic: true },
            { type: 'text', text: 'more' },
          ],
          field
        )
      ).toBe('Some ***word*** more\n');
    });

    it('keeps whitespace outside a mark nested in a link', () => {
      expect(
        serialize(
          [
            {
              type: 'a',
              url: 'https://example.com',
              children: [
                { type: 'text', text: 'word ', bold: true },
                { type: 'text', text: 'tail' },
              ],
            },
            { type: 'text', text: 'after' },
          ],
          field
        )
      ).toBe('[**word** tail](https://example.com)after\n');
    });
  }
);

describe.each(fields)('degenerate marked nodes (%s parser)', (_, field) => {
  it('drops the markers from a whitespace-only mark', () => {
    expect(
      serialize(
        [
          { type: 'text', text: 'Some' },
          { type: 'text', text: ' ', bold: true },
          { type: 'text', text: 'more' },
        ],
        field
      )
    ).toBe('Some more\n');
  });

  it('drops the markers from an empty mark', () => {
    expect(
      serialize(
        [
          { type: 'text', text: 'Some ' },
          { type: 'text', text: '', bold: true },
          { type: 'text', text: 'more' },
        ],
        field
      )
    ).toBe('Some more\n');
  });

  it('takes the trailing space from the last node of a marked run', () => {
    expect(
      serialize(
        [
          { type: 'text', text: 'a', bold: true },
          { type: 'text', text: 'b ', bold: true },
          { type: 'text', text: 'more' },
        ],
        field
      )
    ).toBe('**ab** more\n');
  });
});

describe.each(fields)('block boundaries (%s parser)', (_, field) => {
  it('does not leave whitespace at the end of the block', () => {
    expect(
      serialize([{ type: 'text', text: 'word ', bold: true }], field)
    ).toBe('**word**\n');
  });

  it('does not indent the block when the mark has leading whitespace', () => {
    expect(
      serialize([{ type: 'text', text: '    word', bold: true }], field)
    ).toBe('**word**\n');
  });
});

describe.each(fields)('interior whitespace (%s parser)', (_, field) => {
  it('is preserved when a mark wraps other marks', () => {
    const markdown = '**Hello *world*, again**\n';
    const tree = parseMDX(markdown, field, passthrough) as Plate.RootElement;
    expect(serializeMDX(tree, field, passthrough)).toBe(markdown);
  });
});
