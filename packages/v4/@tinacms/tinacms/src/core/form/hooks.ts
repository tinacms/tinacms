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
  definePlugin,
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

// TODO(ADR-014 §3): these hooks run in the browser. Enforcement needs a server
// segment `beforeSave` in the save RPC path, which v4 does not supply yet.
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
      `The schema uses the form hook "${ref.name}", but no installed plugin registers it.`
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
  const failures: unknown[] = [];
  for (const hook of hooks) {
    try {
      await hook.afterSave?.(document, scope);
    } catch (cause) {
      failures.push(cause);
    }
  }
  if (failures.length === 0) return;
  for (const cause of failures.slice(1)) {
    console.error('[tinacms] afterSave hook failed:', cause);
  }
  throw failures[0];
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

export interface RegisteredHook {
  readonly hookName: string;
  readonly factory: FormHookFactory;
}

export interface HookDefinition<Args extends JsonValue[]>
  extends RegisteredHook {
  (...args: Args): HookRef;
}

export const defineHook = <Args extends JsonValue[]>(
  name: string,
  factory: (...args: Args) => FormHooks
): HookDefinition<Args> =>
  Object.assign(
    (...args: Args): HookRef => (args.length > 0 ? { name, args } : { name }),
    { hookName: name, factory: factory as FormHookFactory }
  );

export const defineHooksPlugin = (
  name: string,
  hooks: readonly RegisteredHook[]
): PluginManifest =>
  definePlugin({
    name,
    provides: [HOOKS_CAPABILITY],
    hooks: hooks.map((hook) => hook.hookName),
    client: async () => ({
      default: {
        hooks: Object.fromEntries(
          hooks.map((hook) => [hook.hookName, hook.factory])
        ),
      },
    }),
  });
