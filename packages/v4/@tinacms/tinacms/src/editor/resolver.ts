import type { Resolver } from 'react-hook-form';
import type { ValidatorRegistry } from '../core/field/contract';
import type { FieldRegistry } from '../core/field/registry';
import type { CollectionSchema, TinaDocument } from '../core/schema/types';
import { validateFieldTree } from '../core/validation';
import { nestFieldErrors } from './field-errors';

export const buildFormResolver =
  (
    collection: CollectionSchema,
    registry: FieldRegistry,
    validators: ValidatorRegistry = new Map()
  ): Resolver<TinaDocument> =>
  (values) => {
    const flatErrors: Record<string, string[]> = {};
    const scope = { validators, siblings: values, values };
    for (const node of collection.fields) {
      const descriptor = registry.get(node.type);
      const value = values[node.name];
      Object.assign(
        flatErrors,
        validateFieldTree(node, descriptor, value, node.name, registry, scope)
      );
    }
    if (Object.keys(flatErrors).length === 0) return { values, errors: {} };
    return { values: {}, errors: nestFieldErrors(flatErrors) };
  };
