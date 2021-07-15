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

import type { Field } from '../fields'
import type {
  TemplateData,
  DirectorySection,
  TemplateDataWithNoName,
} from '../types'

export type TinaDocument = {
  [key: string]: any
  content?: string
  data: {
    [key: string]: object | string[] | string | object[]
  }
}

export type UpdateArgs = {
  relativePath: string
  collection: string
  params: { _body?: string } & object
}
export type DocumentArgs = {
  relativePath: string
  collection: string
}

export type AddArgs = {
  relativePath: string
  collection: string
  template: string
}
export interface DataSource {
  /**
   * `getData`
   *
   * Returns the parsed content from a specified path
   *
   * ```js
   * // Example
   * {
   *   data: {
   *     title: "Hello, World"
   *   }
   * }
   * ```
   */
  getData: (args: DocumentArgs) => Promise<TinaDocument>
  getDocumentMeta: (args: DocumentArgs) => Promise<{
    basename: string
    extension: string
    filename: string
  }>
  getTemplateForDocument: (args: DocumentArgs) => Promise<TemplateData>
  getAllTemplates: () => Promise<TemplateData[]>
  getTemplates: (slugs: string[]) => Promise<TemplateData[]>
  getTemplate: (slug: string) => Promise<TemplateData>
  /**
   * `getTemplateWithoutName` the name is a synthetic value, so
   * sometimes you don't want it (ex. when writing back to the data source)
   */
  getTemplateWithoutName: (slug: string) => Promise<TemplateDataWithNoName>
  /**
   * `getTemplatesForCollection`
   *
   * Returns the parsed templates for a given section. If no section is provided
   * it returns a flattened array of all possible section templates
   *
   * ```js
   * // Example
   * [
   *   {
   *     label: 'Post',
   *     hide_body: false,
   *     display_field: 'title',
   *     fields: [ {
   *       name: "title",
   *       label: "Title",
   *       type: "textarea",
   *       ...
   *     }]
   *     pages: [ 'posts/1.md' ]
   *   },
   *   ...
   * ]
   * ```
   */
  getTemplatesForCollection: (collection?: string) => Promise<TemplateData[]>
  getDocumentsForCollection: (collection: string) => Promise<string[]>
  getSettingsForCollection: (collection?: string) => Promise<DirectorySection>
  getCollectionsSettings: () => Promise<DirectorySection[]>
  getCollection: (collection: string) => Promise<DirectorySection>
  getCollectionByPath: (path: string) => Promise<DirectorySection>
  addDocument: (args: AddArgs) => Promise<void>
  updateDocument: (param: UpdateArgs) => Promise<void>
}

export type DocumentSummary = {
  _template: string
} & TinaDocument

export type DocumentPartial = {
  _fields: { [key: string]: Field | { [key: string]: Field } }
} & TinaDocument
