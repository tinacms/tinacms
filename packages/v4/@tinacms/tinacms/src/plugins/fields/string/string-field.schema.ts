import { type ZodType, z } from 'zod';
import type { BaseFieldSchema, FieldSchema } from '../../../core/schema/types';

export const STRING_FIELD_TYPE = 'string';

export interface StringFieldSchema extends BaseFieldSchema {
  type: typeof STRING_FIELD_TYPE;
  min?: number;
  max?: number;
  pattern?: string;
}

export const string = (
  config: Omit<StringFieldSchema, 'type'>
): StringFieldSchema => ({ ...config, type: STRING_FIELD_TYPE });

const labelOf = (node: StringFieldSchema): string => node.label ?? node.name;

const compileRegExp = (pattern: string): RegExp | null => {
  try {
    return new RegExp(pattern);
  } catch {
    return null;
  }
};

// Per-field validation only — `node` is this field alone. Cross-field rules
// (validate against a sibling field) aren't supported here yet; they'll come via
// useSiblingValue in the component, or a form-level refine / server segment.
export const stringSchema = (node: FieldSchema): ZodType => {
  const field = node as StringFieldSchema;
  let schema = z.string();
  if (field.min != null) {
    schema = schema.min(
      field.min,
      `${labelOf(field)} must be at least ${field.min} characters`
    );
  }
  if (field.max != null) {
    schema = schema.max(
      field.max,
      `${labelOf(field)} must be at most ${field.max} characters`
    );
  }
  if (field.pattern) {
    const compiledPattern = compileRegExp(field.pattern);
    if (compiledPattern) {
      schema = schema.regex(compiledPattern, `${labelOf(field)} is invalid`);
    }
  }
  if (field.required) {
    if (!(field.min && field.min > 0)) {
      schema = schema.min(1, `${labelOf(field)} is required`);
    }
    return z.preprocess((value) => value ?? '', schema);
  }
  return z.preprocess(
    (value) => (value === '' || value == null ? undefined : value),
    schema.optional()
  );
};
