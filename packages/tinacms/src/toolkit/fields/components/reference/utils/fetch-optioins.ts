export const mockFilters: FilterRecord = {
  author: {
    name: 'Napolean',
  },
  post: {
    title: 'hello world',
  },
}

export type FilterValue = string // extend this type if needed for now filter value is only string
export type FilterRecord = Record<string, Record<string, FilterValue>>

//TODO: only support eq filter
export const buildFilter = (
  filter: Record<string, FilterValue>,
  collection: string
) => {
  return {
    [collection]: Object.entries(filter).reduce((acc, [key, value]) => {
      acc[key] = { eq: value }
      return acc
    }, {} as Record<string, Record<string, FilterValue>>),
  }
}
