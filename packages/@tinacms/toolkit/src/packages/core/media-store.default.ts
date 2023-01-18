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
  MediaStore,
  MediaUploadOptions,
  MediaList,
  MediaListOptions,
  E_UNAUTHORIZED,
  E_BAD_ROUTE,
} from './media'
import { CMS } from './cms'

const s3ErrorRegex = /<Error>.*<Code>(.+)<\/Code>.*<Message>(.+)<\/Message>.*/

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
  async list(): Promise<MediaList> {
    const items: Media[] = []
    return {
      items,
      nextOffset: 0,
    }
  }
  async delete() {
    // Unnecessary
  }
}

export class TinaMediaStore implements MediaStore {
  fetchFunction = (input: RequestInfo, init?: RequestInit) => {
    return fetch(input, init)
  }

  private api: any
  private cms: CMS
  private isLocal: boolean
  private url: string
  constructor(cms: CMS) {
    this.cms = cms
  }

  setup() {
    if (!this.api) {
      this.api = this.cms?.api?.tina

      this.isLocal = !!this.api.isLocalMode

      const contentApiUrl = new URL(this.api.contentApiUrl)
      this.url = `${contentApiUrl.origin}/media`
      if (!this.isLocal) {
        if (this.api.options?.tinaioConfig?.assetsApiUrlOverride) {
          const url = new URL(this.api.assetsApiUrl)
          this.url = `${url.origin}/v1/${this.api.clientId}`
        } else {
          this.url = `${contentApiUrl.origin.replace('content', 'assets')}/v1/${
            this.api.clientId
          }`
        }
      }
    }
  }

  async isAuthenticated() {
    this.setup()
    return await this.api.isAuthenticated()
  }

  accept = 'image/*'

  private async persist_cloud(media: MediaUploadOptions[]): Promise<Media[]> {
    const newFiles: Media[] = []

    if (await this.isAuthenticated()) {
      for (const item of media) {
        const path = `${
          item.directory && item.directory !== '/'
            ? `${item.directory}/${item.file.name}`
            : item.file.name
        }`
        const res = await this.api.fetchWithToken(
          `${this.url}/upload_url/${path}`,
          { method: 'GET' }
        )

        const { signedUrl } = await res.json()
        if (!signedUrl) {
          throw new Error('Unexpected error generating upload url')
        }

        const uploadRes = await this.fetchFunction(signedUrl, {
          method: 'PUT',
          body: item.file,
          headers: {
            'Content-Type': item.file.type || 'application/octet-stream',
            'Content-Length': String(item.file.size),
          },
        })

        if (!uploadRes.ok) {
          const xmlRes = await uploadRes.text()
          const matches = s3ErrorRegex.exec(xmlRes)
          console.error(xmlRes)
          if (!matches) {
            throw new Error('Unexpected error uploading media asset')
          } else {
            throw new Error(`Upload error: '${matches[2]}'`)
          }
        }
        const { mediaPrefix } =
          this.cms.api.tina.schema.schema?.config?.media?.tina || {}
        const src = `${
          typeof mediaPrefix != 'undefined'
            ? mediaPrefix
            : 'https://assets.tina.io/'
        }${this.api.clientId}/${path}`
        newFiles.push({
          directory: item.directory,
          filename: item.file.name,
          id: item.file.name,
          type: 'file',
          thumbnail: src,
          src,
        })
      }
    }

    return newFiles
  }

  private async persist_local(media: MediaUploadOptions[]): Promise<Media[]> {
    const newFiles: Media[] = []
    const hasTinaMedia =
      Object.keys(
        this.cms.api.tina.schema.schema?.config?.media?.tina || {}
      ).includes('mediaRoot') &&
      Object.keys(
        this.cms.api.tina.schema.schema?.config?.media?.tina || {}
      ).includes('publicFolder')

    let folder: string = hasTinaMedia
      ? this.cms.api.tina.schema.schema?.config?.media?.tina.mediaRoot
      : '/'

    if (!folder.startsWith('/')) {
      // ensure folder always has a /
      folder = '/' + folder
    }
    if (!folder.endsWith('/')) {
      folder = folder + '/'
    }

    for (const item of media) {
      const { file, directory } = item
      const formData = new FormData()
      formData.append('file', file)
      formData.append('directory', directory)
      formData.append('filename', file.name)

      const uploadPath = `${
        directory ? `${directory}/${file.name}` : file.name
      }`
      const filePath = `${
        directory ? `${directory}${folder}${file.name}` : folder + file.name
      }`
      const res = await this.fetchFunction(`${this.url}/upload/${uploadPath}`, {
        method: 'POST',
        body: formData,
      })

      if (res.status != 200) {
        const responseData = await res.json()
        throw new Error(responseData.message)
      }

      const fileRes = await res.json()
      if (fileRes?.success) {
        const parsedRes: Media = {
          type: 'file',
          id: file.name,
          filename: file.name,
          directory,
          src: filePath,
        }

        newFiles.push(parsedRes)
      } else {
        throw new Error('Unexpected error uploading media')
      }
    }
    return newFiles
  }

  async persist(media: MediaUploadOptions[]): Promise<Media[]> {
    this.setup()

    if (this.isLocal) {
      return this.persist_local(media)
    } else {
      return this.persist_cloud(media)
    }
  }

  private genThumbnail(src: string) {
    return !this.isLocal ? `${src}?fit=crop&max-w=56&max-h=56` : src
  }

  async list(options?: MediaListOptions): Promise<MediaList> {
    this.setup()

    let res
    if (!this.isLocal) {
      if (await this.isAuthenticated()) {
        res = await this.api.fetchWithToken(
          `${this.url}/list/${options.directory || ''}?limit=${
            options.limit | 20
          }${options.offset ? `&cursor=${options.offset}` : ''}`
        )

        if (res.status == 401) {
          throw E_UNAUTHORIZED
        }

        if (res.status == 404) {
          throw E_BAD_ROUTE
        }
      } else {
        throw new Error('Not authenticated')
      }
    } else {
      res = await this.fetchFunction(
        `${this.url}/list/${options.directory || ''}?limit=${
          options.limit | 20
        }${options.offset ? `&cursor=${options.offset}` : ''}`
      )

      if (res.status == 404) {
        throw E_BAD_ROUTE
      }

      if (res.status >= 500) {
        const { e } = await res.json()
        const error = new Error('Unexpected error')
        console.error(e)
        throw error
      }
    }
    const { cursor, files, directories } = await res.json()

    const items: Media[] = []
    for (const file of files) {
      items.push({
        directory: options.directory || '',
        type: 'file',
        id: file.filename,
        filename: file.filename,
        src: file.src,
        thumbnail: this.genThumbnail(file.src),
      })
    }

    for (const dir of directories) {
      items.push({
        type: 'dir',
        id: dir,
        directory: options.directory || '',
        filename: dir,
      })
    }

    return {
      items,
      nextOffset: cursor || 0,
    }
  }

  parse = (img) => {
    return img.src
  }

  async delete(media: Media) {
    const path = `${
      media.directory ? `${media.directory}/${media.filename}` : media.filename
    }`
    if (!this.isLocal) {
      if (await this.isAuthenticated()) {
        await this.api.fetchWithToken(`${this.url}/${path}`, {
          method: 'DELETE',
        })
      } else {
        throw E_UNAUTHORIZED
      }
    } else {
      await this.fetchFunction(`${this.url}/${path}`, {
        method: 'DELETE',
      })
    }
  }
}
