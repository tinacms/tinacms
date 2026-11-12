import { siteAuthHeadersOf } from '../../../core/auth/slice';
import {
  MediaError,
  type MediaPage,
  type MediaProvider,
  type ResolveMediaUrl,
  isMediaErrorCode,
} from '../../../core/media/contract';
import {
  type UploadResponse,
  sendUpload,
} from '../../../core/media/upload-request';
import type { ClientSlice, TinaStoreState } from '../../../core/plugin';
import { MEDIA_EXTENSIONS } from '../../media-manager/media-types';
import { MEDIA_ERROR_HEADER } from './local-media.plugin';
import type { MediaRequest } from './server/media-request';

// The dev server limits the whole request body to 25 MB
// (`MAX_MEDIA_UPLOAD_BYTES`). This leaves 1 MB for the multipart form around
// the file.
const LOCAL_MAX_UPLOAD_BYTES = 24 * 1024 * 1024;

const failureOf = (
  reported: string | null,
  status: number,
  detail: string
): MediaError => {
  const code = isMediaErrorCode(reported)
    ? reported
    : status === 413
      ? 'too-large'
      : 'backend-failure';
  return new MediaError(code, detail);
};

const failure = async (response: Response): Promise<MediaError> =>
  failureOf(
    response.headers.get(MEDIA_ERROR_HEADER),
    response.status,
    await response.text()
  );

const uploadedPathOf = (response: UploadResponse): string => {
  if (response.status < 200 || response.status >= 300) {
    throw failureOf(
      response.header(MEDIA_ERROR_HEADER),
      response.status,
      response.text
    );
  }
  const { path } = JSON.parse(response.text) as { path: string };
  return path;
};

const postMediaRequest = async <Result>(
  url: string,
  state: TinaStoreState,
  request: MediaRequest
): Promise<Result> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(await siteAuthHeadersOf(state)),
    },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw await failure(response);
  return response.json();
};

export const createMediaSlice =
  (url: string, resolveUrl: ResolveMediaUrl): ClientSlice =>
  (_set, get) => {
    const slice: MediaProvider = {
      upload: async (file, folder = '', options) => {
        const body = new FormData();
        body.append('folder', folder);
        body.append('file', file);
        const response = await sendUpload(
          {
            url: `${url}/upload`,
            method: 'POST',
            headers: await siteAuthHeadersOf(get()),
            body,
          },
          options
        );
        return uploadedPathOf(response);
      },
      list: async (folder, page = {}) => {
        const query = new URLSearchParams({ folder });
        if (page.cursor !== undefined) query.set('cursor', page.cursor);
        if (page.limit !== undefined) query.set('limit', String(page.limit));
        const response = await fetch(`${url}?${query}`, {
          headers: await siteAuthHeadersOf(get()),
        });
        if (!response.ok) throw await failure(response);
        return (await response.json()) as MediaPage;
      },
      delete: async (path) => {
        await postMediaRequest<null>(url, get(), { op: 'delete', path });
      },
      rename: async (from, to) => {
        const { path } = await postMediaRequest<{ path: string }>(url, get(), {
          op: 'rename',
          from,
          to,
        });
        return path;
      },
      resolveUrl,
      features: {
        maxSize: LOCAL_MAX_UPLOAD_BYTES,
        acceptedExtensions: [...MEDIA_EXTENSIONS],
      },
    };
    return { ...slice };
  };
