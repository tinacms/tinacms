/**

Copyright 2021 Forestry.io Holdings, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/
import {
  MediaStore,
  MediaUploadOptions,
  Media,
  MediaListOptions,
  MediaList,
} from '../core'
import { GitClient } from './git-client'

export class GitMediaStore implements MediaStore {
  accept = '*'

  constructor(private client: GitClient) {
    //
  }

  async persist(files: MediaUploadOptions[]): Promise<Media[]> {
    const uploaded: Media[] = []

    for (const { file, directory } of files) {
      const response: Response = await this.client.writeMediaToDisk({
        directory,
        content: file,
      })

      const { filename }: { filename: string } = await response.json()

      uploaded.push({
        // TODO: Implement correctly
        id: filename,
        type: 'file',
        directory,
        filename,
      })
    }

    return uploaded
  }
  async list(options?: MediaListOptions): Promise<MediaList> {
    const directory = options?.directory ?? ''
    const offset = (options?.offset as number) ?? 0
    const limit = options?.limit ?? 50
    const { file } = await this.client.getFile(directory)

    return {
      items: file.content.slice(offset, offset + limit),
      nextOffset: nextOffset(offset, limit, file.content.length),
    }
  }
  async delete(media: Media): Promise<void> {
    return this.client.deleteFromDisk({
      relPath: media.id,
    })
  }
}

export const nextOffset = (offset: number, limit: number, count: number) => {
  if (offset + limit < count) return offset + limit
  return undefined
}
