import type { FieldSchema } from '../../../core/schema/types';

// The document model belongs to the editor package — it defines the shape it
// edits, and a codec's job is to produce it. Re-exported so a codec author
// imports the contract and the value from one place.
export {
  EMPTY_RICH_TEXT,
  type RichTextNode,
  type RichTextValue,
} from '@tinacms/rich-text';
import type { RichTextValue } from '@tinacms/rich-text';

// The seam between what a file holds and what the editor edits.
//
// A codec owns the format entirely: how a body is read off disk and how it is
// written back. The editor owns the shape below and knows nothing about markdown,
// MDX, or anything else — so the parser can be replaced without the editor
// noticing, which is the point of this file existing.
//
// Deliberately dependency-free (a type import only): implementing a codec must
// not drag the default one's parser in behind it.

export interface RichTextCodec {
  // `node` is the field's own schema. The default codec reads `templates` off it
  // to resolve embeds; a codec that needs no config can ignore it.
  parse(source: string, node: FieldSchema): RichTextValue;
  // The return value is what lands in the file, so it is always a string — a
  // codec with nothing to write returns ''.
  serialize(value: RichTextValue, node: FieldSchema): string;
}
