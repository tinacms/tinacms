import { useQueries } from '@tanstack/react-query';
import type { DocumentSummary } from '../core/content/contract';
import {
  CONTENT_STALE_TIME,
  contentKeys,
  useCurrentBranch,
} from './content-queries';
import { useContentSlice } from './hooks';

export interface CollectionList {
  collection: string;
  documents: DocumentSummary[];
  status: 'loading' | 'failed' | 'ready';
}

const EMPTY_DOCUMENTS: DocumentSummary[] = [];

/**
 * The document list of each collection on the current branch, with the same
 * cache keys as `useCollectionDocuments`, so one read serves every caller.
 */
export const useCollectionLists = (
  collections: readonly string[]
): { lists: CollectionList[]; retryFailed: () => void } => {
  const content = useContentSlice();
  const branch = useCurrentBranch();
  const results = useQueries({
    queries: collections.map((collection) => ({
      queryKey: contentKeys.list(collection, branch),
      queryFn: () => content.list(collection),
      staleTime: CONTENT_STALE_TIME,
    })),
  });
  return {
    lists: results.map((result, index): CollectionList => {
      const collection = collections[index] ?? '';
      if (result.isSuccess) {
        return { collection, documents: result.data, status: 'ready' };
      }
      return {
        collection,
        documents: EMPTY_DOCUMENTS,
        status: result.isError && !result.isFetching ? 'failed' : 'loading',
      };
    }),
    retryFailed: () => {
      for (const result of results) {
        if (result.isError) void result.refetch();
      }
    },
  };
};
