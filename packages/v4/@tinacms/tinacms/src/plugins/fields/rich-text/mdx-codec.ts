import { parseMDX, serializeMDX } from '@tinacms/mdx';
import type { FieldSchema } from '../../../core/schema/types';
import type { RichTextCodec, RichTextValue } from './rich-text-codec';
import type { RichTextFieldSchema } from './rich-text-field.schema';

// The default codec: markdown/MDX through @tinacms/mdx, the same parser v3 used,
// so a v3 content folder opens unchanged. This is the only thing in the field
// that knows the storage format — replacing it replaces the format.

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

export const mdxCodec: RichTextCodec = {
  name: 'mdx',
  parse: (source, node) =>
    parseMDX(source, asMdxField(node), passthroughMedia) as RichTextValue,
  // serializeMDX returns undefined for an empty value; a file holds a string
  // either way. For a body it could not parse it hands back the original source
  // rather than a blank, which is what stops a save destroying content.
  serialize: (value, node) => {
    const serialized = serializeMDX(
      value as Parameters<typeof serializeMDX>[0],
      asMdxField(node),
      passthroughMedia
    );
    return typeof serialized === 'string' ? serialized : '';
  },
};

// Which codec a field uses: its own if it declares one, markdown otherwise.
// Lives here rather than beside the contract so the contract stays free of any
// implementation, and here rather than on the schema so the universal entry
// (src/index.ts reaches the schema) never pulls a parser into the main bundle.
// A project-wide default belongs on defineConfig (ADR-024) when that lands.
export const codecFor = (node: FieldSchema): RichTextCodec =>
  (node as RichTextFieldSchema).codec ?? mdxCodec;
