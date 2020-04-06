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
import { MediaStore, MediaUploadOptions, Media } from '@tinacms/media'
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
        directory,
        filename,
      })
    }

    return uploaded
  }
}
