import type { IncomingMessage, ServerResponse } from 'node:http';
import type { SearchQueryResponse, SearchResult } from '@tinacms/search';

export interface PathConfig {
  apiURL: string;
  searchPath: string;
}

interface SearchIndexOptions {
  DOCUMENTS?: boolean;
  PAGE?: { NUMBER: number; SIZE: number };
}

interface SearchIndexResult {
  RESULT: SearchResult[];
  RESULT_LENGTH: number;
}

interface FuzzySearchWrapper {
  query: (
    query: string,
    options: {
      limit?: number;
      cursor?: string;
      fuzzy: boolean;
      fuzzyOptions: Record<string, unknown>;
    }
  ) => Promise<SearchQueryResponse>;
}

interface SearchIndex {
  PUT: (docs: Record<string, unknown>[]) => Promise<unknown>;
  DELETE: (id: string) => Promise<unknown>;
  QUERY: (
    query: { AND?: string[]; OR?: string[] },
    options: SearchIndexOptions
  ) => Promise<SearchIndexResult>;
  fuzzySearchWrapper?: FuzzySearchWrapper;
}

interface RequestWithBody extends IncomingMessage {
  body?: { docs?: Record<string, unknown>[] };
}

export const createSearchIndexRouter = ({
  config,
  searchIndex,
}: {
  config: PathConfig;
  searchIndex: SearchIndex;
}) => {
  const put = async (req: RequestWithBody, res: ServerResponse) => {
    const docs = req.body?.docs ?? [];
    const result = await searchIndex.PUT(docs);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ result }));
  };

  const get = async (req: IncomingMessage, res: ServerResponse) => {
    const requestURL = new URL(req.url ?? '', config.apiURL);
    const query = requestURL.searchParams.get('q');
    const optionsParam = requestURL.searchParams.get('options');
    const fuzzyParam = requestURL.searchParams.get('fuzzy');
    const fuzzyOptionsParam = requestURL.searchParams.get('fuzzyOptions');

    let searchIndexOptions: {
      DOCUMENTS?: boolean;
      PAGE?: { NUMBER: number; SIZE: number };
    } = {
      DOCUMENTS: false,
    };
    if (optionsParam) {
      searchIndexOptions = {
        ...searchIndexOptions,
        ...JSON.parse(optionsParam),
      };
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });

    if (query) {
      const queryObj = JSON.parse(query);

      if (fuzzyParam === 'true' && searchIndex.fuzzySearchWrapper) {
        try {
          const fuzzyOptions = fuzzyOptionsParam
            ? JSON.parse(fuzzyOptionsParam)
            : {};

          const searchTerms = queryObj.AND
            ? queryObj.AND.filter(
                (term: string) => !term.includes('_collection:')
              )
            : [];

          const collectionFilter = queryObj.AND?.find((term: string) =>
            term.includes('_collection:')
          );

          // Convert PAGE options to limit/cursor format for FuzzySearchWrapper
          const paginationOptions: { limit?: number; cursor?: string } = {};
          if (searchIndexOptions.PAGE) {
            paginationOptions.limit = searchIndexOptions.PAGE.SIZE;
            paginationOptions.cursor =
              searchIndexOptions.PAGE.NUMBER.toString();
          }

          // If filtering by collection, include it in the search query
          // so pagination works correctly
          const searchQuery = collectionFilter
            ? `${searchTerms.join(' ')} ${collectionFilter}`
            : searchTerms.join(' ');

          const result = await searchIndex.fuzzySearchWrapper.query(
            searchQuery,
            {
              ...paginationOptions,
              fuzzy: true,
              fuzzyOptions,
            }
          );

          // Filter results by collection if needed (for results that don't have _collection indexed)
          if (collectionFilter) {
            const collection = collectionFilter.split(':')[1];
            result.results = result.results.filter(
              (r) => r._id && r._id.startsWith(`${collection}:`)
            );
          }

          res.end(
            JSON.stringify({
              RESULT: result.results,
              RESULT_LENGTH: result.total,
              NEXT_CURSOR: result.nextCursor,
              PREV_CURSOR: result.prevCursor,
              FUZZY_MATCHES: result.fuzzyMatches || {},
            })
          );
          return;
        } catch (error) {
          console.warn(
            '[search] Fuzzy search failed, falling back to standard search:',
            error instanceof Error ? error.message : error
          );
        }
      }

      const result = await searchIndex.QUERY(queryObj, searchIndexOptions);
      res.end(JSON.stringify(result));
    } else {
      res.end(JSON.stringify({ RESULT: [] }));
    }
  };

  const del = async (req: IncomingMessage, res: ServerResponse) => {
    const requestURL = new URL(req.url ?? '', config.apiURL);
    const docId = requestURL.pathname
      .split('/')
      .filter(Boolean)
      .slice(1)
      .join('/');
    const result = await searchIndex.DELETE(docId);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ result }));
  };

  return { del, get, put };
};
