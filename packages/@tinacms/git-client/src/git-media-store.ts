import { MediaStore, MediaUploadOptions, Media } from 'tinacms'
import { GitClient } from './git-client'

export class GitMediaStore implements MediaStore {
  accept = '*'

  constructor(private client: GitClient) {
    //
  }

  async persist(files: MediaUploadOptions[]): Promise<Media[]> {
    const uploaded: Media[] = []

    for (const { file, directory } of files) {
      const response: Response = await this.client.writeMediaToDisk({
        directory,
        content: file,
      })

      const { filename }: { filename: string } = await response.json()

      uploaded.push({
        directory,
        filename,
      })
    }

    return uploaded
  }
}
