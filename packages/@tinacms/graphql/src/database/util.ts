/**

*/

import * as yup from 'yup'
import toml from '@iarna/toml'
import yaml from 'js-yaml'
import matter from 'gray-matter'
import { normalizePath } from '@tinacms/schema-tools'

import { assertShape } from '../util'

export { normalizePath }

const matterEngines = {
  toml: {
    parse: (val) => toml.parse(val),
    stringify: (val) => toml.stringify(val),
  },
}

export const stringifyFile = (
  content: object,
  format: FormatType | string, // FIXME
  /** For non-polymorphic documents we don't need the template key */
  keepTemplateKey: boolean,
  markdownParseConfig?: {
    frontmatterFormat?: 'toml' | 'yaml' | 'json'
    frontmatterDelimiters?: [string, string] | string
  }
): string => {
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
  const strippedContent = { ...rest, ...extra }
  switch (format) {
    case '.markdown':
    case '.mdx':
    case '.md':
      const ok = matter.stringify(
        typeof $_body === 'undefined' ? '' : `\n${$_body}`,
        strippedContent,
        {
          language: markdownParseConfig?.frontmatterFormat || 'yaml',
          engines: matterEngines,
          delimiters: markdownParseConfig?.frontmatterDelimiters || '---',
        }
      )
      return ok
    case '.json':
      return JSON.stringify(strippedContent, null, 2)
    case '.yaml':
    case '.yml':
      return yaml.safeDump(strippedContent)
    case '.toml':
      return toml.stringify(strippedContent as any)
    default:
      throw new Error(`Must specify a valid format, got ${format}`)
  }
}

export const parseFile = <T extends object>(
  content: string,
  format: FormatType | string, // FIXME
  yupSchema: (args: typeof yup) => yup.ObjectSchema<any>,
  markdownParseConfig?: {
    frontmatterFormat?: 'toml' | 'yaml' | 'json'
    frontmatterDelimiters?: [string, string] | string
  }
): T => {
  switch (format) {
    case '.markdown':
    case '.mdx':
    case '.md':
      const contentJSON = matter(content || '', {
        language: markdownParseConfig?.frontmatterFormat || 'yaml',
        delimiters: markdownParseConfig?.frontmatterDelimiters || '---',
        engines: matterEngines,
      })
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
    case '.toml':
      if (!content) {
        return {} as T
      }
      return toml.parse(content) as T
    case '.yaml':
    case '.yml':
      if (!content) {
        return {} as T
      }
      return yaml.safeLoad(content) as T
    default:
      throw new Error(`Must specify a valid format, got ${format}`)
  }
}

export type FormatType = 'json' | 'md' | 'mdx' | 'markdown'

export const atob = (b64Encoded: string) => {
  return Buffer.from(b64Encoded, 'base64').toString()
}

export const btoa = (string: string) => {
  return Buffer.from(string).toString('base64')
}
