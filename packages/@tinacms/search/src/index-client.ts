export type { SearchClient } from './types'

export const optionsToSearchIndexOptions = (options?: {
  limit?: number
  cursor?: string
}) => {
  const opt = {}
  if (options?.limit) {
    opt['PAGE'] = {
      SIZE: options.limit,
      NUMBER: options?.cursor ? parseInt(options.cursor) : 0,
    }
  }
  return opt
}

export const parseSearchIndexResponse = (
  data: any,
  options?: {
    limit?: number
    cursor?: string
  }
) => {
  const results = data['RESULT']
  const total = data['RESULT_LENGTH']
  if (options?.cursor && options?.limit) {
    const prevCursor =
      options.cursor === '0' ? null : (parseInt(options.cursor) - 1).toString()
    const nextCursor =
      total <= (parseInt(options.cursor) + 1) * options.limit
        ? null
        : (parseInt(options.cursor) + 1).toString()
    return {
      results,
      total,
      prevCursor,
      nextCursor,
    }
  } else if (!options?.cursor && options?.limit) {
    const prevCursor = null
    const nextCursor = total <= options.limit ? null : '1'
    return {
      results,
      total,
      prevCursor,
      nextCursor,
    }
  } else {
    return {
      results,
      total,
      prevCursor: null,
      nextCursor: null,
    }
  }
}