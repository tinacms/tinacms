// This type is used in collectionFilter for reference field, it represent the datatype of the field in the referenced collection that will be used to do the filter
// This type is extendable if we need to support more type for reference selection filter (e.g. boolean)
export type FilterValue = string[] | string
export type CollectionFilters =
  | Record<string, FilterValue>
  | (() => Record<string, FilterValue>)

//Below function only support "in" for filter, this function will loop through the record and build the filter query
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
