/**

*/

import * as yup from 'yup'
import parseToml from '@iarna/toml/parse-string'
import stringifyToml from '@iarna/toml/stringify'
import yaml from 'js-yaml'
import matter from 'gray-matter'
import {
  Collection,
  CollectionTemplateable,
  normalizePath,
  TinaSchema,
} from '@tinacms/schema-tools'

import { assertShape, lastItem, sequential } from '../util'
import micromatch from 'micromatch'
import { Bridge } from './bridge'
import path from 'path'
import { replaceNameOverrides } from './alias-utils'

export { normalizePath }

const matterEngines = {
  toml: {
    parse: (val) => parseToml(val),
    stringify: (val) => stringifyToml(val),
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
          language: markdownParseConfig?.frontmatterFormat ?? 'yaml',
          engines: matterEngines,
          delimiters: markdownParseConfig?.frontmatterDelimiters ?? '---',
        }
      )
      return ok
    case '.json':
      return JSON.stringify(strippedContent, null, 2)
    case '.yaml':
    case '.yml':
      return yaml.safeDump(strippedContent)
    case '.toml':
      return stringifyToml(strippedContent as any)
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
  try {
    switch (format) {
      case '.markdown':
      case '.mdx':
      case '.md':
        const contentJSON = matter(content || '', {
          language: markdownParseConfig?.frontmatterFormat ?? 'yaml',
          delimiters: markdownParseConfig?.frontmatterDelimiters ?? '---',
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
        return parseToml(content) as T
      case '.yaml':
      case '.yml':
        if (!content) {
          return {} as T
        }
        return yaml.safeLoad(content) as T
    }
  } catch (e) {
    // ensure that parser errors are always logged out
    console.error(e)
    throw e
  }
  throw new Error(`Must specify a valid format, got ${format}`)
}

export type FormatType = 'json' | 'md' | 'mdx' | 'markdown'

export const atob = (b64Encoded: string) => {
  return Buffer.from(b64Encoded, 'base64').toString()
}

export const btoa = (string: string) => {
  return Buffer.from(string).toString('base64')
}

export const scanAllContent = async (
  tinaSchema: TinaSchema,
  bridge: Bridge,
  callback: (
    collection: Collection<true>,
    contentPaths: string[]
  ) => Promise<void>
) => {
  const warnings: string[] = []
  // This map is used to map files to their collections
  const filesSeen = new Map<string, string[]>()
  // This is used to track which files have duplicate collections so we do not have to loop over all files at the end
  const duplicateFiles = new Set<string>()
  await sequential(tinaSchema.getCollections(), async (collection) => {
    const normalPath = normalizePath(collection.path)
    const format = collection.format || 'md'
    // Get all possible paths for this collection
    const documentPaths = await bridge.glob(normalPath, format)

    // filter paths based on match and exclude
    const matches = tinaSchema.getMatches({ collection })
    const filteredPaths =
      matches.length > 0 ? micromatch(documentPaths, matches) : documentPaths

    filteredPaths.forEach((path) => {
      if (filesSeen.has(path)) {
        filesSeen.get(path).push(collection.name)
        duplicateFiles.add(path)
      } else {
        filesSeen.set(path, [collection.name])
      }
    })
    duplicateFiles.forEach((path) => {
      warnings.push(
        `"${path}" Found in multiple collections: ${filesSeen
          .get(path)
          .map((collection) => `"${collection}"`)
          .join(
            ', '
          )}. This can cause unexpected behavior. We recommend updating the \`match\` property of those collections so that each file is in only one collection.\nThis will be an error in the future. See https://tina.io/docs/errors/file-in-mutpliple-collections/\n`
      )
    })

    await callback(collection, filteredPaths)
  })
  return warnings
}

export const scanContentByPaths = async (
  tinaSchema: TinaSchema,
  documentPaths: string[],
  callback: (
    collection: Collection<true> | undefined,
    documentPaths: string[]
  ) => Promise<void>
) => {
  const { pathsByCollection, nonCollectionPaths, collections } =
    await partitionPathsByCollection(tinaSchema, documentPaths)

  for (const collection of Object.keys(pathsByCollection)) {
    await callback(collections[collection], pathsByCollection[collection])
  }
  if (nonCollectionPaths.length) {
    await callback(undefined, nonCollectionPaths)
  }
}

export const partitionPathsByCollection = async (
  tinaSchema: TinaSchema,
  documentPaths: string[]
) => {
  const pathsByCollection: Record<string, string[]> = {}
  const nonCollectionPaths: string[] = []
  const collections: Record<string, Collection<true>> = {}
  for (const documentPath of documentPaths) {
    const collection = await tinaSchema.getCollectionByFullPath(documentPath)
    if (collection) {
      if (!pathsByCollection[collection.name]) {
        pathsByCollection[collection.name] = []
      }
      collections[collection.name] = collection
      pathsByCollection[collection.name].push(documentPath)
    } else {
      nonCollectionPaths.push(documentPath)
    }
  }
  return { pathsByCollection, nonCollectionPaths, collections }
}

/** TODO help needed with name of this function **/
export const transformDocument = <T extends object>(
  filepath: string,
  contentObject: any,
  tinaSchema: TinaSchema
): T => {
  const extension = path.extname(filepath)
  const templateName =
    hasOwnProperty(contentObject, '_template') &&
    typeof contentObject._template === 'string'
      ? contentObject._template
      : undefined

  const { collection, template } = hasOwnProperty(contentObject, '__collection')
    ? {
        collection: tinaSchema.getCollection(
          contentObject['__collection'] as string
        ),
        template: undefined,
      } // folders have no templates
    : tinaSchema.getCollectionAndTemplateByFullPath(filepath, templateName)

  const field = template?.fields.find((field) => {
    if (field.type === 'string' || field.type === 'rich-text') {
      if (field.isBody) {
        return true
      }
    }
    return false
  })

  let data = contentObject
  if ((extension === '.md' || extension === '.mdx') && field) {
    if (hasOwnProperty(contentObject, '$_body')) {
      const { $_body, ...rest } = contentObject
      data = rest
      data[field.name] = $_body as object
    }
  }
  return {
    ...data,
    _collection: collection.name,
    _keepTemplateKey: !!collection.templates,
    _template: template?.namespace ? lastItem(template?.namespace) : undefined,
    _relativePath: filepath
      .replace(collection.path, '')
      .replace(/^\/|\/$/g, ''),
    _id: filepath,
  } as T
}

export function hasOwnProperty<X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y
): obj is X & Record<Y, unknown> {
  return obj.hasOwnProperty(prop)
}

export const getTemplateForFile = (
  templateInfo: CollectionTemplateable,
  data: { [key: string]: unknown }
) => {
  if (templateInfo?.type === 'object') {
    return templateInfo.template
  }
  if (templateInfo?.type === 'union') {
    if (hasOwnProperty(data, '_template')) {
      const template = templateInfo.templates.find(
        (t) => lastItem(t.namespace) === data._template
      )
      if (!template) {
        throw new Error(
          `Unable to find template "${
            data._template
          }". Possible templates are: ${templateInfo.templates
            .map((template) => `"${template.name}"`)
            .join(', ')}.`
        )
      }
      return template
    } else {
      return undefined
    }
  }
  throw new Error(`Unable to determine template`)
}

/** TODO help needed with name of this function **/
export const loadAndParseWithAliases = async (
  bridge: Bridge,
  filepath: string,
  collection?: Collection<true>,
  templateInfo?: CollectionTemplateable
) => {
  const dataString = await bridge.get(normalizePath(filepath))
  const data = parseFile(
    dataString,
    path.extname(filepath),
    (yup) => yup.object({}),
    {
      frontmatterDelimiters: collection?.frontmatterDelimiters,
      frontmatterFormat: collection?.frontmatterFormat,
    }
  )
  const template = getTemplateForFile(templateInfo, data as any)
  if (!template) {
    console.warn(
      `Document: ${filepath} has an ambiguous template, skipping from indexing. See https://tina.io/docs/errors/ambiguous-template/ for more info.`
    )
    return
  }
  return templateInfo ? replaceNameOverrides(template, data) : data
}
