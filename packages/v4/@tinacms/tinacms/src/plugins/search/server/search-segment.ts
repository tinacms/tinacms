import { defineServerHook } from '../../../core/form/hooks';
import type { ServerSegment } from '../../../core/plugin';
import type { SearchIndexProvider } from '../../../core/search/index-contract';
import { SEARCH_INDEX_HOOK } from '../../../core/search/index-contract';
import { validateSearchRequest } from '../../../core/search/validate';
import { publicOp } from '../../../server/op-meta';
import { currentServerRuntime } from '../../../server/runtime-access';
import type { SearchPluginConfig } from '../search.plugin';

// Everything below the `server` loader must import no node module (ADR-028 §4).
export const serverSegmentOf = (
  config: SearchPluginConfig,
  provider: SearchIndexProvider
): ServerSegment => {
  const searchable = Object.keys(config.fields);
  const query = publicOp(async (input: unknown) => {
    const { query: text, options } = validateSearchRequest(input, searchable);
    return provider.query({ query: text, ...options });
  });
  const hook = defineServerHook(() => ({
    afterSave: async (document, scope) => {
      if (scope.branch === undefined) return;
      const runtime = currentServerRuntime();
      const fields = config.fields[scope.collection.name];
      if (!fields || !runtime.resolveBranch || !runtime.searchIndex) return;
      const defaultBranch = await runtime.resolveBranch(undefined);
      if (defaultBranch !== scope.branch) return;
      // Loaded on demand: the rich-text codec is large, and only a save needs it.
      const { buildSearchRecord } = await import('../../../core/search/record');
      await runtime.searchIndex.upsert([
        buildSearchRecord(scope.collection, scope.path, document, fields),
      ]);
    },
  }));
  return { query, hooks: { [SEARCH_INDEX_HOOK]: hook }, searchIndex: provider };
};
