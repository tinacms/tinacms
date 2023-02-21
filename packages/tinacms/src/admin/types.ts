/**

*/

export interface Template {
  name: string
  label: string
  fields: any[]
}

export interface DocumentNode {
  node: {
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
  slug: string
  format?: string
  templates?: Template[]
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
}
