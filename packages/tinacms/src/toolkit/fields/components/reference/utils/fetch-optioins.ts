export const mockFilters: CollectionFilters = {
  author: {
    name: 'Napolean',
    description: 'something',
  },
  post: {
    title: 'hello world',
  },
}

export type FilterValue = string // extend this type if needed
export type CollectionFilters = Record<string, Record<string, string>>

//Currently only support eq for filter, this function will loop thorugh the record and build the filter query
export const filterQueryBuilder = (
  fieldFilterConfig: Record<string, FilterValue>,
  collection: string
) => {
  return {
    [collection]: Object.entries(fieldFilterConfig).reduce(
      (acc, [key, value]) => {
        acc[key] = { eq: value }
        return acc
      },
      {} as Record<string, Record<string, FilterValue>>
    ),
  }
}
