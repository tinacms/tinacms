import type { FormId } from '../../form/form-store';
import type { Session } from '../auth/contract';
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

// A server hook has no form, so its scope has no `formId`. `session` is null
// when no auth plugin verifies the request. `branch` is undefined on the
// default branch, and on a Data Layer that has no branches.
export interface ServerHookScope {
  path: string;
  collection: CollectionSchema;
  session: Session | null;
  branch?: string;
}

export interface ServerFormHooks {
  beforeSave?: (
    document: TinaDocument,
    scope: ServerHookScope
  ) => TinaDocument | Promise<TinaDocument>;
  afterSave?: (
    document: TinaDocument,
    scope: ServerHookScope
  ) => void | Promise<void>;
}

export type ServerHookFactory = (...args: JsonValue[]) => ServerFormHooks;

export type ServerHookLoader<Args extends JsonValue[] = JsonValue[]> =
  () => Promise<{ default: (...args: Args) => ServerFormHooks }>;

export const defineServerHook = <Args extends JsonValue[]>(
  factory: (...args: Args) => ServerFormHooks
): ((...args: Args) => ServerFormHooks) => factory;

export class HookRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HookRejectedError';
  }
}

// The one way a server hook's message reaches the editor. Any other throw
// answers with a generic failure.
export const reject = (message: string): never => {
  throw new HookRejectedError(message);
};

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

const NO_CLIENT_SIDE: FormHookFactory = () => ({});

const hookEntriesOf = ({
  manifest,
  segment,
}: ResolvedSegment): RegistryEntry<FormHookFactory>[] => {
  const declared = manifest.hooks ?? [];
  const serverSides = manifest.serverHooks ?? [];
  const factories = segment.hooks ?? {};
  for (const name of Object.keys(factories)) {
    invariant(
      declared.includes(name),
      'hooks-plugin-undeclared-factory',
      `Plugin "${manifest.name}" exports a form hook factory for "${name}" but its manifest does not declare "${name}" in \`hooks\`.`
    );
  }
  return declared.map((name) => {
    const factory =
      factories[name] ??
      (serverSides.includes(name) ? NO_CLIENT_SIDE : undefined);
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

export const hookProvidersOf = (
  plugins: PluginManifest[]
): Map<string, PluginManifest> =>
  composeOverridableRegistry(
    plugins.flatMap((plugin) =>
      (plugin.hooks ?? []).map((name) => ({
        key: name,
        value: plugin,
        isOverride: overridesHookKey(plugin, name),
      }))
    ),
    hookConflictError
  );

// The hook names whose winning registration has a server side. The client
// routes a save from these without loading any server code.
export const serverHookNamesOf = (
  plugins: PluginManifest[]
): ReadonlySet<string> =>
  new Set(
    [...hookProvidersOf(plugins)]
      .filter(([name, plugin]) => plugin.serverHooks?.includes(name))
      .map(([name]) => name)
  );

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

interface SaveHooks<Scope> {
  beforeSave?: (
    document: TinaDocument,
    scope: Scope
  ) => TinaDocument | Promise<TinaDocument>;
  afterSave?: (document: TinaDocument, scope: Scope) => void | Promise<void>;
}

export const runBeforeSave = async <Scope>(
  hooks: readonly SaveHooks<Scope>[],
  document: TinaDocument,
  scope: Scope
): Promise<TinaDocument> => {
  let current = document;
  for (const hook of hooks) {
    if (hook.beforeSave) current = await hook.beforeSave(current, scope);
  }
  return current;
};

export const runAfterSave = async <Scope>(
  hooks: readonly SaveHooks<Scope>[],
  document: TinaDocument,
  scope: Scope
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
  readonly factory?: FormHookFactory;
  readonly server?: ServerHookLoader;
}

export interface HookDefinition<Args extends JsonValue[]>
  extends RegisteredHook {
  (...args: Args): HookRef;
}

export interface HookSides<Args extends JsonValue[]> {
  client?: (...args: Args) => FormHooks;
  server?: ServerHookLoader<Args>;
}

export function defineHook<Args extends JsonValue[]>(
  name: string,
  factory: (...args: Args) => FormHooks
): HookDefinition<Args> & { readonly factory: FormHookFactory };
export function defineHook<Args extends JsonValue[]>(
  name: string,
  sides: HookSides<Args>
): HookDefinition<Args>;
export function defineHook<Args extends JsonValue[]>(
  name: string,
  sides: ((...args: Args) => FormHooks) | HookSides<Args>
): HookDefinition<Args> {
  // The registry stores every hook under the widest Args; the ref helper keeps Args.
  const { client, server } = (
    typeof sides === 'function' ? { client: sides } : sides
  ) as HookSides<JsonValue[]>;
  return Object.assign(
    (...args: Args): HookRef => (args.length > 0 ? { name, args } : { name }),
    { hookName: name, factory: client, server }
  );
}

export const defineHooksPlugin = (
  name: string,
  hooks: readonly RegisteredHook[]
): PluginManifest => {
  const serverSides = hooks.flatMap(({ hookName, server }) =>
    server ? [{ hookName, server }] : []
  );
  return definePlugin({
    name,
    provides: [HOOKS_CAPABILITY],
    hooks: hooks.map((hook) => hook.hookName),
    serverHooks: serverSides.map((hook) => hook.hookName),
    client: async () => ({
      default: {
        hooks: Object.fromEntries(
          hooks.flatMap(({ hookName, factory }) =>
            factory ? [[hookName, factory]] : []
          )
        ),
      },
    }),
    ...(serverSides.length > 0
      ? {
          server: async () => ({
            default: {
              hooks: Object.fromEntries(
                await Promise.all(
                  serverSides.map(async ({ hookName, server }) => [
                    hookName,
                    (await server()).default,
                  ])
                )
              ),
            },
          }),
        }
      : {}),
  });
};
