import type { SearchHit, SearchQuery, SearchRef } from './contract';

/** One searchable field of a document, as plain text with the weight from `fields`. */
export interface SearchRecordField {
  name: string;
  weight: number;
  text: string;
}

/** What a provider indexes for one document. Empty fields are left out. */
export interface SearchRecord {
  ref: SearchRef;
  fields: SearchRecordField[];
}

/** The default export of a search provider's server module (ADR-021 §4). */
export interface SearchIndexProvider {
  query(input: { query: string } & SearchQuery): Promise<SearchHit[]>;
  /** Add or replace these documents. */
  upsert(records: SearchRecord[]): Promise<void>;
  /** The index becomes exactly these records. */
  replace(records: SearchRecord[]): Promise<void>;
}

/** Collection name to field name to weight (a finite number above 0). */
export type SearchFields = Record<string, Record<string, number>>;

export const SEARCH_INDEX_MEMBERS = ['query', 'upsert', 'replace'] as const;

export const SEARCH_INDEX_HOOK = 'searchIndex';
