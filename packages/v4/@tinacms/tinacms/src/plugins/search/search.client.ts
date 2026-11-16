import { DEFAULT_RPC_URL, RpcError, createRpcClient } from '../../rpc/proxy';
import type { ClientSlice } from '../../core/plugin';
import {
  type Search,
  type SearchHit,
  SearchError,
  isSearchErrorCode,
} from '../../core/search/contract';
import { validateSearchRequest } from '../../core/search/validate';

export interface SearchClientConfig {
  /** Where the site mounts its RPC handler. `/api/tina` for browser code. */
  rpcUrl: string;
  fetch?: typeof fetch;
}

interface SearchRoutes {
  search: {
    query: (input: { query: string; options: unknown }) => Promise<SearchHit[]>;
  };
}

// 404, 405 and a body that is not JSON mean the site mounted no handler.
const isMissingRoute = (cause: RpcError): boolean =>
  cause.status === 404 || cause.status === 405 || cause.code === 'rpc-not-json';

const searchErrorOf = (cause: unknown, route: string): SearchError => {
  if (cause instanceof SearchError) return cause;
  if (cause instanceof RpcError) {
    if (isSearchErrorCode(cause.code)) {
      return new SearchError(cause.code, cause.message);
    }
    if (isMissingRoute(cause)) {
      return new SearchError(
        'unavailable',
        `The site has no ${route} route (status ${cause.status}). Mount the RPC handler.`
      );
    }
    return new SearchError('backend-failure', cause.message);
  }
  if (cause instanceof Error) {
    return new SearchError('unavailable', cause.message);
  }
  return new SearchError('unavailable', String(cause));
};

/**
 * ADR-021's `search` over Capability RPC, for a website or the admin. It needs
 * no session, and it throws `SearchError`.
 */
export const createSearchClient = (
  config: SearchClientConfig
): { search: Search } => {
  const server = createRpcClient<SearchRoutes>({
    url: config.rpcUrl,
    fetch: config.fetch,
  });
  return {
    search: async (query, options) => {
      const request = validateSearchRequest({ query, options }, undefined);
      try {
        return await server.search.query(request);
      } catch (cause) {
        throw searchErrorOf(cause, `${config.rpcUrl}/search/query`);
      }
    },
  };
};

export const createSearchSlice: ClientSlice = (_set, _get, sliceConfig) =>
  createSearchClient({ rpcUrl: sliceConfig?.rpcUrl ?? DEFAULT_RPC_URL });
