import { defineClientPlugin } from '../../../client';
import { digestDocument, ingestDocument } from '../../../core/form/ingest';
import { invariant } from '../../../core/invariant';
import type { TinaDocument } from '../../../core/schema/types';
import { validateFieldTree } from '../../../core/validation';
import { asObjectFieldSchema, objectSchema } from './object-field.schema';
import { ObjectField } from './object-field.ui';

const isPlainObject = (value: unknown): value is TinaDocument =>
  value != null && typeof value === 'object' && !Array.isArray(value);

// Refuse content that is not an object. Coercing it to `{}` here means the next
// save writes that `{}` back over whatever the file held.
const asObjectValue = (stored: unknown, name: string): TinaDocument => {
  if (stored == null) return {};
  invariant(
    isPlainObject(stored),
    'object-field-content-invalid',
    `The object field "${name}" expected an object in the stored content.`
  );
  return stored;
};

export default defineClientPlugin({
  field: {
    Component: ObjectField,
    metadata: { layout: 'block', labelable: false },
    schema: objectSchema,
    parse: (stored: unknown, node, context) => {
      const field = asObjectFieldSchema(node);
      return ingestDocument(
        asObjectValue(stored, node.name),
        field.fields,
        context
      );
    },
    serialize: (value: TinaDocument, node, context) => {
      const field = asObjectFieldSchema(node);
      return digestDocument(value, field.fields, context);
    },
    validateChildren: (value: TinaDocument, node, address, registry) => {
      const field = asObjectFieldSchema(node);
      const object = isPlainObject(value) ? value : {};
      const errors: Record<string, string[]> = {};
      for (const subfield of field.fields) {
        const descriptor = registry.get(subfield.type);
        Object.assign(
          errors,
          validateFieldTree(
            subfield,
            descriptor,
            object[subfield.name],
            `${address}.${subfield.name}`,
            registry
          )
        );
      }
      return errors;
    },
  },
});
