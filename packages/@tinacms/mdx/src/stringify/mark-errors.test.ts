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
    it('explains what to remove when a block cannot be written', () => {
      const value = {
        type: 'root' as const,
        children: [{ type: 'not_a_real_block', children: [] }],
      } as unknown as Plate.RootElement;
      expect(() => serializeMDX(value, field, passthrough)).toThrow(
        /This block can't be saved as markdown \("not_a_real_block"\)/
      );
    });
  }
);
