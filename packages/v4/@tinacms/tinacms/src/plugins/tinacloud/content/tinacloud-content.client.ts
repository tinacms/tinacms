import {
  type ContentProvider,
  type DocumentSummary,
  type ListQuery,
  isProviderRefusalError,
  ContentError,
} from '../../../core/content/contract';
import { queryDocuments } from '../../../core/content/list-query';
import { currentBranchOf } from '../../../core/branch/contract';
import type { SliceSet, TinaStoreState } from '../../../core/plugin';
import { type TinaCloudClientOptions, createTinaCloudClient } from '../client';
import { toContentError } from './errors';
import {
  TinaCloudGraphQLError,
  fetchDocument,
  fetchDocumentPage,
  updateDocument,
} from './request';

// `relativePath` is the path inside the collection's configured `path`, so
// the difference is the collection's folder. A `relativePath` that is not a
// whole trailing segment of `path` gives the unrooted listing.
const collectionFolderOf = (path: string, relativePath: string): string =>
  relativePath !== '' && path.endsWith(`/${relativePath}`)
    ? path.slice(0, -(relativePath.length + 1))
    : '';

const titleOf = (values: Record<string, unknown>): string | undefined =>
  typeof values.title === 'string' && values.title !== ''
    ? values.title
    : undefined;

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
          return { path: document._sys.path, document: document._values };
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
      list: async (collection, query?: ListQuery) => {
        const summaries: DocumentSummary[] = [];
        let root = '';
        try {
          const target = await branch();
          let after: string | null = null;
          while (true) {
            const page = await fetchDocumentPage(
              client,
              target,
              collection,
              after
            );
            for (const { node } of page.edges) {
              const title = titleOf(node._values);
              root = collectionFolderOf(node._sys.path, node._sys.relativePath);
              summaries.push({
                path: node._sys.path,
                ...(title === undefined ? {} : { title }),
              });
            }
            const { hasNextPage, endCursor } = page.pageInfo;
            if (!hasNextPage || !endCursor || endCursor === after) break;
            after = endCursor;
          }
        } catch (cause) {
          throw toContentError(cause);
        }
        try {
          return queryDocuments({
            summaries,
            root,
            query,
          });
        } catch (cause) {
          if (isProviderRefusalError(cause)) {
            throw new ContentError(cause.code, cause.message);
          }
          throw cause;
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
          return { path: document._sys.path, document: document._values };
        } catch (cause) {
          throw toContentError(cause);
        }
      },
    } satisfies ContentProvider;
    return content;
  };
