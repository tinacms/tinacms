import { isRecord } from '../../utils/is-record';
import type { FieldSchema, TemplateSchema, TinaDocument } from './types';

// ADR-017 §3: an item of a `templates` position names its template here.
export const TEMPLATE_KEY = '_template';

export const templateFor = <T extends TemplateSchema>(
  templates: T[],
  item: Record<string, unknown>
): T | undefined =>
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

type ItemLabel = (item: TinaDocument) => unknown;

const itemLabelOf = (node: object): ItemLabel | undefined =>
  'itemLabel' in node && typeof node.itemLabel === 'function'
    ? (node.itemLabel as ItemLabel)
    : undefined;

// A throw or a result that is not a non-empty string is no heading.
export const customItemLabel = (
  node: object,
  item: TinaDocument
): string | undefined => {
  try {
    const label = itemLabelOf(node)?.(item);
    return typeof label === 'string' && label !== '' ? label : undefined;
  } catch {
    return undefined;
  }
};

export const templateTitle = (template: TemplateSchema): string =>
  template.label ?? template.name;

// What an item of a list of objects is called: its `itemLabel`, else its
// template's label, else its position.
export const itemHeadingOf = (
  node: FieldSchema,
  item: unknown,
  index: number
): string => {
  if (!isRecord(item)) return `Item ${index + 1} is not an object`;
  if (!node.templates) {
    return customItemLabel(node, item) ?? `Item ${index + 1}`;
  }
  const template = templateFor(node.templates, item);
  if (template) {
    return customItemLabel(template, item) ?? templateTitle(template);
  }
  const name = item[TEMPLATE_KEY];
  return name === undefined
    ? 'Block with no template'
    : `Unknown block "${String(name)}"`;
};
