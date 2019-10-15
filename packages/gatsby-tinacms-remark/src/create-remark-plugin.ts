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
import { CMS, Field } from '@tinacms/core'
import { AddContentPlugin } from 'tinacms'

type MaybePromise<T> = Promise<T> | T

interface CreateRemarkButtonOptions<FormShape, FrontmatterShape> {
  label: string
  fields: Field[]
  filename(form: FormShape): MaybePromise<string>
  frontmatter?(form: FormShape): MaybePromise<FrontmatterShape>
  body?(form: FormShape): MaybePromise<string>
}

const MISSING_FILENAME_MESSAGE =
  'createRemarkButton must be given `filename(form): string`'
const MISSING_FIELDS_MESSAGE =
  'createRemarkButton must be given `fields: Field[]` with at least 1 item'

export function createRemarkButton<FormShape = any, FrontmatterShape = any>(
  options: CreateRemarkButtonOptions<FormShape, FrontmatterShape>
): AddContentPlugin {
  if (!options.filename) {
    console.error(MISSING_FILENAME_MESSAGE)
    throw new Error(MISSING_FILENAME_MESSAGE)
  }
  if (!options.fields || options.fields.length === 0) {
    console.error(MISSING_FIELDS_MESSAGE)
    throw new Error(MISSING_FIELDS_MESSAGE)
  }
  const formatFilename = options.filename
  const createFrontmatter = options.frontmatter || (() => ({}))
  const createBody = options.body || (() => '')
  return {
    __type: 'content-button',
    name: options.label,
    fields: options.fields,
    onSubmit: async (form: any, cms: CMS) => {
      const filename = await formatFilename(form)
      //@ts-ignore
      const rawFrontmatter = await createFrontmatter(form)
      //@ts-ignore
      const rawMarkdownBody = await createBody(form)

      const fileRelativePath = filename
      cms.api.git!.onChange!({
        fileRelativePath,
        content: toMarkdownString({
          fileRelativePath,
          rawFrontmatter,
          rawMarkdownBody,
        }),
      })
    },
  }
}
