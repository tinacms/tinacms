// Client segment of the localContentPlugin: the ContentSlice (contract.ts)
// speaking the content-request.ts wire protocol over plain fetch — content goes
// Client → Data Layer directly, not through Capability RPC (ADR-018 §1).

import type {
  ContentSlice,
  DocumentEntry,
} from '../../../core/content/contract';
import type { ClientSlice } from '../../../core/plugin';
import type { ContentRequest } from './content-request';

const postContentRequest = async <Result>(
  url: string,
  request: ContentRequest
): Promise<Result> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    throw new Error(
      `Content request ${request.op} failed (${response.status}): ${await response.text()}`
    );
  }
  return response.json();
};

const upsertByPath = (
  entries: DocumentEntry[],
  entry: DocumentEntry
): DocumentEntry[] =>
  entries.some((cached) => cached.path === entry.path)
    ? entries.map((cached) => (cached.path === entry.path ? entry : cached))
    : [...entries, entry];

// The store composes many slices, so the setter hands back the generic SliceState
// (Record<string, unknown>). This is the one place that reads our own `documents`
// field back out as its concrete type — the single boundary cast.
const documentsOf = (state: {
  documents?: unknown;
}): ContentSlice['documents'] =>
  (state.documents as ContentSlice['documents']) ?? {};

export const createContentSlice =
  (url: string): ClientSlice =>
  (set) => {
    const slice: ContentSlice = {
      documents: {},
      async loadDocuments(collection) {
        const response = await postContentRequest<DocumentEntry[]>(url, {
          op: 'list',
          collection,
        });
        set((state) => ({
          documents: {
            ...documentsOf(state),
            [collection]: response,
          },
        }));
        return response;
      },
      async getDocument(collection, path) {
        return postContentRequest<DocumentEntry | null>(url, {
          op: 'get',
          collection,
          path,
        });
      },
      async saveDocument(collection, path, value) {
        // update returns the persisted entry, which may carry more than the
        // form value (unknown fields merged from the stored document).
        const saved = await postContentRequest<DocumentEntry>(url, {
          op: 'update',
          collection,
          path,
          value,
        });
        // Keep the list cache honest so collection views reflect the save —
        // replace the cached entry, or append when the path is not cached yet.
        set((state) => {
          const cache = documentsOf(state);
          return {
            documents: {
              ...cache,
              [collection]: upsertByPath(cache[collection] ?? [], saved),
            },
          };
        });
        return saved;
      },
    };
    return { ...slice };
  };
