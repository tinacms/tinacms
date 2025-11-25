/**
 * Fuzzy Search Wrapper
 *
 * Integrates fuzzy search capabilities with search-index by using the DICTIONARY
 * function to retrieve indexed tokens and applying Levenshtein distance matching.
 */

import { findSimilarTerms, FuzzyCache, DEFAULT_FUZZY_OPTIONS } from './fuzzy';
import type { FuzzySearchOptions, FuzzyMatch } from './fuzzy';

/**
 * Wrapper class that adds fuzzy search capabilities to search-index
 */
export class FuzzySearchWrapper {
  private cache: FuzzyCache;
  private searchIndex: any; // search-index instance

  constructor(searchIndex: any, cacheSize: number = 100) {
    this.searchIndex = searchIndex;
    this.cache = new FuzzyCache(cacheSize);
  }

  /**
   * Get the dictionary of indexed tokens from search-index
   * @param field - Optional field name to get dictionary for specific field
   * @returns Array of indexed terms
   */
  async getDictionary(field?: string): Promise<string[]> {
    try {
      // search-index DICTIONARY function returns tokens
      // In this version of search-index, it returns strings directly
      const token = field ? { FIELD: field } : undefined;
      const dictionary = await this.searchIndex.DICTIONARY(token);

      console.log('[FuzzySearchWrapper] Dictionary size:', dictionary.length);
      console.log(
        '[FuzzySearchWrapper] First 20 terms:',
        dictionary.slice(0, 20)
      );

      // The dictionary returns strings directly, not objects
      return dictionary.filter((entry: any) => typeof entry === 'string');
    } catch (error) {
      console.error('Error retrieving dictionary from search-index:', error);
      return [];
    }
  }

  /**
   * Find similar terms for a query using fuzzy matching
   * @param query - The search term
   * @param field - Optional field to search within
   * @param options - Fuzzy search options
   * @returns Array of similar terms with scores
   */
  async findSimilar(
    query: string,
    field?: string,
    options: FuzzySearchOptions = {}
  ): Promise<FuzzyMatch[]> {
    // Check cache first
    const cacheKey = `${query}:${field || 'all'}`;
    const cached = this.cache.get(cacheKey, options);
    if (cached) {
      return cached;
    }

    // Get dictionary from search-index
    const dictionary = await this.getDictionary(field);

    // Find similar terms using Levenshtein distance
    const matches = findSimilarTerms(query, dictionary, options);

    // Cache the results
    this.cache.set(cacheKey, options, matches);

    return matches;
  }

  /**
   * Expand a search query with fuzzy matches
   * @param query - The original search query
   * @param options - Fuzzy search options
   * @returns Expanded query with similar terms
   */
  async expandQuery(
    query: string,
    options: FuzzySearchOptions = {}
  ): Promise<{
    original: string[];
    expanded: string[];
    matches: Record<string, FuzzyMatch[]>;
  }> {
    const opts = { ...DEFAULT_FUZZY_OPTIONS, ...options };

    // Split query into terms
    const terms = query
      .split(' ')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    console.log('[FuzzySearchWrapper] Expanding query:', query);
    console.log('[FuzzySearchWrapper] Terms:', terms);
    console.log('[FuzzySearchWrapper] Options:', opts);

    const expanded: string[] = [];
    const matches: Record<string, FuzzyMatch[]> = {};

    // Find similar terms for each query term
    for (const term of terms) {
      const similarTerms = await this.findSimilar(term, undefined, opts);

      console.log(
        `[FuzzySearchWrapper] Similar terms for "${term}":`,
        similarTerms
      );

      // Add original term
      expanded.push(term);

      // Add similar terms (excluding exact matches)
      const similarValues = similarTerms
        .filter((m) => m.term.toLowerCase() !== term.toLowerCase())
        .map((m) => m.term);

      expanded.push(...similarValues);

      if (similarTerms.length > 0) {
        matches[term] = similarTerms;
      }
    }

    console.log('[FuzzySearchWrapper] Expanded query:', expanded);
    console.log('[FuzzySearchWrapper] Matches:', matches);

    return {
      original: terms,
      expanded: Array.from(new Set(expanded)), // Remove duplicates
      matches,
    };
  }

  /**
   * Execute a fuzzy search query
   * This method expands the query with fuzzy matches and executes it against search-index
   *
   * @param query - The search query
   * @param options - Search and fuzzy options
   * @returns Search results
   */
  async query(
    query: string,
    options: {
      limit?: number;
      cursor?: string;
      fuzzy?: boolean;
      fuzzyOptions?: FuzzySearchOptions;
    } = {}
  ): Promise<{
    results: any[];
    total: number;
    nextCursor: string | null;
    prevCursor: string | null;
    fuzzyMatches?: Record<string, FuzzyMatch[]>;
  }> {
    // If fuzzy is not enabled, pass through to search-index directly
    if (!options.fuzzy) {
      const results = await this.searchIndex.QUERY({
        AND: query.split(' ').filter((t) => t),
      });

      return {
        results: results.RESULT || [],
        total: results.RESULT_LENGTH || 0,
        nextCursor: null,
        prevCursor: null,
      };
    }

    // Expand query with fuzzy matches
    const expansion = await this.expandQuery(query, options.fuzzyOptions);

    // If no expansion happened, fallback to exact search
    if (expansion.expanded.length === expansion.original.length) {
      const results = await this.searchIndex.QUERY({
        AND: expansion.original,
      });

      return {
        results: results.RESULT || [],
        total: results.RESULT_LENGTH || 0,
        nextCursor: null,
        prevCursor: null,
        fuzzyMatches: expansion.matches,
      };
    }

    // Build expanded query with OR logic for similar terms
    // Group by original terms to maintain AND logic between different query terms
    const queryGroups = expansion.original.map((originalTerm) => {
      const similarTerms =
        expansion.matches[originalTerm]?.map((m) => m.term) || [];

      // Include original term and similar terms
      return [originalTerm, ...similarTerms];
    });

    // Execute query with expanded terms
    // If only one term, use OR, otherwise use AND of ORs
    let queryObj;
    if (queryGroups.length === 1) {
      queryObj = { OR: queryGroups[0] };
    } else {
      // For multiple terms, each group is OR'd internally, groups are AND'd together
      queryObj = {
        AND: queryGroups.map((group) =>
          group.length === 1 ? group[0] : { OR: group }
        ),
      };
    }

    const results = await this.searchIndex.QUERY(queryObj);

    return {
      results: results.RESULT || [],
      total: results.RESULT_LENGTH || 0,
      nextCursor: null,
      prevCursor: null,
      fuzzyMatches: expansion.matches,
    };
  }

  /**
   * Clear the fuzzy search cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get current cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}
