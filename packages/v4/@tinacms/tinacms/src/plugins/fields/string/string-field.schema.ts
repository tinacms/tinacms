import { type ZodType, z } from 'zod';
import type { BaseFieldSchema, FieldSchema } from '../../../core/schema/types';

export const STRING_FIELD_TYPE = 'string';

export interface StringFieldSchema extends BaseFieldSchema {
  type: typeof STRING_FIELD_TYPE;
}

export const string = (
  config: Omit<StringFieldSchema, 'type'>
): StringFieldSchema => ({ ...config, type: STRING_FIELD_TYPE });

// The shape of the value only. `required`, `min`, `max` and `pattern` are
// validators the collection attaches (`_docs/field-plugins.md`).
export const stringSchema = (_node: FieldSchema): ZodType =>
  z.preprocess(
    (value) => (value === '' || value == null ? undefined : value),
    z.string().optional()
  );
