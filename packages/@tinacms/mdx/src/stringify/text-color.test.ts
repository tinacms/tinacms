import type { RichTextField } from '@tinacms/schema-tools';
import { describe, expect, it } from 'vitest';
import { parseMDX } from '../parse';
import type * as Plate from '../parse/plate';
import { serializeMDX } from './index';

const passthrough = (v: string) => v;

const paragraph = (children: Plate.InlineElement[]): Plate.RootElement => ({
  type: 'root',
  children: [{ type: 'p', children }],
});

const red = '#CC4141';

const mdx: RichTextField = { name: 'body', type: 'rich-text' };
const markdown: RichTextField = { ...mdx, parser: { type: 'markdown' } };

const roundTrip = (children: Plate.InlineElement[], field: RichTextField) => {
  const value = paragraph(children);
  const string = serializeMDX(value, field, passthrough);
  expect(parseMDX(string as string, field, passthrough)).toEqual(value);
  return string;
};

describe('grouping marked text', () => {
  it('only wraps the neighbours that carry the mark', () => {
    expect(
      roundTrip(
        [
          { type: 'text', text: 'a', bold: true, italic: true },
          { type: 'text', text: 'b', italic: true },
        ],
        mdx
      )
    ).toBe('***a**b*\n');
  });

  it('keeps highlight innermost so the other marks stay', () => {
    expect(
      roundTrip(
        [
          { type: 'text', text: 'a', italic: true, highlight: true },
          { type: 'text', text: 'b', highlight: true },
        ],
        mdx
      )
    ).toBe('*<mark>a</mark>*<mark>b</mark>\n');
  });
});

describe.each<[string, RichTextField, (text: string) => string]>([
  ['mdx', mdx, (text) => `<span style={{ color: "${red}" }}>${text}</span>`],
  [
    'markdown',
    markdown,
    (text) => `<span style="color: ${red}">${text}</span>`,
  ],
])('text colour (%s)', (_, field, span) => {
  it('writes one span per piece of text', () => {
    expect(
      roundTrip(
        [
          { type: 'text', text: 'red', textColor: red },
          { type: 'text', text: ' ' },
          { type: 'text', text: 'bold', bold: true, textColor: red },
          { type: 'text', text: ' ' },
          { type: 'text', text: 'red', textColor: red },
        ],
        field
      )
    ).toBe(`${span('red')} **${span('bold')}** ${span('red')}\n`);
  });

  it('keeps edge whitespace outside the span and the delimiters', () => {
    const value = paragraph([
      { type: 'text', text: 'bold red ', bold: true, textColor: red },
      { type: 'text', text: 'next' },
    ]);
    expect(serializeMDX(value, field, passthrough)).toBe(
      `**${span('bold red')}** next\n`
    );
  });

  it('keeps bold, italic and strikethrough outside the span', () => {
    expect(
      roundTrip(
        [
          { type: 'text', text: 'a ' },
          {
            type: 'text',
            text: 'b',
            bold: true,
            italic: true,
            strikethrough: true,
            textColor: red,
          },
        ],
        field
      )
    ).toBe(`a ***~~${span('b')}~~***\n`);
  });

  it('keeps the span inside a link', () => {
    expect(
      roundTrip(
        [
          {
            type: 'a',
            url: 'https://tina.io',
            title: null,
            children: [{ type: 'text', text: 'Tina', textColor: red }],
          },
        ],
        field
      )
    ).toBe(`[${span('Tina')}](https://tina.io)\n`);
  });

  it('leaves out a colour that is not a plain CSS colour', () => {
    const value = paragraph([
      { type: 'text', text: 'a', textColor: 'red; background: url(x)' },
    ]);
    expect(serializeMDX(value, field, passthrough)).toBe('a\n');
  });
});

describe('text colour on highlighted text', () => {
  it('writes the span inside the mark', () => {
    expect(
      roundTrip(
        [{ type: 'text', text: 'a', highlight: true, textColor: red }],
        mdx
      )
    ).toBe(`<mark><span style={{ color: "${red}" }}>a</span></mark>\n`);
  });
});
