import { parseMDX, serializeMDX } from '@tinacms/mdx';
import { INVALID_MARKDOWN_TYPE } from '@tinacms/rich-text';
import type { FieldSchema } from '../../../core/schema/types';
import type { RichTextValue } from './rich-text-codec';

const passthroughMedia = (url: string): string => url;

export type MdxField = Parameters<typeof parseMDX>[1];

export const asMdxField = (node: FieldSchema): MdxField => node as MdxField;

const unparsedSource = (value: RichTextValue): string | undefined => {
  const first = value.children[0] as
    | { type?: string; value?: string }
    | undefined;
  if (first?.type !== INVALID_MARKDOWN_TYPE) return undefined;
  return first.value ?? '';
};

export const parseWithMdx = (source: string, field: MdxField): RichTextValue =>
  parseMDX(source, field, passthroughMedia) as RichTextValue;

export const serializeWithMdx = (
  value: RichTextValue,
  field: MdxField
): string => {
  if (!value?.children) return '';
  const unparsed = unparsedSource(value);
  if (unparsed !== undefined) return unparsed;
  const serialized = serializeMDX(
    value as Parameters<typeof serializeMDX>[0],
    field,
    passthroughMedia
  );
  return typeof serialized === 'string' ? serialized : '';
};
