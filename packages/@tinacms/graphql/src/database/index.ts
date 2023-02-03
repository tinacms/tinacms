/**

*/

import path from 'path'
import type { DocumentNode } from 'graphql'
import { GraphQLError } from 'graphql'
import { createSchema } from '../schema/createSchema'
import { atob, btoa, lastItem, sequential } from '../util'
import { normalizePath, parseFile, stringifyFile } from './util'
import type {
  CollectionFieldsWithNamespace,
  CollectionTemplatesWithNamespace,
  TinaCloudSchemaBase,
  TinaFieldInner,
  TinaSchema,
} from '@tinacms/schema-tools'
import type { Bridge } from '../database/bridge'
import { TinaFetchError, TinaQueryError } from '../resolver/error'
import {
  BinaryFilter,
  coerceFilterChainOperands,
  DEFAULT_COLLECTION_SORT_KEY,
  DEFAULT_NUMERIC_LPAD,
  IndexDefinition,
  makeFilter,
  makeFilterSuffixes,
  makeIndexOpsForDocument,
  TernaryFilter,
} from './datalayer'
import {
  BatchOp,
  DelOp,
  INDEX_KEY_FIELD_SEPARATOR,
  Level,
  PutOp,
  CONTENT_ROOT_PREFIX,
  SUBLEVEL_OPTIONS,
} from './level'

type IndexStatusEvent = {
  status: 'inprogress' | 'complete' | 'failed'
  error?: Error
}
type IndexStatusCallback = (event: IndexStatusEvent) => Promise<void>
export type OnPutCallback = (key: string, value: any) => Promise<void>
export type OnDeleteCallback = (key: string) => Promise<void>

export type CreateDatabase = {
  bridge?: Bridge
  level: Level
  onPut?: (key: string, value: any) => Promise<void>
  onDelete?: (key: string) => Promise<void>
  tinaDirectory?: string
  indexStatusCallback?: IndexStatusCallback
  version?: boolean
}

export const createDatabase = (config: CreateDatabase) => {
  return new Database({
    ...config,
    bridge: config.bridge,
    level: config.level,
  })
}
const SYSTEM_FILES = ['_schema', '_graphql', '_lookup']

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
const defaultOnPut: OnPutCallback = () => Promise.resolve()
const defaultOnDelete: OnDeleteCallback = () => Promise.resolve()

export class Database {
  public bridge?: Bridge
  public rootLevel: Level
  public level: Level | undefined
  public tinaDirectory: string
  public indexStatusCallback: IndexStatusCallback | undefined
  private onPut: OnPutCallback
  private onDelete: OnDeleteCallback
  private tinaSchema: TinaSchema | undefined
  private collectionIndexDefinitions:
    | Record<string, Record<string, IndexDefinition>>
    | undefined
  private _lookup: { [returnType: string]: LookupMapType } | undefined
  constructor(public config: CreateDatabase) {
    this.tinaDirectory = config.tinaDirectory || '.tina'
    this.bridge = config.bridge
    this.rootLevel = config.level
    this.indexStatusCallback =
      config.indexStatusCallback || defaultStatusCallback
    this.onPut = config.onPut || defaultOnPut
    this.onDelete = config.onDelete || defaultOnDelete
  }

  private collectionForPath = async (
    filepath: string
  ): Promise<
    | CollectionFieldsWithNamespace<true>
    | CollectionTemplatesWithNamespace<true>
    | undefined
  > => {
    const tinaSchema = await this.getSchema(this.level)
    return tinaSchema.getCollectionByFullPath(filepath)
  }

  private getGeneratedFolder = () =>
    path.join(this.tinaDirectory, '__generated__')

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

  private async updateDatabaseVersion(version: string) {
    const metadataLevel = await this.rootLevel.sublevel(
      '_metadata',
      SUBLEVEL_OPTIONS
    )
    await metadataLevel.put('metadata', { version })
  }

  private async getDatabaseVersion(): Promise<string | undefined> {
    const metadataLevel = await this.rootLevel.sublevel(
      '_metadata',
      SUBLEVEL_OPTIONS
    )

    let version: string | undefined
    try {
      const metadata = await metadataLevel.get('metadata')
      version = metadata.version || version
    } catch (e: any) {
      if (e.code !== 'LEVEL_NOT_FOUND') {
        throw e
      }
      if (version) {
        await metadataLevel.put('metadata', { version })
      }
    }
    return version
  }

  private async initLevel() {
    if (this.level) {
      return
    }
    if (!this.config.version) {
      this.level = this.rootLevel
    } else {
      const version = await this.getDatabaseVersion()
      if (version) {
        this.level = this.rootLevel.sublevel(version, SUBLEVEL_OPTIONS)
      }
    }
  }

  public get = async <T extends object>(filepath: string): Promise<T> => {
    await this.initLevel()
    if (SYSTEM_FILES.includes(filepath)) {
      throw new Error(`Unexpected get for config file ${filepath}`)
    } else {
      const tinaSchema = await this.getSchema(this.level)
      const extension = path.extname(filepath)
      const contentObject = await this.level
        .sublevel<string, Record<string, any>>(
          CONTENT_ROOT_PREFIX,
          SUBLEVEL_OPTIONS
        )
        .get(normalizePath(filepath))
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
          data[field.name] = $_body as object
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
    await this.initLevel()
    const { stringifiedFile, payload } = await this.stringifyFile(
      filepath,
      data
    )
    const collection = await this.collectionForPath(filepath)
    let collectionIndexDefinitions
    if (collection) {
      const indexDefinitions = await this.getIndexDefinitions(this.level)
      collectionIndexDefinitions = indexDefinitions?.[collection.name]
    }
    const normalizedPath = normalizePath(filepath)
    if (this.bridge) {
      await this.bridge.put(normalizedPath, stringifiedFile)
    }
    await this.onPut(normalizedPath, stringifiedFile)

    const putOps = makeIndexOpsForDocument(
      normalizedPath,
      collection?.name,
      collectionIndexDefinitions,
      payload,
      'put',
      this.level
    )

    let existingItem
    try {
      existingItem = await this.level
        .sublevel<string, Record<string, any>>(
          CONTENT_ROOT_PREFIX,
          SUBLEVEL_OPTIONS
        )
        .get(normalizedPath)
    } catch (e: any) {
      if (e.code !== 'LEVEL_NOT_FOUND') {
        throw e
      }
    }

    const delOps = existingItem
      ? makeIndexOpsForDocument(
          normalizedPath,
          collection?.name,
          collectionIndexDefinitions,
          existingItem,
          'del',
          this.level
        )
      : []

    const ops: BatchOp[] = [
      ...delOps,
      ...putOps,
      {
        type: 'put',
        key: normalizedPath,
        value: payload,
        sublevel: this.level.sublevel<string, Record<string, any>>(
          CONTENT_ROOT_PREFIX,
          SUBLEVEL_OPTIONS
        ),
      },
    ]

    await this.level.batch(ops)
  }

  public put = async (
    filepath: string,
    data: { [key: string]: unknown },
    collection?: string
  ) => {
    await this.initLevel()
    try {
      if (SYSTEM_FILES.includes(filepath)) {
        throw new Error(`Unexpected put for config file ${filepath}`)
      } else {
        let collectionIndexDefinitions
        if (collection) {
          const indexDefinitions = await this.getIndexDefinitions(this.level)
          collectionIndexDefinitions = indexDefinitions?.[collection]
        }

        const normalizedPath = normalizePath(filepath)
        const { stringifiedFile, payload } = await this.stringifyFile(
          filepath,
          data
        )
        if (this.bridge) {
          await this.bridge.put(normalizedPath, stringifiedFile)
        }
        await this.onPut(normalizedPath, stringifiedFile)
        const putOps = makeIndexOpsForDocument(
          normalizedPath,
          collection,
          collectionIndexDefinitions,
          payload,
          'put',
          this.level
        )

        let existingItem
        try {
          existingItem = await this.level
            .sublevel<string, Record<string, any>>(
              CONTENT_ROOT_PREFIX,
              SUBLEVEL_OPTIONS
            )
            .get(normalizedPath)
        } catch (e: any) {
          if (e.code !== 'LEVEL_NOT_FOUND') {
            throw e
          }
        }
        const delOps = existingItem
          ? makeIndexOpsForDocument(
              normalizedPath,
              collection,
              collectionIndexDefinitions,
              existingItem,
              'del',
              this.level
            )
          : []

        const ops: BatchOp[] = [
          ...delOps,
          ...putOps,
          {
            type: 'put',
            key: normalizedPath,
            value: payload,
            sublevel: this.level.sublevel<string, Record<string, any>>(
              CONTENT_ROOT_PREFIX,
              SUBLEVEL_OPTIONS
            ),
          },
        ]

        await this.level.batch(ops)
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
      const tinaSchema = await this.getSchema(this.level)
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
        templateInfo.type === 'union',
        {
          frontmatterFormat: collection?.frontmatterFormat,
          frontmatterDelimiters: collection?.frontmatterDelimiters,
        }
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
    await this.initLevel()
    const lookupPath = normalizePath(
      path.join(this.getGeneratedFolder(), `_lookup.json`)
    )
    if (!this._lookup) {
      const _lookup = await this.level
        .sublevel<string, Record<string, any>>(
          CONTENT_ROOT_PREFIX,
          SUBLEVEL_OPTIONS
        )
        .get(lookupPath)
      // @ts-ignore
      this._lookup = _lookup
    }
    return this._lookup[returnType]
  }
  public getGraphQLSchema = async (): Promise<DocumentNode> => {
    await this.initLevel()
    const graphqlPath = normalizePath(
      path.join(this.getGeneratedFolder(), `_graphql.json`)
    )
    return (await this.level
      .sublevel<string, Record<string, any>>(
        CONTENT_ROOT_PREFIX,
        SUBLEVEL_OPTIONS
      )
      .get(graphqlPath)) as unknown as DocumentNode
  }
  //TODO - is there a reason why the database fetches some config with "bridge.get", and some with "store.get"?
  public getGraphQLSchemaFromBridge = async (): Promise<DocumentNode> => {
    if (!this.bridge) {
      throw new Error(`No bridge configured`)
    }

    const graphqlPath = normalizePath(
      path.join(this.getGeneratedFolder(), `_graphql.json`)
    )
    const _graphql = await this.bridge.get(graphqlPath)
    return JSON.parse(_graphql)
  }
  public getTinaSchema = async (
    level?: Level
  ): Promise<TinaCloudSchemaBase> => {
    await this.initLevel()
    const schemaPath = normalizePath(
      path.join(this.getGeneratedFolder(), `_schema.json`)
    )
    return (await (level || this.level)
      .sublevel<string, Record<string, any>>(
        CONTENT_ROOT_PREFIX,
        SUBLEVEL_OPTIONS
      )
      .get(schemaPath)) as unknown as TinaCloudSchemaBase
  }

  public getSchema = async (level?: Level) => {
    if (this.tinaSchema) {
      return this.tinaSchema
    }
    await this.initLevel()
    const schema = await this.getTinaSchema(level || this.level)
    this.tinaSchema = await createSchema({ schema })
    return this.tinaSchema
  }

  public getIndexDefinitions = async (
    level?: Level
  ): Promise<Record<string, Record<string, IndexDefinition>>> => {
    if (!this.collectionIndexDefinitions) {
      await new Promise<void>(async (resolve, reject) => {
        await this.initLevel()
        try {
          const schema = await this.getSchema(level || this.level)
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
    await this.initLevel()
    const {
      first,
      after,
      last,
      before,
      sort = DEFAULT_COLLECTION_SORT_KEY,
      collection,
      filterChain: rawFilterChain,
    } = queryOptions
    let limit = 50
    if (first) {
      limit = first
    } else if (last) {
      limit = last
    }

    const query: {
      gt?: string
      gte?: string
      lt?: string
      lte?: string
      reverse: boolean
    } = { reverse: !!last }

    if (after) {
      query.gt = atob(after)
    } else if (before) {
      query.lt = atob(before)
    }

    const allIndexDefinitions = await this.getIndexDefinitions(this.level)
    const indexDefinitions = allIndexDefinitions?.[queryOptions.collection]
    if (!indexDefinitions) {
      throw new Error(
        `No indexDefinitions for collection ${queryOptions.collection}`
      )
    }

    const filterChain = coerceFilterChainOperands(rawFilterChain)

    // Because we default to DEFAULT_COLLECTION_SORT_KEY, the only way this is
    // actually undefined is if the caller specified a non-existent sort key
    const indexDefinition = (sort && indexDefinitions?.[sort]) as
      | IndexDefinition
      | undefined
    const filterSuffixes =
      indexDefinition && makeFilterSuffixes(filterChain, indexDefinition)
    const rootLevel = this.level.sublevel<string, Record<string, any>>(
      CONTENT_ROOT_PREFIX,
      SUBLEVEL_OPTIONS
    )
    const sublevel = indexDefinition
      ? this.level
          .sublevel(collection, SUBLEVEL_OPTIONS)
          .sublevel(sort, SUBLEVEL_OPTIONS)
      : rootLevel

    if (!query.gt && !query.gte) {
      query.gte = filterSuffixes?.left ? filterSuffixes.left : ''
    }

    if (!query.lt && !query.lte) {
      query.lte = filterSuffixes?.right ? `${filterSuffixes.right}\xFF` : '\xFF'
    }

    let edges: { cursor: string; path: string }[] = []
    let startKey: string = ''
    let endKey: string = ''
    let hasPreviousPage = false
    let hasNextPage = false

    const fieldsPattern = indexDefinition?.fields?.length
      ? `${indexDefinition.fields
          .map((p) => `(?<${p.name}>.+)${INDEX_KEY_FIELD_SEPARATOR}`)
          .join('')}`
      : ''
    const valuesRegex = indexDefinition
      ? new RegExp(`^${fieldsPattern}(?<_filepath_>.+)`)
      : new RegExp(`^(?<_filepath_>.+)`)
    const itemFilter = makeFilter({ filterChain })

    // @ts-ignore
    // It looks like tslint is confused by the multiple iterator() overloads
    const iterator = sublevel.iterator<string, Record<string, any>>(query)
    for await (const [key, value] of iterator) {
      const matcher = valuesRegex.exec(key)
      if (
        !matcher ||
        (indexDefinition &&
          matcher.length !== indexDefinition.fields.length + 2)
      ) {
        continue
      }
      const filepath = matcher.groups['_filepath_']
      if (
        !itemFilter(
          filterSuffixes
            ? matcher.groups
            : indexDefinition
            ? await rootLevel.get(filepath)
            : (value as Record<string, any>)
        )
      ) {
        continue
      }

      if (limit !== -1 && edges.length >= limit) {
        if (query.reverse) {
          hasPreviousPage = true
        } else {
          hasNextPage = true
        }
        break
      }

      startKey = startKey || key || ''
      endKey = key || ''
      edges = [...edges, { cursor: key, path: filepath }]
    }

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
            (!edge.path.includes('.tina/__generated__/_graphql.json') ||
              !edge.path.includes('tina/__generated__/_graphql.json'))
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
        startCursor: btoa(startKey),
        endCursor: btoa(endKey),
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
    if (this.bridge && this.bridge.supportsBuilding()) {
      await this.bridge.putConfig(
        normalizePath(path.join(this.getGeneratedFolder(), `_graphql.json`)),
        JSON.stringify(graphQLSchema)
      )
      await this.bridge.putConfig(
        normalizePath(path.join(this.getGeneratedFolder(), `_schema.json`)),
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
    lookup: lookupFromLockFile,
  }: {
    graphQLSchema: DocumentNode
    tinaSchema: TinaSchema
    lookup?: object
  }) => {
    if (!this.bridge) {
      throw new Error('No bridge configured')
    }
    await this.initLevel()
    await this.indexStatusCallbackWrapper(async () => {
      const lookup =
        lookupFromLockFile ||
        JSON.parse(
          await this.bridge.get(
            normalizePath(path.join(this.getGeneratedFolder(), '_lookup.json'))
          )
        )

      let nextLevel: Level | undefined
      let nextVersion: string | undefined
      if (!this.config.version) {
        await this.level.clear()
        nextLevel = this.level
      } else {
        const version = await this.getDatabaseVersion()
        nextVersion = version ? `${parseInt(version) + 1}` : '0'
        nextLevel = this.rootLevel.sublevel(nextVersion, SUBLEVEL_OPTIONS)
      }

      const contentRootLevel = nextLevel.sublevel<string, Record<string, any>>(
        CONTENT_ROOT_PREFIX,
        SUBLEVEL_OPTIONS
      )
      await contentRootLevel.put(
        normalizePath(path.join(this.getGeneratedFolder(), '_graphql.json')),
        graphQLSchema as any
      )
      await contentRootLevel.put(
        normalizePath(path.join(this.getGeneratedFolder(), '_schema.json')),
        tinaSchema.schema as any
      )
      await contentRootLevel.put(
        normalizePath(path.join(this.getGeneratedFolder(), '_lookup.json')),
        lookup
      )
      await this._indexAllContent(nextLevel)

      if (this.config.version) {
        await this.updateDatabaseVersion(nextVersion)
        if (this.level) {
          await this.level.clear()
        }
        this.level = nextLevel
      }
    })
  }

  public deleteContentByPaths = async (documentPaths: string[]) => {
    await this.initLevel()
    const operations: DelOp[] = []
    const enqueueOps = async (ops: DelOp[]): Promise<void> => {
      operations.push(...ops)
      while (operations.length >= 25) {
        // make this an option
        await this.level.batch(operations.splice(0, 25))
      }
    }
    await this.indexStatusCallbackWrapper(async () => {
      const { pathsByCollection, nonCollectionPaths, collections } =
        await this.partitionPathsByCollection(documentPaths)

      for (const collection of Object.keys(pathsByCollection)) {
        await _deleteIndexContent(
          this,
          pathsByCollection[collection],
          enqueueOps,
          collections[collection]
        )
      }

      await _deleteIndexContent(this, nonCollectionPaths, enqueueOps, null)
    })
    while (operations.length) {
      await this.level.batch(operations.splice(0, 25))
    }
  }

  public indexContentByPaths = async (documentPaths: string[]) => {
    await this.initLevel()
    const operations: BatchOp[] = []
    const enqueueOps = async (ops: BatchOp[]): Promise<void> => {
      operations.push(...ops)
      while (operations.length >= 25) {
        // make this an option
        await this.level.batch(operations.splice(0, 25))
      }
    }
    await this.indexStatusCallbackWrapper(async () => {
      const { pathsByCollection, nonCollectionPaths, collections } =
        await this.partitionPathsByCollection(documentPaths)

      for (const collection of Object.keys(pathsByCollection)) {
        await _indexContent(
          this,
          this.level,
          pathsByCollection[collection],
          enqueueOps,
          collections[collection]
        )
      }
      await _indexContent(this, this.level, nonCollectionPaths, enqueueOps)
    })
    while (operations.length) {
      await this.level.batch(operations.splice(0, 25))
    }
  }

  public delete = async (filepath: string) => {
    await this.initLevel()
    const collection = await this.collectionForPath(filepath)
    let collectionIndexDefinitions
    if (collection) {
      const indexDefinitions = await this.getIndexDefinitions(this.level)
      collectionIndexDefinitions = indexDefinitions?.[collection.name]
    }
    this.level.sublevel<string, Record<string, any>>(
      CONTENT_ROOT_PREFIX,
      SUBLEVEL_OPTIONS
    )
    const itemKey = normalizePath(filepath)
    const rootSublevel = this.level.sublevel<string, Record<string, any>>(
      CONTENT_ROOT_PREFIX,
      SUBLEVEL_OPTIONS
    )
    const item = await rootSublevel.get(itemKey)
    if (item) {
      await this.level.batch([
        ...makeIndexOpsForDocument<Record<string, any>>(
          filepath,
          collection.name,
          collectionIndexDefinitions,
          item,
          'del',
          this.level
        ),
        {
          type: 'del',
          key: itemKey,
          sublevel: rootSublevel,
        },
      ])
    }

    if (this.bridge) {
      await this.bridge.delete(normalizePath(filepath))
    }
    await this.onDelete(normalizePath(filepath))
  }

  public _indexAllContent = async (level: Level) => {
    const tinaSchema = await this.getSchema(level)
    const operations: PutOp[] = []
    const enqueueOps = async (ops: PutOp[]): Promise<void> => {
      operations.push(...ops)
      while (operations.length >= 25) {
        // make this an option
        const batchOps = operations.splice(0, 25)
        await level.batch(batchOps)
      }
    }
    await sequential(tinaSchema.getCollections(), async (collection) => {
      const documentPaths = await this.bridge.glob(
        normalizePath(collection.path),
        collection.format || 'md'
      )
      await _indexContent(this, level, documentPaths, enqueueOps, collection)
    })
    while (operations.length) {
      await level.batch(operations.splice(0, 25))
    }
  }

  public addToLookupMap = async (lookup: LookupMapType) => {
    if (!this.bridge) {
      throw new Error('No bridge configured')
    }
    const lookupPath = path.join(this.getGeneratedFolder(), `_lookup.json`)
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
    //await this.onPut(normalizePath(lookupPath), JSON.stringify(updatedLookup))
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
  level: Level,
  documentPaths: string[],
  enqueueOps: (ops: BatchOp[]) => Promise<void>,
  collection?:
    | CollectionFieldsWithNamespace<true>
    | CollectionTemplatesWithNamespace<true>
) => {
  let collectionIndexDefinitions
  if (collection) {
    const indexDefinitions = await database.getIndexDefinitions(level)
    collectionIndexDefinitions = indexDefinitions?.[collection.name]
    if (!collectionIndexDefinitions) {
      throw new Error(`No indexDefinitions for collection ${collection.name}`)
    }
  }

  await sequential(documentPaths, async (filepath) => {
    try {
      const dataString = await database.bridge.get(normalizePath(filepath))
      const data = parseFile(
        dataString,
        path.extname(filepath),
        (yup) => yup.object({}),
        {
          frontmatterDelimiters: collection?.frontmatterDelimiters,
          frontmatterFormat: collection?.frontmatterFormat,
        }
      )
      const normalizedPath = normalizePath(filepath)
      await enqueueOps([
        ...makeIndexOpsForDocument<Record<string, any>>(
          normalizedPath,
          collection?.name,
          collectionIndexDefinitions,
          data,
          'put',
          level
        ),
        {
          type: 'put',
          key: normalizedPath,
          value: data as any,
          sublevel: level.sublevel<string, Record<string, any>>(
            CONTENT_ROOT_PREFIX,
            SUBLEVEL_OPTIONS
          ),
        },
      ])
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
  enequeueOps: (ops: BatchOp[]) => Promise<void>,
  collection?:
    | CollectionFieldsWithNamespace<true>
    | CollectionTemplatesWithNamespace<true>
) => {
  let collectionIndexDefinitions
  if (collection) {
    const indexDefinitions = await database.getIndexDefinitions(database.level)
    collectionIndexDefinitions = indexDefinitions?.[collection.name]
    if (!collectionIndexDefinitions) {
      throw new Error(`No indexDefinitions for collection ${collection.name}`)
    }
  }

  const rootLevel = database.level.sublevel<string, Record<string, any>>(
    CONTENT_ROOT_PREFIX,
    SUBLEVEL_OPTIONS
  )
  await sequential(documentPaths, async (filepath) => {
    const itemKey = normalizePath(filepath)
    const item = await rootLevel.get(itemKey)
    if (item) {
      await enequeueOps([
        ...makeIndexOpsForDocument(
          itemKey,
          collection.name,
          collectionIndexDefinitions,
          item,
          'del',
          database.level
        ),
        { type: 'del', key: itemKey, sublevel: rootLevel },
      ])
    }
  })
}
