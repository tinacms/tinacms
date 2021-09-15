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
import path from 'path'
import { NAMER } from '../ast-builder'
import { Bridge, FilesystemBridge } from './bridge'
import { lastItem } from '../util'
import { createSchema } from '../schema'
import { MemoryStore } from './store/memory-store'
import { FileSystemStore } from './store/filesystem-store'
import { LevelStore } from './store/level-store'
import type { Store } from './store'

import type { TinaSchema } from '../schema'
import type { TinaCloudSchemaBase, Templateable } from '../types'
import { DocumentNode, GraphQLError } from 'graphql'

type CreateDatabase = { rootPath?: string; bridge?: Bridge; store?: Store }

export const createDatabase = async (config: CreateDatabase) => {
  const rootPath = config.rootPath || ''
  return new Database({
    ...config,
    bridge: config.bridge || new FilesystemBridge(rootPath),
    store: config.store || new MemoryStore(rootPath),
    // store: config.store || new FileSystemStore(rootPath),
    // store: config.store || new LevelStore(rootPath),
  })
}

const SYSTEM_FILES = ['_schema', '_graphql', '_lookup']
const GENERATED_FOLDER = path.join('.tina', '__generated__')

export class Database {
  public bridge: Bridge
  public store: Store
  private accumulator: any[]
  private tinaSchema: TinaSchema | undefined
  private _lookup: { [returnType: string]: LookupMapType } | undefined
  private _graphql: DocumentNode | undefined
  private _tinaSchema: TinaCloudSchemaBase | undefined
  constructor(public config: CreateDatabase) {
    this.bridge = config.bridge
    this.store = config.store
    this.accumulator = []
  }

  public clear = async () => {
    await this.store.clear()
  }

  public get = async <T extends object>(
    filepath: string,
    options?: { useBridge?: boolean }
  ): Promise<T> => {
    if (SYSTEM_FILES.includes(filepath)) {
      try {
        return (await this.bridge.get(
          path.join(GENERATED_FOLDER, `${filepath}.json`)
        )) as T
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
      const contentObject = options?.useBridge
        ? await this.bridge.get(filepath)
        : await this.store.get(filepath)
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
        if (field.type === 'string') {
          if (field.isBody) {
            return true
          }
        }
        return false
      })

      let data = contentObject as { [key: string]: unknown }
      if (extension === '.md' && field) {
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

  public putIndex = async (
    filepath: string,
    contentObject: { id: string; data: object }
  ) => {
    const tinaSchema = await this.getSchema()
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

    this.mapWithFields(
      contentObject.id,
      contentObject.data,
      [collection.name, template.name],
      template,
      this.accumulator
    )
    await Promise.all(
      Object.entries(this.accumulator).map(async ([key, items]) => {
        const uniqueItems = [...new Set(items)]
        this.store.put(`__attribute__${key}`, uniqueItems)
        return true
      })
    )
  }

  private mapWithFields = (
    id: string,
    data: object,
    path: string[],
    template: Templateable,
    accumulator: { [key: string]: string[] }
  ) => {
    Object.entries(data).forEach(([key, value]) => {
      const field = template.fields.find((field) => field.name === key)
      if (!field) {
      } else {
        if (!value) {
          return
        }
        if (['string', 'number', 'boolean'].includes(typeof value)) {
          const key = `${path.join('#')}#${field.name}#${
            typeof value === 'string' ? value?.substr(0, 30) : ''
          }`
          const existingValue = accumulator[key] || []
          accumulator[key] = [...existingValue, id]
          if (field.type === 'reference') {
            const existingReferenceValue =
              accumulator[`reference#${value}`] || []
            accumulator[`reference#${value}`] = [...existingReferenceValue, id]
          }
        } else if (Array.isArray(value)) {
          value.forEach((item) => {
            if (['string', 'number', 'boolean'].includes(typeof item)) {
              const existingValue = accumulator[item] || []
              accumulator[`${path.join('#')}#${field.name}#${item}`] = [
                ...existingValue,
                id,
              ]
              if (field.type === 'reference') {
                const existingReferenceValue =
                  accumulator[`reference#${item}`] || []
                accumulator[`reference#${item}`] = [
                  ...existingReferenceValue,
                  id,
                ]
              }
            } else {
              if (field.type === 'object') {
                const fieldTemplate = field.templates
                  ? field.templates.find((t) => t.name === item._template)
                  : field
                if (!fieldTemplate) {
                  throw new Error(
                    `Expected to find template for item with _template: ${item._template}`
                  )
                }
                const other = field.templates ? [fieldTemplate.name] : []
                this.mapWithFields(
                  id,
                  item,
                  [...path, field.name, ...other],
                  fieldTemplate,
                  accumulator
                )
              }
            }
          })
        } else {
          const fieldTemplate = field.templates
            ? field.templates.find((t) => t.name === value._template)
            : field
          this.mapWithFields(
            id,
            value,
            [...path, field.name],
            fieldTemplate,
            accumulator
          )
          // It's an object
        }
      }
    })

    return accumulator
  }

  public put = async (filepath: string, data: { [key: string]: unknown }) => {
    if (SYSTEM_FILES.includes(filepath)) {
      await this.bridge.put(
        path.join(GENERATED_FOLDER, `${filepath}.json`),
        data
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
        if (field.type === 'string') {
          if (field.isBody) {
            return true
          }
        }
        return false
      })
      let payload: { [key: string]: unknown } = {}
      if (collection.format === 'md' && field) {
        Object.entries(data).forEach(([key, value]) => {
          if (key !== field.name) {
            payload[key] = value
          }
        })
        payload['$_body'] = data[field.name]
      } else {
        payload = data
      }
      await this.store.put(filepath, payload, {
        includeTemplate: templateInfo.type === 'union',
      })
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

  public getDocument = async (
    fullPath: unknown,
    options?: { useBridge: boolean }
  ) => {
    if (typeof fullPath !== 'string') {
      throw new Error(`fullPath must be of type string for getDocument request`)
    }
    const data = await this.get<{
      _collection: string
      _template: string
    }>(fullPath, options)
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

  public getDocumentsForCollection = async (
    collectionName: string,
    options?: { useBridge?: boolean }
  ) => {
    const tinaSchema = await this.getSchema()
    const collection = await tinaSchema.getCollection(collectionName)
    if (options?.useBridge) {
      return this.store.glob(collection.path)
    }
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
}

function hasOwnProperty<X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y
): obj is X & Record<Y, unknown> {
  return obj.hasOwnProperty(prop)
}

type FormatType = 'json' | 'md' | 'markdown' | 'yml' | 'yaml'

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
