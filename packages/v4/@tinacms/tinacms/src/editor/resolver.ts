import type { Resolver } from 'react-hook-form';
import type { ValidatorRegistry } from '../core/field/contract';
import type { FieldRegistry } from '../core/field/registry';
import type { CollectionSchema, TinaDocument } from '../core/schema/types';
import { validateFieldTree } from '../core/validation';
import type { FormId } from '../form/form-store';
import { nestFieldErrors } from './field-errors';
import { heldServerErrors } from './server-errors';

export const validateDocument = (
  collection: CollectionSchema,
  registry: FieldRegistry,
  validators: ValidatorRegistry,
  values: TinaDocument
): Record<string, string[]> => {
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
  return flatErrors;
};

export const buildFormResolver =
  (
    collection: CollectionSchema,
    registry: FieldRegistry,
    validators: ValidatorRegistry = new Map(),
    formId?: FormId
  ): Resolver<TinaDocument> =>
  (values) => {
    const flatErrors = validateDocument(
      collection,
      registry,
      validators,
      values
    );
    for (const [address, messages] of Object.entries(
      formId ? heldServerErrors(formId, values) : {}
    )) {
      flatErrors[address] = [
        ...new Set([...(flatErrors[address] ?? []), ...messages]),
      ];
    }
    if (Object.keys(flatErrors).length === 0) return { values, errors: {} };
    return { values: {}, errors: nestFieldErrors(flatErrors) };
  };
