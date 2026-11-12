import { currentBranchOf } from '../../../core/branch/contract';
import type { MediaProvider } from '../../../core/media/contract';
import type { ClientSlice, TinaStoreState } from '../../../core/plugin';
import {
  type TinaCloudClientOptions,
  type TinaCloudProject,
  createTinaCloudClient,
} from '../client';
import { deleteMedia } from './delete';
import { listMedia, mediaUrl } from './read';
import { type MediaBranch, toMediaError } from './shared';
import { answeredFailureOf, uploadMedia } from './upload';

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

const storeBranch = (state: TinaStoreState): MediaBranch =>
  currentBranchOf(state);

// Branch is operational data the Data Layer owns (ADR-019, ADR-024), so with
// no branch in the store the slice uses the project's default branch.
export const createTinaCloudMediaSlice =
  (options: TinaCloudClientOptions): ClientSlice =>
  (_set, get) => {
    const client = createTinaCloudClient(options);
    let project: TinaCloudProject | undefined;
    const loadProject = async (): Promise<TinaCloudProject> => {
      try {
        project = await client.getProject();
      } catch (cause) {
        throw toMediaError(cause);
      }
      return project;
    };
    const branch = async (): Promise<MediaBranch> => {
      const { defaultBranch } = await loadProject();
      return storeBranch(get()) ?? defaultBranch;
    };
    const media = {
      upload: async (file, folder, options) => {
        // Read before the first `await`: the caller checked this branch, and
        // a switch during the project lookup must not move the upload.
        const live = storeBranch(get());
        try {
          project = await client.getProject();
        } catch (cause) {
          throw answeredFailureOf(cause);
        }
        return uploadMedia(
          client,
          live ?? project.defaultBranch,
          file,
          folder,
          options
        );
      },
      list: async (folder, page) =>
        listMedia(client, await branch(), folder, page),
      delete: async (path) => deleteMedia(client, await branch(), path),
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
