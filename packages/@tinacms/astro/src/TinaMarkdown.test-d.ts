import { describe, expectTypeOf, it } from 'vitest';
import type { TinaMarkdownProps, TinaRichTextContent } from './types';

// `TinaMarkdownContent` from `tinacms/dist/rich-text`, which `@tinacms/cli`
// writes into the generated client types for every rich-text field.
type CliRichText = { type: string; children: CliRichText[] };

describe('TinaMarkdownProps content', () => {
  it('accepts an optional rich-text field from the generated client', () => {
    expectTypeOf<CliRichText | null | undefined>().toExtend<
      TinaMarkdownProps['content']
    >();
  });

  it('accepts the children of a generated rich-text field', () => {
    expectTypeOf<CliRichText[]>().toExtend<TinaMarkdownProps['content']>();
  });

  it('accepts the Astro rich-text types', () => {
    expectTypeOf<TinaRichTextContent>().toExtend<
      TinaMarkdownProps['content']
    >();
  });

  it('does not accept values that are not rich text', () => {
    expectTypeOf<string>().not.toExtend<TinaMarkdownProps['content']>();
  });
});
