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

import { Media, MediaStore, MediaUploadOptions, MediaList } from './media'

export class DummyMediaStore implements MediaStore {
  accept = '*'
  async persist(files: MediaUploadOptions[]): Promise<Media[]> {
    return files.map(({ directory, file }) => ({
      id: file.name,
      type: 'file',
      directory,
      filename: file.name,
    }))
  }
  async previewSrc(filename: string) {
    return filename
  }
  async list(): Promise<MediaList> {
    const items: Media[] = []
    return {
      items,
      offset: 0,
      limit: 10,
      totalCount: 0,
    }
  }
  async delete() {
    // Unnecessary
  }
}
