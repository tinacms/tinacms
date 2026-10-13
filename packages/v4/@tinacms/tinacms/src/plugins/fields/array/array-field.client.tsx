import { defineClientPlugin } from '../../../client';
import { digestDocument, ingestDocument } from '../../../core/form/ingest';
import type { TinaDocument } from '../../../core/schema/types';
import { validateFieldTree } from '../../../core/validation';
import {
  arraySchema,
  asArrayFieldSchema,
  isItemArray,
} from './array-field.schema';
import { ArrayField } from './array-field.ui';

export default defineClientPlugin({
  field: {
    Component: ArrayField,
    metadata: { layout: 'block', labelable: false },
    schema: arraySchema,
    // A stored value that is not a list of items stays as it is, so a save
    // writes it back unchanged (ADR-012: never throw on open).
    parse: (stored: unknown, node, context) => {
      if (stored == null) return [];
      if (!isItemArray(stored)) return stored;
      const field = asArrayFieldSchema(node);
      return stored.map((item) => ingestDocument(item, field.fields, context));
    },
    serialize: (value: unknown, node, context) => {
      if (!isItemArray(value)) return value;
      const field = asArrayFieldSchema(node);
      return value.map((item) => digestDocument(item, field.fields, context));
    },
    validateChildren: (value: unknown, node, address, registry, scope) => {
      const field = asArrayFieldSchema(node);
      const items = isItemArray(value) ? value : [];
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
              registry,
              { ...scope, siblings: item ?? {} }
            )
          );
        }
      });
      return errors;
    },
  },
});
