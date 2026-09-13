import type { FieldTransformContext } from '../../../core/field/contract';
import {
  type CollectionFormat,
  type FieldSchema,
  formatForPath,
} from '../../../core/schema/types';
import { markdownCodec } from './markdown.codec';
import { mdxCodec } from './mdx.codec';
import {
  type RichTextCodec,
  RichTextSerializeError,
  type RichTextValue,
} from './rich-text-codec';
import {
  isRichTextFieldSchema,
  isRichTextValue,
} from './rich-text-field.schema';

const codecsByFormat: Partial<Record<CollectionFormat, RichTextCodec>> = {
  mdx: mdxCodec,
  md: markdownCodec,
};

export const codecFor = (
  node: FieldSchema,
  context: Pick<FieldTransformContext, 'documentPath'> = {}
): RichTextCodec => {
  const declared = isRichTextFieldSchema(node) ? node.codec : undefined;
  if (declared) return declared;
  if (!context.documentPath) return mdxCodec;
  const format = formatForPath(context.documentPath);
  if (!format) return mdxCodec;
  return codecsByFormat[format] ?? mdxCodec;
};

const sourceOfValue = new WeakMap<
  RichTextValue,
  { codec: RichTextCodec; node: FieldSchema; source: string }
>();

const sourceOf = (
  value: RichTextValue,
  codec: RichTextCodec,
  node: FieldSchema
): string => {
  const cached = sourceOfValue.get(value);
  if (cached && cached.codec === codec && cached.node === node) {
    return cached.source;
  }
  let source: string;
  try {
    source = codec.serialize(value, node);
  } catch (cause) {
    throw new RichTextSerializeError(cause);
  }
  sourceOfValue.set(value, { codec, node, source });
  return source;
};

export const writesSameSource = (
  a: unknown,
  b: unknown,
  node: FieldSchema,
  context: Pick<FieldTransformContext, 'documentPath'>
): boolean => {
  if (a === b) return true;
  if (!isRichTextValue(a) || !isRichTextValue(b)) return false;
  const codec = codecFor(node, context);
  try {
    return sourceOf(a, codec, node) === sourceOf(b, codec, node);
  } catch (cause) {
    if (cause instanceof RichTextSerializeError) return false;
    throw cause;
  }
};
