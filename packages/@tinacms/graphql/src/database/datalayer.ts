/**

*/

import { JSONPath } from 'jsonpath-plus'
import {
  BatchOp,
  INDEX_KEY_FIELD_SEPARATOR,
  Level,
  SUBLEVEL_OPTIONS,
} from './level'

export enum OP {
  EQ = 'eq',
  GT = 'gt',
  LT = 'lt',
  GTE = 'gte',
  LTE = 'lte',
  STARTS_WITH = 'startsWith',
  IN = 'in',
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
export type IndexDefinition = {
  fields: {
    name: string
    type?: string
    pad?: PadDefinition
  }[]
}

export type PadDefinition = {
  fillString: string
  maxLength: number
}

export type FilterOperand = string | number | boolean | string[] | number[]
export type FilterCondition = {
  filterExpression: Record<string, FilterOperand>
  filterPath: string
}
type StringEscaper = <T extends string | string[]>(input: T) => T

export const DEFAULT_COLLECTION_SORT_KEY = '__filepath__'
export const DEFAULT_NUMERIC_LPAD = 4

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

const getFilterOperator = (
  expression: Record<string, FilterOperand>,
  operand: string
) => {
  return (expression[operand] || expression[operand] === 0) && operand
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

const makeKeyForField = <T extends object>(
  definition: IndexDefinition,
  data: T,
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

export const coerceFilterChainOperands = (
  filterChain: (BinaryFilter | TernaryFilter)[],
  escapeString: StringEscaper = stringEscaper
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
              escapeString(filter.rightOperand as string | string[]),
              filter.pad
            ),
            leftOperand: applyPadding(
              escapeString(
                (filter as TernaryFilter).leftOperand as string | string[]
              ),
              filter.pad
            ),
          })
        } else {
          result.push({
            ...filter,
            rightOperand: applyPadding(
              escapeString(filter.rightOperand as string | string[]),
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

export const makeIndexOpsForDocument = <T extends object>(
  filepath: string,
  collection: string | undefined,
  indexDefinitions: IndexDefinition[],
  data: T,
  opType: 'put' | 'del',
  level: Level,
  escapeStr: StringEscaper = stringEscaper
): BatchOp[] => {
  const result: BatchOp[] = []

  if (collection) {
    const collectionSublevel = level.sublevel(collection, SUBLEVEL_OPTIONS)
    for (const [sort, definition] of Object.entries(indexDefinitions)) {
      const indexedValue = makeKeyForField<T>(definition, data, escapeStr)
      const indexSublevel = collectionSublevel.sublevel(sort, SUBLEVEL_OPTIONS)
      if (sort === DEFAULT_COLLECTION_SORT_KEY) {
        result.push({
          type: opType,
          key: filepath,
          sublevel: indexSublevel,
          value: opType === 'put' ? ({} as T) : undefined,
        })
      } else {
        if (indexedValue) {
          result.push({
            type: opType,
            key: `${indexedValue}${INDEX_KEY_FIELD_SEPARATOR}${filepath}`,
            sublevel: indexSublevel,
            value: opType === 'put' ? ({} as T) : undefined,
          })
        }
      }
    }
  }
  return result
}

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
      if (typeof input === 'string') {
        return (input as string).replace(regex, replacement) as T
      } else {
        return input as T
      }
    }
  }
}

export const stringEscaper = makeStringEscaper(
  new RegExp(INDEX_KEY_FIELD_SEPARATOR, 'gm'),
  encodeURIComponent(INDEX_KEY_FIELD_SEPARATOR)
)
