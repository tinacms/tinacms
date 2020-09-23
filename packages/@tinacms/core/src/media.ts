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

import { EventBus } from './event'

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
   * A url that provides an image preview of the media file
   */
  previewSrc?: string
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
   * Given a `src` string it returns a url for previewing that content.
   * This is helpful in cases where the file may not be available in production yet.
   */
  previewSrc(
    src: string,
    fieldPath?: string,
    formValues?: any
  ): Promise<string> | string

  /**
   * Lists all media in a specific directory.
   */
  list(options?: MediaListOptions): Promise<MediaList>
}

/**
 * The options available when listing media.
 */
export interface MediaListOptions {
  directory?: string
  limit?: number
  offset?: number
}

/**
 * The response returned from listing media.
 */
export interface MediaList {
  items: Media[]
  limit: number
  offset: number
  nextOffset?: number
  totalCount: number
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
  constructor(public store: MediaStore, private events: EventBus) {}

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

  previewSrc = async (
    src: string,
    fieldName: string = '',
    formValues: any = {}
  ): Promise<string> => {
    try {
      this.events.dispatch({
        type: 'media:preview:start',
        src,
        fieldName,
        formValues,
      })
      const url = await this.store.previewSrc(src, fieldName, formValues)
      this.events.dispatch({
        type: 'media:preview:success',
        src,
        url,
        fieldName,
        formValues,
      })
      return url
    } catch (error) {
      this.events.dispatch({
        type: 'media:preview:failure',
        src,
        error,
        fieldName,
        formValues,
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
  onSelect?(media: Media): void
}
