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
  const results = data.RESULT;
  const total = data.RESULT_LENGTH;
  const fuzzyMatches = data.FUZZY_MATCHES;

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
