export type PostMessage = {
  type: 'open' | 'close' | 'isEditMode'
  id: string
  data: object
}

export type Payload = {
  id: string
  query: string
  variables: object
  data: object
}

export type SystemInfo = {
  breadcrumbs: string[]
  basename: string
  filename: string
  path: string
  extension: string
  relativePath: string
  title?: string
  template: string
  __typename: string
  collection: {
    name: string
    slug: string
    label: string
    path: string
    format: string
    matches?: string
    templates?: object
    fields?: object
    __typename: string
  }
}

export type Document = {
  _values: Record<string, unknown>
  _sys: SystemInfo
}

export type ResolvedDocument = {
  _values: Record<string, unknown>
  _sys: SystemInfo
  _internalValues: Record<string, unknown>
  _internalSys: SystemInfo
}
