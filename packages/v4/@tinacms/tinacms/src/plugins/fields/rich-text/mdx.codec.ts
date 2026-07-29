import { asMdxField, parseWithMdx, serializeWithMdx } from './mdx-parser';
import type { RichTextCodec } from './rich-text-codec';

// The default codec. It reads and writes markdown and MDX through @tinacms/mdx. This
// is the parser that v3 used, so a v3 content folder opens without a change. The codec
// is the only part of the field that knows the storage format. A new codec gives the
// field a new format.
export const mdxCodec: RichTextCodec = {
  parse: (source, node) => parseWithMdx(source, asMdxField(node)),
  serialize: (value, node) => serializeWithMdx(value, asMdxField(node)),
};
