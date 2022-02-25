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

import type {QueryParams, Store} from './index'
import fs from 'fs-extra'
import path from 'path'
import { sequential } from '../../util'

/**
 * This is the bridge from whatever datasource we need for I/O.
 * The basic example here is for the filesystem, one is needed
 * for Github has well.
 */
export class MemoryStore implements Store {
  public rootPath
  public db
  private map: object
  constructor(rootPath: string, object: object = {}) {
    this.map = object
    this.rootPath = rootPath || ''
    this.db = {
      get: async (filepath: string) => {
        return this.map[filepath]
      },
      put: async (filepath: string, content: object) => {
        this.map[filepath] = content
        await this.print()
      },
    }
  }
  public async query(queryParams: QueryParams, hydrator) {
    // const resultSets = await sequential(queryStrings, async (queryString) => {
    //   const res = await this.get(queryString)
    //   return res || []
    // })
    // let items = []
    // if (resultSets.length > 0) {
    //   items = resultSets.reduce((p, c) => p.filter((e) => c.includes(e)))
    // }
    //
    // return sequential(items, async (documentString) => {
    //   return hydrator(documentString)
    // })
    throw new Error('Unable to perform query for memory store')
  }
  public async seed(filepath: string, data: object) {
    await this.put(filepath, data)
  }
  public supportsSeeding() {
    return true
  }
  public supportsIndexing() {
    return true
  }
  public async print() {
    // Uncomment to print
    // await fs.outputFile(
    //   path.join(this.rootPath, '.tina/__generated__/map.json'),
    //   JSON.stringify(this.map, null, 2)
    // )
  }
  public async clear() {
    this.map = {}
  }

  public async glob(pattern: string, callback) {
    const strings = Object.keys(this.map).filter((key) => {
      if (key.startsWith(pattern)) {
        return true
      } else {
        return false
      }
    })
    if (callback) {
      return sequential(strings, async (item) => {
        return callback(item)
      })
    } else {
      return strings
    }
  }
  public async get(filepath: string) {
    const content = await this.db.get(filepath)
    return content
  }
  public async put(filepath: string, data: object) {
    await this.db.put(filepath, data)
  }
}
