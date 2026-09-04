import { type ZodType, z } from 'zod';
import { invariant } from '../../../core/invariant';
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

const labelOf = (node: ArrayFieldSchema): string => node.label ?? node.name;

const plural = (count: number): string => (count === 1 ? 'item' : 'items');

export const arraySchema = (node: FieldSchema): ZodType => {
  const field = asArrayFieldSchema(node);

  let schema = z.array(z.unknown());
  if (field.min != null) {
    schema = schema.min(
      field.min,
      `${labelOf(field)} needs at least ${field.min} ${plural(field.min)}`
    );
  }
  if (field.max != null) {
    schema = schema.max(
      field.max,
      `${labelOf(field)} allows at most ${field.max} ${plural(field.max)}`
    );
  }
  // `required` is a floor of one item. `min` only raises that floor, so
  // `required` with `min: 0` still needs an item rather than the other way.
  if (field.required && !(field.min && field.min > 0)) {
    schema = schema.min(1, `${labelOf(field)} needs at least 1 item`);
  }

  return z.preprocess((value) => value ?? [], schema);
};
