import {
  fieldsOf,
  nestedValuesOf,
  scalarItemOf,
} from '../../../../core/schema/children';
import type { FieldSchema, TinaDocument } from '../../../../core/schema/types';
import { isRecord } from '../../../../utils/is-record';

/** The new stored value for a reference value, or undefined to keep it. */
type ReferenceMapper = (value: string) => string | undefined;

/**
 * Whether any field of the fields names `collection` in `collections`, which
 * only a reference field declares. Mirrors the walk of `collectReferences`.
 */
export const referencesCollection = (
  fields: readonly FieldSchema[],
  collection: string
): boolean =>
  fields.some((node) => {
    if (node.collections?.includes(collection)) return true;
    const scalar = scalarItemOf(node);
    const children = [
      ...(fieldsOf(node) ?? []),
      ...(node.templates?.flatMap((template) => template.fields) ?? []),
      ...(scalar ? [scalar] : []),
    ];
    return referencesCollection(children, collection);
  });

/**
 * A copy of `document` with every reference value for `collection` mapped. Only
 * the mapped values change, so a serialize of the result differs from the file
 * by those values alone. Returns the same object when nothing changed.
 */
export const rewriteReferences = (
  document: TinaDocument,
  fields: FieldSchema[],
  collection: string,
  map: ReferenceMapper
): TinaDocument => {
  const mapValue = (node: FieldSchema, value: unknown): string | undefined =>
    typeof value === 'string' && node.collections?.includes(collection)
      ? map(value)
      : undefined;

  const walk = (current: TinaDocument, nodes: FieldSchema[]): TinaDocument => {
    let result = current;
    for (const node of nodes) {
      const value = current[node.name];
      const direct = mapValue(node, value);
      if (direct !== undefined) {
        result = { ...result, [node.name]: direct };
        continue;
      }
      const nested = nestedValuesOf(node, value);
      if (Array.isArray(value)) {
        const items = [...value];
        let changed = false;
        for (const entry of nested) {
          if (entry.index === undefined) continue;
          if ('field' in entry) {
            const next = mapValue(entry.field, entry.value);
            if (next !== undefined) {
              items[entry.index] = next;
              changed = true;
            }
          } else if (isRecord(entry.value)) {
            const next = walk(entry.value, entry.fields);
            if (next !== entry.value) {
              items[entry.index] = next;
              changed = true;
            }
          }
        }
        if (changed) result = { ...result, [node.name]: items };
        continue;
      }
      const only = nested[0];
      if (only && 'fields' in only && isRecord(only.value)) {
        const next = walk(only.value, only.fields);
        if (next !== only.value) result = { ...result, [node.name]: next };
      }
    }
    return result;
  };

  return walk(document, fields);
};
