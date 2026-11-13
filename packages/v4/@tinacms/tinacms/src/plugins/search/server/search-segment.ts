import { defineServerHook } from '../../../core/form/hooks';
import type { ServerSegment } from '../../../core/plugin';
import {
  SEARCH_INDEX_HOOK,
  type SearchFields,
  type SearchIndexProvider,
} from '../../../core/search/index-contract';
import { buildSearchRecord } from '../../../core/search/record';
import { validateSearchRequest } from '../../../core/search/validate';
import { publicOp } from '../../../server/op-meta';
import { currentServerRuntime } from '../../../server/runtime-access';

// Everything below the `server` loader must import no node module (ADR-028 §4).
export const serverSegmentOf = (
  config: { fields: SearchFields },
  provider: SearchIndexProvider,
  { saveHook }: { saveHook: boolean }
): ServerSegment => {
  const searchable = Object.keys(config.fields);
  const query = publicOp(async (input: unknown) => {
    const { query: text, options } = validateSearchRequest(input, searchable);
    return provider.query({ query: text, ...options });
  });
  if (!saveHook) return { query, searchIndex: provider };
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
