import type { FieldTransformContext } from '../../../core/field/contract';
import {
  type CollectionFormat,
  type FieldSchema,
  formatForPath,
} from '../../../core/schema/types';
import { markdownCodec } from './markdown.codec';
import { mdxCodec } from './mdx.codec';
import type { RichTextCodec, RichTextValue } from './rich-text-codec';
import {
  isRichTextFieldSchema,
  isRichTextValue,
} from './rich-text-field.schema';

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
  const declared = isRichTextFieldSchema(node) ? node.codec : undefined;
  if (declared) return declared;
  if (!context.documentPath) return mdxCodec;
  const format = formatForPath(context.documentPath);
  if (!format) return mdxCodec;
  return codecsByFormat[format] ?? mdxCodec;
};

// The source of a value, kept against the value it came from. The store asks
// writesSameSource for every subscriber of the form on every keystroke, and a serialize
// of a long body is not free. Plate replaces the tree at each edit, so an entry falls out
// with the tree it belongs to. The codec and the node are part of the entry, because both
// decide what the source looks like, and one collection can hold more than one format.
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
  const source = codec.serialize(value, node);
  sourceOfValue.set(value, { codec, node, source });
  return source;
};

// Whether two values would write the same source, which is the question the form store
// asks through isEqual. It cannot compare the trees themselves: Plate normalizes the tree
// it is given, with an id on every node and a trailing block, so the tree in the editor
// never matches the tree parsed from the file. A body that its author typed and then
// deleted again would stay dirty for ever, and a click alone would look like an edit.
// A form seeds its values from the document, so a value here is a tree. A field with no
// value at all is the exception: an absent key and an empty body are two states, and only
// the identity above makes them one.
export const writesSameSource = (
  a: unknown,
  b: unknown,
  node: FieldSchema,
  context: FieldTransformContext
): boolean => {
  if (a === b) return true;
  if (!isRichTextValue(a) || !isRichTextValue(b)) return false;
  const codec = codecFor(node, context);
  try {
    return sourceOf(a, codec, node) === sourceOf(b, codec, node);
  } catch {
    // @tinacms/mdx throws for a tree it cannot write — a mark inside inline code, or a
    // node it does not model. The store asks this on every keystroke, so a throw here
    // would take the editor down mid-edit. Reporting "different" keeps the form dirty,
    // which is the safe answer: it offers the save rather than dropping the edit.
    return false;
  }
};
