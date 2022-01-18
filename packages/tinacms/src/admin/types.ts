/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

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
