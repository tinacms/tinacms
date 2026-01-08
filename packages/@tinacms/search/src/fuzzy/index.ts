export type { FuzzySearchOptions, FuzzyMatch } from './types';
export { DEFAULT_FUZZY_OPTIONS, normalizeFuzzyOptions } from './types';
export { FuzzyCache } from './cache';
export {
  levenshteinDistance,
  similarityScore,
  damerauLevenshteinDistance,
  findSimilarTerms,
  getNgrams,
  ngramOverlap,
  PREFIX_MATCH_MIN_SIMILARITY,
} from './distance';
