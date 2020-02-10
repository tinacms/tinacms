import { Subscribable } from '@tinacms/core'

export interface Media {
  directory: string
  filename: string
}

export interface MediaUploadOptions {
  directory: string
  file: File
}

export interface MediaStore {
  accept: string
  persist(files: MediaUploadOptions[]): Promise<Media[]>
}

export class MediaManager extends Subscribable {
  constructor(public store: MediaStore) {
    super()
  }
}
