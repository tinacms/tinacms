import type { FieldSchema } from '../../../core/schema/types';

// The document model belongs to the editor package, which defines the shape that it
// edits. A codec produces that shape. This file re-exports the model, so a codec author
// imports the contract and the value from one place.
export {
  EMPTY_RICH_TEXT,
  type RichTextNode,
  type RichTextValue,
} from '@tinacms/rich-text';
import type { RichTextValue } from '@tinacms/rich-text';

// The boundary between the contents of a file and the value that the editor edits.
//
// A codec owns the format. It reads a body from the disk, and it writes the body back.
// The editor owns the shape below, and it knows nothing about markdown or MDX. A new
// parser therefore changes nothing in the editor, which is why this file exists.
//
// This file has no dependency, and it holds one type import. A new codec must not pull in
// the parser of the default codec.

export interface RichTextCodec {
  // The `node` is the schema of the field. The default codec reads `templates` from
  // it to resolve the embeds. A codec that needs no config ignores it.
  parse(source: string, node: FieldSchema): RichTextValue;
  // The return value goes into the file, so it is always a string. A codec with
  // nothing to write returns an empty string.
  serialize(value: RichTextValue, node: FieldSchema): string;
}
