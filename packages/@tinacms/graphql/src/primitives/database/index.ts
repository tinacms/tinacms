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

import path from 'path'
import { GraphQLError } from 'graphql'
import { createSchema } from '../schema'
import { lastItem } from '../util'
import { parseFile, stringifyFile } from './util'
import { sequential } from '../util'

import type { DocumentNode } from 'graphql'
import type { TinaSchema } from '../schema'
import type { TinaCloudSchemaBase } from '../types'
import type { Store } from './store'
import type { Bridge } from './bridge'

type CreateDatabase = { bridge?: Bridge; store?: Store }

export const createDatabase = async (config: CreateDatabase) => {
  return new Database({
    ...config,
    bridge: config.bridge,
    store: config.store,
  })
}
const SYSTEM_FILES = ['_schema', '_graphql', '_lookup']
const GENERATED_FOLDER = path.join('.tina', '__generated__')

export class Database {
  public bridge: Bridge
  public store: Store
  private tinaSchema: TinaSchema | undefined
  private _lookup: { [returnType: string]: LookupMapType } | undefined
  private _graphql: DocumentNode | undefined
  private _tinaSchema: TinaCloudSchemaBase | undefined
  constructor(public config: CreateDatabase) {
    this.bridge = config.bridge
    this.store = config.store
  }

  public get = async <T extends object>(filepath: string): Promise<T> => {
    if (SYSTEM_FILES.includes(filepath)) {
      throw new Error(`Unexpected get for config file ${filepath}`)
    } else {
      const tinaSchema = await this.getSchema()
      const extension = path.extname(filepath)
      const contentObject = await this.store.get(filepath)
      if (!contentObject) {
        throw new GraphQLError(`Unable to find record ${filepath}`)
      }
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
      throw new Error(`Unexpected put for config file ${filepath}`)
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
      const stringData = stringifyFile(
        payload,
        extension,
        templateInfo.type === 'union'
      )
      await this.bridge.put(filepath, stringData)
      await this.store.put(filepath, payload)
    }
    return true
  }

  public getLookup = async (returnType: string): Promise<LookupMapType> => {
    const lookupPath = path.join(GENERATED_FOLDER, `_lookup.json`)
    if (!this._lookup) {
      const _lookup = await this.bridge.get<{
        [returnType: string]: LookupMapType
      }>(lookupPath)
      this._lookup = JSON.parse(_lookup)
    }
    return this._lookup[returnType]
  }
  public getGraphQLSchema = async (): Promise<DocumentNode> => {
    const graphqlPath = path.join(GENERATED_FOLDER, `_graphql.json`)
    if (!this._graphql) {
      const _graphql = await this.bridge.get<DocumentNode>(graphqlPath)
      this._graphql = JSON.parse(_graphql)
    }
    return this._graphql
  }
  public getTinaSchema = async (): Promise<TinaCloudSchemaBase> => {
    const schemaPath = path.join(GENERATED_FOLDER, `_schema.json`)
    if (!this._tinaSchema) {
      const _tinaSchema = await this.bridge.get<TinaCloudSchemaBase>(schemaPath)
      this._tinaSchema = JSON.parse(_tinaSchema)
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

  public documentExists = async (fullpath: unknown) => {
    try {
      // @ts-ignore assert is string
      await this.get(fullpath)
    } catch (e) {
      return false
    }

    return true
  }
  public query = async (queryStrings: string[], hydrator) => {
    return await this.store.query(queryStrings, hydrator)
  }

  public indexData = async ({
    experimentalData,
    graphQLSchema,
    tinaSchema,
  }: {
    experimentalData?: boolean
    graphQLSchema: DocumentNode
    tinaSchema: TinaSchema
  }) => {
    if (this.bridge.supportsBuilding) {
      throw new Error(
        `Schema cannot be built with provided Bridge ${this.bridge.className}`
      )
    }
    const graphqlPath = path.join(GENERATED_FOLDER, `_graphql.json`)
    const schemaPath = path.join(GENERATED_FOLDER, `_schema.json`)
    await this.bridge.putConfig(
      graphqlPath,
      JSON.stringify(graphQLSchema, null, 2)
    )
    // @ts-ignore
    await this.bridge.putConfig(
      schemaPath,
      JSON.stringify(tinaSchema.schema, null, 2)
    )
    if (experimentalData) {
      if (!this.store.supportsIndexing) {
        throw new Error(
          `Schema cannot be indexed with provided Store ${this.store.className}`
        )
      }
      await this.store.seed('_graphql', graphQLSchema)
      await this.store.seed('_schema', tinaSchema.schema)
      await _indexContent(tinaSchema, this)
    }
  }

  public addToLookupMap = async (lookup: LookupMapType) => {
    const lookupPath = path.join(GENERATED_FOLDER, `_lookup.json`)
    let lookupMap
    try {
      lookupMap = JSON.parse(await this.bridge.get(lookupPath))
    } catch (e) {
      lookupMap = {}
    }
    const updatedLookup = {
      ...lookupMap,
      [lookup.type]: lookup,
    }
    await this.bridge.putConfig(
      lookupPath,
      JSON.stringify(updatedLookup, null, 2)
    )
  }
}

function hasOwnProperty<X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y
): obj is X & Record<Y, unknown> {
  return obj.hasOwnProperty(prop)
}

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

const _indexContent = async (tinaSchema: TinaSchema, database: Database) => {
  await sequential(tinaSchema.getCollections(), async (collection) => {
    const documentPaths = await database.bridge.glob(collection.path)
    await sequential(documentPaths, async (documentPath) => {
      const dataString = await database.bridge.get(documentPath)
      const data = parseFile(dataString, path.extname(documentPath), (yup) =>
        yup.object({})
      )
      await database.store.seed(documentPath, data)
      await _indexCollectable({
        record: documentPath,
        //@ts-ignore
        field: collection,
        value: data,
        prefix: `${collection.name}`,
        database,
      })
    })
  })
}

const _indexCollectable = async ({
  field,
  value,
  ...rest
}: {
  record: string
  value: object
  prefix: string
  field: TinaField
  database: Database
}) => {
  let template
  if (field.templates) {
    template = field.templates.find((t) => t.name === value._template)
  } else {
    template = field
  }
  await _indexAttributes({
    record: rest.record,
    data: value,
    prefix: `${rest.prefix}#${template.name}`,
    fields: template.fields,
    database: rest.database,
  })
}

const _indexAttributes = async ({
  data,
  fields,
  ...rest
}: {
  record: string
  data: object
  prefix: string
  fields: TinaField[]
  database: Database
}) => {
  await sequential(fields, async (field) => {
    const value = data[field.name]
    if (!value) {
      return true
    }

    switch (field.type) {
      case 'boolean':
      case 'string':
      case 'number':
      case 'datetime':
        await _indexAttribute({ value, field, ...rest })

        return true

      case 'object':
        if (field.list) {
          await sequential(value, async (item) => {
            await _indexCollectable({ field, value: item, ...rest })
          })
        } else {
          await _indexCollectable({ field, value, ...rest })
        }
        return true
      case 'reference':
        await _indexAttribute({ value, field, ...rest })
        return true
    }
    return true
  })
}

const _indexAttribute = async ({
  record,
  value,
  prefix,
  field,
  database,
}: {
  record: string
  value: string
  prefix: string
  field: TinaField
  database: Database
}) => {
  const stringValue = value.toString().substr(0, 100)
  const fieldName = `__attribute__${prefix}#${field.name}#${stringValue}`
  const existingRecords = (await database.store.get(fieldName)) || []
  // FIXME: only indexing on the first 100 characters, a "startsWith" query will be handy
  // @ts-ignore
  const uniqueItems = [...new Set([...existingRecords, record])]
  await database.store.seed(fieldName, uniqueItems)
}
