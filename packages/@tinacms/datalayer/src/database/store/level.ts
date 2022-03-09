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

import type {BinaryFilter, PutOptions, QueryParams, Store, TernaryFilter} from './index'
import {OP, isIndexed} from './index'
import path from 'path'
import {atob, btoa, sequential} from '../../util'
import level, {LevelDB} from 'level'
import levelup from 'levelup'
import memdown from 'memdown'
import encode from 'encoding-down'
import {IndexDefinition} from '.'
import {FilterOperand} from '../../index'

const defaultPrefix = '_ROOT_'

export class LevelStore implements Store {
  public rootPath
  public db: LevelDB
  public indexes: Record<string, {fields: {name: string, type: string}[], indexDefinitions: Record<string, IndexDefinition>}> = {}
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

  // TODO move this up so it can be used by other stores
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

        let value: FilterOperand
        if (dataType === 'string' || dataType === 'reference') {
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
            case OP.IN:
              if ((filter.rightOperand as any[]).indexOf(value) === -1) {
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
        if (dataType === 'datetime') {
          if ((filter as TernaryFilter).leftOperand !== undefined) {
            result.push({
              ...filter,
              rightOperand: new Date(filter.rightOperand as string).getTime(),
              leftOperand: new Date((filter as TernaryFilter).leftOperand as string).getTime(),
            })
          } else {
            if (Array.isArray(filter.rightOperand)) {
              (filter.rightOperand as string[]).map(operand => new Date(operand).getTime())
            } else {
              result.push({
                ...filter,
                rightOperand: new Date(filter.rightOperand as string).getTime(),
              })
            }
          }
        } else {
          result.push({ ...filter })
        }
      }
    }

    return result
  }

  public async query(queryParams: QueryParams, hydrator) {
    let { first, after, last, before, sort, collection } = queryParams
    const query: { gt?: string, gte?: string, lt?: string, lte?: string, reverse?: boolean } = {}
    let limit = 10 // default

    if (first) {
      limit = first
    } else if (last) {
      limit = last
    }

    const { fields, indexDefinitions } = this.indexes[collection]
    const indexDefinition = sort && indexDefinitions[sort]
    const indexed = indexDefinition && isIndexed(queryParams, indexDefinition)

    if (after) {
      query.gt = atob(after)
    } else if (before) {
      query.lt = atob(before)
    }

    const indexPrefix = indexDefinition ? `${indexDefinition.collection}:${sort}` : `${defaultPrefix}:`

    // // TODO does this properly handle DESC ?
    if (!query.gt && !query.gte) {
      query.gt = indexPrefix
    }

    if (!query.lt && !query.lte) {
      query.lt = `${indexPrefix}\xFF`
    }

    if (last ) {
      query.reverse = true
    }

    // TODO
    // - allow case insensitivity?
    // - how do we handle exists operator in dynamo?
    // - when using last/before, should we change the hasNextPage/hasPreviousPage and startCursor/endCursor?

    let edges: { cursor: string, path: string }[] = []
    let startKey: string = ''
    let endKey: string = ''
    let hasPreviousPage = false
    let hasNextPage = false

    const dataTypes: Record<string, string> = {}
    for (const field of indexed ? indexDefinition.fields : fields) {
      dataTypes[field.name] = field.type
    }

    const filterChain: (BinaryFilter | TernaryFilter)[] | undefined = this.coerceFilterChainOperands(queryParams.filterChain, dataTypes)
    let valuesRegex = indexDefinition ? new RegExp(`^${indexPrefix}${indexDefinition.fields.map(p => `:(?<${p.name}>.+)`).join('')}:(?<_filepath_>.+)`) : new RegExp(`^${indexPrefix}(?<_filepath_>.+)`)

    const itemFilter = filterChain ? this.makeFilter({
      filterChain,
      dataTypes
    }) : () => true

    const { db } = this

    for await (const [key, value] of (db as any).iterator(query)) { //TODO why is typescript unhappy?
      const matcher = valuesRegex.exec(key)
      if (!matcher || (indexDefinition && matcher.length !== (indexDefinition.fields.length + 2))) {
        continue
      }
      const filepath = matcher.groups['_filepath_']
      if (!itemFilter(indexed ? matcher.groups : (indexDefinition ? await db.get(`${defaultPrefix}:${filepath}`) : value))) {
        continue
      }

      if (limit !== -1 && edges.length >= limit) {
        if (last) {
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
      edges: await sequential(edges, async (edge) => {
        const node = await hydrator(edge.path)
        return {
          node,
          cursor: btoa(edge.cursor)
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

  public async seed(filepath: string, data: object, options?: PutOptions) {
    if (options?.indexDefinitions || options?.fields) {
      if (!options?.collection) {
        throw new Error('collection must be specified with fields or indexDefinitions')
      }

      if (!this.indexes[options?.collection]) {
        this.indexes[options?.collection] = {
          indexDefinitions: options?.indexDefinitions,
          fields: options?.fields
        }
      }
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

  public async put(filepath: string, data: object, options?: PutOptions ) {
    await this.db.put(`${defaultPrefix}:${filepath}`, data)

    if (options?.indexDefinitions) {
      for (let [sort, definition] of Object.entries(options.indexDefinitions)) {
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

        await this.db.put(`${definition.collection}:${sort}:${indexedValue}:${filepath}`, '')
      }
    }
  }
}
