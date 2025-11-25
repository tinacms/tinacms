import si from 'search-index';
export { SearchIndexer } from './indexer';
export { LocalSearchIndexClient, TinaCMSSearchIndexClient } from './client';
export type { SearchClient, SearchOptions, FuzzySearchOptions } from './types';
export {
  levenshteinDistance,
  similarityScore,
  damerauLevenshteinDistance,
  findSimilarTerms,
  FuzzyCache,
  DEFAULT_FUZZY_OPTIONS,
} from './fuzzy';
export type { FuzzyMatch } from './fuzzy';
export { si };
