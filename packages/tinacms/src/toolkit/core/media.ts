import { EventBus } from './event'
import { DummyMediaStore } from './media-store.default'
import MiniSearch from 'minisearch'

/**
 * Represents an individual file in the MediaStore
 */
export interface Media {
  type: 'file' | 'dir'

  /**
   * A unique identifier for this file.
   */
  id: string

  /**
   * The name of the file.
   */
  filename: string

  /**
   * The directory where the file is stored.
   */

  directory: string

  /**
   * A url that provides an image of the media file
   */
  src?: string

  /**
   * A url that provides a smaller image of the media file
   */
  thumbnails?: { [name: string]: string }
}

export interface MediaUploadOptions {
  /**
   * The directory where the file should be stored.
   */
  directory: string
  /**
   * The File to be uploaded.
   */
  file: File
}

/**
 * Represents some external service for storing and
 * managing media.
 */
export interface MediaStore {
  /**
   * The [input accept string](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept)
   * that describes what kind of files the Media Store will accept.
   */
  accept: string
  /**
   * Uploads a set of files to the Media Store and
   * returns a Promise containing the Media objects
   * for those files.
   */
  persist(files: MediaUploadOptions[]): Promise<Media[]>

  /**
   * Delete a media object from the store.
   */
  delete(media: Media): Promise<void>

  /**
   * Lists all media in a specific directory.
   */
  list(options?: MediaListOptions): Promise<MediaList>

  /**
   * Indicates that uploads and deletions are not supported
   *
   * @default false
   */
  isStatic?: boolean
}

export declare type MediaListOffset = string | number
/**
 * The options available when listing media.
 */
export interface MediaListOptions {
  directory?: string
  limit?: number
  offset?: MediaListOffset
  thumbnailSizes?: { w: number; h: number }[]
}

/**
 * The response returned from listing media.
 */
export interface MediaList {
  items: Media[]
  nextOffset?: MediaListOffset
}

/**
 * The central object for all things media.
 *
 * Meant to be placed directly on the `cms`
 *
 * ```ts
 * cms.media = new MediaManager({
 *   accept: '*',
 *   async persist(files) {
 *     // do something
 *   }
 * })
 * ```
 */
export class MediaManager implements MediaStore {
  private _pageSize: number = 100
  private loaded: boolean = false
  private loading: boolean = false
  private _mediaPages: {
    [directory: string]: Media[]
  } = {}
  private minisearch = new MiniSearch({
    fields: ['id', 'filename'],
    storeFields: ['item'],
  })

  constructor(public store: MediaStore, private events: EventBus) {}

  get isConfigured() {
    return !(this.store instanceof DummyMediaStore)
  }

  get pageSize() {
    return this._pageSize
  }

  set pageSize(pageSize) {
    this._pageSize = pageSize
    this.events.dispatch({
      type: 'media:pageSize',
      pageSize: pageSize,
    })
  }

  open(options: SelectMediaOptions = {}) {
    this.events.dispatch({
      type: 'media:open',
      ...options,
    })
  }

  get accept() {
    return this.store.accept
  }

  async fetchDirectory(
    directory: string | undefined,
    thumbnailSizes: { w: number; h: number }[]
  ) {
    const results: Media[] = []
    let offset: number = 0

    while (true) {
      const { items } = await this.store.list({
        offset,
        limit: this.pageSize,
        thumbnailSizes,
        directory,
      })
      if (!items || !items.length) break
      for (const item of items) {
        if (item.type !== 'dir') {
          this.minisearch.add({
            id: directory ? `${directory}/${item.id}` : item.id,
            filename: item.filename,
            item,
          })
        }
        results.push(item)
      }
      offset += this.pageSize
    }

    let key = '.'
    if (directory) {
      key = directory
    }

    this._mediaPages[key] = results

    for (const media of results) {
      if (media.type === 'dir') {
        await this.fetchDirectory(media.id, thumbnailSizes)
      }
    }
  }

  async refreshCache(
    thumbnailSizes: { w: number; h: number }[],
    callback?: (loading: boolean, loaded: boolean) => void
  ) {
    this.minisearch.removeAll()
    callback && callback(true, false)
    await this.fetchDirectory(undefined, thumbnailSizes)
    callback && callback(false, true)
    this.loaded = true
  }

  loadFromCache(options: MediaListOptions): MediaList {
    const directory = options.directory || '.'
    const media = this._mediaPages[directory]
    if (!media) {
      throw new Error(`No media found for directory: ${directory}`)
    }

    const offset = options.offset || 0
    const limit = options.limit || this.pageSize
    const start = offset as number
    const end = start + limit
    const items = media.slice(start, end)
    return { items, nextOffset: end < media.length ? end : undefined }
  }

  async persist(files: MediaUploadOptions[]): Promise<Media[]> {
    try {
      this.events.dispatch({ type: 'media:upload:start', uploaded: files })
      const media = await this.store.persist(files)
      this.events.dispatch({
        type: 'media:upload:success',
        uploaded: files,
        media,
      })
      return media
    } catch (error) {
      console.error(error)
      this.events.dispatch({
        type: 'media:upload:failure',
        uploaded: files,
        error,
      })
      throw error
    }
  }

  async delete(media: Media): Promise<void> {
    try {
      this.events.dispatch({ type: 'media:delete:start', media })
      await this.store.delete(media)
      this.events.dispatch({
        type: 'media:delete:success',
        media,
      })
    } catch (error) {
      this.events.dispatch({
        type: 'media:delete:failure',
        media,
        error,
      })
      throw error
    }
  }

  async list(options: MediaListOptions): Promise<MediaList> {
    try {
      this.events.dispatch({ type: 'media:list:start', ...options })
      let media: MediaList
      if (!this.loaded && !this.loading) {
        media = await this.store.list(options)
      } else {
        media = this.loadFromCache(options)
      }
      this.events.dispatch({ type: 'media:list:success', ...options, media })
      return media
    } catch (error) {
      this.events.dispatch({ type: 'media:list:failure', ...options, error })
      throw error
    }
  }

  async search(query: string, options: MediaListOptions): Promise<MediaList> {
    try {
      this.events.dispatch({ type: 'media:list:start', ...options })
      let media: MediaList
      if (this.loaded) {
        const results = this.minisearch.search(query)
        let items = results.map((result) => result.item)
        const start = (options.offset || 0) as number
        const end = start + (options.limit || this.pageSize)
        items = items.slice(start, end)
        media = { items, nextOffset: end < items.length ? end : undefined }
      } else {
        throw new Error('Media cache not loaded')
      }
      this.events.dispatch({ type: 'media:list:success', ...options, media })
      return media
    } catch (error) {
      this.events.dispatch({ type: 'media:list:failure', ...options, error })
      throw error
    }
  }
}

export interface SelectMediaOptions {
  allowDelete?: boolean
  directory?: string
  onSelect?(media: Media): void
}

interface MediaListErrorConfig {
  title: string
  message: string
  docsLink: string
}

export class MediaListError extends Error {
  public ERR_TYPE = 'MediaListError'
  public title: string
  public docsLink: string

  constructor(config: MediaListErrorConfig) {
    super(config.message)
    this.title = config.title
    this.docsLink = config.docsLink
  }
}

export const E_UNAUTHORIZED = new MediaListError({
  title: 'Unauthorized',
  message: "You don't have access to this resource.",
  docsLink: 'https://tina.io/docs/reference/media/overview',
})

export const E_BAD_ROUTE = new MediaListError({
  title: 'Bad Route',
  message: 'The Cloudinary API route is missing or misconfigured.',
  docsLink: 'https://tina.io/docs/reference/media/external/authentication/',
})

export const E_DEFAULT = new MediaListError({
  title: 'An Error Occurred',
  message: 'Something went wrong accessing your media from Tina Cloud.',
  docsLink: '', // TODO
})
