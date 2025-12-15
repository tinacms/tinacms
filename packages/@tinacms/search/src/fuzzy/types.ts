export interface FuzzySearchOptions {
  maxDistance?: number;
  minSimilarity?: number;
  maxResults?: number;
  useTranspositions?: boolean;
  caseSensitive?: boolean;
  usePrefixFilter?: boolean;
  prefixLength?: number;
}

export interface FuzzyMatch {
  term: string;
  distance: number;
  similarity: number;
}

export const DEFAULT_FUZZY_OPTIONS: Required<FuzzySearchOptions> = {
  maxDistance: 2,
  minSimilarity: 0.6,
  maxResults: 10,
  useTranspositions: true,
  caseSensitive: false,
  usePrefixFilter: false,
  prefixLength: 2,
};
