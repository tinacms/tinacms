import type { MediaProvider } from '../../../core/media/contract';
import type { ClientSlice, TinaStoreState } from '../../../core/plugin';
import { type TinaCloudOptions, createTinaCloudClient } from '../client';
import { type MediaBranch, deleteMedia, listMedia, mediaUrl } from './read';
import { renameMedia } from './rename';
import { uploadMedia } from './upload';

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

const currentBranch = (state: TinaStoreState): MediaBranch => {
  const name = state.branch?.name;
  return typeof name === 'string' && name ? name : undefined;
};

export const createTinaCloudMediaSlice =
  (options: TinaCloudOptions): ClientSlice =>
  (_set, get) => {
    const client = createTinaCloudClient(options);
    const branch = () => currentBranch(get());
    const media = {
      upload: (file, folder) => uploadMedia(client, branch(), file, folder),
      list: (folder, page) => listMedia(client, branch(), folder, page),
      delete: (path) => deleteMedia(client, branch(), path),
      rename: (from, to) => renameMedia(client, branch(), from, to),
      resolveUrl: (path, size) =>
        mediaUrl(options.clientId, branch(), path, size),
      features: {
        search: true,
        extensionFilter: true,
        maxSize: MAX_UPLOAD_BYTES,
      },
    } satisfies MediaProvider;
    return media;
  };
