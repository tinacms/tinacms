import type { TinaDocument } from '../schema/types';

// `list` names the documents of a collection. It carries no content, because a
// collection of 50 documents then costs 50 bodies to open one. The open
// document comes from `get`.
export interface DocumentSummary {
  path: string;
}

export interface DocumentEntry extends DocumentSummary {
  document: TinaDocument;
}

export interface ContentProvider {
  get(collection: string, path: string): Promise<DocumentEntry | null>;
  list(collection: string): Promise<DocumentSummary[]>;
  update(
    collection: string,
    path: string,
    value: TinaDocument
  ): Promise<DocumentEntry>;
}

export type ContentSlice = ContentProvider;

export const DEFAULT_CONTENT_URL = '/api/tina/content';
