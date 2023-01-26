/**

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
