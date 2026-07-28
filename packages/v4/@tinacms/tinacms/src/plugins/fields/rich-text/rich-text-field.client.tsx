import { parseMDX, serializeMDX } from '@tinacms/mdx';
import { defineClientPlugin } from '../../../client';
import type { FieldSchema } from '../../../core/schema/types';
import {
  RICH_TEXT_FIELD_TYPE,
  type RichTextAst,
  type RichTextFieldSchema,
  richTextSchema,
} from './rich-text-field.schema';
import { RichTextField } from './rich-text-field.ui';

// @tinacms/mdx resolves media paths through this callback. v4 has no media
// capability yet (plugins/media/ is empty), so paths pass through untouched —
// swap in the media store's resolver when it lands.
const passthroughMedia = (url: string): string => url;

// The registry hands every field its node as the base FieldSchema, and
// @tinacms/mdx wants v3's field type. Both are structurally satisfied by
// RichTextFieldSchema (parser, templates, under the same names), so this is the
// one place the two nominal types are reconciled — not at each call site.
type MdxField = Parameters<typeof parseMDX>[1];

const asMdxField = (node: FieldSchema): MdxField =>
  node as RichTextFieldSchema as unknown as MdxField;

export default defineClientPlugin({
  field: {
    type: RICH_TEXT_FIELD_TYPE,
    Component: RichTextField,
    defaultValue: { type: 'root', children: [] } satisfies RichTextAst,
    // A body is its own section, not something to sit beside a text input.
    metadata: { layout: 'block' },
    schema: richTextSchema,
    // The document stores markdown (the format adapter hands the body over as a
    // string); the editor works on the mdx AST. @tinacms/mdx is the only thing
    // that knows how to cross that gap, and it's the same parser v3 used, so v3
    // content opens unchanged.
    parse: (stored, node) =>
      parseMDX(
        typeof stored === 'string' ? stored : '',
        asMdxField(node),
        passthroughMedia
      ) as RichTextAst,
    // serializeMDX returns the AST untouched for `slatejson`; only the markdown
    // parser produces a string, which is what a markdown file can hold.
    serialize: (value, node) => {
      const serialized = serializeMDX(
        value as Parameters<typeof serializeMDX>[0],
        asMdxField(node),
        passthroughMedia
      );
      return typeof serialized === 'string' ? serialized : '';
    },
  },
});
