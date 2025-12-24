export type {
  SearchClient,
  SearchResult,
  SearchQueryResponse,
  IndexableDocument,
  SearchOptions,
} from './types';
export type { FuzzySearchOptions, FuzzyMatch } from './fuzzy';
export { processDocumentForIndexing } from './indexer/utils';
import { lookupStopwords } from './indexer/utils';
import type { FuzzyMatch } from './fuzzy';
import type { SearchResult, SearchQueryResponse } from './types';

interface SearchQuery {
  AND: string[];
}

interface PaginationOptions {
  limit?: number;
  cursor?: string;
}

interface PageOptions {
  PAGE?: {
    SIZE: number;
    NUMBER: number;
  };
}

interface SearchIndexResponse {
  RESULT: SearchResult[];
  RESULT_LENGTH: number;
  FUZZY_MATCHES?: Record<string, FuzzyMatch[]>;
  NEXT_CURSOR?: string | null;
  PREV_CURSOR?: string | null;
}

export const queryToSearchIndexQuery = (
  query: string,
  stopwordLanguages?: string[]
): SearchQuery => {
  const parts = query.split(' ');
  const stopwords = lookupStopwords(stopwordLanguages);

  if (parts.length === 1) {
    return { AND: [parts[0]] };
  }

  const filteredParts = parts.filter(
    (part) =>
      part.toLowerCase() !== 'and' && !stopwords.includes(part.toLowerCase())
  );

  return { AND: filteredParts };
};

export const optionsToSearchIndexOptions = (
  options?: PaginationOptions
): PageOptions => {
  if (!options?.limit) return {};

  return {
    PAGE: {
      SIZE: options.limit,
      NUMBER: options.cursor ? parseInt(options.cursor) : 0,
    },
  };
};

export const parseSearchIndexResponse = (
  data: SearchIndexResponse,
  options?: PaginationOptions
): SearchQueryResponse => {
  const resultArray = data?.RESULT ?? (data as any)?.results;
  if (!data || !Array.isArray(resultArray)) {
    return {
      results: [],
      total: 0,
      prevCursor: null,
      nextCursor: null,
      fuzzyMatches: undefined,
    };
  }

  const results: SearchResult[] = data.RESULT ?? (data as any).results;
  const total = data.RESULT_LENGTH ?? (data as any).total ?? 0;
  const fuzzyMatches = data.FUZZY_MATCHES ?? (data as any).fuzzyMatches;

  const nextCursor = data.NEXT_CURSOR ?? (data as any).nextCursor;
  const prevCursor = data.PREV_CURSOR ?? (data as any).prevCursor;

  if (nextCursor !== undefined || prevCursor !== undefined) {
    return {
      results,
      total,
      prevCursor: prevCursor ?? null,
      nextCursor: nextCursor ?? null,
      fuzzyMatches,
    };
  }

  const currentPage = options?.cursor ? parseInt(options.cursor) : 0;
  const pageSize = options?.limit;

  const hasPreviousPage = currentPage > 0;
  const hasNextPage = pageSize ? total > (currentPage + 1) * pageSize : false;

  return {
    results,
    total,
    prevCursor: hasPreviousPage ? (currentPage - 1).toString() : null,
    nextCursor: hasNextPage ? (currentPage + 1).toString() : null,
    fuzzyMatches,
  };
};
