/**
 * Shared overlay reader + helper for fetching Tina query data with the
 * stateless preview overlay. Each route uses `withOverlay()` so the same
 * code path runs in production (header absent → real fetch) and inside
 * the editor iframe (header present → use overlay).
 *
 * The bridge attaches a `{ [queryId]: data }` map to every island refetch
 * via the X-Tina-Preview header. Pages and island endpoints both look up
 * `id` via hashFromQuery so a refresh hits the matching overlay entry.
 */
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
   * header (production / first paint). Returns the raw query data, or
   * null/undefined if nothing exists yet (newly-created docs).
   */
  fetcher: () => Promise<T | null | undefined>;
  /** Render-empty fallback when the disk fetch returns nothing. */
  defaults: T;
}): Promise<QueryResult<T>> {
  const { query, variables, request, fetcher, defaults } = args;
  const id = hashFromQuery(JSON.stringify({ query, variables }));

  const overlayRaw = request.headers.get('X-Tina-Preview');
  if (overlayRaw) {
    try {
      const map = JSON.parse(overlayRaw) as Record<string, T>;
      if (map[id] !== undefined) {
        return {
          data: addContentSourceMetadata(id, map[id]) as T,
          query,
          variables,
          id,
        };
      }
    } catch {
      // Malformed header — fall through to disk fetch.
    }
  }

  const fetched = await fetcher().catch(() => null);
  return {
    data: addContentSourceMetadata(id, fetched ?? defaults) as T,
    query,
    variables,
    id,
  };
}
