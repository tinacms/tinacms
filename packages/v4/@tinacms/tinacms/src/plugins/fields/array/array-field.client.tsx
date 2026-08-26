import { defineClientPlugin } from '../../../client';
import type { FieldTransformContext } from '../../../core/field/contract';
import { digestDocument, ingestDocument } from '../../../core/form/ingest';
import { invariant } from '../../../core/invariant';
import type { TinaDocument } from '../../../core/schema/types';
import { validateField } from '../../../core/validation';
import { type ArrayFieldSchema, arraySchema } from './array-field.schema';
import { ArrayField } from './array-field.ui';

const requireRegistry = (context: FieldTransformContext) => {
  invariant(
    context.registry,
    'array-field-no-registry',
    'The array field requires a registry in its transform context.'
  );
  return context.registry;
};

export default defineClientPlugin({
  field: {
    Component: ArrayField,
    metadata: { layout: 'block', labelable: false },
    schema: arraySchema,
    parse: (stored: unknown, node, context) => {
      const field = node as ArrayFieldSchema;
      const registry = requireRegistry(context);
      const items = Array.isArray(stored) ? stored : [];
      return items.map((item) =>
        ingestDocument(item as TinaDocument, field.fields, registry, context)
      );
    },
    serialize: (value: TinaDocument[], node, context) => {
      const field = node as ArrayFieldSchema;
      const registry = requireRegistry(context);
      return value.map((item) =>
        digestDocument(item, field.fields, registry, context)
      );
    },
    validateChildren: (value: TinaDocument[], node, registry) => {
      const field = node as ArrayFieldSchema;
      const items = Array.isArray(value) ? value : [];
      const errors: Record<string, string[]> = {};
      items.forEach((item, index) => {
        for (const subfield of field.fields) {
          const descriptor = registry.get(subfield.type);
          const messages = validateField(
            subfield,
            descriptor,
            item?.[subfield.name]
          );
          if (messages.length > 0) {
            errors[`${field.name}.${index}.${subfield.name}`] = messages;
          }
        }
      });
      return errors;
    },
  },
});
