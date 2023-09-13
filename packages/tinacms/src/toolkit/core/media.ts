import { EventBus } from './event'
import { DummyMediaStore } from './media-store.default'

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
  private _pageSize: number = 36

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
      const media = await this.store.list(options)
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
