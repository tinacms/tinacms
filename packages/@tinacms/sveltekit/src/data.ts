import { addMetadata, hashFromQuery } from '@tinacms/bridge/metadata';
import { readOverlay } from '@tinacms/bridge/preview';
import type { RequestEvent } from '@sveltejs/kit';
import { recordForm, type TinaLocals } from './internal/forms-store';

export interface QueryResult<TData> {
  data: TData;
  query: string;
  variables: Record<string, unknown>;
  id: string;
}

type ClientResult<TData> =
  | {
      data: TData;
      query: string;
      variables: Record<string, unknown>;
    }
  | null
  | undefined;

export interface RequestOptions {
  priority?: 'primary';
}

export function subscribeToTinaData<TData extends object>(
  result: Pick<QueryResult<TData>, 'id' | 'data'>,
  onUpdate: (data: TData) => void
): () => void {
  if (typeof window === 'undefined' || window.parent === window) {
    return () => {};
  }

  const handleMessage = (event: MessageEvent<unknown>) => {
    if (
      event.source !== window.parent ||
      event.origin !== window.location.origin
    ) {
      return;
    }

    const message = event.data;
    if (!message || typeof message !== 'object') return;

    const update = message as {
      type?: unknown;
      id?: unknown;
      data?: unknown;
    };
    if (
      update.type !== 'updateData' ||
      update.id !== result.id ||
      !update.data ||
      typeof update.data !== 'object'
    ) {
      return;
    }

    onUpdate(addMetadata(result.id, update.data) as TData);
  };

  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}

export async function requestWithMetadata<TData>(
  source: ClientResult<TData> | Promise<ClientResult<TData>>,
  event: Pick<RequestEvent, 'request' | 'locals'>,
  options?: RequestOptions
): Promise<QueryResult<TData>> {
  let result: ClientResult<TData> = null;
  try {
    result = (await source) ?? null;
  } catch (error) {
    console.warn('[@tinacms/sveltekit] client query failed', error);
  }

  const query = result?.query ?? '';
  const variables = result?.variables ?? {};
  const id = hashFromQuery(JSON.stringify({ query, variables }));
  const data = (result?.data ?? {}) as TData;
  const overlay = await readOverlay<TData>(event.request, id);
  const resolvedData = overlay === undefined ? data : overlay;
  const enriched = {
    data: addMetadata(id, resolvedData) as TData,
    query,
    variables,
    id,
  };

  recordForm(event.locals as TinaLocals, {
    id,
    query,
    variables,
    data: enriched.data as unknown as object,
    priority: options?.priority,
  });

  return enriched;
}
