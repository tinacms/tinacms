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

import {JSONPath} from 'jsonpath-plus'

import {FilterOperand} from '../../index'

export enum OP {
  EQ = 'eq',
  GT = 'gt',
  LT = 'lt',
  GTE = 'gte',
  LTE = 'lte',
  BEGINS_WITH = 'begins_with', // TODO Change to STARTS_WITH
  IN = 'in',
}

export type BinaryFilter = {
  pathExpression: string
  rightOperand: FilterOperand
  operator:  OP.EQ | OP.GT | OP.LT | OP.GTE | OP.LTE | OP.BEGINS_WITH | OP.IN
  type: string
}

export type TernaryFilter = {
  pathExpression: string
  leftOperand: FilterOperand
  rightOperand: FilterOperand
  leftOperator: OP.GTE | OP.GT
  rightOperator: OP.LT | OP.LTE
  type: string
}

export type KeyValueQueryParams = {
  collection?: string,
  filterChain: (BinaryFilter | TernaryFilter)[],
  sort?: string,
  gt?: string,
  gte?: string,
  lt?: string,
  lte?: string,
  reverse?: boolean,
  limit?: number
}

export type QueryParams = {
  filterChain?: (BinaryFilter | TernaryFilter)[]
  collection?: string
  sort?: string
  first?: number
  last?: number
  before?: string
  after?: string
}

export type IndexDefinition = {
  fields: {
    name: string
    default?: string
    type?: string
  }[]
}

export type SeedOptions = {
  collection?: string,
  indexDefinitions?: Record<string,IndexDefinition>,
  includeTemplate?: boolean,
  keepTemplateKey?: boolean,
}

export type PutOptions = SeedOptions & {seed?: boolean}

export interface Store {
  glob(
    pattern: string,
    hydrator?: (fullPath: string) => Promise<object>
  ): Promise<string[]>
  get<T extends object>(filepath: string): Promise<T>
  // delete(filepath: string): Promise<void>
  clear(): void
  close(): void
  open(): void
  /**
   *
   * @param queryStrings
   * Queries are currently structured as prefixed keys where that last portion
   * of the key is the value provided by the query
   * ```graphql
   * {
   *   getPostsList(filter: {
   *     title: {
   *       eq: "Hello, World"
   *     }
   *   }) {
   *      ...
   *   }
   * }
   * ```
   * Would equate to a query string of:
   * ```
   * __attribute__#posts#posts#title#Hello, World
   * ```
   * This can be used by a data store as a secondary index of sorts
   *
   * It's important to note that for now each query string acts as an "AND" clause,
   * meaning the resulting records need to be present in _each_ query string.
   *
   * @param hydrator
   * hydrator is an optional callback, which may be useful depending on the storage mechanism.
   * For example, the in-memory storage only stores the path to its records as its value,
   * but in something like DynamoDB the query strings may be used to look up the full record,
   * meaning there's no need to "hydrate" the return value
   */
  // TODO update documentation
  query(queryParams: KeyValueQueryParams)

  /**
   * In this context, seeding is the act of putting records and indexing data into an ephemeral
   * storage layer for use during the GraphQL runtime. What might seem suprising is that some stores
   * don't support seeding, this is because they're behaving more like a "bridge" (GithubStore and FilesystemStore).
   * Currently they're acting as a way to swap out true data-layer behavior with a backwards-compatible
   * "store". In the future, all stores should be able to query and seed data.
   *
   * At this time it seems that it would never make sense to be able to "query" without "seed"-ing, and
   * there'd be no value in "seeding" without "query"-ing.
   */
  seed(
    filepath: string,
    data: object,
    options?: PutOptions,
  ): Promise<void>
  supportsSeeding(): boolean
  /**
   * Whether this store supports the ability to index data.
   * Indexing data requires writing arbitrary keys/values to
   * the external service, so is not advisable to use for
   * something like Github, which would write commits to the
   * user's repo.
   */
  supportsIndexing(): boolean
  put(
    filepath: string,
    data: object,
    options?: PutOptions
  ): Promise<void>
}

const inferOperatorFromFilter = (filterOperator: string) => {
  switch(filterOperator) {
    case 'after':
      return OP.GT

    case 'before':
      return OP.LT

    case 'eq':
      return OP.EQ

    case 'startsWith':
      return OP.BEGINS_WITH

    case 'lt':
      return OP.LT

    case 'lte':
      return OP.LTE

    case 'gt':
      return OP.GT

    case 'gte':
      return OP.GTE

    case 'in':
      return OP.IN

    default:
      throw new Error(`unsupported filter condition: '${filterOperator}'`)
  }
}

export type FilterCondition = {
  filterExpression: Record<string,FilterOperand>,
  filterPath: string
}

export const makeFilterChain = ({ conditions }: { conditions: FilterCondition[]}) => {
  let filterChain: (BinaryFilter | TernaryFilter)[] = []
  if (!conditions) {
    return filterChain
  }

  for (const condition of conditions) {
    const { filterPath, filterExpression } = condition
    const { _type, ...keys } = filterExpression
    const [key1, key2, ...extraKeys] = Object.keys(keys)
    if (extraKeys.length) {
      throw new Error(`Unexpected keys: [${extraKeys.join(',')}] in filter expression`)
    }

    if (key1 && !key2) {
      filterChain.push({
        pathExpression: filterPath,
        rightOperand: filterExpression[key1],
        operator: inferOperatorFromFilter(key1),
        type: _type as string
      })
    } else if (key1 && key2) {
      const leftFilterOperator = (filterExpression['gt'] && 'gt') || (filterExpression['gte'] && 'gte') || (filterExpression['after'] && 'after') || undefined
      const rightFilterOperator = (filterExpression['lt'] && 'lt') || (filterExpression['lte'] && 'lte') || (filterExpression['before'] && 'before') || undefined
      let leftOperand: FilterOperand
      let rightOperand: FilterOperand
      if (rightFilterOperator && leftFilterOperator) {
        if (key1 === leftFilterOperator) {
          leftOperand = filterExpression[key1]
          rightOperand = filterExpression[key2]
        } else {
          rightOperand = filterExpression[key1]
          leftOperand = filterExpression[key2]
        }

        filterChain.push({
          pathExpression: filterPath,
          rightOperand,
          leftOperand,
          leftOperator: inferOperatorFromFilter(leftFilterOperator) as OP.GT | OP.GTE,
          rightOperator: inferOperatorFromFilter(rightFilterOperator) as OP.LT | OP.LTE,
          type: _type as string
        })
      } else {
        throw new Error(`Filter on field '${filterPath}' has invalid combination of conditions: '${key1}, ${key2}'`)
      }
    }
  }
  return filterChain
}

export const makeFilter = ({ filterChain }: {
  filterChain?: (BinaryFilter | TernaryFilter)[]
}): (values: Record<string, object>) => boolean => {
  return (values: Record<string, object>) => {
    for (const filter of filterChain) {
      const dataType = filter.type
      // TODO how do nested values work with the JSONPath, would we ever have an index with a nested path
      const resolvedValues = JSONPath({path: filter.pathExpression, json: values})
      if (!resolvedValues || !resolvedValues.length) {
        return false
      }

      let operands: FilterOperand[]
      if (dataType === 'string' || dataType === 'reference') {
        operands = resolvedValues
      } else if (dataType === 'number' || dataType === 'datetime') {
        operands = resolvedValues.map(resolvedValue => Number(resolvedValue))
      } else if (dataType === 'boolean') {
        operands = resolvedValues.map(resolvedValue => resolvedValue === 'true' || resolvedValue === '1')
      }

      const { operator } = filter as BinaryFilter
      let matches = false
      if (operator) {
        switch(operator) {
          case OP.EQ:
            if (operands.findIndex(operand => operand === filter.rightOperand) >= 0) {
              matches = true
            }
            break
          case OP.GT:
            for (const operand of operands) {
              if (operand > filter.rightOperand) {
                matches = true
                break
              }
            }
            break
          case OP.LT:
            for (const operand of operands) {
              if (operand < filter.rightOperand) {
                matches = true
                break
              }
            }
            break
          case OP.GTE:
            for (const operand of operands) {
              if (operand >= filter.rightOperand) {
                matches = true
                break
              }
            }
            break
          case OP.LTE:
            for (const operand of operands) {
              if (operand <= filter.rightOperand) {
                matches = true
                break
              }
            }
            break
          case OP.IN:
            for (const operand of operands) {
              if ((filter.rightOperand as any[]).indexOf(operand) >= 0) {
                matches = true
                break
              }
            }
            break
          case OP.BEGINS_WITH:
            for (const operand of operands) {
              if ((operand as string).startsWith(filter.rightOperand as string)) {
                matches = true
                break
              }
            }
            break
          default:
            throw new Error(`unexpected operator ${operator}`)
        }

      } else {
        const { rightOperator, leftOperator, rightOperand, leftOperand } = filter as TernaryFilter
        for (const operand of operands) {
          let rightMatches = false
          let leftMatches = false
          if (rightOperator === OP.LTE && operand <= rightOperand) {
            rightMatches = true
          } else if (rightOperator === OP.LT && operand < rightOperand) {
            rightMatches = true
          }

          if (leftOperator === OP.GTE && operand >= leftOperand) {
            leftMatches = true
          } else if (leftOperator === OP.GT && operand > leftOperand) {
            leftMatches = true
          }

          if (rightMatches && leftMatches) {
            matches = true
            break
          }
        }
      }

      if (!matches) {
        return false
      }
    }
    return true
  }
}

export const coerceFilterChainOperands = (filterChain: (BinaryFilter | TernaryFilter)[]) => {
  const result: (BinaryFilter | TernaryFilter)[] = []
  if (filterChain && filterChain.length) {
    // convert operands by type
    for (const filter of filterChain) {
      const dataType: string = filter.type
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

export const isIndexed = (queryParams: QueryParams, index: IndexDefinition) => {
  if (queryParams.filterChain && queryParams.filterChain.length) {
    const [lastFilter] = queryParams.filterChain.slice(-1)
    const maxOrder = index.fields.findIndex(field => lastFilter.pathExpression === field.name)
    const indexFields = index.fields.map(field => field.name)
    const referencedFields = index.fields.filter((field, i) => { return i <= maxOrder }).map((field, i) => field.name)

    // First make sure that all the query fields are present in the index
    for (const [i, filter] of Object.entries(queryParams.filterChain)) {
      if (indexFields.indexOf(filter.pathExpression) === -1) {
        return false
      }

      // and the order of the filtering makes sense
      if (filter.pathExpression !== referencedFields[Number(i)]) {
        return false
      }

      // Indexes do not support filtering with IN operator
      if ((filter as BinaryFilter).operator && (filter as BinaryFilter).operator === OP.IN) {
        return false
      }

      if (Number(i) < maxOrder) {
        // Lower order fields can not use TernaryFilter
        if (!(filter as BinaryFilter).operator) {
          return false
        }

        // Lower order fields must use equality operator
        const binaryFilter: BinaryFilter = filter as BinaryFilter
        if (binaryFilter.operator !== OP.EQ) {
          return false
        }
      }
    }
  }
  return true
}