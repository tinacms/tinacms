import { parseMDX, serializeMDX } from '@tinacms/mdx';
import { INVALID_MARKDOWN_TYPE } from '@tinacms/rich-text';
import type { FieldTransformContext } from '../../../core/field/contract';
import {
  type CollectionFormat,
  type FieldSchema,
  formatForPath,
} from '../../../core/schema/types';
import type { RichTextCodec, RichTextValue } from './rich-text-codec';
import type { RichTextFieldSchema } from './rich-text-field.schema';

// The default codec. It reads and writes markdown and MDX through @tinacms/mdx. This
// is the parser that v3 used, so a v3 content folder opens without a change. The codec
// is the only part of the field that knows the storage format. A new codec gives the
// field a new format.

// @tinacms/mdx resolves the media paths through this callback. v4 has no media
// capability yet, because plugins/media/ is empty. The paths therefore pass through
// with no change. Use the resolver of the media store when that store exists.
const passthroughMedia = (url: string): string => url;

// The registry gives each field its node as the base FieldSchema, but @tinacms/mdx
// needs the v3 field type. RichTextFieldSchema satisfies the structure of both,
// because it holds the templates under the same name. This is the one place that
// reconciles the two types. The call sites do not repeat it.
type MdxField = Parameters<typeof parseMDX>[1];

const asMdxField = (node: FieldSchema): MdxField =>
  node as RichTextFieldSchema as unknown as MdxField;

// The two codecs serialize in the same way. They differ only in the shape of the field
// they give to @tinacms/mdx, so the body of the function is here once.
//
// The guard for invalid markdown belongs to this file, and not to the parser.
// @tinacms/mdx makes the same check, but only on its MDX branch. Its markdown branch
// returns before that check, so a body that it could not parse would save as an empty
// string. This guard covers both branches.
const serializeWith =
  (toMdxField: (node: FieldSchema) => MdxField): RichTextCodec['serialize'] =>
  (value, node) => {
    const first = value.children[0] as
      | { type?: string; value?: string }
      | undefined;
    if (first?.type === INVALID_MARKDOWN_TYPE) return first.value ?? '';
    const serialized = serializeMDX(
      value as Parameters<typeof serializeMDX>[0],
      toMdxField(node),
      passthroughMedia
    );
    // serializeMDX returns undefined for an empty value, but a file holds a string.
    return typeof serialized === 'string' ? serialized : '';
  };

export const mdxCodec: RichTextCodec = {
  parse: (source, node) =>
    parseMDX(source, asMdxField(node), passthroughMedia) as RichTextValue,
  serialize: serializeWith(asMdxField),
};

// The codec for .md files. It uses the stricter `markdown` parser of @tinacms/mdx,
// which reads no JSX. A .md file and a .mdx file are different formats, so a parse of
// both as MDX is wrong in two ways. In .md prose, the MDX parser reads `{` as an
// expression and `<` as a tag. In a .md file, an embed writes JSX that no markdown
// reader can parse again.
const markdownField = (node: FieldSchema): MdxField =>
  ({ ...asMdxField(node), parser: { type: 'markdown' } }) as MdxField;

export const markdownCodec: RichTextCodec = {
  parse: (source, node) =>
    parseMDX(source, markdownField(node), passthroughMedia) as RichTextValue,
  serialize: serializeWith(markdownField),
};

// This map is keyed by format, and not by extension. FORMAT_EXTENSIONS in
// core/schema/types.ts owns the extensions. A key from the format union also makes a
// new format visible to the compiler here. The map is partial, because a format needs
// no codec. Refer to the fallback below.
const codecsByFormat: Partial<Record<CollectionFormat, RichTextCodec>> = {
  mdx: mdxCodec,
  md: markdownCodec,
};

// The codec that a field uses. A field that declares a codec uses that codec. Every
// other field uses the codec for the format of its document.
//
// The fallback covers the formats with no markdown file of their own. These are .json,
// .yaml, and any path with an extension that this code does not know. MDX is the
// correct default there, because v3 behaves in the same way. v3 selects a parser from
// the `parser` option of the field, and not from the extension. Without that option,
// v3 uses the MDX parser for every file. Refer to resolver/index.ts in
// @tinacms/graphql, which calls parseMDX directly. v4 selects by extension where the
// extension is clear, and keeps the answer of v3 where it is not.
//
// This function sits here, and not next to the contract, so that the contract holds no
// implementation. It also sits here, and not on the schema, so that the universal entry
// in src/index.ts never pulls a parser into the main bundle. A default for the whole
// project belongs on defineConfig (ADR-024).
export const codecFor = (
  node: FieldSchema,
  context: FieldTransformContext = {}
): RichTextCodec => {
  const declared = (node as RichTextFieldSchema).codec;
  if (declared) return declared;
  const format = context.documentPath && formatForPath(context.documentPath);
  return (format && codecsByFormat[format]) || mdxCodec;
};
