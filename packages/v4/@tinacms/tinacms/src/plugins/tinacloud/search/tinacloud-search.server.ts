import { z } from 'zod';
import { SearchError, type SearchHit } from '../../../core/search/contract';
import type {
  SearchFields,
  SearchIndexProvider,
} from '../../../core/search/index-contract';
import { requestContext } from '../../../server/request-context';
import { currentServerRuntime } from '../../../server/runtime-access';
import { bearerTokenOf } from '../auth/tinacloud-auth.server';
import {
  TINACLOUD_CONTENT_URL,
  TINACLOUD_IDENTITY_URL,
  type TinaCloudOptions,
  TinaCloudError,
  createTinaCloudClient,
  projectSchema,
} from '../client';
import { TINACLOUD_PLUGIN_NAME } from '../name';

const CALL_TIMEOUT_MS = 10_000;

// A cursor page scans this many of TinaCloud's results for the cursor's hit.
const SCAN_WINDOW = 1000;

const UNAVAILABLE_STATUSES: ReadonlySet<number> = new Set([
  401, 403, 502, 503, 504,
]);

const searchResponseSchema = z.object({
  results: z.array(z.object({ _id: z.string() })),
});

const searchUrl = (
  clientId: string,
  branch: string,
  params: { query: string; limit: number; collection?: string }
): string => {
  const search = new URLSearchParams({
    query: params.query,
    limit: String(params.limit),
  });
  if (params.collection !== undefined) {
    search.set('collection', params.collection);
  }
  return `${TINACLOUD_CONTENT_URL}/v2/searchIndex/${clientId}/${encodeURIComponent(branch)}?${search}`;
};

// The detail never carries TinaCloud's response body or the token.
const searchErrorOf = (cause: unknown): SearchError => {
  if (cause instanceof SearchError) return cause;
  if (cause instanceof TinaCloudError) {
    if (cause.status === undefined) {
      return new SearchError('unavailable', 'TinaCloud could not be reached.');
    }
    if (cause.status === 401 || cause.status === 403) {
      return new SearchError(
        'unavailable',
        'TinaCloud refused the token. Sign in again.'
      );
    }
    if (UNAVAILABLE_STATUSES.has(cause.status)) {
      return new SearchError(
        'unavailable',
        `TinaCloud answered ${cause.status}.`
      );
    }
    return new SearchError(
      'backend-failure',
      `TinaCloud answered ${cause.status}.`
    );
  }
  // An abort that fires while the body is read escapes authedFetch unwrapped.
  return new SearchError(
    'unavailable',
    'The TinaCloud request did not finish.'
  );
};

const trimTrailingSlashes = (path: string): string => path.replace(/\/+$/, '');

// Never mount this module in the browser: it reads the request's bearer token.
export const createTinaCloudSearchProvider = (
  { clientId }: TinaCloudOptions,
  fields: SearchFields
): SearchIndexProvider => ({
  query: async ({ query, collections, filters, limit, cursor }) => {
    const { collections: schemaCollections } = currentServerRuntime();
    if (schemaCollections.length === 0) {
      throw new SearchError(
        'backend-failure',
        'The RPC handler has no schema. Pass the config schema to the handler.'
      );
    }
    const context = requestContext();
    if (context.authProvider !== TINACLOUD_PLUGIN_NAME) {
      throw new SearchError(
        'unavailable',
        'TinaCloud search needs tinaCloud() as the auth provider.'
      );
    }
    const token = bearerTokenOf(context.request);
    if (!token) {
      throw new SearchError(
        'unavailable',
        'TinaCloud search needs a signed-in editor.'
      );
    }
    if (collections !== undefined && collections.length > 1) {
      throw new SearchError(
        'unsupported',
        'TinaCloud search takes one collection or all of them.'
      );
    }
    if (filters !== undefined && Object.keys(filters).length > 0) {
      throw new SearchError(
        'unsupported',
        'TinaCloud search has no field filters.'
      );
    }

    const client = createTinaCloudClient({ clientId, getToken: () => token });
    const call = (url: string) =>
      client.authedFetch(url, { signal: AbortSignal.timeout(CALL_TIMEOUT_MS) });

    let body: unknown;
    try {
      const project = projectSchema.safeParse(
        await call(`${TINACLOUD_IDENTITY_URL}/v2/apps/${clientId}`)
      );
      if (!project.success) {
        throw new SearchError(
          'backend-failure',
          'TinaCloud returned the project in an unknown format.'
        );
      }
      if (!project.data.defaultBranch) {
        throw new SearchError(
          'backend-failure',
          'The TinaCloud project has no default branch.'
        );
      }
      body = await call(
        searchUrl(clientId, project.data.defaultBranch, {
          query,
          limit: cursor === undefined ? limit : SCAN_WINDOW,
          collection: collections?.[0],
        })
      );
    } catch (cause) {
      throw searchErrorOf(cause);
    }
    const response = searchResponseSchema.safeParse(body);
    if (!response.success) {
      throw new SearchError(
        'backend-failure',
        'TinaCloud returned search results in an unknown format.'
      );
    }

    const pathOf = new Map(
      schemaCollections.flatMap(({ name, path }) =>
        path === undefined ? [] : [[name, trimTrailingSlashes(path)] as const]
      )
    );
    const refs: SearchHit['ref'][] = [];
    const seen = new Set<string>();
    for (const { _id } of response.data.results) {
      const colon = _id.indexOf(':');
      if (colon === -1) continue;
      const collection = _id.slice(0, colon);
      const base = pathOf.get(collection);
      if (base === undefined || !Object.hasOwn(fields, collection)) continue;
      const ref = { collection, path: `${base}/${_id.slice(colon + 1)}` };
      const key = JSON.stringify(ref);
      if (seen.has(key)) continue;
      seen.add(key);
      refs.push(ref);
    }

    let start = 0;
    if (cursor !== undefined) {
      const at = refs.findIndex((ref) => JSON.stringify(ref) === cursor);
      if (at === -1) {
        throw new SearchError(
          'invalid-query',
          'The cursor is not in the first 1,000 results.'
        );
      }
      start = at + 1;
    }
    return refs.slice(start, start + limit).map((ref, offset) => ({
      ref,
      score: 1 / (start + offset + 1),
      snippet: '',
    }));
  },
  // TinaCloud indexes itself (ADR-021 §4).
  upsert: async () => {},
  replace: async () => {},
});
