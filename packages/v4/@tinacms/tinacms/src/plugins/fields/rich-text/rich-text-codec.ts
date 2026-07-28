import type { FieldSchema } from '../../../core/schema/types';

// The seam between what a file holds and what the editor edits.
//
// A codec owns the format entirely: how a body is read off disk and how it is
// written back. The editor owns the shape below and knows nothing about markdown,
// MDX, or anything else — so the parser can be replaced without the editor
// noticing, which is the point of this file existing.
//
// Deliberately dependency-free (a type import only): implementing a codec must
// not drag the default one's parser in behind it.

// A node in the document. The editor (Plate) owns the full shape per node type;
// `type` is the only field this package reads, so it is the only one named.
export interface RichTextNode {
  type: string;
  [key: string]: unknown;
}

// What the editor edits and a codec produces. Both sides have to agree on this
// much — it is the editor's document model, not any one format's AST.
export interface RichTextValue {
  type: 'root';
  children: RichTextNode[];
}

export const EMPTY_RICH_TEXT: RichTextValue = { type: 'root', children: [] };

export interface RichTextCodec {
  // Identifies the codec in errors and tests; not a registry key.
  name: string;
  // `node` is the field's own schema. The default codec reads `templates` off it
  // to resolve embeds; a codec that needs no config can ignore it.
  parse(source: string, node: FieldSchema): RichTextValue;
  // The return value is what lands in the file, so it is always a string — a
  // codec with nothing to write returns ''.
  serialize(value: RichTextValue, node: FieldSchema): string;
}
