export type FilterValue = string[] | string // extend this type if needed
export type CollectionFilters = Record<string, Record<string, FilterValue>>

//Currently only support eq for filter, this function will loop thorugh the record and build the filter query
export const filterQueryBuilder = (
  fieldFilterConfig: Record<string, FilterValue>,
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
