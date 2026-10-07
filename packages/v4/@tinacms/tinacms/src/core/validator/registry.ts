import type { ValidatorFactory, ValidatorRegistry } from '../field/contract';
import { invariant } from '../invariant';
import {
  REGISTRY_CONFLICTS,
  type RegistryConflict,
  type RegistryEntry,
  composeOverridableRegistry,
} from '../overridable-registry';
import {
  type PluginManifest,
  type ResolvedSegment,
  VALIDATOR_CAPABILITY,
} from '../plugin';

export const overridesValidatorKey = (
  manifest: PluginManifest,
  key: string
): boolean =>
  manifest.overrides.some(
    (override) =>
      override.capability === VALIDATOR_CAPABILITY && override.key === key
  );

export const validatorConflictError = (
  conflict: RegistryConflict,
  key: string
): Error => {
  if (conflict === REGISTRY_CONFLICTS.duplicateOverride) {
    return new Error(
      `Two plugins both declare an \`overrides\` for the validator "${key}". ` +
        'Only one may replace it.'
    );
  }
  return new Error(
    `Two plugins both register the validator "${key}". ` +
      'Declare `overrides: [{ capability: "validator", key }]` to replace it.'
  );
};

// given a plugin returns its validator entries (i.e. KV pair of name to function)
// needed because a plugin may declare numerous validators
const validatorEntriesOf = ({
  manifest,
  segment,
}: ResolvedSegment): RegistryEntry<ValidatorFactory>[] => {
  const declared = manifest.validators ?? [];
  const factories = segment.validators ?? {};
  for (const name of Object.keys(factories)) {
    invariant(
      declared.includes(name),
      'validator-plugin-undeclared-factory',
      `Plugin "${manifest.name}" exports a factory for "${name}" but its manifest does not declare "${name}" in \`validators\`.`
    );
  }
  return declared.map((name) => {
    const factory = factories[name];
    invariant(
      factory,
      'validator-plugin-missing-factory',
      `Plugin "${manifest.name}" declares the validator "${name}" but its client segment has no factory for "${name}".`
    );
    return {
      key: name,
      value: factory,
      isOverride: overridesValidatorKey(manifest, name),
    };
  });
};

// Creates a validator registry from the resolved plugin segments, handling overrides and conflicts.
// registry is used by validateField() to find rule by name
export const createValidatorRegistry = (
  resolved: ResolvedSegment[]
): ValidatorRegistry =>
  composeOverridableRegistry(
    resolved.flatMap(validatorEntriesOf),
    validatorConflictError
  );
