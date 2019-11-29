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

import { CMS, Field, AddContentPlugin } from 'tinacms'

type MaybePromise<T> = Promise<T> | T

interface CreateJsonButtonOptions<FormShape, JsonShape> {
  label: string
  fields: Field[]
  filename(form: FormShape): MaybePromise<string>
  data?(form: FormShape): MaybePromise<JsonShape>
}

const MISSING_FILENAME_MESSAGE =
  'createJsonButton must be given `filename(form): string`'

const MISSING_FIELDS_MESSAGE =
  'createJsonButton must be given `fields: Field[]` with at least 1 item'

export class JsonCreatorPlugin<FormShape = any, FrontmatterShape = any>
  implements AddContentPlugin<FormShape> {
  __type: 'content-creator' = 'content-creator'
  name: AddContentPlugin<FormShape>['name']
  fields: AddContentPlugin<FormShape>['fields']

  // Json Specific
  filename: (form: FormShape) => MaybePromise<string>
  data: (form: FormShape) => MaybePromise<FrontmatterShape>

  constructor(options: CreateJsonButtonOptions<FormShape, FrontmatterShape>) {
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
    this.data = options.data || (() => ({} as FrontmatterShape))
  }

  async onSubmit(form: FormShape, cms: CMS) {
    const fileRelativePath = await this.filename(form)
    const content = await this.data(form)

    cms.api.git!.onChange!({
      fileRelativePath,
      content: JSON.stringify(content, null, 2),
    })
  }
}
