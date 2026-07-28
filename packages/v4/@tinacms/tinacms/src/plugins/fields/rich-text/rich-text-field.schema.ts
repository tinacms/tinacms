import { type ZodType, z } from 'zod';
import type { BaseFieldSchema, FieldSchema } from '../../../core/schema/types';
import { INVALID_MARKDOWN_TYPE } from './error-message';
import type {
  ToolbarOverrideType,
  ToolbarOverrides,
} from './plate/toolbar/toolbar-overrides';
import type { MdxTemplate } from './plate/types';

export const RICH_TEXT_FIELD_TYPE = 'rich-text';

// Plate owns the full shape of each node type. `type` is the only field this
// package reads, so it's the only one named.
export interface RichTextNode {
  type: string;
  [key: string]: unknown;
}

// The editor value: the mdx AST @tinacms/mdx parses markdown into and serializes
// back out — the same shape v3 stored, so v3 content round-trips unchanged.
export interface RichTextAst {
  type: 'root';
  children: RichTextNode[];
}

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
  // No `parser` option: v3's two alternatives both lose content here. `slatejson`
  // makes serializeMDX return the AST, which this field would write as an empty
  // body; `markdown` routes to a stringifier with no invalid_markdown branch, so
  // an unparseable body saves as blank. Leaving it unset takes the path that
  // round-trips markdown AND returns the original source for a body it couldn't
  // parse. Re-add the option behind tests if a real collection needs it.
}

export const richText = (
  config: Omit<RichTextFieldSchema, 'type'>
): RichTextFieldSchema => ({ ...config, type: RICH_TEXT_FIELD_TYPE });

const labelOf = (node: RichTextFieldSchema): string => node.label ?? node.name;

const isRichTextAst = (value: unknown): value is RichTextAst => {
  const candidate = value as RichTextAst | null;
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
const isUnparsedMarkdown = (value: RichTextAst): boolean =>
  value.children[0]?.type === INVALID_MARKDOWN_TYPE;

// An empty body parses to a root with no children, so `required` counts children
// rather than testing the value — an empty AST is present but blank. Absent has
// to be caught before the shape check, or a missing required body reports "must
// be rich text" instead of "is required".
export const richTextSchema = (node: FieldSchema): ZodType => {
  const field = node as RichTextFieldSchema;
  const ast = z
    .custom<RichTextAst>(isRichTextAst, `${labelOf(field)} must be rich text`)
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
