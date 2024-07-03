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
import { DEFAULT_MEDIA_UPLOAD_TYPES } from '@toolkit/components/media/utils'
import type { Client } from '../../internalClient'

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

interface StaticMediaItem {
  id: string
  filename: string
  src: string
  directory: string
  thumbnails: {
    '75x75': string
    '400x400': string
    '1000x1000': string
  }
  type: 'file' | 'dir'
  children?: StaticMedia
}
export interface StaticMedia {
  [offset: string]: StaticMediaItem[]
}

export class TinaMediaStore implements MediaStore {
  fetchFunction = (input: RequestInfo, init?: RequestInit) => {
    return fetch(input, init)
  }

  private api: Client
  private cms: CMS
  private isLocal: boolean
  private url: string
  private staticMedia: StaticMedia
  private lastAuth: number = 0
  isStatic?: boolean

  constructor(cms: CMS, staticMedia?: StaticMedia) {
    this.cms = cms
    if (staticMedia && Object.keys(staticMedia).length > 0) {
      this.isStatic = true
      this.staticMedia = staticMedia
    }
  }

  setup() {
    if (!this.api) {
      this.api = this.cms?.api?.tina

      this.isLocal = !!this.api.isLocalMode

      if (!this.isStatic) {
        const contentApiUrl = new URL(this.api.contentApiUrl)
        this.url = `${contentApiUrl.origin}/media`
        if (!this.isLocal) {
          // TODO: type options
          // @ts-ignore
          if (this.api.options?.tinaioConfig?.assetsApiUrlOverride) {
            const url = new URL(this.api.assetsApiUrl)
            this.url = `${url.origin}/v1/${this.api.clientId}`
          } else {
            this.url = `${contentApiUrl.origin.replace(
              'content',
              'assets'
            )}/v1/${this.api.clientId}`
          }
        }
      }
    }
  }

  async isAuthenticated() {
    this.setup()

    // If we've authenticated in the last 5 minutes, return true
    if (this.lastAuth && Date.now() - this.lastAuth < 1000 * 60 * 5) {
      return true
    }

    // Otherwise, check if we're authenticated
    const authenticated = await this.api.authProvider.isAuthenticated()
    if (authenticated) {
      this.lastAuth = Date.now()
    }
    return authenticated
  }

  accept = DEFAULT_MEDIA_UPLOAD_TYPES

  private async persist_cloud(media: MediaUploadOptions[]): Promise<Media[]> {
    const newFiles: Media[] = []

    if (await this.isAuthenticated()) {
      for (const item of media) {
        let directory = item.directory
        if (directory?.endsWith('/')) {
          directory = directory.substr(0, directory.length - 1)
        }
        const path = `${
          directory && directory !== '/'
            ? `${directory}/${item.file.name}`
            : item.file.name
        }`
        const res = await this.api.authProvider.fetchWithToken(
          `${this.url}/upload_url/${path}`,
          { method: 'GET' }
        )

        if (res.status === 412) {
          const { message = 'Unexpected error generating upload url' } =
            await res.json()
          throw new Error(message)
        }

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
        const src = `https://assets.tina.io/${this.api.clientId}/${path}`

        newFiles.push({
          directory: item.directory,
          filename: item.file.name,
          id: item.file.name,
          type: 'file',
          thumbnails: {
            '75x75': src,
            '400x400': src,
            '1000x1000': src,
          },
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

    // Folder always has leading and trailing slashes
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
      // Stripped directory does not have leading or trailing slashes
      let strippedDirectory = directory
      if (strippedDirectory.startsWith('/')) {
        strippedDirectory = strippedDirectory.substr(1) || ''
      }
      if (strippedDirectory.endsWith('/')) {
        strippedDirectory =
          strippedDirectory.substr(0, strippedDirectory.length - 1) || ''
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('directory', directory)
      formData.append('filename', file.name)

      let uploadPath = `${
        strippedDirectory ? `${strippedDirectory}/${file.name}` : file.name
      }`
      if (uploadPath.startsWith('/')) {
        uploadPath = uploadPath.substr(1)
      }
      const filePath = `${
        strippedDirectory
          ? `${folder}${strippedDirectory}/${file.name}`
          : folder + file.name
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
          thumbnails: {
            '75x75': filePath,
            '400x400': filePath,
            '1000x1000': filePath,
          },
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

  private genThumbnail(src: string, dimensions: { w: number; h: number }) {
    return !this.isLocal
      ? `${src}?fit=crop&max-w=${dimensions.w}&max-h=${dimensions.h}`
      : src
  }

  async list(options?: MediaListOptions): Promise<MediaList> {
    this.setup()

    if (this.staticMedia) {
      const offset = options.offset || 0
      const media = this.staticMedia[String(offset)]
      let hasMore = false
      if (this.staticMedia[String(Number(offset) + 20)]) {
        hasMore = true
      }
      if (options.directory) {
        let depth = 0
        const pathToDirectory = options.directory.split('/')
        let currentFolder = media
        let hasMore = false
        while (depth < pathToDirectory.length) {
          const nextFolder = currentFolder.find(
            (item) =>
              item.type === 'dir' && item.filename === pathToDirectory[depth]
          )
          if (nextFolder) {
            const offset = options.offset || 0
            currentFolder = nextFolder.children[String(offset)]
            if (nextFolder.children[String(Number(offset) + 20)]) {
              hasMore = true
            }
          }
          depth++
        }
        return {
          items: currentFolder,
          nextOffset: hasMore ? Number(offset) + 20 : null,
        }
      }
      return { items: media, nextOffset: hasMore ? Number(offset) + 20 : null }
    }

    let res
    if (!this.isLocal) {
      if (await this.isAuthenticated()) {
        res = await this.api.authProvider.fetchWithToken(
          `${this.url}/list/${options.directory || ''}?limit=${
            options.limit || 20
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
          options.limit || 20
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
    for (const dir of directories) {
      const filename = dir.startsWith('/') ? dir.substr(1) : dir
      items.push({
        type: 'dir',
        id: options.directory ? `${options.directory}/${filename}` : filename,
        directory: options.directory || '',
        filename,
      })
    }

    for (const file of files) {
      const filename = file.filename.startsWith('/')
        ? file.filename.startsWith('/')
        : file.filename
      items.push({
        directory: options.directory || '',
        type: 'file',
        id: filename,
        filename,
        src: file.src,
        thumbnails: options.thumbnailSizes.reduce((acc, { w, h }) => {
          acc[`${w}x${h}`] = this.genThumbnail(file.src, { w, h })
          return acc
        }, {}),
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
        await this.api.authProvider.fetchWithToken(`${this.url}/${path}`, {
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
