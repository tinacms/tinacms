import { parseMDX, serializeMDX } from '@tinacms/mdx';
import { INVALID_MARKDOWN_TYPE } from '@tinacms/rich-text';
import type { FieldSchema } from '../../../core/schema/types';
import type { RichTextValue } from './rich-text-codec';

// The calls into @tinacms/mdx, which both built-in codecs share. They differ only in the
// shape of the field they hand to the parser, so that field is a parameter here and the
// body of each call site is written once.

// @tinacms/mdx resolves the media paths through this callback. v4 has no media
// capability yet, because plugins/media/ is empty. The paths therefore pass through
// with no change. Use the resolver of the media store when that store exists.
const passthroughMedia = (url: string): string => url;

// The registry gives each field its node as the base FieldSchema, but @tinacms/mdx
// needs the v3 field type. The two hold the same data under the same names, and the
// compiler cannot see it: v3 types a template field by a closed union of literal types,
// and a v4 schema node types it as a string. So the conversion stays an assertion, and
// this is the one place that makes it. The call sites do not repeat it. It becomes a
// plain assignment when @tinacms/mdx declares the field shape that it reads.
export type MdxField = Parameters<typeof parseMDX>[1];

export const asMdxField = (node: FieldSchema): MdxField => node as MdxField;

/**
 * Reads a body that @tinacms/mdx could not parse back as its original source.
 *
 * The parser keeps that source on the node it puts in place of the body, so the value
 * of the node is the file as it was. Returns undefined for every other tree.
 *
 * This guard belongs to the codec, and not to the parser. @tinacms/mdx makes the same
 * check, but only on its MDX branch. Its markdown branch returns before that check, so
 * a body that it could not parse would save as an empty string.
 */
const unparsedSource = (value: RichTextValue): string | undefined => {
  const first = value.children[0] as
    | { type?: string; value?: string }
    | undefined;
  if (first?.type !== INVALID_MARKDOWN_TYPE) return undefined;
  return first.value ?? '';
};

/** Reads a body from the file into the document model of the editor. */
export const parseWithMdx = (source: string, field: MdxField): RichTextValue =>
  parseMDX(source, field, passthroughMedia) as RichTextValue;

/**
 * Writes the document model back as the contents of a body.
 *
 * An absent body arrives as EMPTY_RICH_TEXT, and not as null: the field normalises it
 * at the dispatch, so this holds the contract in rich-text-codec.ts and a codec of your
 * own takes a value of the declared type. The first guard below covers a tree with no
 * children.
 */
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
  // serializeMDX returns undefined for an empty value, but a file holds a string.
  return typeof serialized === 'string' ? serialized : '';
};
