import { type ZodType, z } from 'zod';
import type { BaseFieldSchema, FieldSchema } from '../../../core/schema/types';

export const BOOLEAN_FIELD_TYPE = 'boolean';

export interface BooleanFieldSchema extends BaseFieldSchema {
  type: typeof BOOLEAN_FIELD_TYPE;
}

export const boolean = (
  config: Omit<BooleanFieldSchema, 'type'>
): BooleanFieldSchema => ({ ...config, type: BOOLEAN_FIELD_TYPE });

// The field has two states. The value `false` is valid, and there is no empty state, so
// this schema cannot enforce `required`. It checks the type of the value only, and `null`
// passes as an absent value.
export const booleanSchema = (_node: FieldSchema): ZodType =>
  z.preprocess(
    (value) => (value == null ? undefined : value),
    z.boolean().optional()
  );
