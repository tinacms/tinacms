import type { ContentFieldErrors } from '../content/contract';
import { toFieldAddress } from '../field/address';
import type {
  FieldMeasure,
  FieldValidationContext,
  ValidatorRegistry,
} from '../field/contract';
import { invariant } from '../invariant';
import type { FieldProvision, PluginManifest } from '../plugin';
import { fieldConflictError, overridesFieldKey } from '../field/registry';
import { composeOverridableRegistry } from '../overridable-registry';
import { fieldsOf, nestedValuesOf } from '../schema/children';
import type {
  CollectionSchema,
  FieldSchema,
  TinaDocument,
} from '../schema/types';
import {
  isEmptyValue,
  isSkippedField,
  joinAddress,
  measureValue,
} from '../validation';
import { isRecord } from '../../utils/is-record';

type StoredHelpers = NonNullable<FieldProvision['stored']>;

// The stored-value helpers of the plugin that wins each field type, after
// overrides. A winner that declares none leaves the type on the defaults. The
// Backend loads manifests and never client segments (ADR-028 §9).
export const storedHelpersOf = (
  plugins: readonly PluginManifest[]
): ReadonlyMap<string, StoredHelpers | undefined> =>
  composeOverridableRegistry(
    plugins.flatMap((plugin) =>
      plugin.field
        ? [
            {
              key: plugin.field.type,
              value: plugin.field.stored,
              isOverride: overridesFieldKey(plugin, plugin.field.type),
            },
          ]
        : []
    ),
    fieldConflictError
  );

export interface StoredValidationConfig {
  validators: ValidatorRegistry;
  stored: ReadonlyMap<string, StoredHelpers | undefined>;
}

// A rule returns a message, a list of messages or null. Anything else, such as
// a Promise from an untyped plugin, is a throw (a generic 500).
const messagesOf = (result: unknown, name: string): string[] => {
  if (result === null) return [];
  if (typeof result === 'string') return [result];
  invariant(
    Array.isArray(result) && result.every((item) => typeof item === 'string'),
    'validator-bad-result',
    `The validator "${name}" must return a message, a list of messages or null.`
  );
  return result;
};

/**
 * Runs the field-level validators a collection lists against the stored
 * document the browser sent (ADR-028 §9). Descriptor-free: it reads the schema
 * for the shape, so its depth follows the schema and not the payload. Same
 * skip rule and address form as the form's `validateFieldTree`.
 */
export const validateStoredDocument = (
  collection: CollectionSchema,
  document: TinaDocument,
  config: StoredValidationConfig
): ContentFieldErrors => {
  const errors: Record<string, string[]> = {};

  const check = (
    node: FieldSchema,
    value: unknown,
    address: string,
    siblings: TinaDocument
  ) => {
    if (isSkippedField(node)) return;
    const helpers = config.stored.get(node.type);
    const context: FieldValidationContext = {
      node,
      address,
      siblings,
      values: document,
      isEmpty: (candidate) =>
        helpers?.isEmpty?.(candidate) ?? isEmptyValue(candidate),
      measure: (candidate): FieldMeasure | null =>
        helpers?.measure ? helpers.measure(candidate) : measureValue(candidate),
    };
    const messages: string[] = [];
    for (const ref of node.validators ?? []) {
      const factory = config.validators.get(ref.name);
      invariant(
        factory,
        'validator-unknown',
        `Field "${address}" lists the validator "${ref.name}", but no plugin registers it.`
      );
      messages.push(
        ...messagesOf(factory(...(ref.args ?? []))(value, context), ref.name)
      );
    }
    if (messages.length > 0) errors[address] = messages;

    if (Array.isArray(value)) {
      for (const nested of nestedValuesOf(node, value)) {
        const at = joinAddress(address, nested.index ?? 0);
        if ('field' in nested) {
          check(nested.field, nested.value, at, siblings);
        } else if (isRecord(nested.value)) {
          walk(nested.fields, nested.value, at);
        }
      }
      return;
    }
    const fields = fieldsOf(node);
    if (!fields) return;
    if (isRecord(value)) walk(fields, value, address);
    else if (value == null && helpers?.childrenWhenAbsent) {
      walk(fields, {}, address);
    }
  };

  const walk = (
    fields: FieldSchema[],
    record: TinaDocument,
    prefix: string
  ) => {
    for (const node of fields) {
      check(node, record[node.name], joinAddress(prefix, node.name), record);
    }
  };

  walk(collection.fields, document, '');
  const fieldErrors: ContentFieldErrors = {};
  for (const [address, messages] of Object.entries(errors)) {
    fieldErrors[toFieldAddress(address)] = messages;
  }
  return fieldErrors;
};
