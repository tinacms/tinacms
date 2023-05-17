/**

*/

import fs from 'fs-extra'
import { join } from 'path'
import { parseMediaFolder } from '../../utils/'

interface MediaArgs {
  searchPath: string
  cursor?: string
  limit?: string
}

interface File {
  src: string
  filename: string
  size: number
}

interface FileRes {
  src: string
  filename: string
  size: number
  isFile: boolean
}
interface ListMediaRes {
  directories: string[]
  files: File[]
  cursor?: string
  error?: string
}
export interface PathConfig {
  rootPath: string
  publicFolder: string
  mediaRoot: string
}

type SuccessRecord = { ok: true } | { ok: false; message: string }
export class MediaModel {
  public readonly rootPath: string
  public readonly publicFolder: string
  public readonly mediaRoot: string
  constructor({ rootPath, publicFolder, mediaRoot }: PathConfig) {
    this.rootPath = rootPath
    this.mediaRoot = mediaRoot
    this.publicFolder = publicFolder
  }
  async listMedia(args: MediaArgs): Promise<ListMediaRes> {
    try {
      const folderPath = join(
        this.rootPath,
        this.publicFolder,
        this.mediaRoot,
        args.searchPath
      )
      const searchPath = parseMediaFolder(args.searchPath)
      let filesStr: string[] = []
      try {
        filesStr = await fs.readdir(folderPath)
      } catch (error) {
        return {
          files: [],
          directories: [],
        }
      }
      const filesProm: Promise<FileRes>[] = filesStr.map(async (file) => {
        const filePath = join(folderPath, file)
        const stat = await fs.stat(filePath)

        let src = `/${file}`

        const isFile = stat.isFile()

        // It seems like our media manager wants relative paths for dirs.
        if (!isFile) {
          return {
            isFile,
            size: stat.size,
            src,
            filename: file,
          }
        }

        if (searchPath) {
          src = `/${searchPath}${src}`
        }
        if (this.mediaRoot) {
          src = `/${this.mediaRoot}${src}`
        }

        return {
          isFile,
          size: stat.size,
          src: src,
          filename: file,
        }
      })

      const offset = Number(args.cursor) || 0
      const limit = Number(args.limit) || 20

      const rawItems = await Promise.all(filesProm)
      const sortedItems = rawItems.sort((a, b) => {
        if (a.isFile && !b.isFile) {
          return 1
        }
        if (!a.isFile && b.isFile) {
          return -1
        }
        return 0
      })
      const limitItems = sortedItems.slice(offset, offset + limit)
      const files = limitItems.filter((x) => x.isFile)
      const directories = limitItems.filter((x) => !x.isFile).map((x) => x.src)

      const cursor =
        rawItems.length > offset + limit ? String(offset + limit) : null

      return {
        files,
        directories,
        cursor,
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
  async deleteMedia(args: MediaArgs): Promise<SuccessRecord> {
    try {
      const file = join(
        this.rootPath,
        this.publicFolder,
        this.mediaRoot,
        args.searchPath
      )
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
