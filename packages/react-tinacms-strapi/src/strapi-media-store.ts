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

import { Media, MediaUploadOptions, MediaListOptions } from '@tinacms/core'

import Cookies from 'js-cookie'
import { STRAPI_JWT } from './strapi-client'

export class StrapiMediaStore {
  strapiUrl: string
  accept = '*'

  constructor(strapiUrl: string) {
    if (!strapiUrl) {
      throw new Error('Missing strapiURL in StrapiMediaStore')
    }
    this.strapiUrl = strapiUrl
  }

  async persist(files: MediaUploadOptions[]): Promise<Media[]> {
    const uploaded: Media[] = []

    for (const { file } of files) {
      const [item] = await this.uploadFile(file)

      uploaded.push({
        id: item.id,
        type: 'file',
        directory: '/uploads',
        filename: item.hash + item.ext + `?${item.id}`,
        previewSrc: this.strapiUrl + item.url,
      })
    }
    return uploaded
  }

  async uploadFile(file: File) {
    const authToken = Cookies.get(STRAPI_JWT)
    const formData = new FormData()
    formData.append('files', file)
    const uploadResponse: Response = await fetch(`${this.strapiUrl}/upload`, {
      method: 'post',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    })

    if (uploadResponse.status != 200) {
      throw Error(uploadResponse.statusText)
    }
    return uploadResponse.json()
  }

  async previewSrc(src: string) {
    return this.strapiUrl + this.getFilePath(src)
  }

  async list(options: MediaListOptions) {
    const offset = options?.offset ?? 0
    const limit = options?.limit ?? 50

    const authToken = Cookies.get(STRAPI_JWT)
    const response: Response = await fetch(`${this.strapiUrl}/upload/files`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.status != 200) {
      throw Error(response.statusText)
    }
    const mediaData = await response.json()
    const nextOffset = offset + limit

    return {
      items: mediaData.slice(offset, limit + offset).map((item: any) => {
        return {
          id: item.id,
          filename: item.name,
          directory: '/uploads',
          type: 'file',
          previewSrc: this.strapiUrl + item.url,
        }
      }),
      limit,
      offset,
      totalCount: mediaData.length,
      nextOffset: nextOffset < mediaData.length ? nextOffset : undefined,
    }
  }

  getFilePath(fileUrl: string): string {
    return fileUrl.split('?')[0]
  }

  getFileId(fileUrl: string): string {
    return fileUrl.split('?')[1]
  }

  getAbsolutePath(fileUrl: string): string {
    return this.strapiUrl + fileUrl
  }
}
