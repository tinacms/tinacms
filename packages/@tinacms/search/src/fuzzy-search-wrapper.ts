import { findSimilarTerms, FuzzyCache, DEFAULT_FUZZY_OPTIONS } from './fuzzy';
import type { FuzzySearchOptions, FuzzyMatch } from './fuzzy';
import type { SearchQueryResponse, SearchResult } from './types';

interface SearchIndex {
  QUERY: (
    query:
      | { AND: string[] }
      | { OR: string[] }
      | { AND: (string | { OR: string[] })[] },
    options?: { PAGE?: { NUMBER: number; SIZE: number } }
  ) => Promise<{ RESULT: SearchResult[]; RESULT_LENGTH: number }>;
  DICTIONARY: (token?: { FIELD: string }) => Promise<unknown[]>;
}

export class FuzzySearchWrapper {
  private cache: FuzzyCache;
  private searchIndex: SearchIndex;

  constructor(searchIndex: SearchIndex, cacheSize: number = 100) {
    this.searchIndex = searchIndex;
    this.cache = new FuzzyCache(cacheSize);
  }

  async getDictionary(field?: string): Promise<string[]> {
    const token = field ? { FIELD: field } : undefined;
    const dictionary = await this.searchIndex.DICTIONARY(token);
    return dictionary.filter((entry: unknown) => typeof entry === 'string');
  }

  async findSimilar(
    query: string,
    field?: string,
    options: FuzzySearchOptions = {}
  ): Promise<FuzzyMatch[]> {
    const cacheKey = `${query}:${field || 'all'}`;
    const cached = this.cache.get(cacheKey, options);
    if (cached) return cached;

    const dictionary = await this.getDictionary(field);
    const matches = findSimilarTerms(query, dictionary, options);
    this.cache.set(cacheKey, options, matches);

    return matches;
  }

  async expandQuery(
    query: string,
    options: FuzzySearchOptions = {}
  ): Promise<{
    original: string[];
    expanded: string[];
    matches: Record<string, FuzzyMatch[]>;
  }> {
    const opts = { ...DEFAULT_FUZZY_OPTIONS, ...options };

    const terms = query
      .split(' ')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const expanded: string[] = [];
    const matches: Record<string, FuzzyMatch[]> = {};

    for (const term of terms) {
      const similarTerms = await this.findSimilar(term, undefined, opts);

      expanded.push(term);

      const similarValues = similarTerms
        .filter((m) => m.term.toLowerCase() !== term.toLowerCase())
        .map((m) => m.term);

      expanded.push(...similarValues);

      if (similarTerms.length > 0) {
        matches[term] = similarTerms;
      }
    }

    return {
      original: terms,
      expanded: Array.from(new Set(expanded)),
      matches,
    };
  }

  async query(
    query: string,
    options: {
      limit?: number;
      cursor?: string;
      fuzzy?: boolean;
      fuzzyOptions?: FuzzySearchOptions;
    } = {}
  ): Promise<SearchQueryResponse> {
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

    const expansion = await this.expandQuery(query, options.fuzzyOptions);

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

    const queryGroups = expansion.original.map((originalTerm) => {
      const similarTerms =
        expansion.matches[originalTerm]?.map((m) => m.term) || [];
      return [originalTerm, ...similarTerms];
    });

    const searchQuery =
      queryGroups.length === 1
        ? { OR: queryGroups[0] }
        : {
            AND: queryGroups.map((group) =>
              group.length === 1 ? group[0] : { OR: group }
            ),
          };

    const results = await this.searchIndex.QUERY(searchQuery);

    return {
      results: results.RESULT || [],
      total: results.RESULT_LENGTH || 0,
      nextCursor: null,
      prevCursor: null,
      fuzzyMatches: expansion.matches,
    };
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}
