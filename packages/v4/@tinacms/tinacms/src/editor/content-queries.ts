import {
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { DocumentEntry } from '../core/content/contract';
import type { TinaDocument } from '../core/schema/types';
import { useContentSlice } from './hooks';

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

const EMPTY_DOCUMENTS: DocumentEntry[] = [];

export interface CollectionDocuments {
  documents: DocumentEntry[];
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
  entries: DocumentEntry[],
  entry: DocumentEntry
): DocumentEntry[] => {
  const index = entries.findIndex((cached) => cached.path === entry.path);
  if (index === -1) return [...entries, entry];
  const next = [...entries];
  next[index] = entry;
  return next;
};

export interface SaveDocumentInput {
  collection: string;
  path: string;
  value: TinaDocument;
}

export interface DocumentSave {
  save: (input: SaveDocumentInput) => Promise<DocumentEntry>;
  isSaving: boolean;
}

export const useSaveDocument = (): DocumentSave => {
  const content = useContentSlice();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ collection, path, value }: SaveDocumentInput) =>
      content.update(collection, path, value),
    onSuccess: (entry, { collection }) => {
      queryClient.setQueryData<DocumentEntry[]>(
        contentKeys.list(collection),
        (cached) => (cached ? upsertByPath(cached, entry) : undefined)
      );
      queryClient.setQueryData(
        contentKeys.document(collection, entry.path),
        entry
      );
    },
  });
  return { save: mutation.mutateAsync, isSaving: mutation.isPending };
};

export const useInvalidateContent = (): (() => Promise<void>) => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: contentKeys.all() });
};
