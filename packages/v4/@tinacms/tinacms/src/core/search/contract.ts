import type { SliceState } from '../plugin';

/** One result of ADR-021's `search`. `ref` names a document; the editor reads it back from `content`. */
export interface SearchHit {
  ref: string;
  score?: number;
  snippet?: string;
}

export interface SearchProvider {
  search: (query: string) => Promise<SearchHit[]>;
}

export const isSearchProvider = (
  slice: SliceState | undefined
): slice is SliceState & SearchProvider =>
  slice !== undefined && typeof slice.search === 'function';
