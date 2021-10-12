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

import _ from 'lodash'
import * as yup from 'yup'
import matter from 'gray-matter'
import path from 'path'
import { NAMER } from '../ast-builder'
import { Bridge, FilesystemBridge } from './bridge'
import { createSchema } from '../schema'
import { assertShape, lastItem } from '../util'

import type { TinaSchema } from '../schema'
import type { TinaCloudSchemaBase } from '../types'
import { DocumentNode, GraphQLError } from 'graphql'

type CreateDatabase = { rootPath?: string; bridge?: Bridge }

export const createDatabase = async (config: CreateDatabase) => {
  return new Database(config)
}

const SYSTEM_FILES = ['_schema', '_graphql', '_lookup']
const GENERATED_FOLDER = path.join('.tina', '__generated__')

export class Database {
  public bridge: Bridge
  private tinaSchema: TinaSchema | undefined
  private _lookup: { [returnType: string]: LookupMapType } | undefined
  private _graphql: DocumentNode | undefined
  private _tinaSchema: TinaCloudSchemaBase | undefined
  constructor(public config: CreateDatabase) {
    this.bridge = config.bridge || new FilesystemBridge(config.rootPath || '')
  }

  public get = async <T extends object>(filepath: string): Promise<T> => {
    if (SYSTEM_FILES.includes(filepath)) {
      try {
        const dataString = await this.bridge.get(
          path.join(GENERATED_FOLDER, `${filepath}.json`)
        )
        return JSON.parse(dataString)
      } catch (err) {
        /** File Not Found */
        if (err instanceof GraphQLError && err.extensions?.status === 404) {
          throw new GraphQLError(
            `${err.toString()}.  Please confirm this location is correct and contains a '.tina' folder and a valid '.tina/schema.ts'.`
          )
          /** Other Errors */
        } else {
          throw err
        }
      }
    } else {
      const tinaSchema = await this.getSchema()
      const extension = path.extname(filepath)
      const contentString = await this.bridge.get(filepath)
      const contentObject = this.parseFile<{ [key: string]: unknown }>(
        contentString,
        extension,
        (yup) => yup.object({})
      )
      const templateName =
        hasOwnProperty(contentObject, '_template') &&
        typeof contentObject._template === 'string'
          ? contentObject._template
          : undefined
      const { collection, template } =
        await tinaSchema.getCollectionAndTemplateByFullPath(
          filepath,
          templateName
        )
      const field = template.fields.find((field) => {
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
          data[field.name] = $_body
        }
      }
      return {
        ...data,
        _collection: collection.name,
        _template: lastItem(template.namespace),
        _relativePath: filepath
          .replace(collection.path, '')
          .replace(/^\/|\/$/g, ''),
        _id: filepath,
      } as T
    }
  }

  public put = async (filepath: string, data: { [key: string]: unknown }) => {
    if (SYSTEM_FILES.includes(filepath)) {
      await this.bridge.put(
        path.join(GENERATED_FOLDER, `${filepath}.json`),
        JSON.stringify(data, null, 2)
      )
    } else {
      const tinaSchema = await this.getSchema()
      const collection = await tinaSchema.getCollectionByFullPath(filepath)

      const templateInfo = await tinaSchema.getTemplatesForCollectable(
        collection
      )
      let template
      if (templateInfo.type === 'object') {
        template = templateInfo.template
      }
      if (templateInfo.type === 'union') {
        if (hasOwnProperty(data, '_template')) {
          template = templateInfo.templates.find(
            (t) => lastItem(t.namespace) === data._template
          )
        } else {
          throw new Error(
            `Expected _template to be provided for document in an ambiguous collection`
          )
        }
      }
      if (!template) {
        throw new Error(`Unable to determine template`)
      }
      const field = template.fields.find((field) => {
        if (field.type === 'string' || field.type === 'rich-text') {
          if (field.isBody) {
            return true
          }
        }
        return false
      })
      let payload: { [key: string]: unknown } = {}
      if (['md', 'mdx'].includes(collection.format) && field) {
        Object.entries(data).forEach(([key, value]) => {
          if (key !== field.name) {
            payload[key] = value
          }
        })
        payload['$_body'] = data[field.name]
      } else {
        payload = data
      }
      const extension = path.extname(filepath)
      const stringData = this.stringifyFile(
        payload,
        extension,
        templateInfo.type === 'union'
      )
      await this.bridge.put(filepath, stringData)
    }
    return true
  }

  public getLookup = async (returnType: string): Promise<LookupMapType> => {
    if (!this._lookup) {
      const _lookup = await this.get<{ [returnType: string]: LookupMapType }>(
        '_lookup'
      )
      this._lookup = _lookup
    }
    return this._lookup[returnType]
  }
  public getGraphQLSchema = async (): Promise<DocumentNode> => {
    if (!this._graphql) {
      const _graphql = await this.get<DocumentNode>('_graphql')
      this._graphql = _graphql
    }
    return this._graphql
  }
  public getTinaSchema = async (): Promise<TinaCloudSchemaBase> => {
    if (!this._tinaSchema) {
      const _tinaSchema = await this.get<TinaCloudSchemaBase>('_schema')
      this._tinaSchema = _tinaSchema
    }
    return this._tinaSchema
  }

  private getSchema = async () => {
    if (this.tinaSchema) {
      return this.tinaSchema
    }
    const schema = await this.getTinaSchema()
    this.tinaSchema = await createSchema({ schema })
    return this.tinaSchema
  }

  public getDocument = async (fullPath: unknown) => {
    if (typeof fullPath !== 'string') {
      throw new Error(`fullPath must be of type string for getDocument request`)
    }
    const data = await this.get<{
      _collection: string
      _template: string
    }>(fullPath)
    return {
      __typename: NAMER.documentTypeName([data._collection]),
      id: fullPath,
      data,
    }
  }

  public documentExists = async (fullpath: unknown) => {
    try {
      await this.getDocument(fullpath)
    } catch (e) {
      return false
    }

    return true
  }

  public getDocumentsForCollection = async (collectionName: string) => {
    const tinaSchema = await this.getSchema()
    const collection = await tinaSchema.getCollection(collectionName)
    return this.bridge.glob(collection.path)
  }

  public addToLookupMap = async (lookup: LookupMapType) => {
    let lookupMap
    try {
      lookupMap = await this.get('_lookup')
    } catch (e) {
      lookupMap = {}
    }
    await this.put('_lookup', { ...lookupMap, [lookup.type]: lookup })
  }

  private stringifyFile = (
    content: object,
    format: FormatType | string, // FIXME
    /** For non-polymorphic documents we don't need the template key */
    keepTemplateKey: boolean
  ): string => {
    switch (format) {
      case '.markdown':
      case '.mdx':
      case '.md':
        // @ts-ignore
        const { _id, _template, _collection, $_body, ...rest } = content
        const extra: { [key: string]: string } = {}
        if (keepTemplateKey) {
          extra['_template'] = _template
        }
        return matter.stringify(`\n${$_body}` || '\n', { ...rest, ...extra })
      case '.json':
        return JSON.stringify(content, null, 2)
      default:
        throw new Error(`Must specify a valid format, got ${format}`)
    }
  }

  private parseFile = <T extends object>(
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
}

function hasOwnProperty<X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y
): obj is X & Record<Y, unknown> {
  return obj.hasOwnProperty(prop)
}

type FormatType = 'json' | 'md' | 'mdx' | 'markdown'

export type LookupMapType =
  | GlobalDocumentLookup
  | CollectionDocumentLookup
  | MultiCollectionDocumentLookup
  | MultiCollectionDocumentListLookup
  | CollectionDocumentListLookup
  | UnionDataLookup
  | NodeDocument

type NodeDocument = {
  type: string
  resolveType: 'nodeDocument'
}
type GlobalDocumentLookup = {
  type: string
  resolveType: 'globalDocument'
  collection: string
}
type CollectionDocumentLookup = {
  type: string
  resolveType: 'collectionDocument'
  collection: string
}
type MultiCollectionDocumentLookup = {
  type: string
  resolveType: 'multiCollectionDocument'
  createDocument: 'create'
  updateDocument: 'update'
}
type MultiCollectionDocumentListLookup = {
  type: string
  resolveType: 'multiCollectionDocumentList'
  collections: string[]
}
export type CollectionDocumentListLookup = {
  type: string
  resolveType: 'collectionDocumentList'
  collection: string
}
type UnionDataLookup = {
  type: string
  resolveType: 'unionData'
  typeMap: { [templateName: string]: string }
}
