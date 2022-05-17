import fs from 'fs-extra'
import { join } from 'path'

interface MediaArgs {
  basePath: string
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
}
export const listMedia = async (args: MediaArgs): Promise<ListMediaRes> => {
  try {
    const folderPath = join(args.basePath, args.searchPath)
    const filesStr = await fs.readdir(folderPath)
    const filesProm: Promise<FileRes>[] = filesStr.map(async (x) => {
      const filePath = join(folderPath, x)
      const stat = await fs.stat(filePath)

      const src = join(args.searchPath, x)
      return {
        size: stat.size,
        fileName: x,
        src: src,
        isFile: stat.isFile(),
      }
    })

    const files = await Promise.all(filesProm)

    return {
      files: files.filter((x) => x.isFile),
      directories: files.filter((x) => !x.isFile).map((x) => x.fileName),
    }
  } catch (error) {
    console.error(error)
    return {
      files: [],
      directories: [],
    }
  }
}
