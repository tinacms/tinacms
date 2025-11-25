/**
 * PROTOTYPE: Levenshtein Distance Fuzzy Search
 *
 * This prototype demonstrates how to use the search-index DICTIONARY function
 * combined with Levenshtein distance to implement fuzzy search.
 */

/**
 * Calculate Levenshtein distance between two strings
 * Time complexity: O(n*m) where n and m are string lengths
 * Space complexity: O(n*m) - can be optimized to O(min(n,m))
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  // Initialize first column and row
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // deletion
          dp[i][j - 1] + 1, // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Calculate similarity score (0-1, where 1 is identical)
 */
function similarityScore(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  return 1 - distance / maxLength;
}

/**
 * Fuzzy search implementation using DICTIONARY and Levenshtein distance
 */
export class LevenshteinFuzzySearch {
  constructor(
    private searchIndex: any,
    private options: {
      maxDistance?: number; // Maximum edit distance (default: 2)
      minSimilarity?: number; // Minimum similarity threshold 0-1 (default: 0.6)
      maxResults?: number; // Maximum number of suggestions (default: 10)
    } = {}
  ) {
    this.options = {
      maxDistance: options.maxDistance ?? 2,
      minSimilarity: options.minSimilarity ?? 0.6,
      maxResults: options.maxResults ?? 10,
    };
  }

  /**
   * Find similar terms in the index dictionary
   */
  async findSimilarTerms(
    query: string,
    field?: string
  ): Promise<
    Array<{
      term: string;
      distance: number;
      similarity: number;
    }>
  > {
    const queryLower = query.toLowerCase();

    // Get dictionary for the field (all indexed tokens)
    const token = field ? { FIELD: field } : undefined;
    const dictionary = await this.searchIndex.DICTIONARY(token);

    const matches: Array<{
      term: string;
      distance: number;
      similarity: number;
    }> = [];

    // Compare query with each dictionary term
    for (const entry of dictionary) {
      const term = entry.VALUE.toLowerCase();
      const distance = levenshteinDistance(queryLower, term);
      const similarity = similarityScore(queryLower, term);

      // Filter by distance and similarity thresholds
      if (
        distance <= this.options.maxDistance! &&
        similarity >= this.options.minSimilarity!
      ) {
        matches.push({
          term: entry.VALUE,
          distance,
          similarity,
        });
      }
    }

    // Sort by similarity (highest first) and limit results
    return matches
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, this.options.maxResults);
  }

  /**
   * Perform fuzzy search query
   */
  async fuzzyQuery(
    query: string,
    options?: {
      field?: string;
      cursor?: string;
      limit?: number;
    }
  ): Promise<{
    results: any[];
    total: number;
    nextCursor: string | null;
    prevCursor: string | null;
    suggestions?: Array<{ term: string; similarity: number }>;
  }> {
    // Split query into terms
    const terms = query.split(' ').filter((t) => t);

    // Find similar terms for each query term
    const allSimilarTerms = await Promise.all(
      terms.map((term) => this.findSimilarTerms(term, options?.field))
    );

    // Build expanded query with similar terms (OR logic)
    const expandedTerms = allSimilarTerms.flatMap((matches) =>
      matches.map((m) => m.term)
    );

    // Execute query with expanded terms
    // NOTE: This is a simplified implementation
    // In production, you'd want to integrate with the existing query logic
    const queryObj = {
      OR: expandedTerms.length > 0 ? expandedTerms : terms,
    };

    // Return both results and suggestions
    return {
      results: [], // Would come from actual QUERY execution
      total: 0,
      nextCursor: null,
      prevCursor: null,
      suggestions: allSimilarTerms
        .flat()
        .map((m) => ({ term: m.term, similarity: m.similarity })),
    };
  }
}

/**
 * PERFORMANCE ANALYSIS
 *
 * Time Complexity:
 * - levenshteinDistance: O(n*m) where n,m are string lengths
 * - findSimilarTerms: O(D * n*m) where D is dictionary size
 * - For large dictionaries (10k+ terms), this becomes expensive
 *
 * Space Complexity:
 * - O(n*m) per comparison
 * - Can be optimized to O(min(n,m)) using single array
 *
 * Performance Considerations:
 * 1. Dictionary size: Larger dictionaries = slower searches
 * 2. Query length: Longer queries = more comparisons
 * 3. No indexing optimization: Every search scans entire dictionary
 *
 * POTENTIAL OPTIMIZATIONS:
 * 1. Use Damerau-Levenshtein for transposition support
 * 2. Implement early termination if distance exceeds threshold
 * 3. Use BK-tree or similar data structure for faster lookups
 * 4. Cache frequently searched terms
 * 5. Use Web Workers (browser) or worker threads (Node) for parallel computation
 * 6. Implement prefix filtering before distance calculation
 */

/**
 * EXAMPLE USAGE:
 *
 * const fuzzySearch = new LevenshteinFuzzySearch(searchIndex, {
 *   maxDistance: 2,
 *   minSimilarity: 0.6,
 *   maxResults: 10
 * });
 *
 * // Find similar terms
 * const similar = await fuzzySearch.findSimilarTerms('tehn', 'body');
 * // Returns: [{ term: 'then', distance: 1, similarity: 0.75 }, ...]
 *
 * // Perform fuzzy query
 * const results = await fuzzySearch.fuzzyQuery('tehn is a tset');
 * // Expands query to include: 'then', 'test', etc.
 */
