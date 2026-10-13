import { defineClientPlugin } from '../../../client';
import { digestDocument, ingestDocument } from '../../../core/form/ingest';
import { TEMPLATE_KEY } from '../../../core/schema/children';
import type { FieldSchema, TinaDocument } from '../../../core/schema/types';
import { validateFieldTree } from '../../../core/validation';
import {
  type ObjectArrayFieldSchema,
  arraySchema,
  asArrayFieldSchema,
  isItemArray,
  isListFor,
  isScalarArray,
  isTemplatesArray,
  itemFieldsOf,
} from './array-field.schema';
import { ArrayField } from './array-field.ui';

// Ingest and digest drop `_template`, so put it back first to keep the stored
// key order.
const convertItems = (
  field: ObjectArrayFieldSchema,
  items: TinaDocument[],
  convert: (item: TinaDocument, fields: FieldSchema[]) => TinaDocument
): TinaDocument[] =>
  items.map((item) => {
    const fields = itemFieldsOf(field, item);
    if (!fields) return { ...item };
    const values = convert(item, fields);
    return isTemplatesArray(field)
      ? { [TEMPLATE_KEY]: item[TEMPLATE_KEY], ...values }
      : values;
  });

const warnUnknownTemplates = (
  field: ObjectArrayFieldSchema,
  items: TinaDocument[]
) => {
  for (const item of items) {
    if (itemFieldsOf(field, item)) continue;
    console.warn(
      `The array field "${field.name}" has an item with ${
        item[TEMPLATE_KEY] === undefined
          ? `no "${TEMPLATE_KEY}"`
          : `the unknown template "${String(item[TEMPLATE_KEY])}"`
      }. It is kept unchanged.`
    );
  }
};

export default defineClientPlugin({
  field: {
    Component: ArrayField,
    metadata: { layout: 'block', labelable: false },
    schema: arraySchema,
    // A stored value of the wrong shape stays as it is, so a save writes it
    // back unchanged (ADR-012: never throw on open).
    parse: (stored: unknown, node, context) => {
      if (stored == null) return [];
      const field = asArrayFieldSchema(node);
      if (!isListFor(field, stored)) return stored;
      if (isScalarArray(field)) {
        const parse = context.registry.get(field.of.type)?.parse;
        return stored.map((item) =>
          item == null || !parse ? item : parse(item, field.of, context)
        );
      }
      if (!isItemArray(stored)) return stored;
      warnUnknownTemplates(field, stored);
      return convertItems(field, stored, (item, fields) =>
        ingestDocument(item, fields, context)
      );
    },
    serialize: (value: unknown, node, context) => {
      const field = asArrayFieldSchema(node);
      if (!isListFor(field, value)) return value;
      if (isScalarArray(field)) {
        const serialize = context.registry.get(field.of.type)?.serialize;
        return value.map((item) => {
          if (item == null) return null;
          return serialize ? serialize(item, field.of, context) : item;
        });
      }
      if (!isItemArray(value)) return value;
      return convertItems(field, value, (item, fields) =>
        digestDocument(item, fields, context)
      );
    },
    validateChildren: (value: unknown, node, address, registry, scope) => {
      const field = asArrayFieldSchema(node);
      if (!isListFor(field, value)) return {};
      const errors: Record<string, string[]> = {};
      if (isScalarArray(field)) {
        const descriptor = registry.get(field.of.type);
        value.forEach((item, index) => {
          Object.assign(
            errors,
            validateFieldTree(
              field.of,
              descriptor,
              item,
              `${address}.${index}`,
              registry,
              scope
            )
          );
        });
        return errors;
      }
      if (!isItemArray(value)) return errors;
      value.forEach((values, index) => {
        for (const subfield of itemFieldsOf(field, values) ?? []) {
          Object.assign(
            errors,
            validateFieldTree(
              subfield,
              registry.get(subfield.type),
              values[subfield.name],
              `${address}.${index}.${subfield.name}`,
              registry,
              { ...scope, siblings: values }
            )
          );
        }
      });
      return errors;
    },
  },
});
