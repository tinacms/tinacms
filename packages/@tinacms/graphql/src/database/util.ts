/**

*/

import * as yup from 'yup'
import toml from '@iarna/toml'
import yaml from 'js-yaml'
import matter from 'gray-matter'
import {
  Collection,
  CollectionTemplateable,
  normalizePath,
  TinaField,
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
    parse: (val) => toml.parse(val),
    stringify: (val) => toml.stringify(val),
  },
}

export const stringifyCSV = (collection: Collection<true>, items: any[]) => {
  const lines: string[] = []
  const fields = collection.fields
  const fieldLookup = fields.reduce((acc, field) => {
    acc[field.name] = field
    return acc
  }, {} as { [key: string]: TinaField<true> })
  const headers = fields.map((field) => field.name)
  lines.push(headers.join(','))
  items.forEach((item) => {
    const row = headers.map((header) => {
      const val = item[header]
      if (typeof val === 'undefined') {
        return '""'
      }
      const fieldType = fieldLookup[header].type
      if (fieldType === 'number' || fieldType === 'boolean') {
        return val
      } else {
        return `"${val.replace(/"/g, '\\"')}"`
      }
    })
    lines.push(row.join(','))
  })
  return `${lines.join('\n')}\n`
}

export const stringifyFile = (
  content: object,
  format: FormatType | string, // FIXME
  /** For non-polymorphic documents we don't need the template key */
  keepTemplateKey: boolean,
  collection?: Collection<true>,
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
    case '.csv':
      if (!collection) {
        throw new Error(`Must specify a collection when stringifying CSV files`)
      }
      // return stringifyCSV(collection, strippedContent)
      throw new Error(`CSV stringifying is not supported yet`)
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
      return toml.stringify(strippedContent as any)
    default:
      throw new Error(`Must specify a valid format, got ${format}`)
  }
}

export function parseCSV(content: string, collection: Collection<true>) {
  const fields = collection.fields
  const fieldLookup = fields.reduce((acc, field) => {
    acc[field.name] = field
    return acc
  }, {} as { [key: string]: TinaField<true> })
  const lines = content.split('\n')
  const headers = lines[0].split(',')
  const rows = lines
    .slice(1)
    .map((line) => line.split(','))
    .filter((row) => row.length === headers.length)

  return rows.map((row) => {
    const obj: any = {}
    headers.forEach((header, i) => {
      const field = fields.find((field) => field.name === header)
      if (field) {
        const fieldType = fieldLookup[header].type
        if (fieldType === 'number' || fieldType === 'boolean') {
          obj[header] = row[i]
        } else {
          obj[header] = row[i].slice(1, -1).replace(/\\"/g, '"')
        }
      }
    })
    return obj
  })
}

export const parseFile = <T extends object>(
  content: string,
  format: FormatType | string, // FIXME
  yupSchema: (args: typeof yup) => yup.ObjectSchema<any>,
  collection?: Collection<true>,
  markdownParseConfig?: {
    frontmatterFormat?: 'toml' | 'yaml' | 'json'
    frontmatterDelimiters?: [string, string] | string
  }
): T => {
  try {
    switch (format) {
      case '.csv':
        if (!collection) {
          throw new Error(`Must specify a collection when parsing CSV files`)
        }

        // TODO I don't think we want to allow this
        // return parseCSV(content, collection) as T
        throw new Error(`CSV parsing is not supported yet`)
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
        return toml.parse(content) as T
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

export type FormatType = 'json' | 'md' | 'mdx' | 'markdown' | 'csv'

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

export const bridgeDataLoader =
  ({ bridge, collection }: { bridge: Bridge; collection?: Collection<true> }) =>
  async (fp: string) => {
    const dataString = await bridge.get(normalizePath(fp))
    return parseFile(
      dataString,
      path.extname(fp),
      (yup) => yup.object({}),
      collection,
      {
        frontmatterDelimiters: collection?.frontmatterDelimiters,
        frontmatterFormat: collection?.frontmatterFormat,
      }
    )
  }

export const csvDataLoader = async ({
  bridge,
  collection,
  pathField,
  sourcePath,
}: {
  bridge: Bridge
  collection?: Collection<true>
  pathField: string
  sourcePath: string
}) => {
  const stringCSV = await bridge.get(sourcePath)
  const rows = parseCSV(stringCSV, collection)
  const source = rows.reduce((acc, row) => {
    const key = `${collection.path}/${row[pathField]}.${collection.format}`
    if (!key) {
      throw new Error(`Missing key ${pathField} in row ${row}`)
    }
    acc[key] = row
    // delete acc[key][pathField]
    return acc
  }, {} as Record<string, Record<string, any>>)

  return async (fp: string) => {
    return source[fp]
  }
}

export type DataLoader = (fp: string) => Promise<any>

/** TODO help needed with name of this function **/
export const loadAndParseWithAliases = async (
  dataLoader: DataLoader,
  filepath: string,
  templateInfo?: CollectionTemplateable
) => {
  const data = await dataLoader(filepath)
  const template = getTemplateForFile(templateInfo, data as any)
  if (!template) {
    console.warn(
      `Document: ${filepath} has an ambiguous template, skipping from indexing. See https://tina.io/docs/errors/ambiguous-template/ for more info.`
    )
    return
  }
  return templateInfo ? replaceNameOverrides(template, data) : data
}
