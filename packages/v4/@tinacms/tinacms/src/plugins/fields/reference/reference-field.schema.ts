import { ZodType, z } from 'zod';
import {
  type BaseFieldSchema,
  type FieldSchema,
  REFERENCE_FIELD_TYPE,
} from '../../../core/schema/types';

// The key lives in core, which reads it to resolve references for the
// preview. Re-exported so this file stays the plugin's schema surface, as
// every other field's does.
export { REFERENCE_FIELD_TYPE };

export interface ReferenceFieldSchema extends BaseFieldSchema {
  type: typeof REFERENCE_FIELD_TYPE;
  collections: string[];
}

export const reference = (
  config: Omit<ReferenceFieldSchema, 'type'>
): ReferenceFieldSchema => ({
  type: REFERENCE_FIELD_TYPE,
  ...config,
});

const labelOf = (node: ReferenceFieldSchema): string => node.label ?? node.name;

export const referenceSchema = (node: FieldSchema): ZodType => {
  const field = node as ReferenceFieldSchema;
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
