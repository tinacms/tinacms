import { authHeadersOf } from '../../../core/auth/slice';
import {
  MediaError,
  type MediaPage,
  type MediaProvider,
  isMediaErrorCode,
} from '../../../core/media/contract';
import type { ClientSlice, TinaStoreState } from '../../../core/plugin';
import { encodePath } from '../../../utils/encode-path';
import { MEDIA_ERROR_HEADER } from './local-media.plugin';
import type { MediaRequest } from './server/media-request';

const failure = async (response: Response): Promise<MediaError> => {
  const reported = response.headers.get(MEDIA_ERROR_HEADER);
  const code = isMediaErrorCode(reported)
    ? reported
    : response.status === 413
      ? 'too-large'
      : 'backend-failure';
  return new MediaError(code, await response.text());
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
      ...(await authHeadersOf(state)),
    },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw await failure(response);
  return response.json();
};

export const createMediaSlice =
  (url: string, mediaRoot: string): ClientSlice =>
  (_set, get) => {
    const slice: MediaProvider = {
      upload: async (file, folder = '') => {
        const body = new FormData();
        body.append('folder', folder);
        body.append('file', file);
        const response = await fetch(`${url}/upload`, {
          method: 'POST',
          headers: await authHeadersOf(get()),
          body,
        });
        if (!response.ok) throw await failure(response);
        const { path } = (await response.json()) as { path: string };
        return path;
      },
      list: async (folder, page = {}) => {
        const query = new URLSearchParams({ folder });
        if (page.cursor !== undefined) query.set('cursor', page.cursor);
        if (page.limit !== undefined) query.set('limit', String(page.limit));
        const response = await fetch(`${url}?${query}`, {
          headers: await authHeadersOf(get()),
        });
        if (!response.ok) throw await failure(response);
        return (await response.json()) as MediaPage;
      },
      delete: async (path) => {
        await postMediaRequest<null>(url, get(), { op: 'delete', path });
      },
      resolveUrl: (path) => `/${mediaRoot}/${encodePath(path)}`,
    };
    return { ...slice };
  };
