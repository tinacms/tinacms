import { isRecord } from '../../utils/is-record';
import type { FieldSchema, TemplateSchema } from './types';

// ADR-017 §3: an item of a `templates` position names its template here.
export const TEMPLATE_KEY = '_template';

export const templateFor = (
  templates: TemplateSchema[],
  item: Record<string, unknown>
): TemplateSchema | undefined =>
  templates.find((template) => template.name === item[TEMPLATE_KEY]);

export const fieldsOf = (node: FieldSchema): FieldSchema[] | undefined =>
  'fields' in node && Array.isArray(node.fields) ? node.fields : undefined;

// A value naming no known template has no fieldset.
export const fieldsetOf = (
  node: FieldSchema,
  value: unknown
): FieldSchema[] | undefined => {
  const fields = fieldsOf(node);
  if (fields) return fields;
  if (node.templates && isRecord(value)) {
    return templateFor(node.templates, value)?.fields;
  }
  return undefined;
};

export const isFieldNode = (value: unknown): value is FieldSchema =>
  isRecord(value) && typeof value.type === 'string';

// `FieldSchema` does not declare `of`; only the array plugin owns that key.
export const scalarItemOf = (node: FieldSchema): FieldSchema | undefined =>
  'of' in node && isFieldNode(node.of) ? node.of : undefined;

// A value nested under a node, read either as one value with `field` (an `of`
// item) or as an object with `fields`. `index` is set for an item of a list.
export type NestedValue = { index?: number; value: unknown } & (
  | { field: FieldSchema }
  | { fields: FieldSchema[] }
);

// The walks that read values (references, validation) find a node's children
// here, read from its keys so core never names a field type: `fields`, the
// template an item names, or `of`. An item with no known fieldset, or an `of`
// value that is not a list, has no children.
export const nestedValuesOf = (
  node: FieldSchema,
  value: unknown
): NestedValue[] => {
  const scalar = scalarItemOf(node);
  if (Array.isArray(value)) {
    return value.flatMap((item, index): NestedValue[] => {
      if (scalar) return [{ index, value: item, field: scalar }];
      const fields = fieldsetOf(node, item);
      return fields ? [{ index, value: item, fields }] : [];
    });
  }
  if (scalar) return [];
  const fields = fieldsetOf(node, value);
  return fields ? [{ value, fields }] : [];
};
