/**
 * Fuzzy Search Utilities
 *
 * Provides fuzzy matching capabilities using Levenshtein distance algorithm
 * to find similar terms in the search index dictionary.
 */

/**
 * Calculate the Levenshtein distance between two strings.
 * This is the minimum number of single-character edits (insertions, deletions, or substitutions)
 * required to change one string into another.
 *
 * Time complexity: O(n*m) where n and m are string lengths
 * Space complexity: O(n*m) - can be optimized to O(min(n,m))
 *
 * @param str1 - First string to compare
 * @param str2 - Second string to compare
 * @returns The edit distance between the two strings
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  // Create a 2D array for dynamic programming
  const dp: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));

  // Initialize first column (deletion costs)
  for (let i = 0; i <= len1; i++) {
    dp[i][0] = i;
  }

  // Initialize first row (insertion costs)
  for (let j = 0; j <= len2; j++) {
    dp[0][j] = j;
  }

  // Fill the DP table
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      // If characters match, no operation needed
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        // Take minimum of three operations
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // deletion
          dp[i][j - 1] + 1, // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[len1][len2];
}

/**
 * Calculate a normalized similarity score between two strings.
 * Returns a value between 0 (completely different) and 1 (identical).
 *
 * @param str1 - First string to compare
 * @param str2 - Second string to compare
 * @returns Similarity score between 0 and 1
 */
export function similarityScore(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);

  // Avoid division by zero for empty strings
  if (maxLength === 0) return 1;

  return 1 - distance / maxLength;
}

/**
 * Calculate Damerau-Levenshtein distance which also considers transpositions.
 * This is more forgiving for common typos like "teh" instead of "the".
 *
 * @param str1 - First string to compare
 * @param str2 - Second string to compare
 * @returns The edit distance including transpositions
 */
export function damerauLevenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  const maxDist = len1 + len2;
  const H: Record<string, number> = {};
  const dp: number[][] = Array(len1 + 2)
    .fill(null)
    .map(() => Array(len2 + 2).fill(0));

  dp[0][0] = maxDist;

  for (let i = 0; i <= len1; i++) {
    dp[i + 1][0] = maxDist;
    dp[i + 1][1] = i;
  }

  for (let j = 0; j <= len2; j++) {
    dp[0][j + 1] = maxDist;
    dp[1][j + 1] = j;
  }

  for (let i = 1; i <= len1; i++) {
    let DB = 0;

    for (let j = 1; j <= len2; j++) {
      const k = H[str2[j - 1]] || 0;
      const l = DB;

      let cost = 1;
      if (str1[i - 1] === str2[j - 1]) {
        cost = 0;
        DB = j;
      }

      dp[i + 1][j + 1] = Math.min(
        dp[i][j] + cost, // substitution
        dp[i + 1][j] + 1, // insertion
        dp[i][j + 1] + 1, // deletion
        dp[k][l] + (i - k - 1) + 1 + (j - l - 1) // transposition
      );
    }

    H[str1[i - 1]] = i;
  }

  return dp[len1 + 1][len2 + 1];
}

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
   * Maximum number of similar terms to return.
   * @default 10
   */
  maxResults?: number;

  /**
   * Use Damerau-Levenshtein distance (considers transpositions).
   * @default true
   */
  useTranspositions?: boolean;

  /**
   * Case-sensitive matching.
   * @default false
   */
  caseSensitive?: boolean;

  /**
   * Only consider terms that start with the same prefix as the query.
   * This can significantly improve performance.
   * @default true
   */
  usePrefixFilter?: boolean;

  /**
   * Prefix length to use for filtering (when usePrefixFilter is true).
   * @default 2
   */
  prefixLength?: number;
}

/**
 * Represents a fuzzy match result
 */
export interface FuzzyMatch {
  /** The matched term from the dictionary */
  term: string;

  /** Edit distance from the query term */
  distance: number;

  /** Normalized similarity score (0-1) */
  similarity: number;
}

/**
 * Default options for fuzzy search
 */
export const DEFAULT_FUZZY_OPTIONS: Required<FuzzySearchOptions> = {
  maxDistance: 2,
  minSimilarity: 0.6,
  maxResults: 10,
  useTranspositions: true,
  caseSensitive: false,
  usePrefixFilter: false, // Disabled by default to allow more flexible fuzzy matching
  prefixLength: 2,
};

/**
 * Find similar terms from a dictionary using fuzzy matching.
 *
 * @param query - The search term to find matches for
 * @param dictionary - Array of terms to search through
 * @param options - Configuration options
 * @returns Array of fuzzy matches, sorted by similarity (best first)
 */
export function findSimilarTerms(
  query: string,
  dictionary: string[],
  options: FuzzySearchOptions = {}
): FuzzyMatch[] {
  const opts = { ...DEFAULT_FUZZY_OPTIONS, ...options };

  // Normalize query based on case sensitivity
  const normalizedQuery = opts.caseSensitive ? query : query.toLowerCase();

  // Early return for empty query
  if (normalizedQuery.length === 0) {
    return [];
  }

  const matches: FuzzyMatch[] = [];
  const distanceFunc = opts.useTranspositions
    ? damerauLevenshteinDistance
    : levenshteinDistance;

  // Get prefix for filtering (if enabled)
  const prefix =
    opts.usePrefixFilter && normalizedQuery.length >= opts.prefixLength
      ? normalizedQuery.substring(0, opts.prefixLength)
      : null;

  for (const term of dictionary) {
    // Skip non-string terms
    if (typeof term !== 'string') {
      continue;
    }

    // Normalize term based on case sensitivity
    const normalizedTerm = opts.caseSensitive ? term : term.toLowerCase();

    // Skip empty terms
    if (normalizedTerm.length === 0) {
      continue;
    }

    // Apply prefix filter for performance optimization
    if (prefix && !normalizedTerm.startsWith(prefix)) {
      continue;
    }

    // Calculate edit distance
    const distance = distanceFunc(normalizedQuery, normalizedTerm);

    // Early termination if distance exceeds threshold
    if (distance > opts.maxDistance) {
      continue;
    }

    // Calculate similarity score
    const similarity = similarityScore(normalizedQuery, normalizedTerm);

    // Check if similarity meets threshold
    if (similarity >= opts.minSimilarity) {
      matches.push({
        term,
        distance,
        similarity,
      });
    }
  }

  // Sort by similarity (descending) and then by distance (ascending)
  matches.sort((a, b) => {
    if (Math.abs(a.similarity - b.similarity) < 0.001) {
      return a.distance - b.distance;
    }
    return b.similarity - a.similarity;
  });

  // Limit results
  return matches.slice(0, opts.maxResults);
}

/**
 * Simple LRU cache for storing fuzzy match results
 */
export class FuzzyCache {
  private cache: Map<string, FuzzyMatch[]>;
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  /**
   * Generate a cache key from query and options
   */
  private getCacheKey(query: string, options: FuzzySearchOptions): string {
    return JSON.stringify({ query, options });
  }

  /**
   * Get cached results for a query
   */
  get(query: string, options: FuzzySearchOptions): FuzzyMatch[] | undefined {
    const key = this.getCacheKey(query, options);
    const value = this.cache.get(key);

    if (value) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }

    return value;
  }

  /**
   * Store results in cache
   */
  set(query: string, options: FuzzySearchOptions, results: FuzzyMatch[]): void {
    const key = this.getCacheKey(query, options);

    // Remove oldest entry if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, results);
  }

  /**
   * Clear the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get current cache size
   */
  get size(): number {
    return this.cache.size;
  }
}
