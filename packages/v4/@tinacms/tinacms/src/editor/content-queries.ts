import {
  skipToken,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { use } from 'react';
import { currentBranchOf } from '../core/branch/contract';
import {
  ContentError,
  type ContentSaveInput,
  type ContentSaveResult,
  type DocumentEntry,
  type DocumentSummary,
  type ContentErrorCode,
  isContentRefusalCode,
  isProviderRefusalCode,
} from '../core/content/contract';
import { invariant } from '../core/invariant';
import type { TinaDocument } from '../core/schema/types';
import { RpcError } from '../rpc/proxy';
import { type SavedDocument, TinaRuntimeContext } from './context';
import { useContentSlice, useRpcClient, useTinaStore } from './hooks';

// The branch is the last element, so `all()` still prefixes every key. A key
// built without a branch names the default branch.
export const contentKeys = {
  all: () => ['tina', 'content'] as const,
  list: (collection: string, branch?: string) => [
    ...contentKeys.all(),
    'list',
    collection,
    branch ?? '',
  ],
  document: (collection: string, path: string, branch?: string) => [
    ...contentKeys.all(),
    'document',
    collection,
    path,
    branch ?? '',
  ],
};

export const useCurrentBranch = (): string | undefined =>
  useTinaStore(currentBranchOf);

export const CONTENT_STALE_TIME = 30_000;

const EMPTY_DOCUMENTS: DocumentSummary[] = [];

export interface CollectionDocuments {
  documents: DocumentSummary[];
  isLoading: boolean;
  error: Error | null;
}

export const useCollectionDocuments = (
  collection: string | undefined
): CollectionDocuments => {
  const content = useContentSlice();
  const branch = useCurrentBranch();
  const query = useQuery({
    queryKey: contentKeys.list(collection ?? '', branch),
    queryFn: collection ? () => content.list(collection) : skipToken,
    staleTime: CONTENT_STALE_TIME,
  });
  return {
    documents: query.data ?? EMPTY_DOCUMENTS,
    isLoading: query.isLoading,
    error: query.error,
  };
};

/** The file paths of every listed collection, and whether every list has been read. */
export const useCollectionsDocumentPaths = (
  collections: readonly string[]
): { paths: ReadonlySet<string>; settled: boolean } => {
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
    paths: new Set(
      results.flatMap((result) => (result.data ?? []).map(({ path }) => path))
    ),
    settled: results.every((result) => result.isSuccess),
  };
};

export interface DocumentRead {
  entry: DocumentEntry | null;
  isLoading: boolean;
  error: Error | null;
}

export const useDocument = (
  collection: string | undefined,
  path: string | undefined
): DocumentRead => {
  const content = useContentSlice();
  const branch = useCurrentBranch();
  const query = useQuery({
    queryKey: contentKeys.document(collection ?? '', path ?? '', branch),
    queryFn:
      collection && path ? () => content.get(collection, path) : skipToken,
    staleTime: CONTENT_STALE_TIME,
  });
  return {
    entry: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
  };
};

const upsertByPath = (
  summaries: DocumentSummary[],
  summary: DocumentSummary
): DocumentSummary[] => {
  const index = summaries.findIndex((cached) => cached.path === summary.path);
  if (index === -1) return [...summaries, summary];
  const next = [...summaries];
  next[index] = summary;
  return next;
};

export interface SaveDocumentInput {
  collection: string;
  path: string;
  value: TinaDocument;
}

export type SavedEntry = DocumentEntry & SavedDocument;

export interface DocumentSave {
  save: (input: SaveDocumentInput) => Promise<SavedEntry>;
  isSaving: boolean;
}

interface ContentSaveSegments {
  content: {
    update: (input: ContentSaveInput) => Promise<ContentSaveResult>;
  };
}

// A static host answers a route it lacks with 404 or 405, or with an HTML page.
const STATUS_ERROR_CODES: Partial<Record<number, ContentErrorCode>> = {
  401: 'unauthorized',
  403: 'forbidden',
};

const toServerSaveError = (cause: unknown): ContentError => {
  if (cause instanceof TypeError) {
    return new ContentError('network', cause.message);
  }
  if (!(cause instanceof RpcError)) {
    if (cause instanceof Error) {
      return new ContentError('backend-failure', cause.message);
    }
    return new ContentError('backend-failure', String(cause));
  }
  if (isContentRefusalCode(cause.code)) {
    return new ContentError(cause.code, cause.message);
  }
  if (
    cause.status === 404 ||
    cause.status === 405 ||
    cause.code === 'rpc-not-json'
  ) {
    return new ContentError('server-route-missing', cause.message);
  }
  if (isProviderRefusalCode(cause.code)) {
    return new ContentError(cause.code, cause.message);
  }
  return new ContentError(
    STATUS_ERROR_CODES[cause.status] ?? 'backend-failure',
    cause.message
  );
};

export const useSaveDocument = (): DocumentSave => {
  const runtime = use(TinaRuntimeContext);
  invariant(
    runtime,
    'save-document-outside-provider',
    'useSaveDocument must be used within a TinaProvider'
  );
  const content = useContentSlice();
  const server = useRpcClient<ContentSaveSegments>({ url: runtime.rpcUrl });
  const queryClient = useQueryClient();
  const hasServerHooks = (collection: string): boolean =>
    runtime.schema.collections
      .find(({ name }) => name === collection)
      ?.hooks?.some(({ name }) => runtime.serverHooks.has(name)) ?? false;
  const saveThroughServer = async (
    input: SaveDocumentInput
  ): Promise<SavedEntry> => {
    const branch = currentBranchOf(runtime.store.getState());
    try {
      const { entry, hookWarnings } = await server.content.update({
        ...input,
        ...(typeof branch === 'string' && branch ? { branch } : {}),
      });
      return { ...entry, hookWarnings };
    } catch (cause) {
      throw toServerSaveError(cause);
    }
  };
  const mutation = useMutation({
    mutationFn: (input: SaveDocumentInput): Promise<SavedEntry> =>
      hasServerHooks(input.collection)
        ? saveThroughServer(input)
        : content.update(input.collection, input.path, input.value),
    onMutate: () => currentBranchOf(runtime.store.getState()),
    onSuccess: async (
      { document, hookWarnings, ...summary },
      { collection },
      branch
    ) => {
      const listKey = contentKeys.list(collection, branch);
      await Promise.all([
        queryClient.cancelQueries({
          queryKey: listKey,
          exact: true,
        }),
        queryClient.cancelQueries({
          queryKey: contentKeys.document(collection, summary.path, branch),
          exact: true,
        }),
      ]);
      if (!queryClient.getQueryData<DocumentSummary[]>(listKey)) {
        // Cancelling the first read leaves an active query pending with no data.
        // Restart it before applying the save summary so the navigator is not
        // stranded in an empty state while preserving the confirmed metadata.
        await queryClient.refetchQueries({
          queryKey: listKey,
          exact: true,
          type: 'active',
        });
      }
      queryClient.setQueryData<DocumentSummary[]>(
        listKey,
        (cached) => (cached ? upsertByPath(cached, summary) : undefined)
      );
      queryClient.setQueryData<DocumentEntry>(
        contentKeys.document(collection, summary.path, branch),
        { ...summary, document }
      );
    },
  });
  return { save: mutation.mutateAsync, isSaving: mutation.isPending };
};

export const useInvalidateContent = (): (() => Promise<void>) => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: contentKeys.all() });
};
