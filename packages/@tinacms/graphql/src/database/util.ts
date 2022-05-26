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

import * as yup from 'yup'
import matter from 'gray-matter'
import { assertShape } from '../util'

export const stringifyFile = (
  content: object,
  format: FormatType | string, // FIXME
  /** For non-polymorphic documents we don't need the template key */
  keepTemplateKey: boolean
): string => {
  switch (format) {
    case '.markdown':
    case '.mdx':
    case '.md':
      const {
        _relativePath,
        _keepTemplateKey,
        _id,
        _template,
        _collection,
        $_body,
        ...rest
      } = content as {
        _relativePath: string
        _keepTemplateKey: string
        _id: string
        _template: string
        _collection: string
        $_body: string
      }
      const extra: { [key: string]: string } = {}
      if (keepTemplateKey) {
        extra['_template'] = _template
      }
      const ok = matter.stringify(
        typeof $_body === 'undefined' ? '' : `\n${$_body}`,
        { ...rest, ...extra }
      )
      return ok
    case '.json':
      return JSON.stringify(content, null, 2)
    default:
      throw new Error(`Must specify a valid format, got ${format}`)
  }
}

export const parseFile = <T extends object>(
  content: string,
  format: FormatType | string, // FIXME
  yupSchema: (args: typeof yup) => yup.ObjectSchema<any>
): T => {
  switch (format) {
    case '.markdown':
    case '.mdx':
    case '.md':
      const contentJSON = matter(content || '')
      const markdownData = {
        ...contentJSON.data,
        $_body: contentJSON.content,
      }
      assertShape<T>(markdownData, yupSchema)
      return markdownData
    case '.json':
      if (!content) {
        return {} as T
      }
      return JSON.parse(content)
    default:
      throw new Error(`Must specify a valid format, got ${format}`)
  }
}

export type FormatType = 'json' | 'md' | 'mdx' | 'markdown'

export const normalizePath = (filepath: string) => filepath.replace(/\\/g, '/')
