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

import fs from 'fs-extra'
import fg from 'fast-glob'
import path from 'path'
import normalize from 'normalize-path'
import type { Bridge } from './index'

/**
 * This is the bridge from whatever datasource we need for I/O.
 * The basic example here is for the filesystem, one is needed
 * for Github has well.
 */
export class FilesystemBridge implements Bridge {
  public rootPath: string
  public outputPath?: string
  constructor(rootPath: string) {
    this.rootPath = rootPath || ''
    this.outputPath = rootPath || ''
  }
  public addOutputPath(outputPath: string) {
    this.outputPath = outputPath
  }
  public async glob(pattern: string, extension: string) {
    const basePath = path.join(this.outputPath, ...pattern.split('/'))
    const items = await fg(
      path.join(basePath, '**', `/*${extension}`).replace(/\\/g, '/'),
      {
        dot: true,
      }
    )
    const posixRootPath = normalize(this.outputPath)
    return items.map((item) => {
      return item.replace(posixRootPath, '').replace(/^\/|\/$/g, '')
    })
  }
  public supportsBuilding() {
    return true
  }
  public async delete(filepath: string) {
    await fs.remove(path.join(this.outputPath, filepath))
  }
  public async get(filepath: string) {
    return fs.readFileSync(path.join(this.outputPath, filepath)).toString()
  }
  public async putConfig(filepath: string, data: string) {
    /**
     * If the root path and output path are different (for separate content repos)
     * push config file changes to both.
     */
    if (this.rootPath !== this.outputPath) {
      await this.put(filepath, data)
      await this.put(filepath, data, this.rootPath)
    } else {
      await this.put(filepath, data)
    }
  }
  public async put(filepath: string, data: string, basePathOverride?: string) {
    const basePath = basePathOverride || this.outputPath
    await fs.outputFileSync(path.join(basePath, filepath), data)
  }
}

/**
 * Same as the `FileSystemBridge` except it does not save files
 */
export class AuditFileSystemBridge extends FilesystemBridge {
  public async put(filepath: string, data: string) {
    if (
      [
        '.tina/__generated__/_lookup.json',
        '.tina/__generated__/_schema.json',
        '.tina/__generated__/_graphql.json',
      ].includes(filepath) ||
      [
        'tina/__generated__/_lookup.json',
        'tina/__generated__/_schema.json',
        'tina/__generated__/_graphql.json',
      ].includes(filepath)
    ) {
      return super.put(filepath, data)
    }
    return
  }
}
