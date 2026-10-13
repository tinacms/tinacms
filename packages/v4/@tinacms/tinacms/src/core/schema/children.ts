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

// How a node nests children, read from its keys so core never names a field
// type: `fields` (object, or array of objects), `templates` (each object names
// its own) or `of` (array of scalars). A value naming no known template has no
// fieldset; the owning plugin's parse already refuses it.
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

// `FieldSchema` does not declare `of`; only the array plugin owns that key, and
// its schema check requires no more than a `type`.
const isFieldNode = (value: unknown): value is FieldSchema =>
  isRecord(value) && typeof value.type === 'string';

export const scalarItemOf = (node: FieldSchema): FieldSchema | undefined =>
  'of' in node && isFieldNode(node.of) ? node.of : undefined;
