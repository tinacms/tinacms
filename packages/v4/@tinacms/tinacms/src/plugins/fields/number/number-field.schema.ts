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

// Coerce the editor string before validating. Guard empty explicitly: `0` is valid
// and a falsy test would smuggle empty in as zero (`Number('') === 0`).
const toNumber = (value: unknown): unknown =>
  value === '' || value == null ? undefined : Number(value);

// `min`/`max` are value bounds (not string length); a non-numeric string becomes
// `NaN`, which `z.number()` rejects.
export const numberSchema = (node: FieldSchema): ZodType => {
  const field = node as NumberFieldSchema;
  let schema = z.number({
    required_error: `${labelOf(field)} is required`,
    invalid_type_error: `${labelOf(field)} must be a number`,
  });
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
    // Empty coerces to `undefined`, which fails the non-optional schema.
    return z.preprocess(toNumber, schema);
  }
  return z.preprocess(toNumber, schema.optional());
};
