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

const toNumber = (value: unknown): unknown => {
  const trimmed = typeof value === 'string' ? value.trim() : value;
  return trimmed === '' || trimmed == null ? undefined : Number(trimmed);
};

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
    return z.preprocess(toNumber, schema);
  }
  return z.preprocess(toNumber, schema.optional());
};
