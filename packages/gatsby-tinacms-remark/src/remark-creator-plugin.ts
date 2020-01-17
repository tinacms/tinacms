/**

Copyright 2019 Forestry.io Inc

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

import { toMarkdownString } from './to-markdown'
import { CMS, Field, AddContentPlugin } from 'tinacms'

type MaybePromise<T> = Promise<T> | T

interface AnyField extends Field {
  [key: string]: any
}

interface CreateRemarkButtonOptions<FormShape, FrontmatterShape> {
  label: string
  fields: AnyField[]
  filename(form: FormShape): MaybePromise<string>
  frontmatter?(form: FormShape): MaybePromise<FrontmatterShape>
  body?(form: FormShape): MaybePromise<string>
}

const MISSING_FILENAME_MESSAGE =
  'createRemarkButton must be given `filename(form): string`'
const MISSING_FIELDS_MESSAGE =
  'createRemarkButton must be given `fields: Field[]` with at least 1 item'

/**
 *
 * @deprecated in favour of calling `CreateRemarkPlugin` class directly.
 */
export function createRemarkButton<FormShape = any, FrontmatterShape = any>(
  options: CreateRemarkButtonOptions<FormShape, FrontmatterShape>
): AddContentPlugin<FormShape> {
  return new RemarkCreatorPlugin<FormShape, FrontmatterShape>(options)
}

export class RemarkCreatorPlugin<FormShape = any, FrontmatterShape = any>
  implements AddContentPlugin<FormShape> {
  __type: 'content-creator' = 'content-creator'
  name: AddContentPlugin<FormShape>['name']
  fields: AddContentPlugin<FormShape>['fields']

  // Remark Specific
  filename: (form: FormShape) => MaybePromise<string>
  frontmatter: (form: FormShape) => MaybePromise<FrontmatterShape>
  body: (form: any) => MaybePromise<string>

  constructor(options: CreateRemarkButtonOptions<FormShape, FrontmatterShape>) {
    if (!options.filename) {
      console.error(MISSING_FILENAME_MESSAGE)
      throw new Error(MISSING_FILENAME_MESSAGE)
    }

    if (!options.fields || options.fields.length === 0) {
      console.error(MISSING_FIELDS_MESSAGE)
      throw new Error(MISSING_FIELDS_MESSAGE)
    }

    this.name = options.label
    this.fields = options.fields
    this.filename = options.filename
    this.frontmatter = options.frontmatter || (() => ({} as FrontmatterShape))
    this.body = options.body || (() => '')
  }

  async onSubmit(form: FormShape, cms: CMS) {
    const fileRelativePath = await this.filename(form)
    const rawFrontmatter = await this.frontmatter(form)
    const rawMarkdownBody = await this.body(form)

    cms.api.git!.onChange!({
      fileRelativePath,
      content: toMarkdownString({
        fileRelativePath,
        rawFrontmatter,
        rawMarkdownBody,
      }),
    })
  }
}
