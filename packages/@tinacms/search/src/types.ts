/**
 * Options for configuring fuzzy search behavior
 */
export interface FuzzySearchOptions {
  /**
   * Maximum Levenshtein distance allowed for a match.
   * Lower values = stricter matching.
   * @default 2
   */
  maxDistance?: number;

  /**
   * Minimum similarity score (0-1) required for a match.
   * Higher values = stricter matching.
   * @default 0.6
   */
  minSimilarity?: number;

  /**
   * Maximum number of similar terms to return per query term.
   * @default 10
   */
  maxResults?: number;

  /**
   * Use Damerau-Levenshtein distance (considers transpositions).
   * Helps match common typos like "teh" -> "the"
   * @default true
   */
  useTranspositions?: boolean;

  /**
   * Case-sensitive matching.
   * @default false
   */
  caseSensitive?: boolean;
}

/**
 * Search query options
 */
export interface SearchOptions {
  /** Pagination cursor */
  cursor?: string;

  /** Maximum number of results to return */
  limit?: number;

  /** Enable fuzzy search to match typos and similar terms */
  fuzzy?: boolean;

  /** Fuzzy search configuration (only used when fuzzy is true) */
  fuzzyOptions?: FuzzySearchOptions;
}

export type SearchClient = {
  query: (
    query: string,
    options?: SearchOptions
  ) => Promise<{
    results: any[];
    total: number;
    nextCursor: string | null;
    prevCursor: string | null;
    fuzzyMatches?: Record<string, any[]>;
  }>;
  put: (docs: any[]) => Promise<any>;
  del: (ids: string[]) => Promise<any>;
  onStartIndexing?: () => Promise<void>;
  onFinishIndexing?: () => Promise<void>;
  supportsClientSideIndexing?: () => boolean;
};
