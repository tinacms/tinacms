import type { RichTextField } from '@tinacms/schema-tools';
import { describe, expect, it } from 'vitest';
import { parseMDX } from '../parse';
import type * as Plate from '../parse/plate';
import { serializeMDX } from './index';

const passthrough = (v: string) => v;

const paragraph = (children: Plate.TextElement[]): Plate.RootElement => ({
  type: 'root',
  children: [{ type: 'p', children }],
});

describe('grouping marked text', () => {
  const field: RichTextField = { name: 'body', type: 'rich-text' };

  it('only wraps the neighbours that carry the mark', () => {
    const value = paragraph([
      { type: 'text', text: 'a', bold: true, italic: true },
      { type: 'text', text: 'b', italic: true },
    ]);
    const string = serializeMDX(value, field, passthrough);
    expect(string).toBe('***a**b*\n');
    expect(parseMDX(string as string, field, passthrough)).toEqual(value);
  });

  it('keeps unbolded highlighted text out of the bold run', () => {
    const value = paragraph([
      { type: 'text', text: 'a', bold: true, highlight: true },
      { type: 'text', text: 'b', highlight: true },
    ]);
    const string = serializeMDX(value, field, passthrough);
    expect(string).toBe('<mark>**a**b</mark>\n');
    expect(parseMDX(string as string, field, passthrough)).toEqual(value);
  });
});

describe.each<[string, RichTextField, string]>([
  [
    'mdx',
    { name: 'body', type: 'rich-text' },
    '<span style={{ color: "#CC4141" }}>`beta`</span>',
  ],
  [
    'markdown',
    { name: 'body', type: 'rich-text', parser: { type: 'markdown' } },
    '<span style="color: #CC4141">`beta`</span>',
  ],
])('inline code beside other formatting (%s)', (_, field, coloured) => {
  it.each<[string, Plate.TextElement[], string]>([
    [
      'colour',
      [
        { type: 'text', text: 'alpha ', code: true },
        { type: 'text', text: 'beta', code: true, textColor: '#CC4141' },
      ],
      `\`alpha \`${coloured}\n`,
    ],
    [
      'bold',
      [
        { type: 'text', text: 'npm ', code: true },
        { type: 'text', text: 'install', code: true, bold: true },
        { type: 'text', text: ' first' },
      ],
      '`npm `**`install`** first\n',
    ],
  ])('keeps the code innermost under %s', (_, children, expected) => {
    const value = paragraph(children);
    const string = serializeMDX(value, field, passthrough);
    expect(string).toBe(expected);
    expect(parseMDX(string as string, field, passthrough)).toEqual(value);
  });

  it('writes code split only by underline as one span', () => {
    const underlined = {
      type: 'text' as const,
      text: 'def',
      code: true,
      underline: true,
    };
    const value = paragraph([
      { type: 'text', text: 'abc', code: true },
      underlined,
    ]);
    const string = serializeMDX(value, field, passthrough);
    expect(string).toBe('`abcdef`\n');
    expect(parseMDX(string as string, field, passthrough)).toEqual(
      paragraph([{ type: 'text', text: 'abcdef', code: true }])
    );
  });
});

describe('nested colours', () => {
  const field: RichTextField = { name: 'body', type: 'rich-text' };
  const markdownField: RichTextField = {
    ...field,
    parser: { type: 'markdown' },
  };

  it.each([
    [
      'mdx',
      field,
      '<mark style={{ color: "#CC4141" }}>red <span style={{ color: "#2563EB" }}>blue</span></mark>',
    ],
    [
      'markdown',
      markdownField,
      '<mark style="color: #CC4141">red <span style="color: #2563EB">blue</span></mark>',
    ],
  ])('lets the inner colour win (%s)', (_, field, input) => {
    expect(parseMDX(input, field, passthrough)).toEqual(
      paragraph([
        { type: 'text', text: 'red ', highlight: true, textColor: '#CC4141' },
        { type: 'text', text: 'blue', highlight: true, textColor: '#2563EB' },
      ])
    );
  });
});

describe('unsafe colours', () => {
  const field: RichTextField = { name: 'body', type: 'rich-text' };

  it('are never written out', () => {
    const value = paragraph([
      { type: 'text', text: 'a', textColor: 'red;position:fixed' },
      {
        type: 'text',
        text: 'b',
        highlight: true,
        highlightColor: 'url(https://evil/x)',
      },
    ]);
    expect(serializeMDX(value, field, passthrough)).toBe('a<mark>b</mark>\n');
  });
});

describe.each<[string, RichTextField]>([
  ['mdx', { name: 'body', type: 'rich-text' }],
  [
    'markdown',
    { name: 'body', type: 'rich-text', parser: { type: 'markdown' } },
  ],
])('marks whose edge is punctuation beside a letter (%s)', (_, field) => {
  it.each<[string, Plate.TextElement[]]>([
    [
      'closing inside a highlight',
      [
        { type: 'text', text: 'a.', bold: true, italic: true, highlight: true },
        { type: 'text', text: 'b', bold: true, highlight: true },
      ],
    ],
    [
      'opening inside a highlight',
      [
        { type: 'text', text: 'x', bold: true, highlight: true },
        { type: 'text', text: '.a', bold: true, italic: true, highlight: true },
      ],
    ],
    [
      'closing without a highlight',
      [
        { type: 'text', text: 'a.', bold: true, italic: true },
        { type: 'text', text: 'b', bold: true },
      ],
    ],
  ])('keeps the mark %s', (_, children) => {
    const value = paragraph(children);
    const string = serializeMDX(value, field, passthrough);
    expect(parseMDX(string as string, field, passthrough)).toEqual(value);
  });
});

describe.each<[string, RichTextField]>([
  ['mdx', { name: 'body', type: 'rich-text' }],
  [
    'markdown',
    { name: 'body', type: 'rich-text', parser: { type: 'markdown' } },
  ],
])('line breaks inside a colour (%s)', (_, field) => {
  it('keeps the break inside one element', () => {
    const value: Plate.RootElement = {
      type: 'root',
      children: [
        {
          type: 'p',
          children: [
            { type: 'text', text: 'x', highlight: true },
            { type: 'break', children: [{ type: 'text', text: '' }] },
            { type: 'text', text: 'y', highlight: true },
          ],
        },
      ],
    };
    const string = serializeMDX(value, field, passthrough);
    expect(string).toBe('<mark>x\\\ny</mark>\n');
    expect(parseMDX(string as string, field, passthrough)).toEqual(value);
  });
});
