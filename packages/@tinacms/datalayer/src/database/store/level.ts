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

import type {StoreQueryOptions, StoreQueryResponse, PutOptions, SeedOptions, Store} from './index'
import {coerceFilterChainOperands, makeFilterSuffixes, makeFilter, makeKeyForField, DEFAULT_COLLECTION_SORT_KEY} from './index'
import path from 'path'
import {sequential} from '../../util'
import level, {LevelDB} from 'level'
import levelup from 'levelup'
import memdown from 'memdown'
import encode from 'encoding-down'
import {IndexDefinition} from '.'

const defaultPrefix = '_ROOT_'

export class LevelStore implements Store {
  public rootPath
  public db: LevelDB
  public useMemory: boolean
  constructor(rootPath: string, useMemory: boolean = false) {
    this.rootPath = rootPath || ''
    this.useMemory = useMemory
    if (useMemory) {
      this.db = levelup(encode(memdown(), { valueEncoding: 'json' }))
    } else {
      this.db = level(path.join(rootPath, '.tina/__generated__/db'), {
        valueEncoding: 'json',
      })
    }
  }

  public async query(queryOptions: StoreQueryOptions): Promise<StoreQueryResponse> {
    const { filterChain: rawFilterChain, sort = DEFAULT_COLLECTION_SORT_KEY, collection, indexDefinitions, limit = 10, ...query } = queryOptions

    const filterChain = coerceFilterChainOperands(rawFilterChain)
    const indexDefinition = (sort && indexDefinitions?.[sort]) as IndexDefinition | undefined
    const filterSuffixes = indexDefinition && makeFilterSuffixes(filterChain, indexDefinition)
    const indexPrefix = indexDefinition ? `${collection}:${sort}` : `${defaultPrefix}:`

    if (!query.gt && !query.gte) {
      query.gte = filterSuffixes?.left ? `${indexPrefix}:${filterSuffixes.left}` : indexPrefix
    }

    if (!query.lt && !query.lte) {
      query.lte = filterSuffixes?.right ? `${indexPrefix}:${filterSuffixes.right}\xFF` : `${indexPrefix}\xFF`
    }

    let edges: { cursor: string, path: string }[] = []
    let startKey: string = ''
    let endKey: string = ''
    let hasPreviousPage = false
    let hasNextPage = false

    const fieldsPattern = indexDefinition?.fields?.length ? `${indexDefinition.fields.map(p => `:(?<${p.name}>.+)`).join('')}:` : ':'
    const valuesRegex = indexDefinition ? new RegExp(`^${indexPrefix}${fieldsPattern}(?<_filepath_>.+)`) : new RegExp(`^${indexPrefix}(?<_filepath_>.+)`)
    const itemFilter = makeFilter({ filterChain })

    for await (const [key, value] of (this.db as any).iterator(query)) { //TODO why is typescript unhappy?
      const matcher = valuesRegex.exec(key)
      if (!matcher || (indexDefinition && matcher.length !== (indexDefinition.fields.length + 2))) {
        continue
      }
      const filepath = matcher.groups['_filepath_']
      if (!itemFilter(filterSuffixes ? matcher.groups : (indexDefinition ? await this.db.get(`${defaultPrefix}:${filepath}`) : value))) {
        continue
      }

      if (limit !== -1 && edges.length >= limit) {
        if (query.reverse) {
          hasPreviousPage = true
        } else {
          hasNextPage = true
        }
        break
      }

      startKey = startKey || key || ''
      endKey = key || ''
      edges = [...edges, { cursor: key, path: filepath }]
    }

    return {
      edges,
      pageInfo: {
        hasPreviousPage,
        hasNextPage,
        startCursor: startKey,
        endCursor: endKey
      }
    }
  }

  public async seed(filepath: string, data: object, options?: SeedOptions) {
    await this.put(filepath, data, { keepTemplateKey: false, seed: true, ...options })
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
          gte: `${defaultPrefix}:${pattern}`,
          lte: `${defaultPrefix}:${pattern}\xFF`, // stop at the last key with the prefix
        })
        .on('data', (data) => {
          strings.push(data.split(`${defaultPrefix}:`)[1])
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
      return await this.db.get(`${defaultPrefix}:${filepath}`)
    } catch (e) {
      return undefined
    }
  }

  public async close() {
    await this.db.close()
  }

  public async put(filepath: string, data: object, options?: PutOptions ) {
    let existingData
    try {
      existingData = options && !options.seed ? await this.db.get(`${defaultPrefix}:${filepath}`) : null
    } catch (err) {
      if (!err.notFound) {
        throw err
      }
    }
    await this.db.put(`${defaultPrefix}:${filepath}`, data)

    if (options?.indexDefinitions) {
      for (const [sort, definition] of Object.entries(options.indexDefinitions)) {
        const indexedValue = makeKeyForField(definition, data)
        const existingIndexedValue = existingData ? makeKeyForField(definition, existingData) : null

        let indexKey
        let existingIndexKey = null
        if (sort === DEFAULT_COLLECTION_SORT_KEY) {
          indexKey = `${options.collection}:${sort}:${filepath}`
          existingIndexKey = indexKey
        } else {
          indexKey = indexedValue ? `${options.collection}:${sort}:${indexedValue}:${filepath}` : null
          existingIndexKey = existingIndexedValue ? `${options.collection}:${sort}:${existingIndexedValue}:${filepath}` : null
        }

        if (indexKey) {
          if (existingIndexKey && indexKey != existingIndexKey) {
            await this.db.del(existingIndexKey)
          }
          await this.db.put(indexKey, '')
        }
      }
    }
  }
}
