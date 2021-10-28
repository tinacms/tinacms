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

import type { Store } from './index'
import fs from 'fs-extra'

/**
 * This is the bridge from whatever datasource we need for I/O.
 * The basic example here is for the filesystem, one is needed
 * for Github has well.
 */
let map: { [key: string]: object } = {}
export class MemoryStore implements Store {
  public rootPath
  public db
  constructor(rootPath: string) {
    this.rootPath = rootPath || ''
    this.db = {
      get: async (filepath: string) => {
        return map[filepath]
      },
      put: async (filepath: string, content: object) => {
        map[filepath] = content
        await this.print()
      },
    }
  }
  public async print() {
    await fs.outputFile(
      '.tina/__generated__/map.json',
      JSON.stringify(map, null, 2)
    )
  }
  public async clear() {
    map = {}
  }

  public async glob(pattern: string) {
    return Object.keys(map).filter((key) => {
      if (key.startsWith(pattern)) {
        return true
      } else {
        return false
      }
    })
  }
  public async get(filepath: string) {
    const content = await this.db.get(filepath)
    return content
  }
  public async put(filepath: string, data: object) {
    await this.db.put(filepath, data)
  }
}
