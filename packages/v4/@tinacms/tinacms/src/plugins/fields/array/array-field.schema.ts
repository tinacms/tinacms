import { type ZodType, z } from 'zod';
import { invariant } from '../../../core/invariant';
import { isFieldNode, templateFor } from '../../../core/schema/children';
import { isRecord } from '../../../utils/is-record';
import { OBJECT_FIELD_TYPE } from '../object/object-field.schema';
import type {
  BaseFieldSchema,
  FieldSchema,
  TemplateSchema,
  TinaDocument,
} from '../../../core/schema/types';

export const ARRAY_FIELD_TYPE = 'array';

const COMPOUND_TYPES: string[] = [ARRAY_FIELD_TYPE, OBJECT_FIELD_TYPE];

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

// ADR-017 §4: `of` holds scalars, so its field nests no items of its own.
export type ScalarFieldSchema = FieldSchema & {
  fields?: never;
  templates?: never;
  of?: never;
};

export interface ScalarArrayFieldSchema extends ArrayFieldBase {
  of: ScalarFieldSchema;
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
    candidate.of === undefined || isFieldNode(candidate.of),
    'array-field-schema-invalid',
    `The array field "${node.name}" needs "of" to be a field with a "type".`
  );
  const { of } = candidate;
  const ofRecord = isRecord(of) ? of : {};
  const ofDeclares = ITEM_KEYS.filter((key) => ofRecord[key] !== undefined);
  const holdsItems =
    isFieldNode(of) &&
    (COMPOUND_TYPES.includes(of.type) || ofDeclares.length > 0);
  invariant(
    !holdsItems,
    'array-field-schema-invalid',
    `The array field "${node.name}" needs "of" to be a single-value field, but it is ${
      ofDeclares.length > 0
        ? `a field that declares ${ofDeclares.map((key) => `"${key}"`).join(' and ')}`
        : `of type "${String(ofRecord.type)}"`
    }. Use "fields" for a list of objects, or "templates" for blocks.`
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

const isItem = (item: unknown): item is TinaDocument =>
  item != null && typeof item === 'object' && !Array.isArray(item);

export const isItemArray = (value: unknown): value is TinaDocument[] =>
  Array.isArray(value) && value.every(isItem);

// Whether a value is the list this array edits: objects for `fields` and
// `templates`, any values for `of`.
export const isListFor = (
  field: ArrayFieldSchema,
  value: unknown
): value is unknown[] =>
  isScalarArray(field) ? Array.isArray(value) : isItemArray(value);

// The shape of the value only. `required`, `min` and `max` are validators the
// collection attaches, and they measure the item count.
export const arraySchema = (node: FieldSchema): ZodType => {
  const field = asArrayFieldSchema(node);
  return z.preprocess(
    (value) => value ?? [],
    z.custom<unknown[]>((value) => isListFor(field, value), {
      message: `${node.label ?? node.name} must be a list of items`,
    })
  );
};
