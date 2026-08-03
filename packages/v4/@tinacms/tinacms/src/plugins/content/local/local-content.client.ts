import type {
  ContentProvider,
  DocumentEntry,
} from '../../../core/content/contract';
import type { ClientSlice } from '../../../core/plugin';
import type { ContentRequest } from './server/content-request';

const postContentRequest = async <Result>(
  url: string,
  request: ContentRequest
): Promise<Result> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    throw new Error(
      `Content request ${request.op} failed (${response.status}): ${await response.text()}`
    );
  }
  return response.json();
};

export const createContentSlice = (url: string): ClientSlice => {
  const slice: ContentProvider = {
    list: (collection) =>
      postContentRequest<DocumentEntry[]>(url, { op: 'list', collection }),
    get: (collection, path) =>
      postContentRequest<DocumentEntry | null>(url, {
        op: 'get',
        collection,
        path,
      }),
    update: (collection, path, value) =>
      postContentRequest<DocumentEntry>(url, {
        op: 'update',
        collection,
        path,
        value,
      }),
  };
  return () => ({ ...slice });
};
