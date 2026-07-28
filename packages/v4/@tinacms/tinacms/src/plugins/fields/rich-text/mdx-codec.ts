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

// Both codecs serialize the same way and differ only in how they shape the field
// they hand @tinacms/mdx, so the body lives here once.
//
// The invalid_markdown guard is ours rather than the parser's. @tinacms/mdx does
// the same thing internally, but only on its MDX branch — its markdown branch
// returns before that check, so a body it could not parse would save as blank.
// Doing it here covers both branches and stops the guarantee depending on which
// path inside the parser a value happens to take.
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
    // serializeMDX returns undefined for an empty value; a file holds a string.
    return typeof serialized === 'string' ? serialized : '';
  };

export const mdxCodec: RichTextCodec = {
  parse: (source, node) =>
    parseMDX(source, asMdxField(node), passthroughMedia) as RichTextValue,
  serialize: serializeWith(asMdxField),
};

// The .md codec: @tinacms/mdx's stricter `markdown` parser, which reads no JSX.
// A .md file and a .mdx file are different formats, so parsing both as MDX is
// wrong in both directions — `{`/`<` in ordinary .md prose reads as an expression
// or a tag, and an embed serialized into a .md file writes JSX that no markdown
// consumer can read back.
const markdownField = (node: FieldSchema): MdxField =>
  ({ ...asMdxField(node), parser: { type: 'markdown' } }) as MdxField;

export const markdownCodec: RichTextCodec = {
  parse: (source, node) =>
    parseMDX(source, markdownField(node), passthroughMedia) as RichTextValue,
  serialize: serializeWith(markdownField),
};

// Keyed by format rather than by extension: the extension is FORMAT_EXTENSIONS'
// business (core/schema/types.ts), and keying off the union means a new format
// is a compiler-visible gap here rather than a lookup that silently misses.
// Partial because a format need not have a codec — see the fallback below.
const codecsByFormat: Partial<Record<CollectionFormat, RichTextCodec>> = {
  mdx: mdxCodec,
  md: markdownCodec,
};

// Which codec a field uses: its own if it declares one, otherwise the one its
// document's format names.
//
// The fallback covers formats with no markdown file of their own (.json, .yaml,
// and any path with no recognised extension). MDX is the right default there
// because it is what v3 does: v3 picks a parser from the field's `parser` option
// — not from the extension — and unset means the MDX path whatever the file is
// (@tinacms/graphql resolver/index.ts hands the field straight to parseMDX).
// Choosing per extension is v4 being stricter than v3 where it can be sure; the
// fallback is where it cannot, so it keeps v3's answer.
//
// Lives here rather than beside the contract so the contract stays free of any
// implementation, and here rather than on the schema so the universal entry
// (src/index.ts reaches the schema) never pulls a parser into the main bundle.
// A project-wide default belongs on defineConfig (ADR-024) when that lands.
export const codecFor = (
  node: FieldSchema,
  context: FieldTransformContext = {}
): RichTextCodec => {
  const declared = (node as RichTextFieldSchema).codec;
  if (declared) return declared;
  const format = context.documentPath && formatForPath(context.documentPath);
  return (format && codecsByFormat[format]) || mdxCodec;
};
