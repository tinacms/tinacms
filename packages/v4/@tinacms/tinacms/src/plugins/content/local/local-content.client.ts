import { siteAuthHeadersOf } from '../../../core/auth/slice';
import {
  type ContentErrorCode,
  type ContentProvider,
  ContentError,
  type DocumentConnection,
  type DocumentEntry,
  type DocumentReferrer,
  type FolderSummary,
  type RenameFolderResult,
  type RenameResult,
  isContentRefusalCode,
  isProviderRefusalCode,
} from '../../../core/content/contract';
import { isRecord } from '../../../utils/is-record';
import type { ClientSlice, TinaStoreState } from '../../../core/plugin';
import type { ContentRequest } from './server/content-request';

const refusalIn = (
  text: string
): { code: ContentErrorCode; message: string } | null => {
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return null;
  }
  const error = isRecord(body) ? body.error : undefined;
  if (!isRecord(error) || typeof error.message !== 'string') return null;
  if (!isContentRefusalCode(error.code) && !isProviderRefusalCode(error.code)) {
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
      local: true,
      list: (collection, query) =>
        postContentRequest<DocumentConnection>(url, get(), {
          op: 'list',
          collection,
          query,
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
      create: (collection, path, value, template) =>
        postContentRequest<DocumentEntry>(url, get(), {
          op: 'create',
          collection,
          path,
          value,
          template,
        }),
      rename: (collection, from, to) =>
        postContentRequest<RenameResult>(url, get(), {
          op: 'rename',
          collection,
          from,
          to,
        }),
      delete: async (collection, path) => {
        await postContentRequest<null>(url, get(), {
          op: 'delete',
          collection,
          path,
        });
      },
      referrers: (collection, path) =>
        postContentRequest<DocumentReferrer[]>(url, get(), {
          op: 'referrers',
          collection,
          path,
        }),
      createFolder: (collection, folder) =>
        postContentRequest<FolderSummary>(url, get(), {
          op: 'createFolder',
          collection,
          folder,
        }),
      renameFolder: (collection, from, to) =>
        postContentRequest<RenameFolderResult>(url, get(), {
          op: 'renameFolder',
          collection,
          from,
          to,
        }),
      deleteFolder: (collection, folder) =>
        postContentRequest<{ deleted: string[] }>(url, get(), {
          op: 'deleteFolder',
          collection,
          folder,
        }),
    };
    return { ...slice };
  };
