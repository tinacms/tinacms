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

import { FilterOperand } from '../../index'
import { JSONPath } from 'jsonpath-plus'

export const DEFAULT_COLLECTION_SORT_KEY = '__filepath__'
export const INDEX_KEY_FIELD_SEPARATOR = '#'
export const DEFAULT_NUMERIC_LPAD = 4

export enum OP {
  EQ = 'eq',
  GT = 'gt',
  LT = 'lt',
  GTE = 'gte',
  LTE = 'lte',
  STARTS_WITH = 'startsWith',
  IN = 'in',
}

export type PadDefinition = {
  fillString: string
  maxLength: number
}

export type BinaryFilter = {
  pathExpression: string
  rightOperand: FilterOperand
  operator: OP.EQ | OP.GT | OP.LT | OP.GTE | OP.LTE | OP.STARTS_WITH | OP.IN
  type: string
  pad?: PadDefinition
}

export type TernaryFilter = {
  pathExpression: string
  leftOperand: FilterOperand
  rightOperand: FilterOperand
  leftOperator: OP.GTE | OP.GT
  rightOperator: OP.LT | OP.LTE
  type: string
  pad?: PadDefinition
}

/** Options for {@link Store.query} */
export type StoreQueryOptions = {
  /* collection name */
  collection: string
  /* index definitions for specified collection */
  indexDefinitions?: Record<string, IndexDefinition>
  /* filters to apply to the query */
  filterChain: (BinaryFilter | TernaryFilter)[]
  /* sort (either field or index) */
  sort?: string
  /* starting key exclusive */
  gt?: string
  /* starting key inclusive */
  gte?: string
  /* ending key exclusive */
  lt?: string
  /* ending key inclusive */
  lte?: string
  /* if true, returns results in reverse order */
  reverse?: boolean
  /* limits result set */
  limit?: number
}

export type PageInfo = {
  hasPreviousPage: boolean
  hasNextPage: boolean
  startCursor: string
  endCursor: string
}

export type StoreQueryResponse = {
  edges: { cursor: string; path: string }[]
  pageInfo: PageInfo
}

export type IndexDefinition = {
  fields: {
    name: string
    type?: string
    pad?: PadDefinition
  }[]
}

export type SeedOptions = {
  collection?: string
  indexDefinitions?: Record<string, IndexDefinition>
  includeTemplate?: boolean
  keepTemplateKey?: boolean
}

export type PutOptions = SeedOptions & { seed?: boolean }
export type DeleteOptions = SeedOptions & { seed?: boolean }

export interface Store {
  glob(
    pattern: string,
    hydrator?: (fullPath: string) => Promise<object>,
    extension?: string
  ): Promise<string[]>
  get<T extends object>(filepath: string): Promise<T>
  delete(filepath: string, options?: DeleteOptions): Promise<void>
  clear(): void
  close(): void
  open(): void
  /**
   * Executes a query against a collection
   * @param queryOptions - options for the query
   * @returns the results of the query
   */
  query(queryOptions: StoreQueryOptions): Promise<StoreQueryResponse>

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
  seed(filepath: string, data: object, options?: PutOptions): Promise<void>
  supportsSeeding(): boolean
  /**
   * Whether this store supports the ability to index data.
   * Indexing data requires writing arbitrary keys/values to
   * the external service, so is not advisable to use for
   * something like Github, which would write commits to the
   * user's repo.
   */
  supportsIndexing(): boolean
  put(filepath: string, data: object, options?: PutOptions): Promise<void>
}

const inferOperatorFromFilter = (filterOperator: string) => {
  switch (filterOperator) {
    case 'after':
      return OP.GT

    case 'before':
      return OP.LT

    case 'eq':
      return OP.EQ

    case 'startsWith':
      return OP.STARTS_WITH

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
  filterExpression: Record<string, FilterOperand>
  filterPath: string
}

const getFilterOperator = (
  expression: Record<string, FilterOperand>,
  operand: string
) => {
  return (expression[operand] || expression[operand] === 0) && operand
}

export const makeFilterChain = ({
  conditions,
}: {
  conditions: FilterCondition[]
}) => {
  const filterChain: (BinaryFilter | TernaryFilter)[] = []
  if (!conditions) {
    return filterChain
  }

  for (const condition of conditions) {
    const { filterPath, filterExpression } = condition
    const { _type, ...keys } = filterExpression
    const [key1, key2, ...extraKeys] = Object.keys(keys)
    if (extraKeys.length) {
      throw new Error(
        `Unexpected keys: [${extraKeys.join(',')}] in filter expression`
      )
    }

    if (key1 && !key2) {
      filterChain.push({
        pathExpression: filterPath,
        rightOperand: filterExpression[key1],
        operator: inferOperatorFromFilter(key1),
        type: _type as string,
        pad:
          _type === 'number'
            ? { fillString: '0', maxLength: DEFAULT_NUMERIC_LPAD }
            : undefined,
      })
    } else if (key1 && key2) {
      const leftFilterOperator =
        getFilterOperator(filterExpression, 'gt') ||
        getFilterOperator(filterExpression, 'gte') ||
        getFilterOperator(filterExpression, 'after') ||
        undefined

      const rightFilterOperator =
        getFilterOperator(filterExpression, 'lt') ||
        getFilterOperator(filterExpression, 'lte') ||
        getFilterOperator(filterExpression, 'before') ||
        undefined

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
          leftOperator: inferOperatorFromFilter(leftFilterOperator) as
            | OP.GT
            | OP.GTE,
          rightOperator: inferOperatorFromFilter(rightFilterOperator) as
            | OP.LT
            | OP.LTE,
          type: _type as string,
          pad:
            _type === 'number'
              ? { fillString: '0', maxLength: DEFAULT_NUMERIC_LPAD }
              : undefined,
        })
      } else {
        throw new Error(
          `Filter on field '${filterPath}' has invalid combination of conditions: '${key1}, ${key2}'`
        )
      }
    }
  }
  return filterChain
}

export const makeFilter = ({
  filterChain,
}: {
  filterChain?: (BinaryFilter | TernaryFilter)[]
}): ((values: Record<string, object | FilterOperand>) => boolean) => {
  return (values: Record<string, object>) => {
    for (const filter of filterChain) {
      const dataType = filter.type
      const resolvedValues = JSONPath({
        path: filter.pathExpression,
        json: values,
      })
      if (!resolvedValues || !resolvedValues.length) {
        return false
      }

      let operands: FilterOperand[]
      if (dataType === 'string' || dataType === 'reference') {
        operands = resolvedValues
      } else if (dataType === 'number') {
        operands = resolvedValues.map((resolvedValue) => Number(resolvedValue))
      } else if (dataType === 'datetime') {
        operands = resolvedValues.map((resolvedValue) => {
          const coerced = new Date(resolvedValue).getTime()
          return isNaN(coerced) ? Number(resolvedValue) : coerced
        })
      } else if (dataType === 'boolean') {
        operands = resolvedValues.map(
          (resolvedValue) =>
            (typeof resolvedValue === 'boolean' && resolvedValue) ||
            resolvedValue === 'true' ||
            resolvedValue === '1'
        )
      } else {
        throw new Error(`Unexpected datatype ${dataType}`)
      }

      const { operator } = filter as BinaryFilter
      let matches = false
      if (operator) {
        switch (operator) {
          case OP.EQ:
            if (
              operands.findIndex(
                (operand) => operand === filter.rightOperand
              ) >= 0
            ) {
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
          case OP.STARTS_WITH:
            for (const operand of operands) {
              if (
                (operand as string).startsWith(filter.rightOperand as string)
              ) {
                matches = true
                break
              }
            }
            break
          default:
            throw new Error(`unexpected operator ${operator}`)
        }
      } else {
        const { rightOperator, leftOperator, rightOperand, leftOperand } =
          filter as TernaryFilter
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

type StringEscaper = <T extends string | string[]>(input: T) => T

export const makeStringEscaper = (
  regex: RegExp,
  replacement: string
): StringEscaper => {
  return <T extends string | string[]>(input: T): T => {
    if (Array.isArray(input)) {
      return (input as string[]).map((val) =>
        val.replace(regex, replacement)
      ) as T
    } else {
      return (input as string).replace(regex, replacement) as T
    }
  }
}

const applyPadding = (input: any, pad?: PadDefinition) => {
  if (pad) {
    if (Array.isArray(input)) {
      return (input as any[]).map((val) =>
        String(val).padStart(pad.maxLength, pad.fillString)
      )
    } else {
      return String(input).padStart(pad.maxLength, pad.fillString)
    }
  }
  return input
}

export const coerceFilterChainOperands = (
  filterChain: (BinaryFilter | TernaryFilter)[],
  stringEscaper: StringEscaper
) => {
  const result: (BinaryFilter | TernaryFilter)[] = []
  if (filterChain.length) {
    // convert operands by type
    for (const filter of filterChain) {
      const dataType: string = filter.type
      if (dataType === 'datetime') {
        if ((filter as TernaryFilter).leftOperand !== undefined) {
          result.push({
            ...filter,
            rightOperand: new Date(filter.rightOperand as string).getTime(),
            leftOperand: new Date(
              (filter as TernaryFilter).leftOperand as string
            ).getTime(),
          })
        } else {
          if (Array.isArray(filter.rightOperand)) {
            result.push({
              ...filter,
              rightOperand: (filter.rightOperand as string[]).map((operand) =>
                new Date(operand).getTime()
              ),
            })
          } else {
            result.push({
              ...filter,
              rightOperand: new Date(filter.rightOperand as string).getTime(),
            })
          }
        }
      } else if (dataType === 'string') {
        if ((filter as TernaryFilter).leftOperand !== undefined) {
          result.push({
            ...filter,
            rightOperand: applyPadding(
              stringEscaper(filter.rightOperand as string | string[]),
              filter.pad
            ),
            leftOperand: applyPadding(
              stringEscaper(
                (filter as TernaryFilter).leftOperand as string | string[]
              ),
              filter.pad
            ),
          })
        } else {
          result.push({
            ...filter,
            rightOperand: applyPadding(
              stringEscaper(filter.rightOperand as string | string[]),
              filter.pad
            ),
          })
        }
      } else {
        result.push({ ...filter })
      }
    }
  }

  return result
}

export const makeFilterSuffixes = (
  filterChain: (BinaryFilter | TernaryFilter)[],
  index: IndexDefinition
): { left?: string; right?: string } | undefined => {
  if (filterChain && filterChain.length) {
    const indexFields = index.fields.map((field) => field.name)
    const orderedFilterChain = []
    for (const filter of filterChain) {
      const idx = indexFields.indexOf(filter.pathExpression)
      if (idx === -1) {
        // filter chain path expression not present on index
        return
      }

      if (
        (filter as BinaryFilter).operator &&
        (filter as BinaryFilter).operator === OP.IN
      ) {
        // Indexes do not support filtering with IN operator
        return
      }

      orderedFilterChain[idx] = filter
    }

    const baseFragments = []
    let rightSuffix
    let leftSuffix
    let ternaryFilter = false
    if (
      orderedFilterChain[filterChain.length - 1] &&
      !orderedFilterChain[filterChain.length - 1].operator
    ) {
      ternaryFilter = true
    }
    for (let i = 0; i < orderedFilterChain.length; i++) {
      const filter = orderedFilterChain[i]
      if (!filter) {
        // ensure no gaps in the prefix
        return
      }

      if (Number(i) < indexFields.length - 1) {
        if (!(filter as BinaryFilter).operator) {
          // Lower order fields can not use TernaryFilter
          return
        }

        // Lower order fields must use equality operator
        const binaryFilter: BinaryFilter = filter as BinaryFilter
        if (binaryFilter.operator !== OP.EQ) {
          return
        }

        baseFragments.push(
          applyPadding(
            orderedFilterChain[i].rightOperand,
            orderedFilterChain[i].pad
          )
        )
      } else {
        if (ternaryFilter) {
          leftSuffix = applyPadding(
            orderedFilterChain[i].leftOperand,
            orderedFilterChain[i].pad
          )
          rightSuffix = applyPadding(
            orderedFilterChain[i].rightOperand,
            orderedFilterChain[i].pad
          )
        } else {
          const op = orderedFilterChain[i].operator
          const operand = applyPadding(
            orderedFilterChain[i].rightOperand,
            orderedFilterChain[i].pad
          )
          if (op === OP.LT || op === OP.LTE) {
            rightSuffix = operand
          } else if (op === OP.GT || op === OP.GTE) {
            leftSuffix = operand
          } else {
            // STARTS_WITH or EQ
            rightSuffix = operand
            leftSuffix = operand
          }
        }
      }
    }

    return {
      left:
        (leftSuffix &&
          [...baseFragments, leftSuffix].join(INDEX_KEY_FIELD_SEPARATOR)) ||
        undefined,
      right:
        (rightSuffix &&
          [...baseFragments, rightSuffix].join(INDEX_KEY_FIELD_SEPARATOR)) ||
        undefined,
    }
  } else {
    return {}
  }
}

export const makeKeyForField = (
  definition: IndexDefinition,
  data: object,
  stringEscaper: StringEscaper,
  maxStringLength: number = 100
): string | null => {
  const valueParts = []
  for (const field of definition.fields) {
    if (
      field.name in data &&
      data[field.name] !== undefined &&
      data[field.name] !== null
    ) {
      // TODO I think these dates are ISO 8601 so I don't think we need to convert to numbers
      const rawValue = data[field.name]
      const resolvedValue = String(
        field.type === 'datetime'
          ? new Date(rawValue).getTime()
          : field.type === 'string'
          ? stringEscaper(rawValue as string | string[])
          : rawValue
      ).substring(0, maxStringLength)
      valueParts.push(applyPadding(resolvedValue, field.pad))
    } else {
      return null // tell caller that one of the fields is missing and we can't index
    }
  }

  return valueParts.join(INDEX_KEY_FIELD_SEPARATOR)
}
