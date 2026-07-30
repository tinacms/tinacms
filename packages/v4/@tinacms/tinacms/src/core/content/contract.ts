import type { TinaDocument } from '../schema/types';

export interface DocumentEntry {
  path: string;
  document: TinaDocument;
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
