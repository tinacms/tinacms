import type { FuzzySearchOptions, FuzzyMatch } from './fuzzy';

export interface SearchOptions {
  cursor?: string;
  limit?: number;
  fuzzy?: boolean;
  fuzzyOptions?: FuzzySearchOptions;
  collection?: string;
}

export interface SearchResult {
  _id: string;
  _match: Record<string, string[]>;
  [key: string]: unknown;
}

export interface SearchQueryResponse {
  results: SearchResult[];
  total: number;
  nextCursor: string | null;
  prevCursor: string | null;
  fuzzyMatches?: Record<string, FuzzyMatch[]>;
}

export interface IndexableDocument {
  _id: string;
  [key: string]: unknown;
}

export interface SearchIndexResult {
  RESULT: SearchResult[];
  RESULT_LENGTH: number;
}

export interface SearchIndex {
  PUT: (docs: IndexableDocument[]) => Promise<void>;
  DELETE: (ids: string[]) => Promise<void>;
  QUERY: (
    query:
      | { AND: string[] }
      | { OR: string[] }
      | { AND: (string | { OR: string[] })[] },
    options?: { PAGE?: { NUMBER: number; SIZE: number } }
  ) => Promise<SearchIndexResult>;
  DICTIONARY: (token?: { FIELD: string }) => Promise<unknown[]>;
}

export type SearchClient = {
  query: (
    query: string,
    options?: SearchOptions
  ) => Promise<SearchQueryResponse>;
  put: (docs: IndexableDocument[] | Record<string, unknown>[]) => Promise<void>;
  del: (ids: string[]) => Promise<void>;
  onStartIndexing?: () => Promise<void>;
  onFinishIndexing?: () => Promise<void>;
  supportsClientSideIndexing?: () => boolean;
  getDefaultLimit?: () => number;
};
