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
import path from 'path'
import { sequential } from '../../util'
import { stringifyFile } from '../util'

/**
 * This store is only for tests, it exists so that when we
 * perform a mutation it doesn't get persisted to the filesystem
 */
export class MemoryNoIndexStore implements Store {
  public rootPath
  public db
  private map: object = {}
  constructor(rootPath: string) {
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
  // @ts-ignore this is a no-op so we're violating the return type
  public async query(queryStrings: string[], hydrator): Promise<object[]> {
    throw new Error(`Unable to perform query for MemeoryNoIndex store`)
  }
  public async seed(filepath: string, data: object) {
    await this.put(filepath, data)
  }
  public supportsIndexing() {
    // Technically this is not an indexable store, but we need
    // to get the data in here during the setup. May need a separate
    // concept to indicate that this store shouldn't hold index info
    // but does need data from the "bridge" to get started.
    return true
  }
  public async print() {}
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
