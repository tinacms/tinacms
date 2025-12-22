import createSearchIndex from 'search-index';
export { SearchIndexer } from './indexer';
export { LocalSearchIndexClient, TinaCMSSearchIndexClient } from './client';
export type {
  SearchClient,
  SearchOptions,
  SearchResult,
  SearchQueryResponse,
  IndexableDocument,
  SearchIndexResult,
  SearchIndex,
} from './types';
export type { FuzzySearchOptions, FuzzyMatch } from './fuzzy';
export {
  levenshteinDistance,
  similarityScore,
  damerauLevenshteinDistance,
  findSimilarTerms,
  FuzzyCache,
  DEFAULT_FUZZY_OPTIONS,
} from './fuzzy';
export { FuzzySearchWrapper } from './fuzzy-search-wrapper';
export { buildPageOptions, buildPaginationCursors } from './pagination';
export type {
  PaginationOptions,
  PageOptions,
  PaginationCursors,
} from './pagination';
export { createSearchIndex };
