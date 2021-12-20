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
import path from 'path'
import { sequential } from '../../util'
import level, { LevelDB } from 'level'
import levelup from 'levelup'
import memdown from 'memdown'
import encode from 'encoding-down'

export class LevelStore implements Store {
  public rootPath
  public db: LevelDB
  constructor(rootPath: string, useMemory: boolean = false) {
    this.rootPath = rootPath || ''
    if (useMemory) {
      const db = levelup(encode(memdown(), { valueEncoding: 'json' }))
      this.db = db
    } else {
      const db = level(path.join(rootPath, '.tina/__generated__/db'), {
        valueEncoding: 'json',
      })
      this.db = db
    }
  }
  public async query(queryStrings: string[], hydrator) {
    const resultSets = await sequential(queryStrings, async (queryString) => {
      let strings: string[] = []
      const p = new Promise((resolve, reject) => {
        this.db
          .createReadStream({
            gte: queryString,
            lte: queryString + '\xFF', // stop at the last key with the prefix
          })
          .on('data', (data) => {
            strings = [...strings, ...data.value]
          })
          .on('error', (message) => {
            reject(message)
          })
          .on('end', function () {
            // @ts-ignore Expected 1 arguments, but got 0. Did you forget to include 'void' in your type argument to 'Promise'?
            resolve()
          })
      })
      await p
      return strings || []
    })
    let items = []
    if (resultSets.length > 0) {
      items = resultSets.reduce((p, c) => p.filter((e) => c.includes(e)))
    }

    return sequential(items, async (documentString) => {
      return hydrator(documentString)
    })
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
  // public async delete(filepath: string) {
  //   await this.db.del(filepath)
  // }
  public async print() {
    this.db
      .createReadStream()
      .on('data', function (data) {
        console.log(data.key, '=', data.value)
      })
      .on('error', function (err) {
        console.log('Oh my!', err)
      })
      .on('close', function () {
        console.log('Stream closed')
      })
      .on('end', function () {
        console.log('Stream ended')
      })
  }
  public async open() {
    await this.db.open()
  }
  public async clear() {
    await this.db.clear()
  }

  public async glob(pattern: string, callback) {
    const strings: string[] = []
    const p = new Promise((resolve, reject) => {
      this.db
        .createKeyStream({
          gte: pattern,
          lte: pattern + '\xFF', // stop at the last key with the prefix
        })
        .on('data', (data) => {
          strings.push(data)
        })
        .on('error', (message) => {
          reject(message)
        })
        .on('end', function () {
          // @ts-ignore Expected 1 arguments, but got 0. Did you forget to include 'void' in your type argument to 'Promise'?
          resolve()
        })
    })
    await p
    if (callback) {
      return sequential(strings, async (item) => {
        return callback(item)
      })
    } else {
      return strings
    }
  }
  public async get(filepath: string) {
    try {
      const content = await this.db.get(filepath)
      return content
    } catch (e) {
      return undefined
    }
  }
  public async put(filepath: string, data: object) {
    await this.db.put(filepath, data)
  }
}
