import type { FieldSchema } from '../../../core/schema/types';
import {
  type MdxField,
  asMdxField,
  parseWithMdx,
  serializeWithMdx,
} from './mdx-parser';
import type { RichTextCodec } from './rich-text-codec';

const markdownField = (node: FieldSchema): MdxField => ({
  ...asMdxField(node),
  parser: { type: 'markdown' as const },
});

export const markdownCodec: RichTextCodec = {
  parse: (source, node) => parseWithMdx(source, markdownField(node)),
  serialize: (value, node) => serializeWithMdx(value, markdownField(node)),
};
