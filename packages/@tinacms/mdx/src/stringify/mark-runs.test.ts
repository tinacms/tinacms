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
