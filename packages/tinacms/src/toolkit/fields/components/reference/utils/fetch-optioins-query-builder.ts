export type StaticFilterValue = string[] | string // extend this type if needed
export type ValueToFilterFunction = () => string
// export type CollectionFilters = Record<string, Record<string, FilterValue>>

type DynamicFieldFilterValue = StaticFilterValue | ValueToFilterFunction
type FieldFilter = Record<string, DynamicFieldFilterValue>
export type CollectionFilters =
  | Record<string, FieldFilter>
  | (() => Record<string, FieldFilter>)

//Currently only support eq for filter, this function will loop thorugh the record and build the filter query
export const filterQueryBuilder = (
  fieldFilterConfig: FieldFilter,
  collection: string
) => {
  return {
    [collection]: Object.entries(fieldFilterConfig).reduce(
      (acc, [key, value]) => {
        const filterValue = typeof value === 'function' ? value() : value

        acc[key] = { in: filterValue }
        return acc
      },
      {} as Record<string, Record<string, StaticFilterValue>>
    ),
  }
}
