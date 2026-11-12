import {
  type CapabilityOverride,
  HOOKS_CAPABILITY,
  type PluginManifest,
  type ServerSegment,
  definePlugin,
} from '../../core/plugin';
import type { HookRef } from '../../core/schema/types';
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

const withHookOverride = (
  overrides: CapabilityOverride[] | undefined
): CapabilityOverride[] | undefined => {
  if (!overrides?.some(({ capability }) => capability === 'search')) {
    return overrides;
  }
  const hasHook = overrides.some(
    (override) =>
      override.capability === HOOKS_CAPABILITY &&
      override.key === SEARCH_INDEX_HOOK
  );
  return hasHook
    ? overrides
    : [...overrides, { capability: HOOKS_CAPABILITY, key: SEARCH_INDEX_HOOK }];
};

/**
 * Turns a provider's server module and its searchable fields into a `search`
 * plugin: the client slice, the public `search/query` op, the save-time
 * indexing hook and the index writes core calls in-process (ADR-021). The hook
 * is part of the plugin's own wiring, so overriding `search` also overrides the
 * `searchIndex` hook of the plugin it replaces.
 */
export const defineSearchPlugin = (
  config: SearchPluginConfig
): PluginManifest =>
  definePlugin({
    name: config.name,
    provides: ['search', 'hooks'],
    search: { fields: config.fields },
    hooks: [SEARCH_INDEX_HOOK],
    serverHooks: [SEARCH_INDEX_HOOK],
    overrides: withHookOverride(config.overrides),
    onInit: config.onInit,
    onDestroy: config.onDestroy,
    client: async () => {
      const { createSearchSlice } = await import('./search.client');
      return { default: { slice: createSearchSlice } };
    },
    server: async () => {
      const [{ serverSegmentOf }, { default: provider }] = await Promise.all([
        import('./server/search-segment'),
        config.server(),
      ]);
      return { default: serverSegmentOf(config, provider) };
    },
  });
