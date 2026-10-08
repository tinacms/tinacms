import {
  MediaError,
  type MediaItem,
  type MediaPage,
  type MediaPageRequest,
  type MediaUrlOptions,
} from '../../../core/media/contract';
import {
  TINACLOUD_ASSETS_URL,
  TINACLOUD_CDN_URL,
  type TinaCloudClient,
  TinaCloudError,
} from '../client';
import { encodePath } from '../../../utils/encode-path';
import { isRecord } from '../../../utils/is-record';

const DEFAULT_PAGE_SIZE = 20;

/** An undefined branch is the media branch of the TinaCloud project. */
export type MediaBranch = string | undefined;

export const toMediaError = (cause: unknown): MediaError => {
  if (cause instanceof MediaError) return cause;
  if (!(cause instanceof TinaCloudError)) {
    if (cause instanceof Error) {
      return new MediaError('backend-failure', cause.message);
    }
    return new MediaError('backend-failure', String(cause));
  }
  const { serverMessage } = cause;
  const detail =
    serverMessage && serverMessage !== cause.message
      ? `${cause.message} ${serverMessage}`
      : cause.message;
  switch (cause.status) {
    case 401:
    case 403:
      return new MediaError('unauthorized', detail);
    case 404:
      return new MediaError('not-found', detail);
    case 413:
      return new MediaError('too-large', detail);
    default:
      return new MediaError('backend-failure', detail);
  }
};

export const branchQuery = (branch: MediaBranch): string =>
  branch ? `?${new URLSearchParams({ branch })}` : '';

const joinPath = (folder: string, name: string): string =>
  folder ? `${folder}/${name}` : name;

const toMediaPage = (folder: string, body: unknown): MediaPage => {
  if (
    !isRecord(body) ||
    !Array.isArray(body.files) ||
    !Array.isArray(body.directories)
  ) {
    throw new MediaError(
      'backend-failure',
      'TinaCloud returned a media list in an unknown format.'
    );
  }
  const directories: MediaItem[] = body.directories
    .filter((name): name is string => typeof name === 'string')
    .map((name) => name.replace(/\/+$/, ''))
    .filter(Boolean)
    .map((name) => ({ path: joinPath(folder, name), kind: 'directory' }));
  const files: MediaItem[] = body.files.flatMap((file) =>
    isRecord(file) && typeof file.filename === 'string'
      ? [{ path: joinPath(folder, file.filename), kind: 'file' as const }]
      : []
  );
  const cursor =
    typeof body.cursor === 'string' || typeof body.cursor === 'number'
      ? String(body.cursor)
      : '';
  return {
    items: [...directories, ...files],
    cursor: cursor && cursor !== '0' ? cursor : undefined,
  };
};

export const listMedia = async (
  client: TinaCloudClient,
  branch: MediaBranch,
  folder: string,
  page: MediaPageRequest = {}
): Promise<MediaPage> => {
  const query = new URLSearchParams({
    limit: String(page.limit ?? DEFAULT_PAGE_SIZE),
  });
  if (page.cursor) query.set('cursor', page.cursor);
  if (page.search) query.set('search', page.search);
  if (page.extensions?.length) query.set('ext', page.extensions.join(','));
  if (branch) query.set('branch', branch);
  try {
    const body = await client.authedFetch(
      `${TINACLOUD_ASSETS_URL}/v2/${client.clientId}/list/${encodePath(folder)}?${query}`
    );
    return toMediaPage(folder, body);
  } catch (cause) {
    throw toMediaError(cause);
  }
};

export const deleteMedia = async (
  client: TinaCloudClient,
  branch: MediaBranch,
  path: string
): Promise<void> => {
  try {
    const body = await client.authedFetch(
      `${TINACLOUD_ASSETS_URL}/v1/${client.clientId}/${encodePath(path)}${branchQuery(branch)}`,
      { method: 'DELETE' }
    );
    if (isRecord(body) && typeof body.requestId === 'string') {
      await client.waitForRequest(body.requestId);
    }
  } catch (cause) {
    throw toMediaError(cause);
  }
};

// The URL format of `resolveMediaRelativeToCloud` in
// `@tinacms/graphql/src/resolver/media-utils.ts`: a branch other than the
// media branch reads from `__staging/{branch}/__file/`, with its `/` kept.
export const mediaUrl = (
  clientId: string,
  branch: MediaBranch,
  path: string,
  size: MediaUrlOptions = {}
): string => {
  const staging = branch ? `/__staging/${encodePath(branch)}/__file` : '';
  const url = `${TINACLOUD_CDN_URL}/${clientId}${staging}/${encodePath(path)}`;
  if (size.width === undefined && size.height === undefined) return url;
  const query = new URLSearchParams({ fit: 'crop' });
  if (size.width !== undefined) query.set('max-w', String(size.width));
  if (size.height !== undefined) query.set('max-h', String(size.height));
  return `${url}?${query}`;
};
