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
  Media,
  MediaList,
  MediaListOptions,
  MediaStore,
  MediaUploadOptions,
} from '@tinacms/toolkit'

import { E_UNAUTHORIZED, E_BAD_ROUTE, interpretErrorMessage } from './errors'

export class CloudinaryMediaStore implements MediaStore {
  fetchFunction = (input: RequestInfo, init?: RequestInit) => {
    return fetch(input, init)
  }
  accept = 'text/*,  application/*, image/*'

  async persist(media: MediaUploadOptions[]): Promise<Media[]> {
    let newFiles: Media[] = []

    for (const item of media) {
      const { file, directory } = item
      const formData = new FormData()
      formData.append('file', file)
      formData.append('directory', directory)
      formData.append('filename', file.name)

      const res = await this.fetchFunction(`/api/cloudinary/media`, {
        method: 'POST',
        body: formData,
      })

      if (res.status != 200) {
        const responseData = await res.json()
        throw new Error(responseData.message)
      }
      const fileRes = await res.json()
      /**
       * Images uploaded to Cloudinary aren't instantly available via the API;
       * waiting a couple seconds here seems to ensure they show up in the next fetch.
       */
      await new Promise((resolve) => {
        setTimeout(resolve, 2000)
      })
      /**
       * Format the response from Cloudinary to match Media interface
       * Valid Cloudinary `resource_type` values: `image`, `video`, `raw` and `auto`
       * uploading a directory is not supported as such, type is defaulted to `file`
       * https://cloudinary.com/documentation/upload_images#uploading_with_a_direct_call_to_the_rest_api
       */
      const parsedRes: Media = {
        type: 'file',
        id: fileRes.public_id,
        filename: fileRes.original_filename,
        directory: '/',
        previewSrc: fileRes.url,
      }

      newFiles.push(parsedRes)
    }
    return newFiles
  }
  async delete(media: Media) {
    await this.fetchFunction(
      `/api/cloudinary/media/${encodeURIComponent(media.id)}`,
      {
        method: 'DELETE',
      }
    )
  }
  async list(options: MediaListOptions): Promise<MediaList> {
    const query = this.buildQuery(options)
    const response = await this.fetchFunction('/api/cloudinary/media' + query)

    if (response.status == 401) {
      throw E_UNAUTHORIZED
    }
    if (response.status == 404) {
      throw E_BAD_ROUTE
    }
    if (response.status >= 500) {
      const { e } = await response.json()
      const error = interpretErrorMessage(e)
      throw error
    }
    const { items, offset } = await response.json()
    return {
      items: items.map((item) => item),
      nextOffset: offset,
    }
  }

  // @ts-ignore
  previewSrc = (publicId: string | Media): string => {
    if (typeof publicId === 'string') return publicId
    return publicId.previewSrc
  }

  parse = (img) => {
    return img.src
  }

  private buildQuery(options: MediaListOptions) {
    const params = Object.keys(options)
      .filter((key) => options[key] !== '' && options[key] !== undefined)
      .map((key) => `${key}=${options[key]}`)
      .join('&')

    return `?${params}`
  }
}
