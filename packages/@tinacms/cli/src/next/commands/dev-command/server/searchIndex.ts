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
      fuzzyOptions?: Record<string, unknown>;
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
    const isV2 = requestURL.pathname.startsWith('/v2/searchIndex');

    res.writeHead(200, { 'Content-Type': 'application/json' });

    if (isV2) {
      const queryParam = requestURL.searchParams.get('query');
      const collectionParam = requestURL.searchParams.get('collection');
      const limitParam = requestURL.searchParams.get('limit');
      const cursorParam = requestURL.searchParams.get('cursor');

      if (!queryParam) {
        res.end(JSON.stringify({ RESULT: [], RESULT_LENGTH: 0 }));
        return;
      }

      if (!searchIndex.fuzzySearchWrapper) {
        res.end(JSON.stringify({ RESULT: [], RESULT_LENGTH: 0 }));
        return;
      }

      try {
        const paginationOptions: { limit?: number; cursor?: string } = {};
        if (limitParam) {
          paginationOptions.limit = parseInt(limitParam, 10);
        }
        if (cursorParam) {
          paginationOptions.cursor = cursorParam;
        }

        const searchQuery = collectionParam
          ? `${queryParam} _collection:${collectionParam}`
          : queryParam;

        const result = await searchIndex.fuzzySearchWrapper.query(searchQuery, {
          ...paginationOptions,
        });

        if (collectionParam) {
          result.results = result.results.filter(
            (r) => r._id && r._id.startsWith(`${collectionParam}:`)
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
          '[search] v2 fuzzy search failed:',
          error instanceof Error ? error.message : error
        );
        res.end(JSON.stringify({ RESULT: [], RESULT_LENGTH: 0 }));
        return;
      }
    }

    const query = requestURL.searchParams.get('q');
    const optionsParam = requestURL.searchParams.get('options');

    if (!query) {
      res.end(JSON.stringify({ RESULT: [] }));
      return;
    }

    let searchIndexOptions: SearchIndexOptions = { DOCUMENTS: false };
    if (optionsParam) {
      searchIndexOptions = {
        ...searchIndexOptions,
        ...JSON.parse(optionsParam),
      };
    }

    const queryObj = JSON.parse(query);
    const result = await searchIndex.QUERY(queryObj, searchIndexOptions);
    res.end(JSON.stringify(result));
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
