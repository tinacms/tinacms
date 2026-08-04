import type { TinaDocument } from '../schema/types';

export interface DocumentEntry {
  path: string;
  document: TinaDocument;
  // Set when the file exists but does not parse. `document` is then empty, so a
  // consumer must not write it back — `update` rejects the save anyway.
  error?: string;
}

export interface ContentProvider {
  get(collection: string, path: string): Promise<DocumentEntry | null>;
  list(collection: string): Promise<DocumentEntry[]>;
  update(
    collection: string,
    path: string,
    value: TinaDocument
  ): Promise<DocumentEntry>;
}

export type ContentSlice = ContentProvider;

export const DEFAULT_CONTENT_URL = '/api/tina/content';
