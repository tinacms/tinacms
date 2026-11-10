import {
  type CapabilityOverride,
  type PluginManifest,
  type ServerSegment,
  definePlugin,
} from '../../core/plugin';
import type { HookRef } from '../../core/schema/types';
import { serverSegmentOf } from './server/search-segment';
import {
  SEARCH_INDEX_HOOK,
  type SearchFields,
  type SearchIndexProvider,
} from '../../core/search/index-contract';

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
    client: async () => {
      const { createSearchSlice } = await import('./search.client');
      return { default: { slice: createSearchSlice } };
    },
    server: async () => ({
      default: serverSegmentOf(config, (await config.server()).default),
    }),
  });
