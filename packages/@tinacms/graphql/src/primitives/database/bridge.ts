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

/**
 * This is the bridge from whatever datasource we need for I/O.
 * The basic example here is for the filesystem, one is needed
 * for Github has well.
 */
export class FilesystemBridge implements Bridge {
  public rootPath: string
  constructor(rootPath: string) {
    this.rootPath = rootPath || ''
  }
  public glob = async (pattern: string) => {
    const items = await fg(path.join(this.rootPath, pattern, '**/*'), {
      dot: true,
    })
    return items.map((item) => {
      return item.replace(this.rootPath, '').replace(/^\/|\/$/g, '')
    })
  }
  public get = async (filepath: string) => {
    return fs.readFileSync(path.join(this.rootPath, filepath)).toString()
  }
  public put = async (filepath: string, data: string) => {
    await fs.outputFileSync(path.join(this.rootPath, filepath), data)
  }
}

export interface Bridge {
  glob: (pattern: string) => Promise<string[]>
  get: (filepath: string) => Promise<string>
  put: (filepath: string, data: string) => Promise<void>
}
