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
  ): Promise<void>;
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
        await postContentRequest(url, {
          op: 'update',
          collection,
          path,
          value,
        });
        // Keep the list cache honest so collection views reflect the save.
        set(({ documents }) => ({
          documents: (documents as DocumentEntry[]).map((entry) =>
            entry.path === path ? { path, document: value } : entry
          ),
        }));
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
