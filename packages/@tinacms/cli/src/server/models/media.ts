import fs, { pathExists } from 'fs-extra'
import { join } from 'path'

interface MediaArgs {
  searchPath: string
}

interface File {
  src: string
  fileName: string
  size: number
}

interface FileRes {
  src: string
  fileName: string
  size: number
  isFile: boolean
}
interface ListMediaRes {
  directories: string[]
  files: File[]
  curser?: string
  error?: string
}
type SuccessRecord = { ok: true } | { ok: false; message: string }
export class MediaModel {
  readonly basePath: string
  constructor({ basePath }: { basePath: string }) {
    this.basePath = basePath
  }
  async listMedia(args: MediaArgs): Promise<ListMediaRes> {
    try {
      const folderPath = join(this.basePath, args.searchPath)
      const filesStr = await fs.readdir(folderPath)
      const filesProm: Promise<FileRes>[] = filesStr.map(async (x) => {
        const filePath = join(folderPath, x)
        const stat = await fs.stat(filePath)

        const src = join(args.searchPath, x)
        return {
          size: stat.size,
          fileName: x,
          src: '/' + src,
          isFile: stat.isFile(),
        }
      })

      const files = await Promise.all(filesProm)

      return {
        files: files.filter((x) => x.isFile),
        directories: files.filter((x) => !x.isFile).map((x) => x.src),
      }
    } catch (error) {
      console.error(error)
      return {
        files: [],
        directories: [],
        error: error?.toString(),
      }
    }
  }
  async uploadMediaObj(
    args: MediaArgs & { data: any }
  ): Promise<SuccessRecord> {
    try {
      const file = join(this.basePath, args.searchPath)
      if (await pathExists(file)) {
        throw new Error(`File ${file} already exists. Can not upload`)
      }
      await fs.writeFile(file, args.data)

      return { ok: true }
    } catch (error) {
      console.error(error)
      return { ok: false, message: error?.toString() }
    }
  }

  async deleteMedia(args: MediaArgs): Promise<SuccessRecord> {
    try {
      const file = join(this.basePath, args.searchPath)
      // ensure the file exists because fs.remove does not throw an error if the file does not exist
      await fs.stat(file)
      await fs.remove(file)
      return { ok: true }
    } catch (error) {
      console.error(error)
      return { ok: false, message: error?.toString() }
    }
  }
}
