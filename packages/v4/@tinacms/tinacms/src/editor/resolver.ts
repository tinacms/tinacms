import type { FieldValues, Resolver } from 'react-hook-form';
import { set } from 'react-hook-form';
import type { FieldRegistry } from '../core/field/registry';
import type { CollectionSchema, TinaDocument } from '../core/schema/types';
import { validateField } from '../core/validation';
import { toFieldErrorEntry } from './field-errors';

export const buildFormResolver =
  (
    collection: CollectionSchema,
    registry: FieldRegistry
  ): Resolver<TinaDocument> =>
  (values) => {
    // A nested address (an array item's own field) is a react-hook-form path,
    // not a flat object key — `set` builds the real nested tree react-hook-form
    // expects from a custom resolver's `errors`, the same tree `get` (in
    // `useFieldErrors`) reads back.
    const errors: FieldValues = {};
    let hasErrors = false;
    for (const node of collection.fields) {
      const descriptor = registry.get(node.type);
      const value = values[node.name];
      const fieldErrors = validateField(node, descriptor, value);
      if (fieldErrors.length > 0) {
        hasErrors = true;
        set(errors, node.name, toFieldErrorEntry(fieldErrors));
      }
      const childErrors = descriptor?.validateChildren?.(value, node, registry);
      for (const [address, messages] of Object.entries(childErrors ?? {})) {
        if (messages.length > 0) {
          hasErrors = true;
          set(errors, address, toFieldErrorEntry(messages));
        }
      }
    }
    return hasErrors ? { values: {}, errors } : { values, errors: {} };
  };
