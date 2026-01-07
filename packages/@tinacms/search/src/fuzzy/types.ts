export interface FuzzySearchOptions {
  maxDistance?: number;
  minSimilarity?: number;
  maxTermExpansions?: number;
  useTranspositions?: boolean;
  caseSensitive?: boolean;
  /** Use n-gram filtering for candidate selection (supports transpositions) */
  useNgramFilter?: boolean;
  /** Size of n-grams for filtering (default: 2) */
  ngramSize?: number;
  /** Minimum n-gram overlap ratio to consider a candidate (0-1, default: 0.2) */
  minNgramOverlap?: number;
}

export interface FuzzyMatch {
  term: string;
  distance: number;
  similarity: number;
}

export const DEFAULT_FUZZY_OPTIONS: Required<FuzzySearchOptions> = {
  maxDistance: 2,
  minSimilarity: 0.6,
  maxTermExpansions: 10,
  useTranspositions: true,
  caseSensitive: false,
  useNgramFilter: true,
  ngramSize: 2,
  minNgramOverlap: 0.2,
};
