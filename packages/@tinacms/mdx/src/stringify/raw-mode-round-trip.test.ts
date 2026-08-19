import type { RichTextField } from '@tinacms/schema-tools';
import { describe, expect, it } from 'vitest';
import { parseMDX } from '../parse';
import type * as Plate from '../parse/plate';
import { serializeMDX } from './index';

const passthrough = (v: string) => v;

const fields: [string, RichTextField][] = [
  ['mdx', { name: 'body', type: 'rich-text' }],
  [
    'markdown',
    { name: 'body', type: 'rich-text', parser: { type: 'markdown' } },
  ],
];

const editorValue = (): Plate.RootElement => ({
  type: 'root',
  children: [
    {
      type: 'p',
      children: [
        { type: 'text', text: 'Alpha ' },
        { type: 'text', text: 'bravo ', bold: true },
        { type: 'text', text: 'charlie' },
      ],
    },
  ],
});

/**
 * The raw-markdown toggle serializes the live editor value to a string and
 * parses it straight back, so anything the pair does not agree on surfaces as
 * "Unable to parse rich-text" — see
 * packages/@tinacms/app/src/fields/rich-text/monaco/index.tsx.
 */
describe.each(fields)('raw markdown toggle (%s parser)', (_, field) => {
  it('round-trips a bold run that carries a trailing space', () => {
    const markdown = serializeMDX(editorValue(), field, passthrough);
    if (typeof markdown !== 'string') {
      throw new Error(`Expected a string, received ${typeof markdown}`);
    }
    expect(markdown).toBe('Alpha **bravo** charlie\n');

    const reparsed = parseMDX(
      markdown,
      field,
      passthrough
    ) as Plate.RootElement;
    expect(reparsed.children[0]?.type).not.toBe('invalid_markdown');
    expect((reparsed.children[0] as any).children).toEqual([
      { type: 'text', text: 'Alpha ' },
      { type: 'text', text: 'bravo', bold: true },
      { type: 'text', text: ' charlie' },
    ]);
  });

  it('leaves the editor value it was handed untouched', () => {
    const value = editorValue();
    const before = JSON.stringify(value);
    serializeMDX(value, field, passthrough);
    expect(JSON.stringify(value)).toBe(before);
  });
});
