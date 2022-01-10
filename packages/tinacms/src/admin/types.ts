export interface Template {
  name: string
  label: string
  fields: any[]
}

export interface DocumentNode {
  node: {
    sys: {
      template: string
      breadcrumbs: string[]
      path: string
      basename: string
      relativePath: string
      filename: string
      extension: string
    }
  }
}

export interface DocumentForm {
  form: {
    label: string
    name: string
    fields: Object[]
    mutationInfo: {
      path: string[]
      string: string
      includeCollection: boolean
      includeTemplate: boolean
    }
  }
  values: Object
}

export interface DocumentSys {
  sys: {
    template: string
    breadcrumbs: string[]
    path: string
    basename: string
    relativePath: string
    filename: string
    extension: string
  }
}

export interface Collection {
  label: string
  name: string
  format?: string
  templates?: Template[]
  documents?: {
    totalCount?: number
    edges?: DocumentNode[]
  }
}

export interface GetDocumentFields {
  [collectionName: string]: {
    collection: Object
    templates?: Object[]
    fields?: Object[]
  }
}
