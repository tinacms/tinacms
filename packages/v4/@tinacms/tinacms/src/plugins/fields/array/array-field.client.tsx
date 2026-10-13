import { defineClientPlugin } from '../../../client';
import { digestDocument, ingestDocument } from '../../../core/form/ingest';
import { invariant } from '../../../core/invariant';
import { TEMPLATE_KEY } from '../../../core/schema/children';
import type { FieldSchema, TinaDocument } from '../../../core/schema/types';
import { validateFieldTree } from '../../../core/validation';
import {
  type ObjectArrayFieldSchema,
  arraySchema,
  asArrayFieldSchema,
  isScalarArray,
  isTemplatesArray,
  itemFieldsOf,
} from './array-field.schema';
import { ArrayField } from './array-field.ui';

const isItemObject = (item: unknown): item is TinaDocument =>
  item != null && typeof item === 'object' && !Array.isArray(item);

// Refuse content of the wrong shape. Coercing it to `[]` here means the next
// save writes that `[]` back over whatever the file held.
const asItemArray = (stored: unknown, name: string): TinaDocument[] => {
  if (stored == null) return [];
  invariant(
    Array.isArray(stored) && stored.every(isItemObject),
    'array-field-content-invalid',
    `The array field "${name}" expected an array of objects in the stored content.`
  );
  return stored;
};

const asScalarArray = (stored: unknown, name: string): unknown[] => {
  if (stored == null) return [];
  invariant(
    Array.isArray(stored),
    'array-field-content-invalid',
    `The array field "${name}" expected an array in the stored content.`
  );
  return stored;
};

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
    parse: (stored: unknown, node, context) => {
      const field = asArrayFieldSchema(node);
      if (isScalarArray(field)) {
        const parse = context.registry.get(field.of.type)?.parse;
        return asScalarArray(stored, node.name).map((item) =>
          item == null || !parse ? item : parse(item, field.of, context)
        );
      }
      const items = asItemArray(stored, node.name);
      warnUnknownTemplates(field, items);
      return convertItems(field, items, (item, fields) =>
        ingestDocument(item, fields, context)
      );
    },
    serialize: (value: unknown[], node, context) => {
      const field = asArrayFieldSchema(node);
      if (isScalarArray(field)) {
        const serialize = context.registry.get(field.of.type)?.serialize;
        return value.map((item) => {
          if (item == null) return null;
          return serialize ? serialize(item, field.of, context) : item;
        });
      }
      return convertItems(
        field,
        asItemArray(value, node.name),
        (item, fields) => digestDocument(item, fields, context)
      );
    },
    validateChildren: (value: unknown[], node, address, registry, scope) => {
      const field = asArrayFieldSchema(node);
      const items = Array.isArray(value) ? value : [];
      const errors: Record<string, string[]> = {};
      if (isScalarArray(field)) {
        const descriptor = registry.get(field.of.type);
        items.forEach((item, index) => {
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
      items.forEach((item, index) => {
        const values = isItemObject(item) ? item : {};
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
