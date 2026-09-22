import type { FormId } from '../../form/form-store';
import type { FieldAddress } from '../field/address';
import { invariant } from '../invariant';
import type { JsonValue } from '../json';
import {
  REGISTRY_CONFLICTS,
  type RegistryConflict,
  type RegistryEntry,
  composeOverridableRegistry,
} from '../overridable-registry';
import {
  HOOKS_CAPABILITY,
  type PluginManifest,
  type ResolvedSegment,
} from '../plugin';
import type { CollectionSchema, HookRef, TinaDocument } from '../schema/types';

export interface FormHookScope {
  formId: FormId;
  path: string;
  collection: CollectionSchema;
}

export interface FieldEdit {
  address: FieldAddress;
  value: unknown;
}

export interface FormHooks {
  beforeSave?: (
    document: TinaDocument,
    scope: FormHookScope
  ) => TinaDocument | Promise<TinaDocument>;
  afterSave?: (
    document: TinaDocument,
    scope: FormHookScope
  ) => void | Promise<void>;
  onChange?: (edit: FieldEdit, scope: FormHookScope) => void;
}

export type FormHookFactory = (...args: JsonValue[]) => FormHooks;

export type FormHookRegistry = ReadonlyMap<string, FormHookFactory>;

export const overridesHookKey = (
  manifest: PluginManifest,
  key: string
): boolean =>
  manifest.overrides.some(
    (override) =>
      override.capability === HOOKS_CAPABILITY && override.key === key
  );

export const hookConflictError = (
  conflict: RegistryConflict,
  key: string
): Error => {
  if (conflict === REGISTRY_CONFLICTS.duplicateOverride) {
    return new Error(
      `Two plugins both declare an \`overrides\` for the form hook "${key}". ` +
        'Only one may replace it.'
    );
  }
  return new Error(
    `Two plugins both register the form hook "${key}". ` +
      'Declare `overrides: [{ capability: "hooks", key }]` to replace it.'
  );
};

const hookEntriesOf = ({
  manifest,
  segment,
}: ResolvedSegment): RegistryEntry<FormHookFactory>[] => {
  const declared = manifest.hooks ?? [];
  const factories = segment.hooks ?? {};
  for (const name of Object.keys(factories)) {
    invariant(
      declared.includes(name),
      'hooks-plugin-undeclared-factory',
      `Plugin "${manifest.name}" exports a form hook factory for "${name}" but its manifest does not declare "${name}" in \`hooks\`.`
    );
  }
  return declared.map((name) => {
    const factory = factories[name];
    invariant(
      factory,
      'hooks-plugin-missing-factory',
      `Plugin "${manifest.name}" declares the form hook "${name}" but its client segment has no factory for "${name}".`
    );
    return {
      key: name,
      value: factory,
      isOverride: overridesHookKey(manifest, name),
    };
  });
};

export const createFormHookRegistry = (
  resolved: ResolvedSegment[]
): FormHookRegistry =>
  composeOverridableRegistry(
    resolved.flatMap(hookEntriesOf),
    hookConflictError
  );

export const resolveFormHooks = (
  registry: FormHookRegistry,
  refs: readonly HookRef[]
): readonly FormHooks[] =>
  refs.map((ref) => {
    const factory = registry.get(ref.name);
    invariant(
      factory,
      'schema-unknown-hook',
      `The schema uses the form hook "${ref.name}", but no installed plugin registers the form hook "${ref.name}".`
    );
    return factory(...(ref.args ?? []));
  });

export const runBeforeSave = async (
  hooks: readonly FormHooks[],
  document: TinaDocument,
  scope: FormHookScope
): Promise<TinaDocument> => {
  let current = document;
  for (const hook of hooks) {
    if (hook.beforeSave) current = await hook.beforeSave(current, scope);
  }
  return current;
};

export const runAfterSave = async (
  hooks: readonly FormHooks[],
  document: TinaDocument,
  scope: FormHookScope
): Promise<void> => {
  for (const hook of hooks) await hook.afterSave?.(document, scope);
};

export const runOnChange = (
  hooks: readonly FormHooks[],
  edit: FieldEdit,
  scope: FormHookScope
): void => {
  for (const hook of hooks) {
    try {
      hook.onChange?.(edit, scope);
    } catch (cause) {
      console.error('[tinacms] onChange hook failed:', cause);
    }
  }
};
