import { type ZodType, z } from 'zod';
import type { BaseFieldSchema, FieldSchema } from '../../../core/schema/types';

export const ARRAY_FIELD_TYPE = 'array';

export interface ArrayFieldSchema extends BaseFieldSchema {
  type: typeof ARRAY_FIELD_TYPE;
  fields: FieldSchema[];
  min?: number;
  max?: number;
}

export const array = (
  config: Omit<ArrayFieldSchema, 'type'>
): ArrayFieldSchema => ({ ...config, type: ARRAY_FIELD_TYPE });

const labelOf = (node: ArrayFieldSchema): string => node.label ?? node.name;

const plural = (count: number): string => (count === 1 ? 'item' : 'items');

export const arraySchema = (node: FieldSchema): ZodType => {
  const field = node as ArrayFieldSchema;
  const min = field.min ?? (field.required ? 1 : undefined);

  let schema = z.array(z.unknown());
  if (min !== undefined) {
    schema = schema.min(
      min,
      `${labelOf(field)} needs at least ${min} ${plural(min)}`
    );
  }
  if (field.max !== undefined) {
    schema = schema.max(
      field.max,
      `${labelOf(field)} allows at most ${field.max} ${plural(field.max)}`
    );
  }

  return z.preprocess((value) => value ?? [], schema);
};
