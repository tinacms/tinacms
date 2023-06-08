export type SearchClient = {
  query: (
    query: string,
    options?: {
      cursor?: string
      limit?: number
    }
  ) => Promise<{
    results: any[]
    total: number
    nextCursor: string | null
    prevCursor: string | null
  }>
  put: (docs: any[]) => Promise<any>
  del: (ids: string[]) => Promise<any>
  onStartIndexing?: () => Promise<void>
  onFinishIndexing?: () => Promise<void>
  supportsClientSideIndexing?: () => boolean
}
