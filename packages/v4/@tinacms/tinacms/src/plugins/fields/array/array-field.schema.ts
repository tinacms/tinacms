import { type ZodType, z } from 'zod';
import { invariant } from '../../../core/invariant';
import type { BaseFieldSchema, FieldSchema } from '../../../core/schema/types';

export const ARRAY_FIELD_TYPE = 'array';

export interface ArrayFieldSchema extends BaseFieldSchema {
  type: typeof ARRAY_FIELD_TYPE;
  fields: FieldSchema[];
}

export const array = (
  config: Omit<ArrayFieldSchema, 'type'>
): ArrayFieldSchema => ({ ...config, type: ARRAY_FIELD_TYPE });

// A raw config or codegen output reaches the descriptor as a bare `FieldSchema`.
// Narrow it here so a node with no `fields` fails loudly, not later on `.map`.
export const asArrayFieldSchema = (node: FieldSchema): ArrayFieldSchema => {
  invariant(
    node.type === ARRAY_FIELD_TYPE &&
      Array.isArray((node as ArrayFieldSchema).fields),
    'array-field-schema-invalid',
    `The array field "${node.name}" needs a "fields" array.`
  );
  return node as ArrayFieldSchema;
};

// The shape of the value only. `required`, `min` and `max` are validators the
// collection attaches, and they measure the item count.
export const arraySchema = (_node: FieldSchema): ZodType =>
  z.preprocess((value) => value ?? [], z.array(z.unknown()));
