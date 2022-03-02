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

import {ScalarValue} from '../../index'

export enum OP {
  EQ = 'eq',
  GT = 'gt',
  LT = 'lt',
  GTE = 'gte',
  LTE = 'lte',
  BEGINS_WITH = 'begins_with',
}

export type BinaryFilter = {
  field: string
  rightOperand: ScalarValue
  operator:  OP.EQ | OP.GT | OP.LT | OP.GTE | OP.LTE | OP.BEGINS_WITH
}

export type TernaryFilter = {
  field: string
  leftOperand: ScalarValue
  rightOperand: ScalarValue
  leftOperator: OP.GTE | OP.GT
  rightOperator: OP.LT | OP.LTE
}

export type QueryParams = {
  filterChain?: (BinaryFilter | TernaryFilter)[]
  index?: string
  first?: number
  last?: number
  before?: string
  after?: string
}

export type IndexDefinition = {
  namespace: string
  fields: {
    name: string
    default?: ScalarValue
    type?: string
  }[]
}

export interface Store {
  glob(
    pattern: string,
    hydrator?: (fullPath: string) => Promise<object>
  ): Promise<string[]>
  get<T extends object>(filepath: string): Promise<T>
  // delete(filepath: string): Promise<void>
  clear(): void
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
  query(queryParams: QueryParams, hydrator)

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
    options?: {
      includeTemplate?: boolean,
      indexDefinitions?: Record<string,IndexDefinition>
    },
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
  put(filepath: string, data: object, options?: {keepTemplateKey: boolean, indexDefinitions?: Record<string,IndexDefinition>}): Promise<void>
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

    default:
      throw new Error(`unsupported filter condition: '${filterOperator}'`)
  }
}

export const makeFilterChain = ({ filter, index }: {
  filter?: Record<string,object>,
  index: IndexDefinition
}) => {
  let filterChain: (BinaryFilter | TernaryFilter)[] = []
  if (filter) {
    for (const field of index.fields) {
      const fieldFilter = filter[field.name]
      if (fieldFilter) {
        const [key1, key2, ...otherKeys] = Object.keys(fieldFilter)
        if (otherKeys.length) {
          throw new Error(`Filter on field '${field.name}' supports at most two conditions: '${[key1, key2, ...otherKeys].join(', ')}'`)
        }

        if (key1 && key2) {
          const leftFilterOperator = (fieldFilter['gt'] && 'gt') || (fieldFilter['gte'] && 'gte') || (fieldFilter['after'] && 'after') || undefined
          const rightFilterOperator = (fieldFilter['lt'] && 'lt') || (fieldFilter['lte'] && 'lte') || (fieldFilter['before'] && 'before') || undefined
          let leftOperand: ScalarValue
          let rightOperand: ScalarValue
          if (rightFilterOperator && leftFilterOperator) {
            if (key1 === leftFilterOperator) {
              leftOperand = fieldFilter[key1]
              rightOperand = fieldFilter[key2]
            } else {
              rightOperand = fieldFilter[key1]
              leftOperand = fieldFilter[key2]
            }

            filterChain.push({
              field: field.name,
              rightOperand,
              leftOperand,
              leftOperator: inferOperatorFromFilter(leftFilterOperator) as OP.GT | OP.GTE,
              rightOperator: inferOperatorFromFilter(rightFilterOperator) as OP.LT | OP.LTE
            })
          } else {
            throw new Error(`Filter on field '${field.name}' has invalid combination of conditions: '${key1}, ${key2}'`)
          }
        } else if (key1) {
          filterChain.push({
            field: field.name,
            rightOperand: fieldFilter[key1],
            operator: inferOperatorFromFilter(key1)
          })
        }
      }
    }
  }

  return filterChain
}

export const validateQueryParams = (queryParams: QueryParams, indexName: string, index: IndexDefinition) => {
  if (queryParams.filterChain && queryParams.filterChain.length) {
    const [lastFilter] = queryParams.filterChain.slice(-1)
    const maxOrder = index.fields.findIndex(field => lastFilter.field === field.name)
    const indexFields = index.fields.map(field => field.name)
    const referencedFields = index.fields.filter((field, i) => { return i <= maxOrder }).map((field, i) => field.name)

    // First make sure that all the query fields are present in the index
    for (const [i, filter] of Object.entries(queryParams.filterChain)) {
      if (indexFields.indexOf(filter.field) === -1) {
        throw new Error(`invalid filter on index '${indexName}' - received: '${filter.field}', expected one of: [${indexFields.join(', ')}]`)
      }

      // and the order of the filtering makes sense
      if (filter.field !== referencedFields[Number(i)]) {
        throw new Error(`expected filter '${referencedFields[i]}' on index '${indexName}' at position ${i} but found '${filter.field}'`)
      }

      if (Number(i) < maxOrder) {
        // Lower order fields can not use TernaryFilter
        if (!(filter as BinaryFilter).operator) {
          throw new Error(`ternary filter not supported on index '${indexName} for field '${filter.field}`)
        }

        // Lower order fields must use equality operator
        const binaryFilter: BinaryFilter = filter as BinaryFilter
        if (binaryFilter.operator !== OP.EQ) {
          throw new Error(`specified filter operator '${binaryFilter.operator}' only supported for highest order field in index '${indexName}'`)
        }
      }
    }
  }
}