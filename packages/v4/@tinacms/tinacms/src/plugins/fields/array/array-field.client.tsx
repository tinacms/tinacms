import { defineClientPlugin } from '../../../client';
import { digestDocument, ingestDocument } from '../../../core/form/ingest';
import type { TinaDocument } from '../../../core/schema/types';
import { validateFieldTree } from '../../../core/validation';
import { arraySchema, asArrayFieldSchema } from './array-field.schema';
import { ArrayField } from './array-field.ui';

export default defineClientPlugin({
  field: {
    Component: ArrayField,
    metadata: { layout: 'block', labelable: false },
    schema: arraySchema,
    parse: (stored: unknown, node, context) => {
      const field = asArrayFieldSchema(node);
      const items = Array.isArray(stored) ? stored : [];
      return items.map((item) =>
        ingestDocument(item as TinaDocument, field.fields, context)
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
