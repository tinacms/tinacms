import type { Resolver } from 'react-hook-form';
import type { FieldRegistry } from '../core/field/registry';
import type { CollectionSchema, TinaDocument } from '../core/schema/types';
import { validateField } from '../core/validation';
import { type FieldErrorEntry, toFieldErrorEntry } from './field-errors';

export const buildFormResolver =
  (
    collection: CollectionSchema,
    registry: FieldRegistry
  ): Resolver<TinaDocument> =>
  (values) => {
    const errors: Record<string, FieldErrorEntry> = {};
    for (const node of collection.fields) {
      const descriptor = registry.get(node.type);
      const fieldErrors = validateField(node, descriptor, values[node.name]);
      if (fieldErrors.length > 0) {
        errors[node.name] = toFieldErrorEntry(fieldErrors);
      }
    }
    // The resolver contract of RHF returns { values, errors }. After a failure,
    // errors holds the field errors and values is empty. After a success, errors is
    // empty and the values pass through.
    return Object.keys(errors).length > 0
      ? { values: {}, errors }
      : { values, errors: {} };
  };
