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

import { GitMediaStore } from '@einsteinindustries/tinacms-git-client'
import MediaPreview from './components/mediaPreview'

export class NextGitMediaStore extends GitMediaStore {
  tabs = [
    { name: 'Fruits', accept: ['image/*'] },
    { name: 'Animals', accept: ['image/*'] },
    { name: 'Files', accept: ['.pdf', '.mp4', '.avi', '.docx'] },
  ]
  namespace = 'demo'

  onItemClick = MediaPreview

  previewSrc(src) {
    return /jpg|jpeg|png|svg|gif$/.test(src.toLowerCase())
      ? src.replace(/\/?public/, '')
      : null
  }
  async list(options) {
    const directories = [
      '/public/images/',
      '/public/images2/',
      '/public/files/',
    ]
    const newOptions = {
      ...options,
      directory: directories[options.currentList],
    }
    const listItems = await super.list(newOptions)
    return {
      ...listItems,
      items: listItems.items.map(media => ({
        ...media,
        previewSrc:
          media.type === 'file' ? this.previewSrc(media.id) : undefined,
      })),
    }
  }
}
