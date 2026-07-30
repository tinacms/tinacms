import { asMdxField, parseWithMdx, serializeWithMdx } from './mdx-parser';
import type { RichTextCodec } from './rich-text-codec';

export const mdxCodec: RichTextCodec = {
  parse: (source, node) => parseWithMdx(source, asMdxField(node)),
  serialize: (value, node) => serializeWithMdx(value, asMdxField(node)),
};
