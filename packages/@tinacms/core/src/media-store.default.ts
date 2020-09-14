import { Media, MediaStore, MediaUploadOptions, MediaList } from './media'

export class DummyMediaStore implements MediaStore {
  accept = '*'
  async persist(files: MediaUploadOptions[]): Promise<Media[]> {
    alert('UPLOADING FILES')
    console.log(files)
    return files.map(({ directory, file }) => ({
      id: file.name,
      type: 'file',
      directory,
      filename: file.name,
    }))
  }
  async previewSrc(filename: string) {
    return filename
  }
  async list(): Promise<MediaList> {
    const items: Media[] = []
    return {
      items,
      totalCount: 0,
    }
  }
}
