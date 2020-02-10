import { MediaStore, MediaUploadOptions } from 'tinacms'
import { GitClient } from '@tinacms/git-client'
export class GitMediaStore implements MediaStore {
  accept = '*'
  constructor(private client: GitClient) {
    //
  }
  async persist(files: MediaUploadOptions[]) {
    const uploaded: any[] = []
    for (const { file, directory } of files) {
      const response: Response = await this.client.writeMediaToDisk({
        directory,
        content: file,
      })
      const data: { filename: string } = await response.json()
      uploaded.push({
        src: data.filename,
        previewSrc: data.filename,
        reference: data.filename,
      })
    }
    return uploaded
  }
}
