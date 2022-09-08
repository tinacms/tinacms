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
import { normalizePath, parseFile, stringifyFile } from './util'
import { sequential } from '../util'
import type {
  BinaryFilter,
  IndexDefinition,
  PageInfo,
  StoreQueryOptions,
  Store,
  TernaryFilter,
} from '@tinacms/datalayer'

import type { DocumentNode } from 'graphql'
import type { TinaSchema } from '../schema'
import type {
  TinaCloudSchemaBase,
  CollectionFieldsWithNamespace,
  CollectionTemplatesWithNamespace,
  TinaFieldInner,
} from '../types'
import type { Bridge } from './bridge'
import {
  atob,
  btoa,
  DEFAULT_COLLECTION_SORT_KEY,
  DEFAULT_NUMERIC_LPAD,
} from '@tinacms/datalayer'
import {
  TinaFetchError,
  TinaGraphQLError,
  TinaQueryError,
} from '../resolver/error'

type IndexStatusEvent = {
  status: 'inprogress' | 'complete' | 'failed'
  error?: Error
}
type IndexStatusCallback = (event: IndexStatusEvent) => Promise<void>

type CreateDatabase = {
  bridge: Bridge
  store: Store
  indexStatusCallback?: IndexStatusCallback
}

export const createDatabase = async (config: CreateDatabase) => {
  return new Database({
    ...config,
    bridge: config.bridge,
    store: config.store,
  })
}
const SYSTEM_FILES = ['_schema', '_graphql', '_lookup']
const GENERATED_FOLDER = path.join('.tina', '__generated__')

/** Options for {@link Database.query} **/
export type QueryOptions = {
  fileExtension?: string
  /* collection name */
  collection: string
  /* filters to apply to the query */
  filterChain?: (BinaryFilter | TernaryFilter)[]
  /* sort (either field or index) */
  sort?: string
  /* limit results to first N items */
  first?: number
  /* limit results to last N items */
  last?: number
  /* specify cursor to start results at */
  after?: string
  /* specify cursor to end results at */
  before?: string
}

const defaultStatusCallback: IndexStatusCallback = () => Promise.resolve()

export class Database {
  public bridge: Bridge
  public store: Store
  public indexStatusCallback: IndexStatusCallback | undefined
  private tinaSchema: TinaSchema | undefined
  private collectionIndexDefinitions:
    | Record<string, Record<string, IndexDefinition>>
    | undefined
  private _lookup: { [returnType: string]: LookupMapType } | undefined
  constructor(public config: CreateDatabase) {
    this.bridge = config.bridge
    this.store = config.store
    this.indexStatusCallback =
      config.indexStatusCallback || defaultStatusCallback
  }

  private collectionForPath = async (
    filepath: string
  ): Promise<
    | CollectionFieldsWithNamespace<true>
    | CollectionTemplatesWithNamespace<true>
    | undefined
  > => {
    const tinaSchema = await this.getSchema()
    const collection = tinaSchema.getCollectionByFullPath(filepath)
    return collection
  }

  private async partitionPathsByCollection(documentPaths: string[]) {
    const pathsByCollection: Record<string, string[]> = {}
    const nonCollectionPaths: string[] = []
    const collections: Record<
      string,
      | CollectionFieldsWithNamespace<true>
      | CollectionTemplatesWithNamespace<true>
    > = {}
    for (const documentPath of documentPaths) {
      const collection = await this.collectionForPath(documentPath)
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

  public get = async <T extends object>(filepath: string): Promise<T> => {
    if (SYSTEM_FILES.includes(filepath)) {
      throw new Error(`Unexpected get for config file ${filepath}`)
    } else {
      const tinaSchema = await this.getSchema()
      const extension = path.extname(filepath)
      const contentObject = await this.store.get(normalizePath(filepath))
      if (!contentObject) {
        throw new GraphQLError(`Unable to find record ${filepath}`)
      }
      const templateName =
        hasOwnProperty(contentObject, '_template') &&
        typeof contentObject._template === 'string'
          ? contentObject._template
          : undefined
      const { collection, template } =
        tinaSchema.getCollectionAndTemplateByFullPath(filepath, templateName)
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
        _keepTemplateKey: !!collection.templates,
        _template: lastItem(template.namespace),
        _relativePath: filepath
          .replace(collection.path, '')
          .replace(/^\/|\/$/g, ''),
        _id: filepath,
      } as T
    }
  }

  public addPendingDocument = async (
    filepath: string,
    data: { [key: string]: unknown }
  ) => {
    const { stringifiedFile, payload, keepTemplateKey } =
      await this.stringifyFile(filepath, data)
    const collection = await this.collectionForPath(filepath)
    let collectionIndexDefinitions
    if (collection) {
      const indexDefinitions = await this.getIndexDefinitions()
      collectionIndexDefinitions = indexDefinitions?.[collection.name]
    }
    if (this.store.supportsSeeding()) {
      await this.bridge.put(normalizePath(filepath), stringifiedFile)
    }
    await this.store.put(normalizePath(filepath), payload, {
      keepTemplateKey,
      collection: collection?.name,
      indexDefinitions: collectionIndexDefinitions,
    })
  }

  public put = async (
    filepath: string,
    data: { [key: string]: unknown },
    collection?: string
  ) => {
    try {
      if (SYSTEM_FILES.includes(filepath)) {
        throw new Error(`Unexpected put for config file ${filepath}`)
      } else {
        let collectionIndexDefinitions
        if (collection) {
          const indexDefinitions = await this.getIndexDefinitions()
          collectionIndexDefinitions = indexDefinitions?.[collection]
        }

        const { stringifiedFile, payload, keepTemplateKey } =
          await this.stringifyFile(filepath, data)
        if (this.store.supportsSeeding()) {
          await this.bridge.put(normalizePath(filepath), stringifiedFile)
        }
        await this.store.put(normalizePath(filepath), payload, {
          keepTemplateKey,
          collection: collection,
          indexDefinitions: collectionIndexDefinitions,
        })
      }
      return true
    } catch (error) {
      throw new TinaFetchError(`Error in PUT for ${filepath}`, {
        originalError: error,
        file: filepath,
        collection: collection,
        stack: error.stack,
      })
    }
  }

  public stringifyFile = async (
    filepath: string,
    data: { [key: string]: unknown }
  ) => {
    if (SYSTEM_FILES.includes(filepath)) {
      throw new Error(`Unexpected put for config file ${filepath}`)
    } else {
      const tinaSchema = await this.getSchema()
      const collection = tinaSchema.getCollectionByFullPath(filepath)

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
      const stringifiedFile = stringifyFile(
        payload,
        extension,
        templateInfo.type === 'union'
      )
      return {
        stringifiedFile,
        payload,
        keepTemplateKey: templateInfo.type === 'union',
      }
    }
  }

  /**
   * Clears the internal cache of the tinaSchema and the lookup file. This allows the state to be reset
   */
  public clearCache() {
    this.tinaSchema = null
    this._lookup = null
  }

  public flush = async (filepath: string) => {
    const data = await this.get<{ [key: string]: unknown }>(filepath)
    const { stringifiedFile } = await this.stringifyFile(filepath, data)
    return stringifiedFile
  }

  public getLookup = async (returnType: string): Promise<LookupMapType> => {
    const lookupPath = path.join(GENERATED_FOLDER, `_lookup.json`)
    if (!this._lookup) {
      const _lookup = await this.store.get(normalizePath(lookupPath))
      // @ts-ignore
      this._lookup = _lookup
    }
    return this._lookup[returnType]
  }
  public getGraphQLSchema = async (): Promise<DocumentNode> => {
    const graphqlPath = path.join(GENERATED_FOLDER, `_graphql.json`)
    return this.store.get(normalizePath(graphqlPath))
  }
  //TODO - is there a reason why the database fetches some config with "bridge.get", and some with "store.get"?
  public getGraphQLSchemaFromBridge = async (): Promise<DocumentNode> => {
    const graphqlPath = path.join(GENERATED_FOLDER, `_graphql.json`)
    const _graphql = await this.bridge.get(normalizePath(graphqlPath))
    return JSON.parse(_graphql)
  }
  public getTinaSchema = async (): Promise<TinaCloudSchemaBase> => {
    const schemaPath = path.join(GENERATED_FOLDER, `_schema.json`)
    return this.store.get(normalizePath(schemaPath))
  }

  public getSchema = async () => {
    if (this.tinaSchema) {
      return this.tinaSchema
    }
    const schema = await this.getTinaSchema()
    this.tinaSchema = await createSchema({ schema })
    return this.tinaSchema
  }

  public getIndexDefinitions = async (): Promise<
    Record<string, Record<string, IndexDefinition>>
  > => {
    if (!this.collectionIndexDefinitions) {
      await new Promise<void>(async (resolve, reject) => {
        try {
          const schema = await this.getSchema()
          const collections = schema.getCollections()
          for (const collection of collections) {
            const indexDefinitions = {
              [DEFAULT_COLLECTION_SORT_KEY]: { fields: [] }, // provide a default sort key which is the file sort
            }

            if (collection.fields) {
              for (const field of collection.fields as TinaFieldInner<true>[]) {
                if (
                  (field.indexed !== undefined && field.indexed === false) ||
                  field.type ===
                    'object' /* TODO do we want indexes on objects? */
                ) {
                  continue
                }

                indexDefinitions[field.name] = {
                  fields: [
                    {
                      name: field.name,
                      type: field.type,
                      pad:
                        field.type === 'number'
                          ? { fillString: '0', maxLength: DEFAULT_NUMERIC_LPAD }
                          : undefined,
                    },
                  ],
                }
              }
            }

            if (collection.indexes) {
              // build IndexDefinitions for each index in the collection schema
              for (const index of collection.indexes) {
                indexDefinitions[index.name] = {
                  fields: index.fields.map((indexField) => ({
                    name: indexField.name,
                    type: (collection.fields as TinaFieldInner<true>[]).find(
                      (field) => indexField.name === field.name
                    )?.type,
                  })),
                }
              }
            }
            this.collectionIndexDefinitions =
              this.collectionIndexDefinitions || {}
            this.collectionIndexDefinitions[collection.name] = indexDefinitions
          }
          resolve()
        } catch (err) {
          reject(err)
        }
      })
    }

    return this.collectionIndexDefinitions
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

  public query = async (queryOptions: QueryOptions, hydrator) => {
    const { first, after, last, before, sort, collection, filterChain } =
      queryOptions
    const storeQueryOptions: StoreQueryOptions = {
      sort,
      collection,
      filterChain,
    }

    if (first) {
      storeQueryOptions.limit = first
    } else if (last) {
      storeQueryOptions.limit = last
    } else {
      storeQueryOptions.limit = 10
    }

    if (after) {
      storeQueryOptions.gt = atob(after)
    } else if (before) {
      storeQueryOptions.lt = atob(before)
    }

    if (last) {
      storeQueryOptions.reverse = true
    }

    const indexDefinitions = await this.getIndexDefinitions()
    storeQueryOptions.indexDefinitions =
      indexDefinitions?.[queryOptions.collection]
    if (!storeQueryOptions.indexDefinitions) {
      throw new Error(
        `No indexDefinitions for collection ${queryOptions.collection}`
      )
    }
    const {
      edges,
      pageInfo: { hasPreviousPage, hasNextPage, startCursor, endCursor },
    }: { edges: { path: string; cursor: string }[]; pageInfo: PageInfo } =
      await this.store.query(storeQueryOptions)

    return {
      edges: await sequential(edges, async (edge) => {
        try {
          const node = await hydrator(edge.path)
          return {
            node,
            cursor: btoa(edge.cursor),
          }
        } catch (error) {
          if (
            error instanceof Error &&
            !edge.path.includes('.tina/__generated__/_graphql.json')
          ) {
            throw new TinaQueryError({
              originalError: error,
              file: edge.path,
              collection,
              stack: error.stack,
            })
          } else {
            // I dont think this should ever happen
            throw error
          }
        }
      }),
      pageInfo: {
        hasPreviousPage,
        hasNextPage,
        startCursor: btoa(startCursor),
        endCursor: btoa(endCursor),
      },
    }
  }

  public putConfigFiles = async ({
    graphQLSchema,
    tinaSchema,
  }: {
    graphQLSchema: DocumentNode
    tinaSchema: TinaSchema
  }) => {
    if (this.bridge.supportsBuilding()) {
      await this.bridge.putConfig(
        normalizePath(path.join(GENERATED_FOLDER, `_graphql.json`)),
        JSON.stringify(graphQLSchema)
      )
      await this.bridge.putConfig(
        normalizePath(path.join(GENERATED_FOLDER, `_schema.json`)),
        JSON.stringify(tinaSchema.schema)
      )
    }
  }

  private async indexStatusCallbackWrapper(fn: () => Promise<void>) {
    await this.indexStatusCallback({ status: 'inprogress' })
    try {
      await fn()
      await this.indexStatusCallback({ status: 'complete' })
    } catch (error) {
      await this.indexStatusCallback({ status: 'failed', error })
      throw error
    }
  }

  public indexContent = async ({
    graphQLSchema,
    tinaSchema,
  }: {
    graphQLSchema: DocumentNode
    tinaSchema: TinaSchema
  }) => {
    await this.indexStatusCallbackWrapper(async () => {
      const lookup = JSON.parse(
        await this.bridge.get(
          normalizePath(path.join(GENERATED_FOLDER, '_lookup.json'))
        )
      )
      if (this.store.supportsSeeding()) {
        await this.store.clear()
        await this.store.seed(
          normalizePath(path.join(GENERATED_FOLDER, '_graphql.json')),
          graphQLSchema
        )
        await this.store.seed(
          normalizePath(path.join(GENERATED_FOLDER, '_schema.json')),
          tinaSchema.schema
        )
        await this.store.seed(
          normalizePath(path.join(GENERATED_FOLDER, '_lookup.json')),
          lookup
        )
        await this._indexAllContent()
      } else {
        if (this.store.supportsIndexing()) {
          throw new Error(`Schema must be indexed with provided Store`)
        }
      }
    })
  }

  public deleteContentByPaths = async (documentPaths: string[]) => {
    await this.indexStatusCallbackWrapper(async () => {
      const { pathsByCollection, nonCollectionPaths, collections } =
        await this.partitionPathsByCollection(documentPaths)

      for (const collection of Object.keys(pathsByCollection)) {
        await _deleteIndexContent(
          this,
          pathsByCollection[collection],
          collections[collection]
        )
      }

      await _deleteIndexContent(this, nonCollectionPaths, null)
    })
  }

  public indexContentByPaths = async (documentPaths: string[]) => {
    await this.indexStatusCallbackWrapper(async () => {
      const { pathsByCollection, nonCollectionPaths, collections } =
        await this.partitionPathsByCollection(documentPaths)

      for (const collection of Object.keys(pathsByCollection)) {
        await _indexContent(
          this,
          pathsByCollection[collection],
          collections[collection]
        )
      }
      await _indexContent(this, nonCollectionPaths)
    })
  }

  public delete = async (filepath: string) => {
    const collection = await this.collectionForPath(filepath)
    let collectionIndexDefinitions
    if (collection) {
      const indexDefinitions = await this.getIndexDefinitions()
      collectionIndexDefinitions = indexDefinitions?.[collection.name]
    }
    await this.store.delete(normalizePath(filepath), {
      collection: collection.name,
      indexDefinitions: collectionIndexDefinitions,
    })

    await this.bridge.delete(normalizePath(filepath))
  }

  public _indexAllContent = async () => {
    const tinaSchema = await this.getSchema()
    await sequential(tinaSchema.getCollections(), async (collection) => {
      const documentPaths = await this.bridge.glob(
        normalizePath(collection.path),
        collection.format || 'md'
      )
      await _indexContent(this, documentPaths, collection)
    })
  }

  public addToLookupMap = async (lookup: LookupMapType) => {
    const lookupPath = path.join(GENERATED_FOLDER, `_lookup.json`)
    let lookupMap
    try {
      lookupMap = JSON.parse(await this.bridge.get(normalizePath(lookupPath)))
    } catch (e) {
      lookupMap = {}
    }
    const updatedLookup = {
      ...lookupMap,
      [lookup.type]: lookup,
    }
    await this.bridge.putConfig(
      normalizePath(lookupPath),
      JSON.stringify(updatedLookup)
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
  collection?: string
  typeMap: { [templateName: string]: string }
}

const _indexContent = async (
  database: Database,
  documentPaths: string[],
  collection?:
    | CollectionFieldsWithNamespace<true>
    | CollectionTemplatesWithNamespace<true>
) => {
  let seedOptions: object | undefined = undefined

  if (collection) {
    const indexDefinitions = await database.getIndexDefinitions()
    const collectionIndexDefinitions = indexDefinitions?.[collection.name]
    if (!collectionIndexDefinitions) {
      throw new Error(`No indexDefinitions for collection ${collection.name}`)
    }

    const numIndexes = Object.keys(collectionIndexDefinitions).length
    if (numIndexes > 20) {
      throw new Error(
        `A maximum of 20 indexes are allowed per field. Currently collection ${collection.name} has ${numIndexes} indexes. Add 'indexed: false' to exclude a field from indexing.`
      )
    }

    seedOptions = {
      collection: collection.name,
      indexDefinitions: collectionIndexDefinitions,
    }
  }

  await sequential(documentPaths, async (filepath) => {
    try {
      const dataString = await database.bridge.get(normalizePath(filepath))
      const data = parseFile(dataString, path.extname(filepath), (yup) =>
        yup.object({})
      )
      if (database.store.supportsSeeding()) {
        await database.store.seed(normalizePath(filepath), data, seedOptions)
      }
    } catch (error) {
      throw new TinaFetchError(`Unable to seed ${filepath}`, {
        originalError: error,
        file: filepath,
        collection: collection.name,
        stack: error.stack,
      })
    }
  })
}

const _deleteIndexContent = async (
  database: Database,
  documentPaths: string[],
  collection?:
    | CollectionFieldsWithNamespace<true>
    | CollectionTemplatesWithNamespace<true>
) => {
  let deleteOptions: object | undefined = undefined
  if (collection) {
    const indexDefinitions = await database.getIndexDefinitions()
    const collectionIndexDefinitions = indexDefinitions?.[collection.name]
    if (!collectionIndexDefinitions) {
      throw new Error(`No indexDefinitions for collection ${collection.name}`)
    }

    deleteOptions = {
      collection: collection.name,
      indexDefinitions: collectionIndexDefinitions,
    }
  }

  await sequential(documentPaths, async (filepath) => {
    database.store.delete(filepath, deleteOptions)
  })
}
