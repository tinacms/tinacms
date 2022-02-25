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

import type {BinaryFilter, QueryParams, Store, TernaryFilter} from './index'
import {OP} from './index'
import path from 'path'
import {atob, btoa, sequential} from '../../util'
import level, {LevelDB} from 'level'
import levelup from 'levelup'
import memdown from 'memdown'
import encode from 'encoding-down'
import {IndexAttributes} from '.'

type scalar = string | number | boolean

export class LevelStore implements Store {
  public rootPath
  public db: LevelDB
  public indexes: Record<string,{ db: LevelDB, attributes: IndexAttributes }>
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
    this.indexes = {}
  }

  private makeFilter({ filter,
                       rightOperand,
                       dataType
                     }: {
    filter?: BinaryFilter | TernaryFilter,
    rightOperand: scalar
    dataType: string
  }): (value: string) => boolean {
    return (value: string) => {
      if ((filter as TernaryFilter).leftOperand) {
        // TODO
      } else {
        let leftValue: scalar
        if (dataType === 'string') {
          leftValue = value
        } else if (dataType === 'number' || dataType === 'datetime') {
          leftValue = Number(value)
        } else if (dataType === 'boolean') {
          leftValue = value === 'true' || value === '1'
        }

        const { operator } = filter
        switch(operator) {
          case OP.EQ:
            return (leftValue === rightOperand)
          case OP.GT:
            return (leftValue > rightOperand)
          case OP.LT:
            return (leftValue < rightOperand)
          case OP.GTE:
            return (leftValue >= rightOperand)
          case OP.LTE:
            return (leftValue <= rightOperand)
          case OP.BEGINS_WITH:
            return (leftValue as string).startsWith(rightOperand as string)
            break
          default:
            throw new Error(`unexpected operator ${operator}`)
        }
      }
    }
  }

  public async query(queryParams: QueryParams, hydrator) {
    let { first, after, last, before, index } = queryParams
    const query: { gt?: string, lt?: string, reverse?: boolean } = {}
    let limit = 10 // default

    if (first) {
      limit = first
    } else if (last) {
      limit = last
    }

    if (after) {
      query.gt = atob(after)
    } else if (before) {
      query.lt = atob(before)
    }

    if (last && !before) {
      query.reverse = true
    }

    // TODO
    // - allow case insensitivity?
    // - how do we handle exists operator in dynamo?

    const { attributes, db } = this.indexes[index]

    let edges: { key: string, value: string }[] = []
    let startKey: string = ""
    let endKey: string = ""
    let hasPreviousPage = false
    let hasNextPage = false
    const propertyDescriptor = attributes.properties[0] // TODO handle multi-column filters

    const filter: BinaryFilter | TernaryFilter = queryParams.filter
    let rightValue: scalar
    let valueRegex = new RegExp(`^${attributes.namespace}:(.+)##.+`)
    if (filter) {
      const { rightOperand } = filter
      if (propertyDescriptor.type === 'string' || propertyDescriptor.type === 'boolean') {
        rightValue = rightOperand
      } else if (propertyDescriptor.type === 'number') {
        rightValue = Number(rightOperand)
      } else if (propertyDescriptor.type === 'datetime') {
        rightValue = new Date(rightOperand).getTime()
      }
    }

    const itemFilter = queryParams.filter ? this.makeFilter({
      dataType: propertyDescriptor.type,
      filter: queryParams.filter,
      rightOperand: rightValue
    }) : () => true

    await new Promise<void>((resolve, reject) => {
      db.createReadStream(query).on('data', function(data) {
        try {
          if (edges.length >= limit) {
            if (last) {
              hasPreviousPage = true
            } else {
              hasNextPage = true
            }

            this.destroy('limit') //exit by calling destroy with a specific error
          } else {
            const matcher = valueRegex.exec(data.key)
            if (!matcher || !itemFilter(matcher[1])) {
              return
            }

            startKey = startKey || data.key || ""
            endKey = data.key || ""
            edges = [...edges, { key: data.key, value: data.value.pop() }]
          }
        } catch (err) {
          reject(err)
        }
      })
      .on('error', (message) => {
        if (message === 'limit') {
          resolve()
        } else {
          reject(message)
        }
      })
      .on('end', function () {
        resolve()
      })
    })

    return {
      edges: await sequential(edges, async (edge) => {
        const node = await hydrator(edge.value)
        return {
          node,
          cursor: btoa(edge.key)
        }
      }),
      pageInfo: {
        hasPreviousPage,
        hasNextPage,
        startCursor: btoa(startKey),
        endCursor: btoa(endKey)
      }
    }
  }

  private initIndexes(indexAttributes: Record<string,IndexAttributes>) {
    for (let name of Object.keys(indexAttributes)) {
      if (!this.indexes[name]) {
        this.indexes[name] = { db: this.useMemory ? levelup(encode(memdown(), { valueEncoding: 'json' })) : level(path.join(this.rootPath, `.tina/__generated__/db.index_${name}`), {
          valueEncoding: 'json',
        }), attributes: indexAttributes[name] }
      }
    }
  }

  public async seed(filepath: string, data: object, options?: { indexAttributes?: Record<string,IndexAttributes> }) {
    if (options?.indexAttributes) {
      this.initIndexes(options?.indexAttributes)
    }

    await this.put(filepath, data, { keepTemplateKey: false, ...options })
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
    await Promise.all(
        Object.values(this.indexes).map(
            index => index.db.clear()))
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

  public async put(filepath: string, data: object, options?: { keepTemplateKey: boolean, indexAttributes?: Record<string,IndexAttributes> } ) {
    await this.db.put(filepath, data)

    if (options?.indexAttributes) {
      for (let [name, index] of Object.entries(options.indexAttributes)) {
        const value = index.properties.map(property => {
          if (data[property.field]) {
            if (property.type === 'datetime') {
              // TODO I think these dates are ISO 8601 so I don't think we need to convert to numbers
              return new Date(data[property.field]).getTime()
            } else {
              return String(data[property.field])
            }
          }
          return property.default || ''
        }).join(':')
        // NOTE we append filepath to make entries unique
        await this.indexes[name].db.put(`${index.namespace}:${value}##${filepath}`, [filepath]) // TODO why is the value an array?
      }
    }
  }
}
