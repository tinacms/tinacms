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

import fg from 'fast-glob'
import fs from 'fs-extra'
import path from 'path'
import normalize from 'normalize-path'
import level, { LevelDB } from 'level'

interface Store {
  glob(pattern: string): Promise<string[]>
  get(filepath: string): Promise<object>
  put(
    filepath: string,
    data: object,
    options?: {
      includeTemplate?: boolean
    }
  ): Promise<void>
}

/**
 * This is the bridge from whatever datasource we need for I/O.
 * The basic example here is for the filesystem, one is needed
 * for Github has well.
 */
let map = {}
export class LevelStore implements Store {
  public rootPath: string
  public db: LevelDB<any, any>
  constructor(rootPath: string) {
    this.rootPath = rootPath || ''
    this.db = level(path.join('.tina', 'db'))
    // this.db = {
    //   get: async (filepath) => {
    //     const eh = await fs
    //       .readFileSync(path.join('.tina', 'fsdb', filepath))
    //       .toString()
    //     return eh
    //   },
    //   put: async (filepath, content) => {
    //     await fs.outputFileSync(
    //       path.join('.tina', 'fsdb', filepath),
    //       JSON.stringify(content, null, 2)
    //     )
    //   },
    // }
    // this.db = {
    //   get: async (filepath) => {
    //     return map[filepath]
    //   },
    //   put: async (filepath, content) => {
    //     map[filepath] = content
    //   },
    // }
  }
  public async print() {
    const obj = Object.keys(map)
      .sort()
      .reduce(
        (acc, key) => ({
          ...acc,
          [key]: map[key],
        }),
        {}
      )
    await fs.writeFileSync(
      path.join('.tina', 'map.json'),
      JSON.stringify(obj, null, 2)
    )
  }
  public async clear() {
    map = {}
    await fs.rmdirSync(path.join('.tina', 'fsdb'), { recursive: true })
    await fs.rmdirSync(path.join('.tina', 'db'), { recursive: true })
  }
  // FIXME: we're cheating here by using fg,
  // need a custom function for this to work on the server
  public async glob(pattern: string) {
    const basePath = path.join(this.rootPath, ...pattern.split('/'))
    const items = await fg(
      path.join(basePath, '**', '/*').replace(/\\/g, '/'),
      {
        dot: true,
      }
    )
    const posixRootPath = normalize(this.rootPath)
    return items.map((item) => {
      return item.replace(posixRootPath, '').replace(/^\/|\/$/g, '')
    })
  }
  public async get(filepath: string) {
    const content = await this.db.get(filepath)
    return JSON.parse(content)
    // return content
  }
  public async put(filepath: string, data: object) {
    await this.db.put(filepath, data, { valueEncoding: 'json' })
  }
}
