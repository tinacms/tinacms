import type {
  Schema,
  Collection,
  Template as TinaTemplate,
} from '@tinacms/schema-tools'

import { buildDotTinaFiles } from './build'
export { resolve } from './resolve'
export { transformDocumentIntoPayload } from './resolver'
export * from './resolver/error'
export { TinaLevelClient } from './level/tinaLevel'
export type { Level } from './database/level'
export type {
  QueryOptions,
  OnDeleteCallback,
  OnPutCallback,
  DatabaseArgs,
  GitProvider,
  CreateDatabase,
} from './database'
export {
  Database,
  createDatabaseInternal,
  createDatabase,
  createLocalDatabase,
} from './database'
import type { Config } from '@tinacms/schema-tools'
export { getChangedFiles, getSha, shaExists } from './git'
export * from './auth/utils'

export { sequential, assertShape } from './util'
export {
  loadAndParseWithAliases,
  bridgeDataLoader,
  csvDataLoader,
  stringifyFile,
  parseFile,
  scanAllContent,
  scanContentByPaths,
  transformDocument,
} from './database/util'
export { createSchema } from './schema/createSchema'
export { buildDotTinaFiles }

export type DummyType = unknown

// TODO: Can we just remove this or rename buildDotFiles. Having a wrapper function is confusing.
export const buildSchema = async (config: Config, flags?: string[]) => {
  return buildDotTinaFiles({
    config,
    flags,
  })
}

export type TinaSchema = Schema
export type { TinaTemplate, Schema, Collection }

// Bridge exports
export {
  FilesystemBridge,
  AuditFileSystemBridge,
} from './database/bridge/filesystem'
export { IsomorphicBridge } from './database/bridge/isomorphic'
export type { Bridge } from './database/bridge'
