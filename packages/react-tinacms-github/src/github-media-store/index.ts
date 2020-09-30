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

import {
  MediaStore,
  MediaUploadOptions,
  Media,
  MediaList,
  MediaListOptions,
} from '@tinacms/core'
import { GithubClient } from '../github-client'
import base64File from './base64File'
import path from 'path'

export class GithubMediaStore implements MediaStore {
  accept = '*'

  constructor(private githubClient: GithubClient) {
    //
  }

  async persist(files: MediaUploadOptions[]): Promise<Media[]> {
    const uploaded: Media[] = []
    for (const { file, directory } of files) {
      let mediaPath = path.join(directory, file.name)
      if (mediaPath.charAt(0) === '/') {
        mediaPath = mediaPath.slice(1)
      }

      try {
        const content = (await base64File(file)).toString().split(',')[1] // only need the data piece
        const uploadResponse: GithubUploadResposne = await this.githubClient.upload(
          mediaPath,
          content,
          'Upload',
          true
        )

        uploaded.push(contentToMedia(uploadResponse.content))
      } catch (e) {
        console.warn('Failed to upload content to Github: ' + e)
      }
    }

    return uploaded
  }

  async delete(media: Media) {
    await this.githubClient.delete(
      path.join(media.directory, media.filename),
      `Deleted ${media.filename}`
    )
  }

  async previewSrc(src: string) {
    try {
      return this.githubClient.getDownloadUrl(src)
    } catch {
      return src
    }
  }

  async list(options?: MediaListOptions): Promise<MediaList> {
    const directory = options?.directory ?? ''
    const offset = options?.offset ?? 0
    const limit = options?.limit ?? 50

    const unfilteredItems: GithubContent[] = await this.githubClient.fetchFile(
      directory
    )

    const items = unfilteredItems.filter(function filterByAccept() {
      // TODO
      return true
    })

    return {
      items: items.map(contentToMedia).slice(offset, offset + limit),
      offset,
      limit,
      nextOffset: nextOffset(offset, limit, items.length),
      totalCount: items.length,
    }
  }
}

const nextOffset = (offset: number, limit: number, count: number) => {
  if (offset + limit < count) return offset + limit
  return undefined
}

const contentToMedia = (item: GithubContent): Media => {
  const previewable = ['.jpg', '.jpeg', '.png', '.webp', '.svg']
  const mediaItem: Media = {
    id: item.path,
    filename: item.name,
    directory: item.path.slice(0, item.path.length - item.name.length),
    type: item.type,
  }

  if (previewable.includes(path.extname(item.name).toLowerCase())) {
    mediaItem.previewSrc = item.download_url
  }

  return mediaItem
}

interface GithubUploadResposne {
  content: GithubContent
}

interface GithubContent {
  name: string
  path: string // directory + name
  size: number
  type: 'file' | 'dir'
  url: string
  download_url: string // For Previewing
  git_url: string
  html_url: string
}
