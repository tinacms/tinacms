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

/**
 * Represents an individual file in the MediaStore
 */
export interface Media {
  /**
   * The directory where the file is stored.
   */
  directory: string
  /**
   * The name of the file.
   */
  filename: string
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
export class MediaManager {
  constructor(public store: MediaStore) {}
}
