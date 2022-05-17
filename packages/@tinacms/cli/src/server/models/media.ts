/**
Copyright 2021 Forestry.io Holdings, Inc.
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
