// Client half of the Local Data Layer: the plugin providing the `content`
// capability during local dev. Its slice mounts at the `content` namespace
// (SINGLETON_SLICE_CAPABILITIES) and speaks the local-data-layer.ts wire
// protocol over plain fetch — content goes Client → Data Layer directly, not
// through Capability RPC (ADR-018 §1). A TinaCloud or v3-compat provider
// replaces this plugin and mounts the same-shaped slice.

import type { DocumentEntry } from '../../../core/content/contract';
import {
  type ClientSlice,
  type PluginManifest,
  definePlugin,
} from '../../../core/plugin';
import type { TinaDocument } from '../../../core/schema/types';
import type { ContentRequest } from './local-data-layer';

// What `get().content` holds: the ContentProvider ops (contract.ts) plus the
// list cache collection views render from. saveDocument's rejection propagates
// so useFormSave leaves the form dirty (context.ts SaveHandler contract).
export interface ContentSlice {
  documents: DocumentEntry[];
  loadDocuments(collection: string): Promise<DocumentEntry[]>;
  getDocument(collection: string, path: string): Promise<DocumentEntry | null>;
  saveDocument(
    collection: string,
    path: string,
    value: TinaDocument
  ): Promise<DocumentEntry>;
}

const postContentRequest = async (
  url: string,
  request: ContentRequest
): Promise<unknown> => {
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

const createContentSlice =
  (url: string): ClientSlice =>
  (set) => {
    const slice: ContentSlice = {
      documents: [],
      async loadDocuments(collection) {
        const documents = (await postContentRequest(url, {
          op: 'list',
          collection,
        })) as DocumentEntry[];
        set({ documents });
        return documents;
      },
      async getDocument(collection, path) {
        return (await postContentRequest(url, {
          op: 'get',
          collection,
          path,
        })) as DocumentEntry | null;
      },
      async saveDocument(collection, path, value) {
        // update returns the persisted entry, which may carry more than the
        // form value (unknown fields merged from the stored document).
        const saved = (await postContentRequest(url, {
          op: 'update',
          collection,
          path,
          value,
        })) as DocumentEntry;
        // Keep the list cache honest so collection views reflect the save —
        // replace the cached entry, or append when the path is not cached yet.
        set(({ documents }) => {
          const entries = documents as DocumentEntry[];
          return {
            documents: entries.some((entry) => entry.path === path)
              ? entries.map((entry) => (entry.path === path ? saved : entry))
              : [...entries, saved],
          };
        });
        return saved;
      },
    };
    return { ...slice };
  };

export const DEFAULT_CONTENT_URL = '/api/tina/content';

export const localContentPlugin = (options?: {
  url?: string;
}): PluginManifest =>
  definePlugin({
    name: 'tina:content:local',
    provides: ['content'],
    client: async () => ({
      default: {
        slice: createContentSlice(options?.url ?? DEFAULT_CONTENT_URL),
      },
    }),
  });
