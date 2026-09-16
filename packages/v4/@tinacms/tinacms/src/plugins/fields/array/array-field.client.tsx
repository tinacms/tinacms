import { defineClientPlugin } from '../../../client';
import { digestDocument, ingestDocument } from '../../../core/form/ingest';
import { invariant } from '../../../core/invariant';
import type { TinaDocument } from '../../../core/schema/types';
import { validateFieldTree } from '../../../core/validation';
import { arraySchema, asArrayFieldSchema } from './array-field.schema';
import { ArrayField } from './array-field.ui';

const isItemObject = (item: unknown): item is TinaDocument =>
  item != null && typeof item === 'object' && !Array.isArray(item);

// Refuse content that is not an array of objects. Coercing it to `[]` here
// means the next save writes that `[]` back over whatever the file held.
const asItemArray = (stored: unknown, name: string): TinaDocument[] => {
  if (stored == null) return [];
  invariant(
    Array.isArray(stored) && stored.every(isItemObject),
    'array-field-content-invalid',
    `The array field "${name}" expected an array of objects in the stored content.`
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
      return asItemArray(stored, node.name).map((item) =>
        ingestDocument(item, field.fields, context)
      );
    },
    serialize: (value: TinaDocument[], node, context) => {
      const field = asArrayFieldSchema(node);
      return value.map((item) => digestDocument(item, field.fields, context));
    },
    validateChildren: (value: TinaDocument[], node, address, registry) => {
      const field = asArrayFieldSchema(node);
      const items = Array.isArray(value) ? value : [];
      const errors: Record<string, string[]> = {};
      items.forEach((item, index) => {
        for (const subfield of field.fields) {
          const descriptor = registry.get(subfield.type);
          Object.assign(
            errors,
            validateFieldTree(
              subfield,
              descriptor,
              item?.[subfield.name],
              `${address}.${index}.${subfield.name}`,
              registry
            )
          );
        }
      });
      return errors;
    },
  },
});
