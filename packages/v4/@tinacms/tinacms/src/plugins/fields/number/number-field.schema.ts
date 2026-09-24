import { type ZodType, z } from 'zod';
import type { BaseFieldSchema, FieldSchema } from '../../../core/schema/types';

export const NUMBER_FIELD_TYPE = 'number';

export interface NumberFieldSchema extends BaseFieldSchema {
  type: typeof NUMBER_FIELD_TYPE;
  step?: number;
}

export const number = (
  config: Omit<NumberFieldSchema, 'type'>
): NumberFieldSchema => ({ ...config, type: NUMBER_FIELD_TYPE });

const labelOf = (node: NumberFieldSchema): string => node.label ?? node.name;

export const toNumber = (value: unknown): unknown => {
  const trimmed = typeof value === 'string' ? value.trim() : value;
  return trimmed === '' || trimmed == null ? undefined : Number(trimmed);
};

// The shape of the value only, and the coercion the editor needs: the input
// holds a string, the document holds a number. `min` and `max` are validators.
export const numberSchema = (node: FieldSchema): ZodType => {
  const field = node as NumberFieldSchema;
  return z.preprocess(
    toNumber,
    z
      .number({ invalid_type_error: `${labelOf(field)} must be a number` })
      .finite(`${labelOf(field)} must be a finite number`)
      .optional()
  );
};
