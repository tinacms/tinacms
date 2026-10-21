import { siteAuthHeadersOf } from '../../../core/auth/slice';
import {
  type ContentProvider,
  ContentError,
  type DocumentEntry,
  type DocumentSummary,
} from '../../../core/content/contract';
import { isRecord } from '../../../utils/is-record';
import type { ClientSlice, TinaStoreState } from '../../../core/plugin';
import type { ContentRequest } from './server/content-request';

const refusalIn = (
  text: string
): { code: 'hook-rejected' | 'write-refused'; message: string } | null => {
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return null;
  }
  const error = isRecord(body) ? body.error : undefined;
  if (!isRecord(error) || typeof error.message !== 'string') return null;
  if (error.code !== 'hook-rejected' && error.code !== 'write-refused') {
    return null;
  }
  return { code: error.code, message: error.message };
};

const postContentRequest = async <Result>(
  url: string,
  state: TinaStoreState,
  request: ContentRequest
): Promise<Result> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(await siteAuthHeadersOf(state)),
    },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const text = await response.text();
    const refusal = refusalIn(text);
    if (refusal) throw new ContentError(refusal.code, refusal.message);
    throw new Error(
      `Content request ${request.op} failed (${response.status}): ${text}`
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
