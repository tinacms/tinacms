import { type ZodType, z } from 'zod';
import type { BaseFieldSchema, FieldSchema } from '../../../core/schema/types';

export const RICH_TEXT_FIELD_TYPE = 'rich-text';

export interface RichTextFieldSchema extends BaseFieldSchema {
  type: typeof RICH_TEXT_FIELD_TYPE;
  // Marks this field as the owner of the file's markdown body (v3 content model).
  // Without it the field is ordinary frontmatter that happens to hold markdown.
  isBody?: boolean;
}

export const richText = (
  config: Omit<RichTextFieldSchema, 'type'>
): RichTextFieldSchema => ({ ...config, type: RICH_TEXT_FIELD_TYPE });

const labelOf = (node: RichTextFieldSchema): string => node.label ?? node.name;

// The value is the raw markdown source, so validation is the string field's minus
// the length/pattern rules — those measure characters, which says nothing useful
// about prose. Structural rules (required blocks, allowed templates) need the AST
// and arrive with the WYSIWYG editor.
export const richTextSchema = (node: FieldSchema): ZodType => {
  const field = node as RichTextFieldSchema;
  const schema = z.string();
  if (field.required) {
    return z.preprocess(
      (value) => value ?? '',
      schema.min(1, `${labelOf(field)} is required`)
    );
  }
  return z.preprocess(
    (value) => (value === '' || value == null ? undefined : value),
    schema.optional()
  );
};
