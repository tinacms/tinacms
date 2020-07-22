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

import { Media, MediaUploadOptions } from '@tinacms/media'

import Cookies from 'js-cookie'
import { STRAPI_JWT } from './tina-strapi-client'

export class StrapiMediaStore {
  accept = '*'

  async persist(files: MediaUploadOptions[]): Promise<Media[]> {
    const uploaded: Media[] = []

    for (const { file } of files) {
      const upload = await uploadFile(file)
      uploaded.push({
        directory: '/uploads',
        filename: upload[0].hash + upload[0].ext + `?${upload[0].id}`,
      })
    }
    return uploaded
  }

  getFilePath(fileUrl: string): string {
    return fileUrl.split('?')[0]
  }

  getFileId(fileUrl: string): string {
    return fileUrl.split('?')[1]
  }

  getAbsolutePath(fileUrl: string): string {
    return process.env.STRAPI_URL + fileUrl
  }
}

export async function uploadFile(file: File) {
  const authToken = Cookies.get(STRAPI_JWT)
  const formData = new FormData()
  formData.append('files', file)
  const uploadResponse: Response = await fetch(
    process.env.STRAPI_URL + '/upload',
    {
      method: 'post',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    }
  )

  if (uploadResponse.status != 200) {
    throw Error(uploadResponse.statusText)
  }
  return uploadResponse.json()
}
