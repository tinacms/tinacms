import {
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { use } from 'react';
import {
  ContentError,
  type ContentSaveInput,
  type ContentSaveResult,
  type DocumentEntry,
  type DocumentSummary,
} from '../core/content/contract';
import { invariant } from '../core/invariant';
import type { TinaDocument } from '../core/schema/types';
import { RpcError } from '../rpc/proxy';
import { type SavedDocument, TinaRuntimeContext } from './context';
import { useContentSlice, useRpcClient } from './hooks';

export const contentKeys = {
  all: () => ['tina', 'content'] as const,
  list: (collection: string) => [...contentKeys.all(), 'list', collection],
  document: (collection: string, path: string) => [
    ...contentKeys.all(),
    'document',
    collection,
    path,
  ],
};

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
  const query = useQuery({
    queryKey: contentKeys.list(collection ?? ''),
    queryFn: collection ? () => content.list(collection) : skipToken,
    staleTime: CONTENT_STALE_TIME,
  });
  return {
    documents: query.data ?? EMPTY_DOCUMENTS,
    isLoading: query.isLoading,
    error: query.error,
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
  const query = useQuery({
    queryKey: contentKeys.document(collection ?? '', path ?? ''),
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
const toServerSaveError = (cause: unknown): ContentError => {
  if (cause instanceof TypeError) {
    return new ContentError('server-route-missing', cause.message);
  }
  if (!(cause instanceof RpcError)) {
    if (cause instanceof Error) {
      return new ContentError('backend-failure', cause.message);
    }
    return new ContentError('backend-failure', String(cause));
  }
  if (cause.code === 'hook-rejected' || cause.code === 'write-refused') {
    return new ContentError(cause.code, cause.message);
  }
  if (
    cause.status === 404 ||
    cause.status === 405 ||
    cause.code === 'rpc-not-json'
  ) {
    return new ContentError('server-route-missing', cause.message);
  }
  if (cause.status === 401)
    return new ContentError('unauthorized', cause.message);
  if (cause.status === 403) return new ContentError('forbidden', cause.message);
  return new ContentError('backend-failure', cause.message);
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
    const branch = runtime.store.getState().branch?.name;
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
    onSuccess: ({ path, document }, { collection }) => {
      queryClient.setQueryData<DocumentSummary[]>(
        contentKeys.list(collection),
        (cached) => (cached ? upsertByPath(cached, { path }) : undefined)
      );
      queryClient.setQueryData<DocumentEntry>(
        contentKeys.document(collection, path),
        { path, document }
      );
    },
  });
  return { save: mutation.mutateAsync, isSaving: mutation.isPending };
};

export const useInvalidateContent = (): (() => Promise<void>) => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: contentKeys.all() });
};
