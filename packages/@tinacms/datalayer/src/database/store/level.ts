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
import {IndexDefinition} from '.'
import {ScalarValue} from '../../index'


export class LevelStore implements Store {
  public rootPath
  public db: LevelDB
  public indexes: Record<string,{ db: LevelDB, definition: IndexDefinition }>
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

  private makeFilter({ filterChain,
                       dataTypes
                     }: {
    filterChain?: (BinaryFilter | TernaryFilter)[],
    dataTypes: Record<string, string>
  }): (values: Record<string, string>) => boolean {
    return (values: Record<string, string>) => {
      for (const filter of filterChain) {
        const stringValue = values[filter.field]
        const dataType = dataTypes[filter.field]

        if (!stringValue) {
          return false
        }

        let value: ScalarValue
        if (dataType === 'string') {
          value = stringValue
        } else if (dataType === 'number' || dataType === 'datetime') {
          value = Number(stringValue)
        } else if (dataType === 'boolean') {
          value = stringValue === 'true' || stringValue === '1'
        }

        const { operator } = filter as BinaryFilter
        if (operator) {
          switch(operator) {
            case OP.EQ:
              if (value !== filter.rightOperand) {
                return false
              }
              break
            case OP.GT:
              if (value <= filter.rightOperand) {
                return false
              }
              break
            case OP.LT:
              if (value >= filter.rightOperand) {
                return false
              }
              break
            case OP.GTE:
              if (value < filter.rightOperand) {
                return false
              }
              break
            case OP.LTE:
              if (value > filter.rightOperand) {
                return false
              }
              break
            case OP.BEGINS_WITH:
              if (!(value as string).startsWith(filter.rightOperand as string)) {
                return false
              }
              break
            default:
              throw new Error(`unexpected operator ${operator}`)
          }
        } else {

          const { rightOperator, leftOperator, rightOperand, leftOperand } = filter as TernaryFilter

          if (rightOperator === OP.LTE && value > rightOperand) {
            return false
          } else if (rightOperator === OP.LT && value >= rightOperand) {
            return false
          }

          if (leftOperator === OP.GTE && value < leftOperand) {
              return false
          } else if (leftOperator === OP.GT && value <= leftOperand) {
              return false
          }
        }
      }
      return true
    }
  }

  private coerceFilterChainOperands = (filterChain: (BinaryFilter | TernaryFilter)[], dataTypes: Record<string, string>) => {
    const result: (BinaryFilter | TernaryFilter)[] = []
    if (filterChain && filterChain.length) {
      // convert operands by type
      for (const filter of filterChain) {
        const dataType: string = dataTypes[filter.field]
        if (dataType === 'number') {
          if ((filter as TernaryFilter).leftOperand !== undefined) {
            result.push({
              ...filter,
              rightOperand: Number(filter.rightOperand),
              leftOperand: Number((filter as TernaryFilter).leftOperand),
            })
          } else {
            result.push({
              ...filter,
              rightOperand: Number(filter.rightOperand),
            })
          }
        } else if (dataType === 'datetime') {
          if ((filter as TernaryFilter).leftOperand !== undefined) {
            result.push({
              ...filter,
              rightOperand: new Date(filter.rightOperand as string).getTime(),
              leftOperand: new Date((filter as TernaryFilter).leftOperand as string).getTime(),
            })
          } else {
            result.push({
              ...filter,
              rightOperand: new Date(filter.rightOperand as string).getTime(),
            })
          }
        } else {
          result.push({ ...filter })
        }
      }
    }

    return result
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

    if (last ) {
      query.reverse = true
    }

    // TODO
    // - allow case insensitivity?
    // - how do we handle exists operator in dynamo?
    // - when using last/before, should we change the hasNextPage/hasPreviousPage and startCursor/endCursor?

    const { definition, db } = this.indexes[index]

    let edges: { key: string, value: string }[] = []
    let startKey: string = ""
    let endKey: string = ""
    let hasPreviousPage = false
    let hasNextPage = false

    const dataTypes: Record<string, string> = {}
    for (const field of definition.fields) {
      dataTypes[field.name] = field.type
    }

    const filterChain: (BinaryFilter | TernaryFilter)[] | undefined = this.coerceFilterChainOperands(queryParams.filterChain, dataTypes)
    let valuesRegex = new RegExp(`^${definition.namespace}${definition.fields.map(p => `:(?<${p.name}>.*)`).join('')}`)

    const itemFilter = filterChain ? this.makeFilter({
      filterChain,
      dataTypes
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
            const matcher = valuesRegex.exec(data.key)
            if (!matcher || matcher.length !== (definition.fields.length + 1) || !itemFilter(matcher.groups)) {
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

  private initIndexes(indexDefinitions: Record<string,IndexDefinition>) {
    for (let [name, definition] of Object.entries(indexDefinitions)) {
      if (!this.indexes[name]) {
        this.indexes[name] = { db: this.useMemory ? levelup(encode(memdown(), { valueEncoding: 'json' })) : level(path.join(this.rootPath, `.tina/__generated__/db.index_${name}`), {
          valueEncoding: 'json',
        }), definition }
      }
    }
  }

  public async seed(filepath: string, data: object, options?: { indexDefinitions?: Record<string,IndexDefinition> }) {
    if (options?.indexDefinitions) {
      this.initIndexes(options?.indexDefinitions)
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

  public async put(filepath: string, data: object, options?: { keepTemplateKey: boolean, indexDefinitions?: Record<string,IndexDefinition> } ) {
    await this.db.put(filepath, data)

    if (options?.indexDefinitions) {
      for (let [name, definition] of Object.entries(options.indexDefinitions)) {
        const indexedValue = definition.fields.map(field => {
          if (field.name in data) {
            if (field.type === 'datetime') {
              // TODO I think these dates are ISO 8601 so I don't think we need to convert to numbers
              return new Date(data[field.name]).getTime()
            } else {
              return String(data[field.name])
            }
          }
          return field.default || ''
        }).join(':')

        const key = `${definition.namespace}:${indexedValue}` // This value must be unique for the index
        await new Promise((resolve, reject) => {
          this.indexes[name].db.get(key).then(() => {
            reject(new Error(`Duplicate key error for index '${name}' and key: '${indexedValue}`))
          }).catch(async (err) => {
            if (err.name !== 'NotFoundError') {
              reject(err)
            } else {
              await this.indexes[name].db.put(key, [filepath]) // TODO why is the value an array?
              resolve()
            }
          })
        })
      }
    }
  }
}
