/**
 * `requestWithMetadata()` is the only Astro-specific call site needed
 * around the standard `client.queries.<name>(...)` pattern. In production
 * it stamps the result with the metadata `tinaField()` reads to build
 * click-to-focus markers and the `id` the bridge uses to address forms;
 * inside the editor iframe it additionally swaps `data` for the unsaved
 * overlay the bridge has POSTed for that form.
 *
 * The current `Astro.request` is read from AsyncLocalStorage scoped by
 * the middleware the `tina()` integration injects, so the call site stays
 * a single argument:
 *
 * ```ts
 * import client from '../../tina/__generated__/client';
 * import { requestWithMetadata } from '@tinacms/astro';
 *
 * const post = await requestWithMetadata(
 *   client.queries.post({ relativePath: `${slug}.md` }),
 * );
 * ```
 *
 * Outside a request scope (static builds, integration not installed) the
 * wrapper falls through to a metadata-stamped pass-through — production
 * output stays correct, just without the live overlay swap that only
 * matters during admin editing.
 */
import { addMetadata, hashFromQuery } from '@tinacms/bridge/metadata';
import { readOverlay } from '@tinacms/bridge/preview';
import { recordForm } from './internal/forms-store';
import { requestStore } from './internal/request-context';

export interface QueryResult<TData> {
  data: TData;
  query: string;
  variables: Record<string, unknown>;
  id: string;
}

/** Shape every `client.queries.<name>` returns. Inferring from this lets
 *  `requestWithMetadata()` stay framework-agnostic — it doesn't need to
 *  know about `PostQuery`, `PageQuery`, etc. */
type ClientResult<TData> =
  | {
      data: TData;
      query: string;
      variables: Record<string, unknown>;
    }
  | null
  | undefined;

export async function requestWithMetadata<TData>(
  source: ClientResult<TData> | Promise<ClientResult<TData>>
): Promise<QueryResult<TData>> {
  let result: ClientResult<TData> = null;
  try {
    result = (await source) ?? null;
  } catch (error) {
    // Disk-fetch failures are normal in edit mode (a doc the editor is
    // creating doesn't exist yet) and should never crash the page render
    // — the bridge will populate via overlay. In production, the warning
    // surfaces real misconfigurations.
    console.warn('[@tinacms/astro] client query failed', error);
  }

  const query = result?.query ?? '';
  const variables = result?.variables ?? {};
  const id = hashFromQuery(JSON.stringify({ query, variables }));
  const data = (result?.data ?? {}) as TData;

  const request = requestStore.getStore();
  let resolvedData: TData = data;
  if (request) {
    const overlay = await readOverlay<TData>(request, id);
    if (overlay !== undefined) {
      resolvedData = overlay;
    }
  }

  const enriched = {
    data: addMetadata(id, resolvedData) as TData,
    query,
    variables,
    id,
  };

  // Append to the per-request forms list so the integration's middleware
  // can splice the bridge wiring into edit-mode pages without the caller
  // touching their layout. No-ops outside a request scope (static builds).
  recordForm({
    id,
    query,
    variables,
    data: enriched.data as unknown as object,
  });

  return enriched;
}
