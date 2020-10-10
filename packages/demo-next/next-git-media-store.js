/**

Copyright 2019 Forestry.io Inc

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

import { GitMediaStore, nextOffset } from '@tinacms/git-client'

export class NextGitMediaStore extends GitMediaStore {
  previewSrc(src) {
    return /jpg|jpeg|png|svg|gif$/.test(src.toLowerCase())
      ? src.replace('/public', '')
      : null
  }
  async list(options) {
    const directory = options.directory ?? ''
    const offset = options.offset ?? 0
    const limit = options.limit ?? 50
    const { file } = await this.client.getFile(directory)

    return {
      items: file.content.slice(offset, offset + limit).map(media => ({
        ...media,
        previewSrc:
          media.type === 'file' ? this.previewSrc(media.id) : undefined,
      })),
      totalCount: file.content.length,
      offset,
      limit,
      nextOffset: nextOffset(offset, limit, file.content.length),
    }
  }
}
