import {
  MediaStore,
  MediaUploadOptions,
  Media,
  MediaListOptions,
  MediaList,
} from '@toolkit/core';
import { GitClient } from './git-client';

/**
 * @deprecated as the API is clunky and hard to use. Mutations should now be
 * done via Graphql. This will be removed by July 2025.
 */
export class GitMediaStore implements MediaStore {
  accept = '*';

  constructor(private client: GitClient) {
    //
  }

  /**
   * @deprecated
   */
  async persist(files: MediaUploadOptions[]): Promise<Media[]> {
    const uploaded: Media[] = [];

    for (const { file, directory } of files) {
      const response: Response = await this.client.writeMediaToDisk({
        directory,
        content: file,
      });

      const { filename }: { filename: string } = await response.json();

      uploaded.push({
        // TODO: Implement correctly
        id: filename,
        type: 'file',
        directory,
        filename,
      });
    }

    return uploaded;
  }
  /**
   * @deprecated
   */
  async list(options?: MediaListOptions): Promise<MediaList> {
    const directory = options?.directory ?? '';
    const offset = (options?.offset as number) ?? 0;
    const limit = options?.limit ?? 50;
    const { file } = await this.client.getFile(directory);

    return {
      items: file.content.slice(offset, offset + limit),
      nextOffset: nextOffset(offset, limit, file.content.length),
    };
  }
  /**
   * @deprecated
   */
  async delete(media: Media): Promise<void> {
    return this.client.deleteFromDisk({
      relPath: media.id,
    });
  }
}

export const nextOffset = (offset: number, limit: number, count: number) => {
  if (offset + limit < count) return offset + limit;
  return undefined;
};
