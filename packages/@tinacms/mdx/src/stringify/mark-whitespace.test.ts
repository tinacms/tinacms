import type { RichTextField } from '@tinacms/schema-tools';
import { describe, expect, it } from 'vitest';
import { parseMDX } from '../parse';
import type * as Plate from '../parse/plate';
import { serializeMDX } from './index';

const passthrough = (value: string) => value;

const NBSP = '\u00a0';

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

const serializeRoot = (
  value: Plate.RootElement,
  field: RichTextField
): string => {
  const result = serializeMDX(value, field, passthrough);
  if (typeof result !== 'string') {
    throw new Error(`Expected a string, received ${typeof result}`);
  }
  return result;
};

const serialize = (
  children: Plate.InlineElement[],
  field: RichTextField
): string => serializeRoot(paragraph(children), field);

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

  it('keeps a trailing non-breaking space when no mark is involved', () => {
    expect(serialize([{ type: 'text', text: `hello${NBSP}` }], field)).toBe(
      `hello${NBSP}\n`
    );
  });

  it('keeps non-breaking space indentation before a link', () => {
    expect(
      serialize(
        [
          { type: 'text', text: NBSP.repeat(2) },
          {
            type: 'a',
            url: 'https://e.com',
            title: null,
            children: [{ type: 'text', text: 'Watch' }],
          },
        ] as Plate.InlineElement[],
        field
      )
    ).toBe(`${NBSP.repeat(2)}[Watch](https://e.com)\n`);
  });

  it('keeps a leading space on a heading', () => {
    expect(
      serializeRoot(
        {
          type: 'root',
          children: [
            { type: 'h2', children: [{ type: 'text', text: ' Title' }] },
          ],
        } as Plate.RootElement,
        field
      )
    ).toBe('## &#x20;Title\n');
  });

  it('writes author indentation so it comes back as a paragraph', () => {
    const markdown = serialize([{ type: 'text', text: '    word' }], field);
    expect(markdown).toBe('&#x20;   word\n');
    expect(
      (parseMDX(markdown, field, passthrough) as Plate.RootElement).children
    ).toEqual([{ type: 'p', children: [{ type: 'text', text: '    word' }] }]);
  });

  it('leaves author indentation next to whitespace the hoist moved', () => {
    expect(
      serialize(
        [
          { type: 'text', text: '   ' },
          { type: 'text', text: ' bold', bold: true },
        ],
        field
      )
    ).toBe('&#x20;   **bold**\n');
  });

  it('keeps a whitespace-only spacer paragraph', () => {
    const markdown = serializeRoot(
      {
        type: 'root',
        children: [
          { type: 'p', children: [{ type: 'text', text: 'one' }] },
          { type: 'p', children: [{ type: 'text', text: NBSP }] },
          { type: 'p', children: [{ type: 'text', text: 'two' }] },
        ],
      } as Plate.RootElement,
      field
    );
    expect(
      (parseMDX(markdown, field, passthrough) as Plate.RootElement).children
    ).toHaveLength(3);
  });
});

describe.each(fields)('table cells (%s parser)', (_, field) => {
  const cell = (children: Plate.InlineElement[]) => ({
    type: 'td',
    children: [{ type: 'p', children }],
  });

  /**
   * GFM strips whatever sits against the cell delimiters, so author whitespace
   * at a cell edge cannot survive a reload no matter what is written. Pinning
   * that here so nobody extends the author carve-out to cells expecting it to.
   */
  it('discards author whitespace at a cell edge on reload', () => {
    const markdown = serializeRoot(
      {
        type: 'root',
        children: [
          {
            type: 'table',
            children: [
              {
                type: 'tr',
                children: [cell([{ type: 'text', text: 'head' }])],
              },
              {
                type: 'tr',
                children: [
                  cell([
                    { type: 'text', text: 'word ', bold: true },
                    { type: 'text', text: '  ' },
                  ]),
                ],
              },
            ],
          },
        ],
      } as unknown as Plate.RootElement,
      field
    );
    const [table] = (
      parseMDX(markdown, field, passthrough) as Plate.RootElement
    ).children as any[];
    const [, row] = table.children;
    expect(row.children[0].children[0].children).toEqual([
      { type: 'text', text: 'word', bold: true },
    ]);
  });
});

describe.each(fields)('interior whitespace (%s parser)', (_, field) => {
  it('is preserved when a mark wraps other marks', () => {
    const markdown = '**Hello *world*, again**\n';
    const tree = parseMDX(markdown, field, passthrough) as Plate.RootElement;
    expect(serializeMDX(tree, field, passthrough)).toBe(markdown);
  });
});
