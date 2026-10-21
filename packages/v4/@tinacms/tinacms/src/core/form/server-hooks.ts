import { z } from 'zod';
import type { Session } from '../auth/contract';
import type {
  ContentSaveInput,
  ContentSaveResult,
  DocumentEntry,
} from '../content/contract';
import { invariant } from '../invariant';
import type { PluginManifest, ResolvedServerSegment } from '../plugin';
import type { CollectionSchema, HookRef } from '../schema/types';
import {
  type ServerFormHooks,
  type ServerHookFactory,
  type ServerHookScope,
  hookProvidersOf,
  runBeforeSave,
} from './hooks';

export type ServerHookRegistry = ReadonlyMap<string, ServerHookFactory>;

// A server factory comes from the plugin that wins the hook name, so an
// override that has no server side removes the server side of the name.
export const createServerHookRegistry = (
  plugins: PluginManifest[],
  resolved: ResolvedServerSegment[]
): ServerHookRegistry => {
  for (const { manifest, ops } of resolved) {
    for (const name of Object.keys(ops.hooks ?? {})) {
      invariant(
        manifest.serverHooks?.includes(name),
        'hooks-plugin-undeclared-server-factory',
        `Plugin "${manifest.name}" exports a server hook factory for "${name}" but its manifest does not declare "${name}" in \`serverHooks\`.`
      );
    }
  }
  const registry = new Map<string, ServerHookFactory>();
  for (const plugin of plugins) {
    for (const name of plugin.serverHooks ?? []) {
      invariant(
        plugin.hooks?.includes(name),
        'hooks-plugin-undeclared-server-hook',
        `Plugin "${plugin.name}" declares the server hook "${name}" but does not declare "${name}" in \`hooks\`.`
      );
    }
  }
  for (const [name, plugin] of hookProvidersOf(plugins)) {
    if (!plugin.serverHooks?.includes(name)) continue;
    const factory = resolved.find(({ manifest }) => manifest === plugin)?.ops
      .hooks?.[name];
    invariant(
      factory,
      'hooks-plugin-missing-server-factory',
      `Plugin "${plugin.name}" declares the server hook "${name}" but its server segment has no factory for "${name}".`
    );
    registry.set(name, factory);
  }
  return registry;
};

interface NamedServerHooks {
  name: string;
  hooks: ServerFormHooks;
}

// A name with no server side is a client-only hook, which the server skips.
const resolveServerHooks = (
  registry: ServerHookRegistry,
  refs: readonly HookRef[]
): NamedServerHooks[] =>
  refs.flatMap((ref) => {
    const factory = registry.get(ref.name);
    return factory
      ? [{ name: ref.name, hooks: factory(...(ref.args ?? [])) }]
      : [];
  });

const contentSaveInputSchema = z.object({
  collection: z.string(),
  path: z.string(),
  value: z.record(z.string(), z.unknown()),
  branch: z.string().optional(),
});

const documentEntrySchema = z.object({
  path: z.string(),
  document: z.record(z.string(), z.unknown()),
});

export interface ServerSaveConfig {
  hooks: ServerHookRegistry;
  // Undefined when the host passed no schema, which only holds while no
  // server hook is installed.
  collections: readonly CollectionSchema[] | undefined;
  write: (input: ContentSaveInput) => Promise<unknown>;
}

export class InvalidSaveInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSaveInputError';
  }
}

export type ServerSave = (
  input: unknown,
  session: Session | null
) => Promise<ContentSaveResult>;

// beforeSave pipeline → the provider's write → every afterSave. An afterSave
// failure is logged, and the save stands with a warning that names the hook.
export const createServerSave =
  ({ hooks, collections, write }: ServerSaveConfig): ServerSave =>
  async (input, session) => {
    const parsed = contentSaveInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new InvalidSaveInputError(
        'A save needs a collection, a path and a document value.'
      );
    }
    const save = parsed.data;
    const collection = collections?.find(
      ({ name }) => name === save.collection
    );
    if (collections && !collection) {
      throw new InvalidSaveInputError(
        `Unknown collection "${save.collection}".`
      );
    }
    const resolved = collection
      ? resolveServerHooks(hooks, collection.hooks ?? [])
      : [];
    const scope: ServerHookScope | null = collection
      ? { path: save.path, collection, session, branch: save.branch }
      : null;
    const value = scope
      ? await runBeforeSave(
          resolved.map((hook) => hook.hooks),
          save.value,
          scope
        )
      : save.value;
    const written = documentEntrySchema.parse(
      await write({
        collection: save.collection,
        path: save.path,
        value,
        branch: save.branch,
      })
    );
    const entry: DocumentEntry = {
      path: written.path,
      document: written.document,
    };
    const hookWarnings: string[] = [];
    if (scope) {
      for (const { name, hooks: hook } of resolved) {
        try {
          await hook.afterSave?.(entry.document, scope);
        } catch (cause) {
          console.error(
            `[tinacms] Server afterSave hook "${name}" failed:`,
            cause
          );
          hookWarnings.push(`The afterSave hook "${name}" failed.`);
        }
      }
    }
    return { entry, hookWarnings };
  };
