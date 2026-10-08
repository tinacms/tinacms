import { authHeadersOf } from '../../../core/auth/slice';
import type {
  ContentProvider,
  DocumentEntry,
  DocumentSummary,
} from '../../../core/content/contract';
import type { ClientSlice, TinaStoreState } from '../../../core/plugin';
import type { ContentRequest } from './server/content-request';

const postContentRequest = async <Result>(
  url: string,
  state: TinaStoreState,
  request: ContentRequest
): Promise<Result> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(await authHeadersOf(state)),
    },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    throw new Error(
      `Content request ${request.op} failed (${response.status}): ${await response.text()}`
    );
  }
  return response.json();
};

export const createContentSlice =
  (url: string): ClientSlice =>
  (_set, get) => {
    const slice: ContentProvider = {
      list: (collection) =>
        postContentRequest<DocumentSummary[]>(url, get(), {
          op: 'list',
          collection,
        }),
      get: (collection, path) =>
        postContentRequest<DocumentEntry | null>(url, get(), {
          op: 'get',
          collection,
          path,
        }),
      update: (collection, path, value) =>
        postContentRequest<DocumentEntry>(url, get(), {
          op: 'update',
          collection,
          path,
          value,
        }),
    };
    return { ...slice };
  };
