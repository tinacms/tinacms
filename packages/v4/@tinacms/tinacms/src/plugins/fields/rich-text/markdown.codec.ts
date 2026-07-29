import type { FieldSchema } from '../../../core/schema/types';
import {
  type MdxField,
  asMdxField,
  parseWithMdx,
  serializeWithMdx,
} from './mdx-parser';
import type { RichTextCodec } from './rich-text-codec';

// The codec for .md files. It uses the stricter `markdown` parser of @tinacms/mdx,
// which reads no JSX. A .md file and a .mdx file are different formats, so a parse of
// both as MDX is wrong in two ways. In .md prose, the MDX parser reads `{` as an
// expression and `<` as a tag. In a .md file, an embed writes JSX that no markdown
// reader can parse again.
const markdownField = (node: FieldSchema): MdxField => ({
  ...asMdxField(node),
  parser: { type: 'markdown' as const },
});

export const markdownCodec: RichTextCodec = {
  parse: (source, node) => parseWithMdx(source, markdownField(node)),
  serialize: (value, node) => serializeWithMdx(value, markdownField(node)),
};
