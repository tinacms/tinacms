export const mockFilters: FilterRecord = {
  author: {
    name: 'Napolean',
  },
  post: {
    title: 'hello world',
  },
}

export type FilterRecord = Record<string, Record<string, any>>

//TODO: only support eq filter
export const buildFilter = (
  filter: Record<string, any>,
  collection: string
) => {
  return {
    [collection]: Object.entries(filter).reduce((acc, [key, value]) => {
      acc[key] = { eq: value }
      return acc
    }, {} as Record<string, any>),
  }
}
