// This type is used in collectionFilter for reference field, it represent the datatype of the field in the referenced collection that will be used to do the filter
// It is extendable in case we need to support more types for the reference selection filter (e.g. boolean)
export type FilterValue = string[] | string
export type CollectionFilters =
  | Record<string, FilterValue>
  | (() => Record<string, FilterValue>)

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
