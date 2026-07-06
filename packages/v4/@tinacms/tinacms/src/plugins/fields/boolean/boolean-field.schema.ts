import { type ZodType, z } from 'zod';
import type { BaseFieldSchema, FieldSchema } from '../../../core/schema/types';

export const BOOLEAN_FIELD_TYPE = 'boolean';

export interface BooleanFieldSchema extends BaseFieldSchema {
  type: typeof BOOLEAN_FIELD_TYPE;
}

export const boolean = (
  config: Omit<BooleanFieldSchema, 'type'>
): BooleanFieldSchema => ({ ...config, type: BOOLEAN_FIELD_TYPE });

// Two-state: `false` is valid and there's no empty state, so `required` can't be
// enforced — this only type-guards the value (`null` passes as absent).
export const booleanSchema = (_node: FieldSchema): ZodType =>
  z.preprocess(
    (value) => (value == null ? undefined : value),
    z.boolean().optional()
  );
