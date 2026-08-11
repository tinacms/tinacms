import type { RichTextField } from '@tinacms/schema-tools';
import { describe, expect, it } from 'vitest';
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

const paragraph = (children: Plate.InlineElement[]): Plate.RootElement => ({
  type: 'root',
  children: [{ type: 'p', children }],
});

/**
 * These messages reach content editors, not just developers. The raw editor
 * shows the thrown message verbatim, so it has to name the formatting to
 * remove rather than describe the editor's internals.
 */
describe.each(fields)(
  'unsupported mark combinations (%s parser)',
  (_, field) => {
    it('explains what to remove when code carries another mark', () => {
      const value = paragraph([
        { type: 'text', text: 'npm ', code: true },
        { type: 'text', text: 'install', code: true, bold: true },
        { type: 'text', text: ' first' },
      ]);
      expect(() => serializeMDX(value, field, passthrough)).toThrow(
        "Inline code can't have other formatting on it. Remove the formatting from the code text."
      );
    });

    it('avoids the word "marks", which no content editor uses', () => {
      const value = paragraph([
        { type: 'text', text: 'npm ', code: true },
        { type: 'text', text: 'install', code: true, bold: true },
        { type: 'text', text: ' first' },
      ]);
      let message = '';
      try {
        serializeMDX(value, field, passthrough);
      } catch (err) {
        if (err instanceof Error) {
          message = err.message;
        } else {
          message = String(err);
        }
      }
      expect(message).not.toMatch(/marks?/i);
    });
  }
);
