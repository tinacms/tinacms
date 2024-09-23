export type FilterValue = string[] | string // extend this type if needed
export type CollectionFilters =
  | Record<string, FilterValue>
  | (() => Record<string, FilterValue>)

//Currently only support eq for filter, this function will loop thorugh the record and build the filter query
export const filterQueryBuilder = (
  fieldFilterConfig: FilterValue,
  collection: string
) => {
  return {
    [collection]: Object.entries(fieldFilterConfig).reduce(
      (acc, [key, value]) => {
        acc[key] = { in: value }
        return acc
      },
      {} as Record<string, Record<string, FilterValue>>
    ),
  }
}
