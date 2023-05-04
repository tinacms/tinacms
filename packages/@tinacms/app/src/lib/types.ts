export type PostMessage =
  | {
      type: 'open' | 'close' | 'isEditMode'
      id: string
      data: object
    }
  | { type: 'field:selected'; fieldName: string }
  | { type: 'quick-edit'; value: boolean }

export type Payload = {
  id: string
  variables: object
  query: string
  data: object
  expandedQuery?: string
  expandedData?: object
  expandedQueryForResolver?: string
}

export type SystemInfo = {
  breadcrumbs: string[]
  basename: string
  filename: string
  path: string
  extension: string
  relativePath: string
  title?: string | null | undefined
  template: string
  // __typename: string
  collection: {
    name: string
    slug: string
    label: string
    path: string
    format?: string | null | undefined
    matches?: string | null | undefined
    // templates?: object
    // fields?: object
    // __typename: string
  }
}

export type Document = {
  _values: Record<string, unknown>
  _sys: SystemInfo
}

export type ResolvedDocument = {
  _internalValues: Record<string, unknown>
  _internalSys: SystemInfo
}
