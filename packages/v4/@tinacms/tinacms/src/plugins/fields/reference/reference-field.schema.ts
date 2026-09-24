import { ZodType, z } from 'zod';
import type { BaseFieldSchema, FieldSchema } from '../../../core/schema/types';

export const REFERENCE_FIELD_TYPE = 'reference';

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

// The shape of the value only: the path of another document. `required` is a
// validator the collection attaches.
export const referenceSchema = (_node: FieldSchema): ZodType =>
  z.preprocess(
    (value) => (value === '' || value == null ? undefined : value),
    z.string().optional()
  );
