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

import type { Field, TinaField } from './fields'

export type DirectorySection = {
  type: 'directory'
  label: string
  /** An alias for "name", spaces or dashes (-) are not permitted  */
  slug: string
  path: string
  format: 'json' | 'md'
  create: 'documents' | 'all'
  match: string
  new_doc_ext: string
  /** The identifier of the collection, spaces or dashes (-) are not permitted  */
  name: string
  templates: string[]
}

export type HeadingSection = {
  type: 'heading'
  label: string
  name: string
  slug: string
}

export type DocumentSection = {
  type: 'document'
  label: string
  path: string
  name: string
  slug: string
}

interface SectionMap {
  directory: DirectorySection
  heading: HeadingSection
  document: DocumentSection
}

export type Section = SectionMap[keyof SectionMap]

export const byTypeWorks =
  <T extends keyof SectionMap>(type: T) =>
  (section: Section): section is SectionMap[T] =>
    section.type === type

export type Settings = {
  data: { sections: Section[] }
}

export type WithFields = {
  label: string
  fields: Field[]
  __namespace: string
}
/**
 * The data portion of the template file. Currently a template
 * is parsed with gray-matter, which returns a "content" and "data"
 * key. TemplateData is the "data" portion
 * ```yaml
 * label: Some Label
 * hide_body: true
 * fields:
 *   - name: title
 *     label: Title
 *     type: text
 * pages:
 *   - path/to/page.md
 * ```
 */
export type TemplateData = WithFields & {
  name: string
  hide_body?: boolean
  display_field?: string
  pages?: string[]
}

export type TemplateDataWithNoName = WithFields & {
  hide_body?: boolean
  display_field?: string
  pages?: string[]
}

export type TinaTemplateData = {
  label: string
  fields: TinaField[]
}

export type Template = {
  data: TemplateData
}

/**
 * The 'name' field doesn't exist
 * on the template definition, we use
 * the file's basename as it's value
 * after fetching
 */
export type RawTemplate = {
  data: TemplateDataWithNoName
}
