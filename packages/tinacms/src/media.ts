import { Subscribable } from '@tinacms/core'

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
 * Media represents a single media object (file + metadata) in a media store
 */
export interface Media {
  reference: string // internal reference used by the store
  src: string // filepath or URI to the media object
  previewSrc: string // filepath or URI to a preview of the media (will this always be a URI?)
}

export interface MediaListOptions {
  limit: number
  offset: number
}

export interface MediaUploadOptions {
  directory: string
  file: File
}

/**
 * MediaStore provides an interface for interacting with a media storage service
 * examples: local filesystem, cloudinary
 */
export interface MediaStore {
  accept: string
  list(options: MediaListOptions): Promise<Media[]>
  persist(files: MediaUploadOptions[]): Promise<Media[]>
  delete(reference: string[]): Promise<any>
  find(src: string): Promise<Media> // finds an object in the media store based on the src string (such as one pulled from document)
}

export type MediaFilter = (
  media: Media,
  index: number,
  allMedia: Media[]
) => boolean

export interface MediaProps {
  multiple?: boolean
  selected?: string[]
  disabled?: MediaFilter
  filter?: MediaFilter
  onChoose(media: Media[]): void
}

class DummyMedia implements Media {
  reference: string
  src: string
  previewSrc: string
  constructor(ref: string) {
    this.reference = ref
    this.src = `src(${ref})`
    this.previewSrc = `preview(${ref})`
  }
}

class DummyMediaStore implements MediaStore {
  accept = 'img/png,image/png'
  async list(options: MediaListOptions) {
    const _ = options
    return [
      new DummyMedia('terry.jpg'),
      new DummyMedia('toot-toot.jpg'),
      new DummyMedia('baby-yoda.jpg'),
      new DummyMedia('tina.jpg'),
      new DummyMedia('clifford.jpg'),
    ]
  }
  async persist(files: MediaUploadOptions[]) {
    alert('UPLOADING FILES')
    console.log(files)
    return files.map(({ file }) => new DummyMedia(file.name))
  }
  async delete(ref: string[]) {
    alert(`Media Deleted: ${ref}`)
    return ref
  }
  async find(ref: string) {
    return new DummyMedia(ref)
  }
}

/**
 * MediaManager is the UI for adding, removing, and selecting media from the MediaStore to use within the CMS.
 */
export class MediaManager extends Subscribable {
  store: MediaStore = new DummyMediaStore()

  open(props: MediaProps) {
    this.notifySubscribers(props)
  }
}
