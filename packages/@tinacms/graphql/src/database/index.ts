import path from 'node:path'
import fs from 'fs-extra'
import type { DocumentNode } from 'graphql'
import { GraphQLError } from 'graphql'
import micromatch from 'micromatch'

import { createSchema } from '../schema/createSchema'
import { atob, btoa, get, lastItem, sequential } from '../util'
import {
  getTemplateForFile,
  hasOwnProperty,
  loadAndParseWithAliases,
  normalizePath,
  partitionPathsByCollection,
  scanAllContent,
  scanContentByPaths,
  stringifyFile,
  transformDocument,
} from './util'
import type {
  Collection,
  CollectionTemplateable,
  Schema,
  Template,
  TinaField,
  TinaSchema,
} from '@tinacms/schema-tools'
import type { Bridge } from './bridge'
import { TinaFetchError, TinaQueryError } from '../resolver/error'
import {
  type BinaryFilter,
  coerceFilterChainOperands,
  DEFAULT_COLLECTION_SORT_KEY,
  DEFAULT_NUMERIC_LPAD,
  FOLDER_ROOT,
  FolderTreeBuilder,
  type IndexDefinition,
  makeFilter,
  makeFilterSuffixes,
  makeFolderOpsForCollection,
  makeIndexOpsForDocument,
  type TernaryFilter,
} from './datalayer'
import {
  ARRAY_ITEM_VALUE_SEPARATOR,
  type BatchOp,
  CONTENT_ROOT_PREFIX,
  type DelOp,
  INDEX_KEY_FIELD_SEPARATOR,
  type Level,
  LevelProxy,
  type PutOp,
  SUBLEVEL_OPTIONS,
} from './level'
import { applyNameOverrides, replaceNameOverrides } from './alias-utils'
import sha from 'js-sha1'
import { FilesystemBridge, TinaLevelClient } from '..'
import { generatePasswordHash, mapUserFields } from '../auth/utils'
import { NotFoundError } from '../error'
import set from 'lodash.set'

type IndexStatusEvent = {
  status: 'inprogress' | 'complete' | 'failed'
  error?: Error
}
type IndexStatusCallback = (event: IndexStatusEvent) => Promise<void>
export type OnPutCallback = (key: string, value: any) => Promise<void>
export type OnDeleteCallback = (key: string) => Promise<void>

export interface DatabaseArgs {
  bridge?: Bridge
  level: Level
  onPut?: (key: string, value: any) => Promise<void>
  onDelete?: (key: string) => Promise<void>
  tinaDirectory?: string
  indexStatusCallback?: IndexStatusCallback
  version?: boolean
  namespace?: string
}

export interface GitProvider {
  onPut: (key: string, value: string) => Promise<void>
  onDelete: (key: string) => Promise<void>
}

export type CreateDatabase = Omit<
  DatabaseArgs,
  'level' | 'onPut' | 'onDelete'
> & {
  databaseAdapter: Level
  gitProvider: GitProvider

  /**
   * @deprecated Use databaseAdapter instead
   */
  level?: Level
  /**
   * @deprecated Use gitProvider instead
   */
  onPut?: OnPutCallback
  /**
   * @deprecated Use gitProvider instead
   */
  onDelete?: OnDeleteCallback
}

export type CreateLocalDatabaseArgs = Omit<DatabaseArgs, 'level'> & {
  port?: number
  rootPath?: string
}

export const createLocalDatabase = (config?: CreateLocalDatabaseArgs) => {
  const level = new TinaLevelClient(config?.port)
  level.openConnection()
  const fsBridge = new FilesystemBridge(config?.rootPath || process.cwd())
  return new Database({
    bridge: fsBridge,
    ...(config || {}),
    level,
  })
}

export const createDatabase = (config: CreateDatabase) => {
  if (config.onPut && config.onDelete) {
    console.warn(
      'onPut and onDelete are deprecated. Please use gitProvider.onPut and gitProvider.onDelete instead.'
    )
  }
  if (config.level) {
    console.warn('level is deprecated. Please use databaseAdapter instead.')
  }
  if (
    config.onPut &&
    config.onDelete &&
    config.level &&
    !config.databaseAdapter &&
    !config.gitProvider
  ) {
    // This is required for backwards compatibility
    return new Database({
      ...config,
      level: config.level,
    })
  }

  if (!config.gitProvider) {
    throw new Error(
      'createDatabase requires a gitProvider. Please provide a gitProvider.'
    )
  }

  if (!config.databaseAdapter) {
    throw new Error(
      'createDatabase requires a databaseAdapter. Please provide a databaseAdapter.'
    )
  }

  return new Database({
    ...config,
    bridge: config.bridge,
    level: config.databaseAdapter,
    onPut: config.gitProvider.onPut.bind(config.gitProvider),
    onDelete: config.gitProvider.onDelete.bind(config.gitProvider),
    namespace: config.namespace || 'tinacms',
  })
}

export const createDatabaseInternal = (config: DatabaseArgs) => {
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
  /* folder to query */
  folder?: string
}

const defaultStatusCallback: IndexStatusCallback = () => Promise.resolve()
const defaultOnPut: OnPutCallback = () => Promise.resolve()
const defaultOnDelete: OnDeleteCallback = () => Promise.resolve()

export class Database {
  public bridge?: Bridge
  public rootLevel: Level
  public appLevel: Level | undefined
  public contentLevel: Level | undefined
  public tinaDirectory: string
  public indexStatusCallback: IndexStatusCallback | undefined
  private readonly onPut: OnPutCallback
  private readonly onDelete: OnDeleteCallback
  private tinaSchema: TinaSchema | undefined
  private contentNamespace: string | undefined

  private collectionIndexDefinitions:
    | Record<string, Record<string, IndexDefinition>>
    | undefined
  private _lookup: { [returnType: string]: LookupMapType } | undefined

  constructor(public config: DatabaseArgs) {
    this.tinaDirectory = config.tinaDirectory || 'tina'
    this.bridge = config.bridge
    this.rootLevel =
      config.level && (new LevelProxy(config.level) as unknown as Level)
    this.indexStatusCallback =
      config.indexStatusCallback || defaultStatusCallback
    this.onPut = config.onPut || defaultOnPut
    this.onDelete = config.onDelete || defaultOnDelete
    this.contentNamespace = config.namespace
  }

  private collectionForPath = async (filepath: string) => {
    const tinaSchema = await this.getSchema(this.contentLevel)
    try {
      return tinaSchema.getCollectionByFullPath(filepath)
    } catch (e) {}
  }

  private getGeneratedFolder = () =>
    path.join(this.tinaDirectory, '__generated__')

  private async updateDatabaseVersion(version: string) {
    let metadataLevel = this.rootLevel.sublevel('_metadata', SUBLEVEL_OPTIONS)
    if (this.contentNamespace) {
      metadataLevel = metadataLevel.sublevel(
        this.contentNamespace,
        SUBLEVEL_OPTIONS
      )
    }
    await metadataLevel.put('metadata', { version })
  }

  private async getDatabaseVersion(): Promise<string | undefined> {
    let metadataLevel = this.rootLevel.sublevel('_metadata', SUBLEVEL_OPTIONS)
    if (this.contentNamespace) {
      metadataLevel = metadataLevel.sublevel(
        this.contentNamespace,
        SUBLEVEL_OPTIONS
      )
    }
    const metadata = await metadataLevel.get('metadata')
    return metadata?.version
  }

  private async initLevel() {
    if (this.contentLevel) {
      return
    }

    this.appLevel = this.rootLevel.sublevel('_appData', SUBLEVEL_OPTIONS)
    if (!this.config.version) {
      this.contentLevel = this.contentNamespace
        ? this.rootLevel
            .sublevel('_content', SUBLEVEL_OPTIONS)
            .sublevel(this.contentNamespace, SUBLEVEL_OPTIONS)
        : this.rootLevel.sublevel('_content', SUBLEVEL_OPTIONS)
    } else {
      let version = await this.getDatabaseVersion()
      if (!version) {
        version = ''
        try {
          await this.updateDatabaseVersion(version)
        } catch (e) {} // this might fail on queries that don't have a version
      }
      this.contentLevel = this.contentNamespace
        ? this.rootLevel
            .sublevel('_content')
            .sublevel(this.contentNamespace, SUBLEVEL_OPTIONS)
            .sublevel(version, SUBLEVEL_OPTIONS)
        : this.rootLevel.sublevel(version, SUBLEVEL_OPTIONS)
    }

    // Make sure this error bubbles up to the user
    if (!this.contentLevel) {
      throw new GraphQLError('Error initializing LevelDB instance')
    }
  }

  public getMetadata = async (key: string) => {
    await this.initLevel()
    let metadataLevel = this.rootLevel.sublevel('_metadata', SUBLEVEL_OPTIONS)
    if (this.contentNamespace) {
      metadataLevel = metadataLevel.sublevel(
        this.contentNamespace,
        SUBLEVEL_OPTIONS
      )
    }
    const metadata = await metadataLevel.get(`metadata_${key}`)
    return metadata?.value
  }

  public setMetadata = async (key: string, value: string) => {
    await this.initLevel()
    let metadataLevel = this.rootLevel.sublevel('_metadata', SUBLEVEL_OPTIONS)
    if (this.contentNamespace) {
      metadataLevel = metadataLevel.sublevel(
        this.contentNamespace,
        SUBLEVEL_OPTIONS
      )
    }
    return metadataLevel.put(`metadata_${key}`, { value })
  }

  public get = async <T extends object>(filepath: string): Promise<T> => {
    await this.initLevel()
    if (SYSTEM_FILES.includes(filepath)) {
      throw new Error(`Unexpected get for config file ${filepath}`)
    } else {
      let collection: Collection<true> | undefined
      let level = this.contentLevel
      if (this.appLevel) {
        collection = await this.collectionForPath(filepath)
        if (collection?.isDetached) {
          level = this.appLevel.sublevel(collection.name, SUBLEVEL_OPTIONS)
        }
      }
      const contentObject = await level
        .sublevel<string, Record<string, any>>(
          CONTENT_ROOT_PREFIX,
          SUBLEVEL_OPTIONS
        )
        .get(normalizePath(filepath))

      if (!contentObject) {
        throw new NotFoundError(`Unable to find record ${filepath}`)
      }
      return transformDocument(
        filepath,
        contentObject,
        await this.getSchema(this.contentLevel)
      )
    }
  }

  public addPendingDocument = async (
    filepath: string,
    data: { [key: string]: unknown }
  ) => {
    await this.initLevel()
    const dataFields = await this.formatBodyOnPayload(filepath, data)

    const collection = await this.collectionForPath(filepath)
    if (!collection) {
      throw new GraphQLError(`Unable to find collection for ${filepath}`)
    }

    const stringifiedFile = await this.stringifyFile(
      filepath,
      dataFields,
      collection
    )

    const indexDefinitions = await this.getIndexDefinitions(this.contentLevel)
    const collectionIndexDefinitions = indexDefinitions?.[collection.name]
    const normalizedPath = normalizePath(filepath)
    if (!collection?.isDetached) {
      if (this.bridge) {
        await this.bridge.put(normalizedPath, stringifiedFile)
      }

      try {
        await this.onPut(normalizedPath, stringifiedFile)
      } catch (e) {
        throw new GraphQLError(
          `Error running onPut hook for ${filepath}: ${e}`,
          null,
          null,
          null,
          null,
          e
        )
      }
    }

    let level = this.contentLevel
    if (collection?.isDetached) {
      level = this.appLevel.sublevel(collection.name, SUBLEVEL_OPTIONS)
    }
    const folderTreeBuilder = new FolderTreeBuilder()
    const folderKey = folderTreeBuilder.update(filepath, collection.path || '')

    let putOps: BatchOp[] = []
    let delOps: BatchOp[] = []
    if (!isGitKeep(normalizedPath, collection)) {
      putOps = [
        ...makeIndexOpsForDocument(
          normalizedPath,
          collection?.name,
          collectionIndexDefinitions,
          dataFields,
          'put',
          level
        ),
        // folder indices
        ...makeIndexOpsForDocument(
          normalizedPath,
          `${collection?.name}_${folderKey}`,
          collectionIndexDefinitions,
          dataFields,
          'put',
          level
        ),
      ]

      const existingItem = await level
        .sublevel<string, Record<string, any>>(
          CONTENT_ROOT_PREFIX,
          SUBLEVEL_OPTIONS
        )
        .get(normalizedPath)

      delOps = existingItem
        ? [
            ...makeIndexOpsForDocument(
              normalizedPath,
              collection?.name,
              collectionIndexDefinitions,
              existingItem,
              'del',
              level
            ),
            // folder indices
            ...makeIndexOpsForDocument(
              normalizedPath,
              `${collection?.name}_${folderKey}`,
              collectionIndexDefinitions,
              existingItem,
              'del',
              level
            ),
          ]
        : []
    }

    const ops: BatchOp[] = [
      ...delOps,
      ...putOps,
      {
        type: 'put',
        key: normalizedPath,
        value: dataFields,
        sublevel: level.sublevel<string, Record<string, any>>(
          CONTENT_ROOT_PREFIX,
          SUBLEVEL_OPTIONS
        ),
      },
    ]

    await level.batch(ops)
  }

  public put = async (
    filepath: string,
    data: { [key: string]: unknown },
    collectionName?: string
  ) => {
    await this.initLevel()

    try {
      if (SYSTEM_FILES.includes(filepath)) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error(`Unexpected put for config file ${filepath}`)
      } else {
        let collectionIndexDefinitions: Record<string, IndexDefinition>
        if (collectionName) {
          const indexDefinitions = await this.getIndexDefinitions(
            this.contentLevel
          )
          collectionIndexDefinitions = indexDefinitions?.[collectionName]
        }

        const normalizedPath = normalizePath(filepath)
        const dataFields = await this.formatBodyOnPayload(filepath, data)
        const collection = await this.collectionForPath(filepath)
        if (!collection) {
          // noinspection ExceptionCaughtLocallyJS
          throw new GraphQLError(`Unable to find collection for ${filepath}.`)
        }

        // If a collection match is specified, make sure the file matches the glob.
        // TODO: Maybe we should service this error better in the frontend?
        if (collection.match?.exclude || collection.match?.include) {
          const matches = this.tinaSchema.getMatches({ collection })

          const match = micromatch.isMatch(filepath, matches)

          if (!match) {
            // noinspection ExceptionCaughtLocallyJS
            throw new GraphQLError(
              `File ${filepath} does not match collection ${
                collection.name
              } glob ${matches.join(
                ','
              )}. Please change the filename or update matches for ${
                collection.name
              } in your config file.`
            )
          }
        }

        const stringifiedFile = filepath.endsWith(
          `.gitkeep.${collection.format || 'md'}`
        )
          ? ''
          : await this.stringifyFile(filepath, dataFields, collection)

        if (!collection?.isDetached) {
          if (this.bridge) {
            await this.bridge.put(normalizedPath, stringifiedFile)
          }
          try {
            await this.onPut(normalizedPath, stringifiedFile)
          } catch (e) {
            // noinspection ExceptionCaughtLocallyJS
            throw new GraphQLError(
              `Error running onPut hook for ${filepath}: ${e}`,
              null,
              null,
              null,
              null,
              e
            )
          }
        }

        const folderTreeBuilder = new FolderTreeBuilder()
        const folderKey = folderTreeBuilder.update(
          filepath,
          collection.path || ''
        )
        const level = collection?.isDetached
          ? this.appLevel.sublevel(collection?.name, SUBLEVEL_OPTIONS)
          : this.contentLevel

        let putOps: BatchOp[] = []
        let delOps: BatchOp[] = []
        if (!isGitKeep(normalizedPath, collection)) {
          putOps = [
            ...makeIndexOpsForDocument(
              normalizedPath,
              collectionName,
              collectionIndexDefinitions,
              dataFields,
              'put',
              level
            ),
            // folder indices
            ...makeIndexOpsForDocument(
              normalizedPath,
              `${collection?.name}_${folderKey}`,
              collectionIndexDefinitions,
              dataFields,
              'put',
              level
            ),
          ]

          const existingItem = await level
            .sublevel<string, Record<string, any>>(
              CONTENT_ROOT_PREFIX,
              SUBLEVEL_OPTIONS
            )
            .get(normalizedPath)

          delOps = existingItem
            ? [
                ...makeIndexOpsForDocument(
                  normalizedPath,
                  collectionName,
                  collectionIndexDefinitions,
                  existingItem,
                  'del',
                  level
                ),
                // folder indices
                ...makeIndexOpsForDocument(
                  normalizedPath,
                  `${collection?.name}_${folderKey}`,
                  collectionIndexDefinitions,
                  existingItem,
                  'del',
                  level
                ),
              ]
            : []
        }

        const ops: BatchOp[] = [
          ...delOps,
          ...putOps,
          {
            type: 'put',
            key: normalizedPath,
            value: dataFields,
            sublevel: level.sublevel<string, Record<string, any>>(
              CONTENT_ROOT_PREFIX,
              SUBLEVEL_OPTIONS
            ),
          },
        ]

        await level.batch(ops)
      }
      return true
    } catch (error) {
      if (error instanceof GraphQLError) {
        throw error
      }
      throw new TinaFetchError(`Error in PUT for ${filepath}`, {
        originalError: error,
        file: filepath,
        collection: collectionName,
        stack: error.stack,
      })
    }
  }

  public async getTemplateDetailsForFile(
    collection: Collection<true>,
    data: { [key: string]: unknown }
  ) {
    const tinaSchema = await this.getSchema()
    const templateInfo = await tinaSchema.getTemplatesForCollectable(collection)

    let template: Template | undefined
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

    return {
      template: template,
      info: templateInfo,
    }
  }

  public formatBodyOnPayload = async (
    filepath: string,
    data: { [key: string]: unknown }
  ) => {
    const collection = await this.collectionForPath(filepath)
    if (!collection) {
      throw new Error(`Unable to find collection for path ${filepath}`)
    }

    const { template } = await this.getTemplateDetailsForFile(collection, data)
    const bodyField = template.fields.find((field) => {
      if (field.type === 'string' || field.type === 'rich-text') {
        if (field.isBody) {
          return true
        }
      }
      return false
    })
    let payload: { [key: string]: unknown } = {}
    if (['md', 'mdx'].includes(collection.format) && bodyField) {
      Object.entries(data).forEach(([key, value]) => {
        if (key !== bodyField.name) {
          payload[key] = value
        }
      })
      payload['$_body'] = data[bodyField.name]
    } else {
      payload = data
    }

    return payload
  }

  public stringifyFile = async (
    filepath: string,
    payload: { [key: string]: unknown },
    collection: Collection<true>
  ) => {
    const templateDetails = await this.getTemplateDetailsForFile(
      collection,
      payload
    )
    const writeTemplateKey = templateDetails.info.type === 'union'

    const aliasedData = applyNameOverrides(templateDetails.template, payload)

    const extension = path.extname(filepath)
    return stringifyFile(
      aliasedData,
      extension,
      writeTemplateKey, //templateInfo.type === 'union',
      {
        frontmatterFormat: collection?.frontmatterFormat,
        frontmatterDelimiters: collection?.frontmatterDelimiters,
      }
    )
  }

  /**
   * Clears the internal cache of the tinaSchema and the lookup file. This allows the state to be reset
   */
  public clearCache() {
    this.tinaSchema = null
    this._lookup = null
    this.collectionIndexDefinitions = null
  }

  public flush = async (filepath: string) => {
    const data = await this.get<{ [key: string]: unknown }>(filepath)

    const dataFields = await this.formatBodyOnPayload(filepath, data)
    const collection = await this.collectionForPath(filepath)
    if (!collection) {
      throw new Error(`Unable to find collection for path ${filepath}`)
    }
    return this.stringifyFile(filepath, dataFields, collection)
  }

  public getLookup = async (
    returnType?: string
  ): Promise<LookupMapType | Record<string, LookupMapType>> => {
    await this.initLevel()
    const lookupPath = normalizePath(
      path.join(this.getGeneratedFolder(), `_lookup.json`)
    )
    if (!this._lookup) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this._lookup = await this.contentLevel
        .sublevel<string, Record<string, any>>(
          CONTENT_ROOT_PREFIX,
          SUBLEVEL_OPTIONS
        )
        .get(lookupPath)
    }
    return returnType ? this._lookup[returnType] : this._lookup
  }
  public getGraphQLSchema = async (): Promise<DocumentNode> => {
    await this.initLevel()
    const graphqlPath = normalizePath(
      path.join(this.getGeneratedFolder(), `_graphql.json`)
    )
    return (await this.contentLevel
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
  public getTinaSchema = async (level?: Level): Promise<Schema> => {
    await this.initLevel()
    const schemaPath = normalizePath(
      path.join(this.getGeneratedFolder(), `_schema.json`)
    )
    return (await (level || this.contentLevel)
      .sublevel<string, Record<string, any>>(
        CONTENT_ROOT_PREFIX,
        SUBLEVEL_OPTIONS
      )
      .get(schemaPath)) as unknown as Schema
  }

  public getSchema = async (level?: Level, existingSchema?: Schema) => {
    if (this.tinaSchema) {
      return this.tinaSchema
    }
    await this.initLevel()
    const schema =
      existingSchema || (await this.getTinaSchema(level || this.contentLevel))
    if (!schema) {
      throw new Error(
        `Unable to get schema from level db: ${normalizePath(
          path.join(this.getGeneratedFolder(), `_schema.json`)
        )}`
      )
    }
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
          const schema = await this.getSchema(level || this.contentLevel)
          const collections = schema.getCollections()
          for (const collection of collections) {
            const indexDefinitions = {
              [DEFAULT_COLLECTION_SORT_KEY]: { fields: [] }, // provide a default sort key which is the file sort
            }

            if (collection.fields) {
              for (const field of collection.fields as TinaField<true>[]) {
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
                      list: !!field.list,
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
                  fields: index.fields.map((indexField) => {
                    const field = (collection.fields as TinaField<true>[]).find(
                      (field) => indexField.name === field.name
                    )
                    return {
                      name: indexField.name,
                      type: field?.type,
                      list: !!field?.list,
                    }
                  }),
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
      filterChain: rawFilterChain,
      folder,
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
    const tinaSchema = await this.getSchema(this.contentLevel)
    const collection = tinaSchema.getCollection(queryOptions.collection)

    const allIndexDefinitions = await this.getIndexDefinitions(
      this.contentLevel
    )
    const indexDefinitions = allIndexDefinitions?.[collection.name]
    if (!indexDefinitions) {
      throw new Error(`No indexDefinitions for collection ${collection.name}`)
    }

    const filterChain = coerceFilterChainOperands(rawFilterChain)

    // Because we default to DEFAULT_COLLECTION_SORT_KEY, the only way this is
    // actually undefined is if the caller specified a non-existent sort key
    const indexDefinition = (sort && indexDefinitions?.[sort]) as
      | IndexDefinition
      | undefined
    const filterSuffixes =
      indexDefinition && makeFilterSuffixes(filterChain, indexDefinition)
    const level = collection?.isDetached
      ? this.appLevel.sublevel(collection?.name, SUBLEVEL_OPTIONS)
      : this.contentLevel
    const rootLevel = level.sublevel<string, Record<string, any>>(
      CONTENT_ROOT_PREFIX,
      SUBLEVEL_OPTIONS
    )
    const sublevel = indexDefinition
      ? level
          .sublevel(
            `${collection.name}${
              folder
                ? `_${folder === FOLDER_ROOT ? folder : sha.hex(folder)}`
                : ''
            }`,
            SUBLEVEL_OPTIONS
          )
          .sublevel(sort, SUBLEVEL_OPTIONS)
      : rootLevel

    if (!query.gt && !query.gte) {
      query.gte = filterSuffixes?.left ? filterSuffixes.left : ''
    }

    if (!query.lt && !query.lte) {
      query.lte = filterSuffixes?.right
        ? `${filterSuffixes.right}\uFFFF`
        : '\uFFFF'
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

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
      let itemRecord: Record<string, any>
      if (filterSuffixes) {
        itemRecord = matcher.groups
        // for index match fields, convert the array value from comma-separated string to array
        for (const field of indexDefinition.fields) {
          if (itemRecord[field.name]) {
            if (field.list) {
              itemRecord[field.name] = itemRecord[field.name].split(
                ARRAY_ITEM_VALUE_SEPARATOR
              )
            }
          }
        }
      } else {
        if (indexDefinition) {
          itemRecord = await rootLevel.get(filepath)
        } else {
          itemRecord = value
        }
      }
      if (!itemFilter(itemRecord)) {
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
          console.log(error)
          if (
            error instanceof Error &&
            (!edge.path.includes('.tina/__generated__/_graphql.json') ||
              !edge.path.includes('tina/__generated__/_graphql.json'))
          ) {
            throw new TinaQueryError({
              originalError: error,
              file: edge.path,
              collection: collection.name,
              stack: error.stack,
            })
          }
          // I dont think this should ever happen
          throw error
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
  private async indexStatusCallbackWrapper<T>(
    fn: () => Promise<T>,
    post?: () => Promise<void>
  ): Promise<T> {
    await this.indexStatusCallback({ status: 'inprogress' })
    try {
      const result = await fn()
      await this.indexStatusCallback({ status: 'complete' })
      if (post) {
        await post()
      }
      return result
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
    let nextLevel: Level | undefined
    return await this.indexStatusCallbackWrapper(
      async () => {
        let lookup
        try {
          lookup =
            lookupFromLockFile ||
            JSON.parse(
              await this.bridge.get(
                normalizePath(
                  path.join(this.getGeneratedFolder(), '_lookup.json')
                )
              )
            )
        } catch (error) {
          console.error('Error: Unable to find generated lookup file')
          if (this.tinaDirectory === 'tina') {
            console.error(
              'If you are using the .tina folder. Please set {tinaDirectory: ".tina"} in your createDatabase options or migrate to the new tina folder: https://tina.io/blog/tina-config-rearrangements/'
            )
          }
          throw error
        }

        let nextVersion: string | undefined
        if (!this.config.version) {
          await this.contentLevel.clear()
          nextLevel = this.contentLevel
        } else {
          const version = await this.getDatabaseVersion()
          nextVersion = version ? `${parseInt(version) + 1}` : '0'
          nextLevel = this.rootLevel.sublevel(nextVersion, SUBLEVEL_OPTIONS)
        }

        const contentRootLevel = nextLevel.sublevel<
          string,
          Record<string, any>
        >(CONTENT_ROOT_PREFIX, SUBLEVEL_OPTIONS)
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
        const result = await this._indexAllContent(
          nextLevel,
          tinaSchema.schema as any
        )
        if (this.config.version) {
          await this.updateDatabaseVersion(nextVersion)
        }
        return result
      },
      async () => {
        if (this.config.version) {
          if (this.contentLevel) {
            await this.contentLevel.clear()
          }
          this.contentLevel = nextLevel
        }
      }
    )
  }

  public deleteContentByPaths = async (documentPaths: string[]) => {
    await this.initLevel()
    const operations: DelOp[] = []
    const enqueueOps = async (ops: DelOp[]): Promise<void> => {
      operations.push(...ops)
      while (operations.length >= 25) {
        // make this an option
        await this.contentLevel.batch(operations.splice(0, 25))
      }
    }
    const tinaSchema = await this.getSchema(this.contentLevel)
    await this.indexStatusCallbackWrapper(async () => {
      const { pathsByCollection, nonCollectionPaths, collections } =
        await partitionPathsByCollection(tinaSchema, documentPaths)

      for (const collection of Object.keys(pathsByCollection)) {
        await _deleteIndexContent(
          this,
          pathsByCollection[collection],
          enqueueOps,
          collections[collection]
        )
      }

      if (nonCollectionPaths.length) {
        await _deleteIndexContent(this, nonCollectionPaths, enqueueOps, null)
      }
    })
    while (operations.length) {
      await this.contentLevel.batch(operations.splice(0, 25))
    }
  }

  public indexContentByPaths = async (documentPaths: string[]) => {
    await this.initLevel()
    const operations: BatchOp[] = []
    const enqueueOps = async (ops: BatchOp[]): Promise<void> => {
      operations.push(...ops)
      while (operations.length >= 25) {
        // make this an option
        await this.contentLevel.batch(operations.splice(0, 25))
      }
    }
    const tinaSchema = await this.getSchema(this.contentLevel)
    await this.indexStatusCallbackWrapper(async () => {
      await scanContentByPaths(
        tinaSchema,
        documentPaths,
        async (collection, documentPaths) => {
          if (collection && !collection.isDetached) {
            await _indexContent(
              this,
              this.contentLevel,
              documentPaths,
              enqueueOps,
              collection
            )
          }
        }
      )
    })
    while (operations.length) {
      await this.contentLevel.batch(operations.splice(0, 25))
    }
  }

  public delete = async (filepath: string) => {
    await this.initLevel()
    const collection = await this.collectionForPath(filepath)
    if (!collection) {
      throw new Error(`No collection found for path: ${filepath}`)
    }
    const indexDefinitions = await this.getIndexDefinitions(this.contentLevel)
    const collectionIndexDefinitions = indexDefinitions?.[collection.name]

    let level = this.contentLevel
    if (collection?.isDetached) {
      level = this.appLevel.sublevel(collection?.name, SUBLEVEL_OPTIONS)
    }
    const itemKey = normalizePath(filepath)
    const rootSublevel = level.sublevel<string, Record<string, any>>(
      CONTENT_ROOT_PREFIX,
      SUBLEVEL_OPTIONS
    )
    const item = await rootSublevel.get(itemKey)
    if (item) {
      const folderTreeBuilder = new FolderTreeBuilder()
      const folderKey = folderTreeBuilder.update(
        filepath,
        collection.path || ''
      )
      await this.contentLevel.batch([
        ...makeIndexOpsForDocument<Record<string, any>>(
          filepath,
          collection.name,
          collectionIndexDefinitions,
          item,
          'del',
          level
        ),
        // folder indices
        ...makeIndexOpsForDocument(
          filepath,
          `${collection.name}_${folderKey}`,
          collectionIndexDefinitions,
          item,
          'del',
          level
        ),
        {
          type: 'del',
          key: itemKey,
          sublevel: rootSublevel,
        },
      ])
    }

    if (!collection?.isDetached) {
      if (this.bridge) {
        await this.bridge.delete(normalizePath(filepath))
      }
      try {
        await this.onDelete(normalizePath(filepath))
      } catch (e) {
        throw new GraphQLError(
          `Error running onDelete hook for ${filepath}: ${e}`,
          null,
          null,
          null,
          null,
          e
        )
      }
    }
  }

  public _indexAllContent = async (level: Level, schema?: Schema) => {
    const tinaSchema = await this.getSchema(level, schema)
    const operations: PutOp[] = []
    const enqueueOps = async (ops: PutOp[]): Promise<void> => {
      operations.push(...ops)
      while (operations.length >= 25) {
        // make this an option
        const batchOps = operations.splice(0, 25)
        await level.batch(batchOps)
      }
    }
    const warnings = await scanAllContent(
      tinaSchema,
      this.bridge,
      async (collection, contentPaths) => {
        const userFields = mapUserFields(collection, [])
        if (collection.isDetached) {
          const level = this.appLevel.sublevel(
            collection.name,
            SUBLEVEL_OPTIONS
          )
          const doc = await level.keys({ limit: 1 }).next()
          if (!doc) {
            // initialize app data with content from filesystem
            await _indexContent(
              this,
              level,
              contentPaths,
              enqueueOps,
              collection,
              userFields.map((field) => [
                ...field.path,
                field.passwordFieldName,
              ])
            )
          }
        } else {
          await _indexContent(this, level, contentPaths, enqueueOps, collection)
        }
      }
    )

    while (operations.length) {
      await level.batch(operations.splice(0, 25))
    }
    return { warnings }
  }
}

export type LookupMapType =
  | GlobalDocumentLookup
  | CollectionDocumentLookup
  | CollectionFolderLookup
  | MultiCollectionDocumentLookup
  | MultiCollectionDocumentListLookup
  | CollectionDocumentListLookup
  | ReverseCollectionDocumentListLookup
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
type CollectionFolderLookup = {
  type: string
  resolveType: 'collectionFolder'
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
export type ReverseCollectionDocumentListLookup = {
  type: string
  resolveType: 'reverseCollectionDocumentList'
  collection: string
}

const hashPasswordVisitor = async (node: any, path: string[]) => {
  const passwordValuePath = [...path, 'value']
  const plaintextPassword = get(node, passwordValuePath)
  if (plaintextPassword) {
    set(
      node,
      passwordValuePath,
      await generatePasswordHash({ password: plaintextPassword })
    )
  }
}

const visitNodes = async (
  node: any,
  path: string[],
  callback: (node: any, path: string[]) => Promise<void> | void
) => {
  const [currentLevel, ...remainingLevels] = path
  if (!remainingLevels?.length) {
    return callback(node, path)
  }
  if (Array.isArray(node[currentLevel])) {
    for (const item of node[currentLevel]) {
      await visitNodes(item, remainingLevels, callback)
    }
  } else {
    await visitNodes(node[currentLevel], remainingLevels, callback)
  }
}

const hashPasswordValues = async (
  data: Record<string, any>,
  passwordFields: string[][]
) =>
  Promise.all(
    passwordFields.map(async (passwordField) =>
      visitNodes(data, passwordField, hashPasswordVisitor)
    )
  )

const isGitKeep = (filepath: string, collection?: Collection<true>) =>
  filepath.endsWith(`.gitkeep.${collection?.format || 'md'}`)

const _indexContent = async (
  database: Database,
  level: Level,
  documentPaths: string[],
  enqueueOps: (ops: BatchOp[]) => Promise<void>,
  collection?: Collection<true>,
  passwordFields?: string[][]
) => {
  let collectionIndexDefinitions: Record<string, IndexDefinition>
  let collectionPath: string | undefined
  if (collection) {
    const indexDefinitions = await database.getIndexDefinitions(level)
    collectionIndexDefinitions = indexDefinitions?.[collection.name]
    if (!collectionIndexDefinitions) {
      throw new Error(`No indexDefinitions for collection ${collection.name}`)
    }
    collectionPath = collection.path
  }

  const tinaSchema = await database.getSchema()
  let templateInfo: CollectionTemplateable | null = null
  if (collection) {
    templateInfo = tinaSchema.getTemplatesForCollectable(collection)
  }

  const folderTreeBuilder = new FolderTreeBuilder()
  await sequential(documentPaths, async (filepath) => {
    try {
      const aliasedData = await loadAndParseWithAliases(
        database.bridge,
        filepath,
        collection,
        templateInfo
      )

      // if we aren't able to load the data, we can't index it
      if (!aliasedData) {
        return
      }

      if (passwordFields?.length) {
        await hashPasswordValues(aliasedData, passwordFields)
      }

      const normalizedPath = normalizePath(filepath)
      const folderKey = folderTreeBuilder.update(
        normalizedPath,
        collectionPath || ''
      )

      if (!isGitKeep(filepath, collection)) {
        await enqueueOps([
          ...makeIndexOpsForDocument<Record<string, any>>(
            normalizedPath,
            collection?.name,
            collectionIndexDefinitions,
            aliasedData,
            'put',
            level
          ),
          // folder indexes
          ...makeIndexOpsForDocument<Record<string, any>>(
            normalizedPath,
            `${collection?.name}_${folderKey}`,
            collectionIndexDefinitions,
            aliasedData,
            'put',
            level
          ),
          {
            type: 'put',
            key: normalizedPath,
            value: aliasedData as any,
            sublevel: level.sublevel<string, Record<string, any>>(
              CONTENT_ROOT_PREFIX,
              SUBLEVEL_OPTIONS
            ),
          },
        ])
      }
    } catch (error) {
      throw new TinaFetchError(`Unable to seed ${filepath}`, {
        originalError: error,
        file: filepath,
        collection: collection?.name,
        stack: error.stack,
      })
    }
  })

  if (collection) {
    await enqueueOps(
      makeFolderOpsForCollection(
        folderTreeBuilder.tree,
        collection,
        collectionIndexDefinitions,
        'put',
        level
      )
    )
  }
}

const _deleteIndexContent = async (
  database: Database,
  documentPaths: string[],
  enqueueOps: (ops: BatchOp[]) => Promise<void>,
  collection?: Collection<true>
) => {
  if (!documentPaths.length) {
    return
  }

  let collectionIndexDefinitions: Record<string, IndexDefinition>
  if (collection) {
    const indexDefinitions = await database.getIndexDefinitions(
      database.contentLevel
    )
    collectionIndexDefinitions = indexDefinitions?.[collection.name]
    if (!collectionIndexDefinitions) {
      throw new Error(`No indexDefinitions for collection ${collection.name}`)
    }
  }

  const tinaSchema = await database.getSchema()
  let templateInfo: CollectionTemplateable | null = null
  if (collection) {
    templateInfo = tinaSchema.getTemplatesForCollectable(collection)
  }

  const rootLevel = database.contentLevel.sublevel<string, Record<string, any>>(
    CONTENT_ROOT_PREFIX,
    SUBLEVEL_OPTIONS
  )

  const folderTreeBuilder = new FolderTreeBuilder()
  await sequential(documentPaths, async (filepath) => {
    const itemKey = normalizePath(filepath)
    const item = await rootLevel.get(itemKey)
    if (item) {
      const folderKey = folderTreeBuilder.update(
        itemKey,
        collection?.path || ''
      )
      const aliasedData = templateInfo
        ? replaceNameOverrides(
            getTemplateForFile(templateInfo, item as any),
            item
          )
        : item
      await enqueueOps([
        ...makeIndexOpsForDocument(
          itemKey,
          collection.name,
          collectionIndexDefinitions,
          aliasedData,
          'del',
          database.contentLevel
        ),
        // folder indexes
        ...makeIndexOpsForDocument<Record<string, any>>(
          itemKey,
          `${collection?.name}_${folderKey}`,
          collectionIndexDefinitions,
          aliasedData,
          'del',
          database.contentLevel
        ),
        { type: 'del', key: itemKey, sublevel: rootLevel },
      ])
    }
  })
  if (collectionIndexDefinitions) {
    await enqueueOps(
      makeFolderOpsForCollection(
        folderTreeBuilder.tree,
        collection,
        collectionIndexDefinitions,
        'del',
        database.contentLevel
      )
    )
  }
}
