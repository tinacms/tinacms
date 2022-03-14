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

import type {PutOptions, SeedOptions, Store} from './index'
import {coerceFilterChainOperands, isIndexed, KeyValueQueryParams, makeFilter} from './index'
import path from 'path'
import {sequential} from '../../util'
import level, {LevelDB} from 'level'
import levelup from 'levelup'
import memdown from 'memdown'
import encode from 'encoding-down'
import {IndexDefinition} from '.'

const defaultPrefix = '_ROOT_'
const filepathSortKey = 'filepath'

export class LevelStore implements Store {
  public rootPath
  public db: LevelDB
  public indexes: Record<string, {indexDefinitions: Record<string, IndexDefinition>}> = {}
  public useMemory: boolean
  constructor(rootPath: string, useMemory: boolean = false) {
    this.rootPath = rootPath || ''
    this.useMemory = useMemory
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

  public async query(queryParams: KeyValueQueryParams) {
    let { filterChain, sort = filepathSortKey, collection, ...query } = queryParams

    let { limit: resultLimit } = query

    // modify the query to fetch one more item to correctly set hasNextPage
    if (resultLimit !== -1) {
      query.limit = resultLimit + 1
    }

    const { indexDefinitions } = this.indexes[collection]
    const indexDefinition = sort && indexDefinitions[sort]
    const indexed = indexDefinition && isIndexed(queryParams, indexDefinition)
    const indexPrefix = indexDefinition ? `${collection}:${sort}` : `${defaultPrefix}:`

    // // TODO does this properly handle DESC ?
    if (!query.gt && !query.gte) {
      query.gt = indexPrefix
    }

    if (!query.lt && !query.lte) {
      query.lt = `${indexPrefix}\xFF`
    }

    let edges: { cursor: string, path: string }[] = []
    let startKey: string = ''
    let endKey: string = ''
    let hasPreviousPage = false
    let hasNextPage = false

    const fieldsPattern = indexDefinition?.fields?.length ? `${indexDefinition.fields.map(p => `:(?<${p.name}>.+)`).join('')}:` : ':'
    let valuesRegex = indexDefinition ? new RegExp(`^${indexPrefix}${fieldsPattern}(?<_filepath_>.+)`) : new RegExp(`^${indexPrefix}(?<_filepath_>.+)`)
    const itemFilter = filterChain ? makeFilter({
      filterChain: coerceFilterChainOperands(filterChain),
    }) : () => true

    for await (const [key, value] of (this.db as any).iterator(query)) { //TODO why is typescript unhappy?
      const matcher = valuesRegex.exec(key)
      if (!matcher || (indexDefinition && matcher.length !== (indexDefinition.fields.length + 2))) {
        continue
      }
      const filepath = matcher.groups['_filepath_']
      if (!itemFilter(indexed ? matcher.groups : (indexDefinition ? await this.db.get(`${defaultPrefix}:${filepath}`) : value))) {
        continue
      }

      if (resultLimit !== -1 && edges.length >= resultLimit) {
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
    if (options?.indexDefinitions) {
      if (!options?.collection) {
        throw new Error('collection must be specified with fields or indexDefinitions')
      }

      if (!this.indexes[options?.collection]) {
        this.indexes[options?.collection] = {
          indexDefinitions: options?.indexDefinitions
        }
        // default index definition
        this.indexes[options?.collection]['indexDefinitions'][filepathSortKey] = {
          fields: []
        }
      }
    }

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
      const content = await this.db.get(`${defaultPrefix}:${filepath}`)
      return content
    } catch (e) {
      return undefined
    }
  }

  private parseValueForKey(definition: IndexDefinition, data: object) {
    return definition.fields.map(field => {
      if (field.name in data) {
        if (field.type === 'datetime') {
          // TODO I think these dates are ISO 8601 so I don't think we need to convert to numbers
          return new Date(data[field.name]).getTime()
        } else {
          return String(data[field.name])
        }
      }
      return [field.default || '']
    }).join(':')
  }

  public async close() {
    await this.db.close()
  }

  public async put(filepath: string, data: object, options?: PutOptions ) {
    let existingData
    try {
      existingData = !options.seed ? await this.db.get(`${defaultPrefix}:${filepath}`, data) : null
    } catch (err) {
      if (!err.notFound) {
        throw err
      }
    }
    await this.db.put(`${defaultPrefix}:${filepath}`, data)

    if (options?.indexDefinitions) {
      for (let [sort, definition] of Object.entries(options.indexDefinitions)) {
        const indexedValue = this.parseValueForKey(definition, data)
        let existingIndexedValue = existingData ? this.parseValueForKey(definition, existingData) : null

        let indexKey
        let existingIndexKey = null
        if (sort === filepathSortKey) {
          indexKey = `${options.collection}:${sort}:${filepath}`
          existingIndexKey = indexKey
        } else {
          indexKey = `${options.collection}:${sort}:${indexedValue}:${filepath}`
          existingIndexKey = `${options.collection}:${sort}:${existingIndexedValue}:${filepath}`
        }

        if (indexKey != existingIndexKey) {
          await this.db.del(existingIndexKey)
        }
        await this.db.put(indexKey, '')
      }
    }
  }
}
