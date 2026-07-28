import { parseMDX, serializeMDX } from '@tinacms/mdx';
import type { FieldSchema } from '../../../core/schema/types';
import type {
  RichTextAst,
  RichTextFieldSchema,
} from './rich-text-field.schema';

// The markdown <-> mdx AST crossing, in one place because two callers need it:
// the client segment's parse/serialize, and the field component's "did this
// actually change?" check. Keeping it here rather than on the client segment
// avoids a cycle — the client segment imports the component.

// @tinacms/mdx resolves media paths through this callback. v4 has no media
// capability yet (plugins/media/ is empty), so paths pass through untouched —
// swap in the media store's resolver when it lands.
const passthroughMedia = (url: string): string => url;

// The registry hands every field its node as the base FieldSchema, and
// @tinacms/mdx wants v3's field type. Both are structurally satisfied by
// RichTextFieldSchema (templates, under the same name), so this is the one place
// the two nominal types are reconciled — not at each call site.
type MdxField = Parameters<typeof parseMDX>[1];

const asMdxField = (node: FieldSchema): MdxField =>
  node as RichTextFieldSchema as unknown as MdxField;

export const markdownToAst = (
  stored: unknown,
  node: FieldSchema
): RichTextAst =>
  parseMDX(
    typeof stored === 'string' ? stored : '',
    asMdxField(node),
    passthroughMedia
  ) as RichTextAst;

// serializeMDX returns undefined for an empty value; a markdown file holds a
// string either way.
export const astToMarkdown = (
  value: RichTextAst,
  node: FieldSchema
): string => {
  const serialized = serializeMDX(
    value as Parameters<typeof serializeMDX>[0],
    asMdxField(node),
    passthroughMedia
  );
  return typeof serialized === 'string' ? serialized : '';
};
