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

import path from 'path'
import { GithubMediaStore } from 'react-tinacms-github'
import { Media, MediaListOptions, MediaUploadOptions } from '@tinacms/core'

export class NextGithubMediaStore extends GithubMediaStore {
  previewSrc(fieldValue: string) {
    return super.previewSrc(path.join('public', fieldValue))
  }

  list(options: MediaListOptions) {
    return super
      .list({
        ...options,
        directory: path.join('public', options.directory || ''),
      })
      .then(list => {
        return {
          ...list,
          items: normalizeMediaItems(list.items),
        }
      })
  }

  persist(files: MediaUploadOptions[]) {
    return super
      .persist(
        files.map(file => {
          return {
            ...file,
            directory: path.join('public', file.directory),
          }
        })
      )
      .then(normalizeMediaItems)
  }

  delete(media: Media) {
    return super.delete({
      ...media,
      directory: path.join('public', media.directory),
    })
  }
}

function normalizeMediaItems(items: Media[]) {
  return items.map(item => {
    return {
      ...item,
      directory: item.directory.replace('public', ''),
      id: item.id.replace('public', ''),
    }
  })
}
