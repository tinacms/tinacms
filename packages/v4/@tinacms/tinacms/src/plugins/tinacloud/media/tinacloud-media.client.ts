import type { MediaProvider } from '../../../core/media/contract';
import type { ClientSlice, TinaStoreState } from '../../../core/plugin';
import {
  type TinaCloudOptions,
  type TinaCloudProject,
  createTinaCloudClient,
} from '../client';
import { type MediaBranch, deleteMedia, listMedia, mediaUrl } from './read';
import { renameMedia } from './rename';
import { uploadMedia } from './upload';

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

const storeBranch = (state: TinaStoreState): MediaBranch => {
  const name = state.branch?.name;
  return typeof name === 'string' && name ? name : undefined;
};

// Branch is operational data the Data Layer owns (ADR-019, ADR-024), so with
// no branch in the store the slice uses the project's default branch.
export const createTinaCloudMediaSlice =
  (options: TinaCloudOptions): ClientSlice =>
  (_set, get) => {
    const client = createTinaCloudClient(options);
    let project: TinaCloudProject | undefined;
    const branch = async (): Promise<MediaBranch> => {
      project = await client.getProject();
      return storeBranch(get()) ?? project.defaultBranch;
    };
    const media = {
      upload: async (file, folder) =>
        uploadMedia(client, await branch(), file, folder),
      list: async (folder, page) =>
        listMedia(client, await branch(), folder, page),
      delete: async (path) => deleteMedia(client, await branch(), path),
      rename: async (from, to) => renameMedia(client, await branch(), from, to),
      resolveUrl: (path, size) => {
        const target = storeBranch(get()) ?? project?.defaultBranch;
        const staged = target === project?.mediaBranch ? undefined : target;
        return mediaUrl(options.clientId, staged, path, size);
      },
      features: {
        search: true,
        extensionFilter: true,
        maxSize: MAX_UPLOAD_BYTES,
      },
    } satisfies MediaProvider;
    return media;
  };
