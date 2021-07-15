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
} from '@tinacms/core'

import type { Client } from './index'

export class ForestryMediaStore implements MediaStore {
  accept = '*'

  constructor(private client: Client) {
    this.client = client
  }

  async persist(files: MediaUploadOptions[]) {
    const uploaded: Media[] = []

    return uploaded
  }
  async previewSrc(src: string) {
    return src
  }
  async list(options?: MediaListOptions): Promise<MediaList> {
    const directory = options?.directory ?? ''
    const offset = options?.offset ?? 0
    const limit = options?.limit ?? 50

    // console.log("get image directory list here", this.client);

    return {
      items: [],
      totalCount: 0,
      offset: 0,
      limit: 10,
      nextOffset: nextOffset(offset, limit, 3),
    }
  }
  async delete(media: Media): Promise<void> {}
}

export const nextOffset = (offset: number, limit: number, count: number) => {
  if (offset + limit < count) return offset + limit
  return undefined
}
