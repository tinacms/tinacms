/**
 * Wraps a per-route data load so the same code path runs in production
 * (no overlay → real fetch) and inside the editor iframe (overlay
 * present → use the bridge's POST body verbatim).
 *
 * The transport details (POST body, content-type, query-id matching)
 * live in `@tinacms/bridge/preview` so consumers only think in terms of
 * "did the bridge send me an overlay for this query?".
 */
import { readOverlay } from '@tinacms/bridge/preview';
import { addContentSourceMetadata, hashFromQuery } from './metadata';

export interface QueryResult<T> {
  data: T;
  query: string;
  variables: Record<string, unknown>;
  id: string;
}

export async function withOverlay<T>(args: {
  query: string;
  variables: Record<string, unknown>;
  request: Request;
  /**
   * Disk-fetch fallback. Called only when the request has no overlay
   * (production / first paint). Returns the raw query data, or
   * null/undefined if nothing exists yet (newly-created docs).
   */
  fetcher: () => Promise<T | null | undefined>;
  /** Render-empty fallback when the disk fetch returns nothing. */
  defaults: T;
}): Promise<QueryResult<T>> {
  const { query, variables, request, fetcher, defaults } = args;
  const id = hashFromQuery(JSON.stringify({ query, variables }));

  const overlay = await readOverlay<T>(request, id);
  if (overlay !== undefined) {
    return {
      data: addContentSourceMetadata(id, overlay) as T,
      query,
      variables,
      id,
    };
  }

  const fetched = await fetcher().catch(() => null);
  return {
    data: addContentSourceMetadata(id, fetched ?? defaults) as T,
    query,
    variables,
    id,
  };
}
