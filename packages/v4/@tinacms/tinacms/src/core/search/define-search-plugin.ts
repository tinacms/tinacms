import { currentServerRuntime } from '../../server/runtime-access';
import { tagOp } from '../../server/op-meta';
import { DEFAULT_RPC_URL } from '../../rpc/proxy';
import { defineServerHook } from '../form/hooks';
import {
  type CapabilityOverride,
  type PluginManifest,
  type ServerSegment,
  definePlugin,
} from '../plugin';
import type { HookRef } from '../schema/types';
import { createSearchClient } from './client';
import {
  SEARCH_INDEX_HOOK,
  type SearchFields,
  type SearchIndexProvider,
} from './index-contract';
import { buildSearchRecord } from './record';
import { validateSearchRequest } from './validate';

/** Lists on a collection's `hooks` to index its saves on the default branch. */
export const searchIndex = (): HookRef => ({ name: SEARCH_INDEX_HOOK });

export interface SearchPluginConfig {
  name: string;
  /** Collection name to field name to weight. Only `string` and `rich-text` fields. */
  fields: SearchFields;
  /** ADR-007 server loader. Its default export is the provider's `SearchIndexProvider`. */
  server: () => Promise<{ default: SearchIndexProvider }>;
  overrides?: CapabilityOverride[];
  onInit?: () => void | Promise<void>;
  onDestroy?: () => void | Promise<void>;
}

// Everything below the `server` loader must import no node module (ADR-028 §4).
const serverSegmentOf = (
  config: SearchPluginConfig,
  provider: SearchIndexProvider
): ServerSegment => {
  const searchable = Object.keys(config.fields);
  const query = tagOp(
    async (input: unknown) => {
      const { query: text, options } = validateSearchRequest(input, searchable);
      return provider.query({ query: text, ...options });
    },
    { public: true, permissions: [] }
  );
  const hook = defineServerHook(() => ({
    afterSave: async (document, scope) => {
      if (scope.branch === undefined) return;
      const runtime = currentServerRuntime();
      const fields = config.fields[scope.collection.name];
      if (!fields || !runtime.resolveBranch || !runtime.searchIndex) return;
      const defaultBranch = await runtime.resolveBranch(undefined);
      if (defaultBranch !== scope.branch) return;
      await runtime.searchIndex.upsert([
        buildSearchRecord(scope.collection, scope.path, document, fields),
      ]);
    },
  }));
  return { query, hooks: { [SEARCH_INDEX_HOOK]: hook }, searchIndex: provider };
};

/**
 * Turns a provider's server module and its searchable fields into a `search`
 * plugin: the client slice, the public `search/query` op, the save-time
 * indexing hook and the index writes core calls in-process (ADR-021).
 */
export const defineSearchPlugin = (
  config: SearchPluginConfig
): PluginManifest =>
  definePlugin({
    name: config.name,
    provides: ['search'],
    search: { fields: config.fields },
    hooks: [SEARCH_INDEX_HOOK],
    serverHooks: [SEARCH_INDEX_HOOK],
    overrides: config.overrides,
    onInit: config.onInit,
    onDestroy: config.onDestroy,
    client: async () => ({
      default: {
        slice: (_set, _get, sliceConfig) =>
          createSearchClient({
            rpcUrl: sliceConfig?.rpcUrl ?? DEFAULT_RPC_URL,
          }),
      },
    }),
    server: async () => ({
      default: serverSegmentOf(config, (await config.server()).default),
    }),
  });
