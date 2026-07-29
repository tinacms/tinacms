import { type ZodType, z } from 'zod';
import type { BaseFieldSchema, FieldSchema } from '../../../core/schema/types';

export const NUMBER_FIELD_TYPE = 'number';

export interface NumberFieldSchema extends BaseFieldSchema {
  type: typeof NUMBER_FIELD_TYPE;
  min?: number;
  max?: number;
  step?: number;
}

export const number = (
  config: Omit<NumberFieldSchema, 'type'>
): NumberFieldSchema => ({ ...config, type: NUMBER_FIELD_TYPE });

const labelOf = (node: NumberFieldSchema): string => node.label ?? node.name;

// Convert the editor string before the validation. Test for an empty string, and for a
// string of spaces, directly. The value `0` is valid, and a falsy test would read an
// empty string as zero.
const toNumber = (value: unknown): unknown => {
  const trimmed = typeof value === 'string' ? value.trim() : value;
  return trimmed === '' || trimmed == null ? undefined : Number(trimmed);
};

// The `min` and `max` values bound the number, and not the length of the string. A
// string that is not a number becomes `NaN`. The `.finite()` check also rejects
// `Infinity`, which JSON would write as `null`.
export const numberSchema = (node: FieldSchema): ZodType => {
  const field = node as NumberFieldSchema;
  let schema = z
    .number({
      required_error: `${labelOf(field)} is required`,
      invalid_type_error: `${labelOf(field)} must be a number`,
    })
    .finite(`${labelOf(field)} must be a finite number`);
  if (field.min != null) {
    schema = schema.min(
      field.min,
      `${labelOf(field)} must be at least ${field.min}`
    );
  }
  if (field.max != null) {
    schema = schema.max(
      field.max,
      `${labelOf(field)} must be at most ${field.max}`
    );
  }
  if (field.required) {
    // An empty string becomes `undefined`, which fails a schema that is not optional.
    return z.preprocess(toNumber, schema);
  }
  return z.preprocess(toNumber, schema.optional());
};
