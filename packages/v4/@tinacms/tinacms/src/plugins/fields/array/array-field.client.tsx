import { defineClientPlugin } from '../../../client';
import { digestDocument, ingestDocument } from '../../../core/form/ingest';
import { invariant } from '../../../core/invariant';
import type { TinaDocument } from '../../../core/schema/types';
import { validateFieldTree } from '../../../core/validation';
import {
  TEMPLATE_KEY,
  arraySchema,
  asArrayFieldSchema,
  isScalarArray,
  isTemplatesArray,
  itemFieldsOf,
  templateOf,
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
      return asItemArray(stored, node.name).map((item) => {
        const values = ingestDocument(item, itemFieldsOf(field, item), context);
        return isTemplatesArray(field)
          ? { [TEMPLATE_KEY]: templateOf(field, item).name, ...values }
          : values;
      });
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
      return asItemArray(value, node.name).map((item) => {
        const values = digestDocument(item, itemFieldsOf(field, item), context);
        return isTemplatesArray(field)
          ? { [TEMPLATE_KEY]: templateOf(field, item).name, ...values }
          : values;
      });
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
        for (const subfield of itemFieldsOf(field, values)) {
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
