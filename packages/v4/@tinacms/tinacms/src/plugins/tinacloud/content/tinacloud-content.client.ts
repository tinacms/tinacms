import type {
  ContentProvider,
  DocumentSummary,
} from '../../../core/content/contract';
import { currentBranchOf } from '../../../core/branch/contract';
import type { SliceSet, TinaStoreState } from '../../../core/plugin';
import { type TinaCloudClientOptions, createTinaCloudClient } from '../client';
import { toContentError } from './errors';
import {
  TinaCloudGraphQLError,
  fetchDocument,
  fetchDocumentPage,
  summaryOf,
  updateDocument,
} from './request';

// Branch is operational data the Data Layer owns (ADR-019, ADR-024), so with
// no branch in the store the slice uses the project's default branch.
export const createTinaCloudContentSlice =
  (options: TinaCloudClientOptions) =>
  (_set: SliceSet, get: () => TinaStoreState) => {
    const client = createTinaCloudClient(options);
    const branch = async (): Promise<string> => {
      const current = currentBranchOf(get());
      if (current) return current;
      const { defaultBranch } = await client.getProject();
      if (!defaultBranch) {
        throw new Error('The TinaCloud project has no default branch.');
      }
      return defaultBranch;
    };
    const content = {
      branches: {
        list: () => client.listBranches(),
        defaultBranch: async () => (await client.getProject()).defaultBranch,
      },
      get: async (collection, path) => {
        try {
          const document = await fetchDocument(
            client,
            await branch(),
            collection,
            path
          );
          if (!document) return null;
          return { ...summaryOf(document._sys), document: document._values };
        } catch (cause) {
          const error = toContentError(cause);
          if (
            cause instanceof TinaCloudGraphQLError &&
            error.code === 'not-found'
          ) {
            return null;
          }
          throw error;
        }
      },
      list: async (collection) => {
        try {
          const target = await branch();
          const summaries: DocumentSummary[] = [];
          let after: string | null = null;
          let historyRevision: string | null = null;
          while (true) {
            const page = await fetchDocumentPage(
              client,
              target,
              collection,
              after,
              historyRevision
            );
            for (const { node } of page.edges) {
              summaries.push(summaryOf(node._sys));
            }
            const { hasNextPage, endCursor } = page.pageInfo;
            historyRevision = page.pageInfo.historyRevision ?? historyRevision;
            if (!hasNextPage || !endCursor || endCursor === after) {
              return summaries;
            }
            after = endCursor;
          }
        } catch (cause) {
          throw toContentError(cause);
        }
      },
      update: async (collection, path, value) => {
        try {
          const document = await updateDocument(
            client,
            await branch(),
            collection,
            path,
            value
          );
          return { ...summaryOf(document._sys), document: document._values };
        } catch (cause) {
          throw toContentError(cause);
        }
      },
    } satisfies ContentProvider;
    return content;
  };
