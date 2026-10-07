import { type ZodType, z } from 'zod';
import { invariant } from '../../../core/invariant';
import type { BaseFieldSchema, FieldSchema } from '../../../core/schema/types';

export const OBJECT_FIELD_TYPE = 'object';

export interface ObjectFieldSchema extends BaseFieldSchema {
  type: typeof OBJECT_FIELD_TYPE;
  fields: FieldSchema[];
}

export const object = (
  config: Omit<ObjectFieldSchema, 'type'>
): ObjectFieldSchema => ({ ...config, type: OBJECT_FIELD_TYPE });

// A raw config or codegen output reaches the descriptor as a bare `FieldSchema`.
// Narrow it here so a node with no `fields` fails loudly, not later on `.map`.
export const asObjectFieldSchema = (node: FieldSchema): ObjectFieldSchema => {
  invariant(
    node.type === OBJECT_FIELD_TYPE &&
      Array.isArray((node as ObjectFieldSchema).fields),
    'object-field-schema-invalid',
    `The object field "${node.name}" needs a "fields" array.`
  );
  return node as ObjectFieldSchema;
};

// The shape of the value only. `required` is a validator the collection
// attaches, and an object with no keys is empty.
export const objectSchema = (_node: FieldSchema): ZodType =>
  z.preprocess((value) => value ?? {}, z.record(z.string(), z.unknown()));
