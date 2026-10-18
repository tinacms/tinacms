import { defineClientPlugin } from '../../../client';
import { digestDocument, ingestDocument } from '../../../core/form/ingest';
import type { TinaDocument } from '../../../core/schema/types';
import { validateFieldTree } from '../../../core/validation';
import {
  asObjectFieldSchema,
  isPlainObject,
  objectSchema,
} from './object-field.schema';
import { ObjectField } from './object-field.ui';

export default defineClientPlugin({
  field: {
    Component: ObjectField,
    metadata: { layout: 'block', labelable: false },
    schema: objectSchema,
    // A stored value that is not an object stays as it is, so a save writes it
    // back unchanged (ADR-012: never throw on open).
    parse: (stored: unknown, node, context) => {
      if (stored === undefined) return null;
      const value = stored ?? {};
      if (!isPlainObject(value)) return value;
      return ingestDocument(value, asObjectFieldSchema(node).fields, context);
    },
    serialize: (value: unknown, node, context) => {
      if (!isPlainObject(value)) return value;
      const field = asObjectFieldSchema(node);
      return digestDocument(value, field.fields, context);
    },
    validateChildren: (value: unknown, node, address, registry, scope) => {
      const object = value ?? {};
      if (!isPlainObject(object)) return {};
      const field = asObjectFieldSchema(node);
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
            registry,
            { ...scope, siblings: object }
          )
        );
      }
      return errors;
    },
  },
});
