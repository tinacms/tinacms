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

const serialize = (
  children: Plate.InlineElement[],
  field: RichTextField
): string => {
  const result = serializeMDX(
    {
      type: 'root',
      children: [{ type: 'p', children }],
    } as Plate.RootElement,
    field,
    passthrough
  );
  if (typeof result !== 'string') {
    throw new Error(`Expected a string, received ${typeof result}`);
  }
  return result;
};

describe.each(fields)('line-start indentation (%s parser)', (_, field) => {
  /**
   * The leading space is written as `&#x20;` because a bare one at the start of
   * a line is whitespace the parser is free to drop, and four of them open an
   * indented code block.
   */
  it('survives a round trip on a continuation line', () => {
    const markdown = serialize(
      [
        { type: 'text', text: 'first' },
        { type: 'break' },
        { type: 'text', text: '    second' },
      ] as Plate.InlineElement[],
      field
    );
    expect(markdown).toBe('first\\\n&#x20;   second\n');
    expect(
      (parseMDX(markdown, field, passthrough) as Plate.RootElement).children
    ).toEqual([
      {
        type: 'p',
        children: [
          { type: 'text', text: 'first' },
          { type: 'break', children: [{ type: 'text', text: '' }] },
          { type: 'text', text: '    second' },
        ],
      },
    ]);
  });

  it('leaves a space before a line ending alone', () => {
    expect(
      serialize(
        [
          { type: 'text', text: 'first ' },
          { type: 'break' },
          { type: 'text', text: 'second' },
        ] as Plate.InlineElement[],
        field
      )
    ).toBe('first \\\nsecond\n');
  });

  it('leaves interior spaces alone', () => {
    expect(serialize([{ type: 'text', text: 'hello  world' }], field)).toBe(
      'hello  world\n'
    );
  });
});
