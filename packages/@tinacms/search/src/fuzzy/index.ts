export type { FuzzySearchOptions, FuzzyMatch } from './types';
export { DEFAULT_FUZZY_OPTIONS } from './types';
export { FuzzyCache } from './cache';
export {
  levenshteinDistance,
  similarityScore,
  damerauLevenshteinDistance,
  findSimilarTerms,
  getNgrams,
  ngramOverlap,
} from './distance';
