export type {
  SearchClient,
  SearchResult,
  SearchQueryResponse,
  IndexableDocument,
} from './types';
export { processDocumentForIndexing } from './indexer/utils';
import { lookupStopwords } from './indexer/utils';
import type { FuzzyMatch } from './fuzzy';

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
  RESULT: unknown[];
  RESULT_LENGTH: number;
  FUZZY_MATCHES?: Record<string, FuzzyMatch[]>;
  NEXT_CURSOR?: string | null;
  PREV_CURSOR?: string | null;
}

interface ParsedSearchResponse {
  results: unknown[];
  total: number;
  prevCursor: string | null;
  nextCursor: string | null;
  fuzzyMatches?: Record<string, FuzzyMatch[]>;
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
): ParsedSearchResponse => {
  // Handle error responses or missing data
  if (!data || !Array.isArray(data.RESULT)) {
    return {
      results: [],
      total: 0,
      prevCursor: null,
      nextCursor: null,
      fuzzyMatches: undefined,
    };
  }

  const results = data.RESULT;
  const total = data.RESULT_LENGTH ?? 0;
  const fuzzyMatches = data.FUZZY_MATCHES;

  // Use server-provided cursors if available, otherwise calculate
  if (data.NEXT_CURSOR !== undefined || data.PREV_CURSOR !== undefined) {
    return {
      results,
      total,
      prevCursor: data.PREV_CURSOR ?? null,
      nextCursor: data.NEXT_CURSOR ?? null,
      fuzzyMatches,
    };
  }

  // Fallback: calculate pagination from options
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
