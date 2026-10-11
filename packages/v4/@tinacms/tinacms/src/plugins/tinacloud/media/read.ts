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
} from '../client';
import { encodePath } from '../../../utils/encode-path';
import { type MediaBranch, toMediaError } from './shared';
import { listResponseSchema } from './tinacloud-media-types';

const DEFAULT_PAGE_SIZE = 20;

const joinPath = (folder: string, name: string): string =>
  folder ? `${folder}/${name}` : name;

const toMediaPage = (folder: string, body: unknown): MediaPage => {
  const parsed = listResponseSchema.safeParse(body);
  if (!parsed.success) {
    throw new MediaError(
      'backend-failure',
      'TinaCloud returned a media list in an unknown format.'
    );
  }
  const directories: MediaItem[] = parsed.data.directories
    .map((name) => name.replace(/\/+$/, ''))
    .filter(Boolean)
    .map((name) => ({ path: joinPath(folder, name), kind: 'directory' }));
  const files: MediaItem[] = parsed.data.files.map(({ filename }) => ({
    path: joinPath(folder, filename),
    kind: 'file',
  }));
  const cursor = String(parsed.data.cursor ?? '');
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
