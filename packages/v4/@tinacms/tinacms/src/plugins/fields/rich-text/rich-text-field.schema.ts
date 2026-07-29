import { INVALID_MARKDOWN_TYPE } from '@tinacms/rich-text';
import type { ToolbarOverrides } from '@tinacms/rich-text/editor';
import type { MdxTemplate } from '@tinacms/rich-text/editor';
import { type ZodType, z } from 'zod';
import type { BaseFieldSchema, FieldSchema } from '../../../core/schema/types';

export const RICH_TEXT_FIELD_TYPE = 'rich-text';

// rich-text-codec.ts holds the document model and the format contract. This is a
// type-only re-export, so a schema author imports from one place.
import type { RichTextCodec, RichTextValue } from './rich-text-codec';

export type {
  RichTextCodec,
  RichTextNode,
  RichTextValue,
} from './rich-text-codec';

export interface RichTextFieldSchema extends BaseFieldSchema {
  type: typeof RICH_TEXT_FIELD_TYPE;
  // This marks the field as the owner of the markdown body of the file, as the v3
  // content model does. Without it, the field is frontmatter that holds markdown.
  isBody?: boolean;
  // The MDX components that an author can embed. Each one becomes an entry in the
  // slash menu, and a node that the author can edit. An edit to the props of an embed
  // needs the object field, which does not exist yet. A template therefore renders,
  // but its side panel is empty.
  templates?: MdxTemplate[];
  // The toolbar buttons and the heading levels the editor shows. v3 also took a
  // bare list of buttons under `toolbarOverride`. v4 takes `overrides.toolbar`
  // alone, so there is one shape to read and one place to add an option to.
  overrides?: ToolbarOverrides;
  // This changes how the field reads its body from the file, and how it writes the
  // body back. Without it, the codec follows the extension of the document. That is
  // MDX for .mdx, markdown for .md, and MDX for any other file that holds a markdown
  // string. Refer to rich-text-codecs.ts. This is what lets one collection hold more
  // than one format. Set a codec to hold this field to one format for every file, or
  // to store the body in a format of your own.
  codec?: RichTextCodec;
  // There is no `parser` option, although the codecs use the v3 parsers below. That
  // option would reach the `markdown` branch of serializeMDX. That branch returns
  // before its check for invalid markdown, so it would save a body that it could not
  // parse as an empty string. The `slatejson` value has the same problem, because it
  // returns the tree that this field would write as an empty body. markdownCodec takes
  // that branch on purpose, and guards it first. Add the option again only behind the
  // same guard.
}

export const richText = (
  config: Omit<RichTextFieldSchema, 'type'>
): RichTextFieldSchema => ({ ...config, type: RICH_TEXT_FIELD_TYPE });

// The registry hands every field its node as the base FieldSchema, which declares no
// codec. This is how the field reads its own config back off that node, and the reason
// it is a test of the type rather than an assertion of it.
export const isRichTextFieldSchema = (
  node: FieldSchema
): node is RichTextFieldSchema => node.type === RICH_TEXT_FIELD_TYPE;

const labelOf = (node: BaseFieldSchema): string => node.label ?? node.name;

// The one answer to "is this a RichTextValue". Validation asks it of a form value, and
// writesSameSource in rich-text-codecs.ts asks it of the two values it is given, so a
// second guard would let the two disagree about what the type means.
export const isRichTextValue = (value: unknown): value is RichTextValue => {
  const candidate = value as RichTextValue | null;
  return (
    typeof candidate === 'object' &&
    candidate !== null &&
    candidate.type === 'root' &&
    Array.isArray(candidate.children)
  );
};

// This reports a body that @tinacms/mdx could not parse as a field error. Refer to
// INVALID_MARKDOWN_TYPE. It reports, and it does not protect. A save does not run the
// resolver, because useFormSave digests the values and calls onSave directly, so the
// value still reaches the disk. The serializer keeps that safe. It writes the original
// source back for this node, and not an empty body.
const isUnparsedMarkdown = (value: RichTextValue): boolean =>
  value.children[0]?.type === INVALID_MARKDOWN_TYPE;

// An empty body parses to a root with no children, so `required` counts the children and
// does not test the value. An empty tree is present, but it holds nothing. The check for
// an absent value must run before the shape check. Otherwise a missing required body
// reports "must be rich text" instead of "is required".
export const richTextSchema = (node: FieldSchema): ZodType => {
  const ast = z
    .custom<RichTextValue>(
      isRichTextValue,
      `${labelOf(node)} must be rich text`
    )
    .refine((value) => !isUnparsedMarkdown(value), 'Unable to parse rich-text');
  if (node.required) {
    return z.preprocess(
      (value) => value ?? { type: 'root', children: [] },
      ast.refine(
        (value) => value.children.length > 0,
        `${labelOf(node)} is required`
      )
    );
  }
  return z.preprocess(
    (value) => (value == null ? undefined : value),
    ast.optional()
  );
};
