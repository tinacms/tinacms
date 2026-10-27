import { defineClientPlugin } from '../../../client';
import { digestDocument, ingestDocument } from '../../../core/form/ingest';
import { TEMPLATE_KEY, nestedValuesOf } from '../../../core/schema/children';
import { isRecord } from '../../../utils/is-record';
import type { FieldSchema, TinaDocument } from '../../../core/schema/types';
import { validateFieldTree } from '../../../core/validation';
import {
  type ObjectArrayFieldSchema,
  arraySchema,
  asArrayFieldSchema,
  isItem,
  isScalarArray,
  isTemplatesArray,
  itemFieldsOf,
} from './array-field.schema';
import { ArrayField } from './array-field.ui';

// Ingest and digest drop `_template`, so put it back first to keep the stored
// key order.
const convertItems = (
  field: ObjectArrayFieldSchema,
  items: unknown[],
  convert: (item: TinaDocument, fields: FieldSchema[]) => TinaDocument
): unknown[] =>
  items.map((item) => {
    if (!isItem(item)) return item;
    const fields = itemFieldsOf(field, item);
    if (!fields) return { ...item };
    const values = convert(item, fields);
    return isTemplatesArray(field)
      ? { [TEMPLATE_KEY]: item[TEMPLATE_KEY], ...values }
      : values;
  });

const describeKeptItem = (
  field: ObjectArrayFieldSchema,
  item: unknown
): string | undefined => {
  if (!isItem(item)) return 'an item that is not an object';
  if (itemFieldsOf(field, item)) return undefined;
  return item[TEMPLATE_KEY] === undefined
    ? `an item with no "${TEMPLATE_KEY}"`
    : `an item with the unknown template "${String(item[TEMPLATE_KEY])}"`;
};

const isEmptyList = (value: unknown) =>
  value == null || (Array.isArray(value) && value.length === 0);

const warnKeptItems = (field: ObjectArrayFieldSchema, items: unknown[]) => {
  for (const item of items) {
    const problem = describeKeptItem(field, item);
    if (problem) {
      console.warn(
        `The array field "${field.name}" has ${problem}. It is kept unchanged.`
      );
    }
  }
};

export default defineClientPlugin({
  field: {
    Component: ArrayField,
    metadata: { layout: 'block', labelable: false, drillable: true },
    schema: arraySchema,
    // A stored value of the wrong shape stays as it is, so a save writes it
    // back unchanged (ADR-012: never throw on open).
    parse: (stored: unknown, node, context) => {
      if (stored == null) return [];
      const field = asArrayFieldSchema(node);
      if (!Array.isArray(stored)) return stored;
      if (isScalarArray(field)) {
        const parse = context.registry.get(field.of.type)?.parse;
        return stored.map((item) =>
          item == null || !parse ? item : parse(item, field.of, context)
        );
      }
      warnKeptItems(field, stored);
      return convertItems(field, stored, (item, fields) =>
        ingestDocument(item, fields, context)
      );
    },
    serialize: (value: unknown, node, context) => {
      const field = asArrayFieldSchema(node);
      if (!Array.isArray(value)) return value;
      if (isScalarArray(field)) {
        const serialize = context.registry.get(field.of.type)?.serialize;
        return value.map((item) => {
          if (item == null) return null;
          return serialize ? serialize(item, field.of, context) : item;
        });
      }
      return convertItems(field, value, (item, fields) =>
        digestDocument(item, fields, context)
      );
    },
    isEqual: (a, b) => isEmptyList(a) && isEmptyList(b),
    validateChildren: (value: unknown, node, address, registry, scope) => {
      const field = asArrayFieldSchema(node);
      if (!Array.isArray(value)) return {};
      const errors: Record<string, string[]> = {};
      for (const nested of nestedValuesOf(field, value)) {
        if (nested.index === undefined) continue;
        const at = `${address}.${nested.index}`;
        if ('field' in nested) {
          Object.assign(
            errors,
            validateFieldTree(
              nested.field,
              registry.get(nested.field.type),
              nested.value,
              at,
              registry,
              scope
            )
          );
          continue;
        }
        if (!isRecord(nested.value)) continue;
        const siblings = nested.value;
        for (const subfield of nested.fields) {
          Object.assign(
            errors,
            validateFieldTree(
              subfield,
              registry.get(subfield.type),
              siblings[subfield.name],
              `${at}.${subfield.name}`,
              registry,
              { ...scope, siblings }
            )
          );
        }
      }
      return errors;
    },
  },
});
