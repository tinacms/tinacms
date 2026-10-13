import { type ZodType, z } from 'zod';
import { invariant } from '../../../core/invariant';
import { templateFor } from '../../../core/schema/children';
import { isRecord } from '../../../utils/is-record';
import type {
  BaseFieldSchema,
  FieldSchema,
  TemplateSchema,
  TinaDocument,
} from '../../../core/schema/types';

export const ARRAY_FIELD_TYPE = 'array';

interface ArrayFieldBase extends BaseFieldSchema {
  type: typeof ARRAY_FIELD_TYPE;
}

export interface FieldsArrayFieldSchema extends ArrayFieldBase {
  fields: FieldSchema[];
  templates?: never;
  of?: never;
}

export interface TemplatesArrayFieldSchema extends ArrayFieldBase {
  templates: TemplateSchema[];
  fields?: never;
  of?: never;
}

export interface ScalarArrayFieldSchema extends ArrayFieldBase {
  of: FieldSchema;
  fields?: never;
  templates?: never;
}

// ADR-017 §4: an array declares its items with exactly one of `fields`,
// `templates` or `of`.
export type ArrayFieldSchema =
  | FieldsArrayFieldSchema
  | TemplatesArrayFieldSchema
  | ScalarArrayFieldSchema;

type ArrayFieldConfig<T extends ArrayFieldSchema> = Omit<T, 'type'>;

// Overloads: one per item shape, so the return type matches the config.
// `t.array({ templates })` returns `TemplatesArrayFieldSchema`, not the union.
export function array(
  config: ArrayFieldConfig<FieldsArrayFieldSchema>
): FieldsArrayFieldSchema;

export function array(
  config: ArrayFieldConfig<TemplatesArrayFieldSchema>
): TemplatesArrayFieldSchema;

export function array(
  config: ArrayFieldConfig<ScalarArrayFieldSchema>
): ScalarArrayFieldSchema;

// The implementation. Callers never see this signature. TypeScript cannot
// prove that the spread keeps one shape, so the cast is necessary.
export function array(
  config: ArrayFieldConfig<ArrayFieldSchema>
): ArrayFieldSchema {
  return { ...config, type: ARRAY_FIELD_TYPE } as ArrayFieldSchema;
}

export const isTemplatesArray = (
  field: ArrayFieldSchema
): field is TemplatesArrayFieldSchema => field.templates !== undefined;

export const isScalarArray = (
  field: ArrayFieldSchema
): field is ScalarArrayFieldSchema => field.of !== undefined;

const ITEM_KEYS = ['fields', 'templates', 'of'] as const;

// A raw config or codegen output reaches the descriptor as a bare `FieldSchema`.
// Narrow it here so a malformed node fails loudly, not later on `.map`.
export const asArrayFieldSchema = (node: FieldSchema): ArrayFieldSchema => {
  invariant(
    node.type === ARRAY_FIELD_TYPE,
    'array-field-schema-invalid',
    `The field "${node.name}" is not an array field.`
  );
  const candidate = node as Partial<
    Record<(typeof ITEM_KEYS)[number], unknown>
  >;
  const declared = ITEM_KEYS.filter((key) => candidate[key] !== undefined);
  invariant(
    declared.length === 1,
    'array-field-schema-invalid',
    declared.length === 0
      ? `The array field "${node.name}" needs one of "fields", "templates" or "of".`
      : `The array field "${node.name}" declares ${declared.map((key) => `"${key}"`).join(' and ')}; use exactly one.`
  );
  invariant(
    candidate.fields === undefined || Array.isArray(candidate.fields),
    'array-field-schema-invalid',
    `The array field "${node.name}" needs "fields" to be an array.`
  );
  invariant(
    candidate.templates === undefined ||
      (Array.isArray(candidate.templates) && candidate.templates.length > 0),
    'array-field-schema-invalid',
    `The array field "${node.name}" needs "templates" to be an array with at least one template.`
  );
  const names = Array.isArray(candidate.templates)
    ? candidate.templates.map((template: unknown) =>
        isRecord(template) ? template.name : undefined
      )
    : [];
  invariant(
    new Set(names).size === names.length,
    'array-field-schema-invalid',
    `The array field "${node.name}" declares two templates with the same name.`
  );
  invariant(
    candidate.of === undefined ||
      (isRecord(candidate.of) && typeof candidate.of.type === 'string'),
    'array-field-schema-invalid',
    `The array field "${node.name}" needs "of" to be a field with a "type".`
  );
  return node as ArrayFieldSchema;
};

export type ObjectArrayFieldSchema =
  | FieldsArrayFieldSchema
  | TemplatesArrayFieldSchema;

export const itemFieldsOf = (
  field: ObjectArrayFieldSchema,
  item: TinaDocument
): FieldSchema[] | undefined =>
  isTemplatesArray(field)
    ? templateFor(field.templates, item)?.fields
    : field.fields;

// The shape of the value only. `required`, `min` and `max` are validators the
// collection attaches, and they measure the item count.
export const arraySchema = (_node: FieldSchema): ZodType =>
  z.preprocess((value) => value ?? [], z.array(z.unknown()));
