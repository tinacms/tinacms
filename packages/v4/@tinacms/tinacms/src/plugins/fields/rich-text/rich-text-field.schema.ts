import { type ZodType, z } from 'zod';
import type { BaseFieldSchema, FieldSchema } from '../../../core/schema/types';
import { INVALID_MARKDOWN_TYPE } from './error-message';
import type {
  ToolbarOverrideType,
  ToolbarOverrides,
} from './plate/toolbar/toolbar-overrides';
import type { MdxTemplate } from './plate/types';

export const RICH_TEXT_FIELD_TYPE = 'rich-text';

// The document model and the format contract live in rich-text-codec.ts; this is
// a type-only re-export so a schema author imports from one place.
import type { RichTextCodec, RichTextValue } from './rich-text-codec';

export type {
  RichTextCodec,
  RichTextNode,
  RichTextValue,
} from './rich-text-codec';

export interface RichTextFieldSchema extends BaseFieldSchema {
  type: typeof RICH_TEXT_FIELD_TYPE;
  // Marks this field as the owner of the file's markdown body (v3 content model).
  // Without it the field is ordinary frontmatter that happens to hold markdown.
  isBody?: boolean;
  // Embeddable MDX components — each becomes a slash-menu entry and an editable
  // node. Editing an embed's props needs the object field (not built yet), so
  // templates render but their side panel is stubbed.
  templates?: MdxTemplate[];
  overrides?: ToolbarOverrides;
  toolbarOverride?: ToolbarOverrideType[];
  // Overrides how this field's body is read from and written to the file. Left
  // unset, the codec follows the document's extension — MDX for .mdx, markdown
  // for .md, MDX for anything holding a markdown string (mdx-codec.ts) — which is
  // what lets one collection hold mixed formats. Supply one to pin this field to a
  // format regardless of the file, or to store the body in some format of your own.
  codec?: RichTextCodec;
  // No `parser` option, though the codecs use v3's parsers underneath: routing it
  // through here would reach serializeMDX's `markdown` branch, which returns before
  // its invalid_markdown check and so saves an unparseable body as blank (and
  // `slatejson`, which returns the AST this field would write as an empty body).
  // markdownCodec takes that branch deliberately and guards it first. Re-add the
  // option only behind the same guard.
}

export const richText = (
  config: Omit<RichTextFieldSchema, 'type'>
): RichTextFieldSchema => ({ ...config, type: RICH_TEXT_FIELD_TYPE });

const labelOf = (node: RichTextFieldSchema): string => node.label ?? node.name;

const isRichTextValue = (value: unknown): value is RichTextValue => {
  const candidate = value as RichTextValue | null;
  return (
    typeof candidate === 'object' &&
    candidate !== null &&
    candidate.type === 'root' &&
    Array.isArray(candidate.children)
  );
};

// Surfaces a body @tinacms/mdx couldn't parse (see INVALID_MARKDOWN_TYPE) as a
// field error. This reports, it does not protect: saves bypass the resolver
// (useFormSave digests and calls onSave directly), so the value still reaches
// disk. What keeps that safe is the serializer, which writes the original source
// back for this node rather than a blank body.
const isUnparsedMarkdown = (value: RichTextValue): boolean =>
  value.children[0]?.type === INVALID_MARKDOWN_TYPE;

// An empty body parses to a root with no children, so `required` counts children
// rather than testing the value — an empty AST is present but blank. Absent has
// to be caught before the shape check, or a missing required body reports "must
// be rich text" instead of "is required".
export const richTextSchema = (node: FieldSchema): ZodType => {
  const field = node as RichTextFieldSchema;
  const ast = z
    .custom<RichTextValue>(
      isRichTextValue,
      `${labelOf(field)} must be rich text`
    )
    .refine((value) => !isUnparsedMarkdown(value), 'Unable to parse rich-text');
  if (field.required) {
    return z.preprocess(
      (value) => value ?? { type: 'root', children: [] },
      ast.refine(
        (value) => value.children.length > 0,
        `${labelOf(field)} is required`
      )
    );
  }
  return z.preprocess(
    (value) => (value == null ? undefined : value),
    ast.optional()
  );
};
