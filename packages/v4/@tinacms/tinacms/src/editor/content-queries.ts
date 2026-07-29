// The cache over the content capability. The capability itself is a transport of plain
// promises (ContentSlice), and this file is the one consumer that decides policy:
// deduplicate concurrent reads, when a read goes stale, what a failed one does, and what
// a save writes back.
//
// The split matters because ContentSlice is the plugin contract. TinaCloud, the
// self-hosted layer, and the v3 shim each implement it, and none of them should have to
// ship a caching strategy — or take a dependency on this query client — to be a data
// layer. React Query stays on this side of that boundary.
//
// These hooks return their own shapes rather than the React Query result. The components
// need the data, the pending flag, and the error, and nothing else; returning the result
// object would also mean spreading it, which reads every tracked property and re-renders
// the caller on query state it never used.

import {
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { DocumentEntry } from '../core/content/contract';
import type { TinaDocument } from '../core/schema/types';
import { useContentSlice } from './hooks';

// One namespace for every content read, so an invalidation can reach the whole
// capability or one collection of it. The functions build on each other, so
// invalidating `all()` reaches every key below it.
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

// Content changes underneath the editor — someone edits the file in their IDE, or a
// teammate pushes — but not on the timescale of a click. Half a minute keeps navigation
// between collections instant without serving a list from the morning.
export const CONTENT_STALE_TIME = 30_000;

// A stable fallback, so a caller that renders the list does not see a new array on every
// render while the first read is in flight.
const EMPTY_DOCUMENTS: DocumentEntry[] = [];

export interface CollectionDocuments {
  documents: DocumentEntry[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * The documents of one collection.
 *
 * Passing no collection is a real state — nothing is open — and not a load of one named
 * ''. `skipToken` models that as a query with no function: nothing is fetched, and the
 * result is an empty list that never reports itself as loading.
 *
 * Two components asking for the same collection share one request. The sidebar's
 * document list and the open document's scope both call this, so before the cache each
 * ran its own effect and its own fetch of the same collection.
 */
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
    // `isLoading`, and not `isPending`. A skipped query is pending forever, because it
    // has no data and never will; `isLoading` is that pending state narrowed to a read
    // actually in flight, which is what a caller renders a spinner for.
    isLoading: query.isLoading,
    error: query.error,
  };
};

export interface DocumentRead {
  // One absent case, and not three. A read that has not run, a skipped one, and a
  // document that does not exist all have no entry, and `isLoading` is what separates a
  // read in flight from a settled one.
  entry: DocumentEntry | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * One document, read directly rather than out of its collection list.
 *
 * The admin shell does not use this. It reads the open document from the list it already
 * holds, so that two reads of one document cannot disagree and seed the form from the
 * older one. A page plugin that opens a document without its collection list needs this.
 */
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
  // Rejects when the write does, so useFormSave leaves the form dirty.
  save: (input: SaveDocumentInput) => Promise<DocumentEntry>;
  isSaving: boolean;
}

/**
 * The save. It writes the stored entry back into the cached list, so the sidebar shows
 * the save without a refetch, and it does not invalidate that list.
 *
 * Not invalidating is deliberate. The stored entry is the authoritative result of this
 * write, so a refetch could only return the same thing — or, against a data layer that
 * reads its own write late, something older. Refer to usePinnedDocument in
 * document-scope.tsx for why re-seeding the open form off a fresh list is the failure
 * this avoids.
 */
export const useSaveDocument = (): DocumentSave => {
  const content = useContentSlice();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ collection, path, value }: SaveDocumentInput) =>
      content.update(collection, path, value),
    onSuccess: (entry, { collection }) => {
      queryClient.setQueryData<DocumentEntry[]>(
        contentKeys.list(collection),
        // Only a list that was read. Seeding an unread one writes a fresh single-
        // document list, which the next useCollectionDocuments mount reads as the whole
        // collection and skips its fetch. Returning undefined leaves the key unset.
        (cached) => (cached ? upsertByPath(cached, entry) : undefined)
      );
      queryClient.setQueryData(
        contentKeys.document(collection, entry.path),
        entry
      );
    },
  });
  // `mutateAsync` is stable across renders, so a caller can hold it in a stable save
  // handler. Refer to the FormProvider scope memo in document-scope.tsx.
  return { save: mutation.mutateAsync, isSaving: mutation.isPending };
};

/**
 * Drop every cached content read, so the next render fetches again. The editorial
 * workflow needs this on a branch switch: the documents of the last branch are not the
 * documents of this one.
 */
export const useInvalidateContent = (): (() => Promise<void>) => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: contentKeys.all() });
};
