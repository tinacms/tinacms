/**

*/

export interface TemplateResponse {
  name: string
  label?: string | boolean
  fields: any[]
}

export interface DocumentNode {
  node: {
    __typename: string
    name?: string
    path?: string
    _sys: {
      template: string
      breadcrumbs: string[]
      path: string
      basename: string
      relativePath: string
      filename: string
      extension: string
      title?: string
    }
  }
}

export interface DocumentForm {
  _values: Object
}

export interface DocumentSys {
  _sys: {
    template: string
    breadcrumbs: string[]
    path: string
    basename: string
    relativePath: string
    filename: string
    extension: string
  }
}

export interface CollectionResponse {
  label: string
  name: string
  slug?: string
  format?: string
  templates?: TemplateResponse[]
  documents?: {
    totalCount?: number
    pageInfo: {
      hasPreviousPage: boolean
      hasNextPage: boolean
      startCursor?: string
      endCursor?: string
    }
    edges?: DocumentNode[]
  }
  isSingleFile?: boolean
}
