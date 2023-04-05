import { buildASTSchema } from 'graphql'

import type {
  Schema,
  Collection,
  Template as TinaTemplate,
} from '@tinacms/schema-tools'

import { buildDotTinaFiles } from './build'
export { resolve } from './resolve'
export * from './resolver/error'
export { createDatabase } from './database'
export { TinaLevelClient } from './level/tinaLevel'
export type {
  QueryOptions,
  Database,
  OnDeleteCallback,
  OnPutCallback,
  CreateDatabase,
} from './database'
import type { Database } from './database'
import type { Config } from '@tinacms/schema-tools'

export { sequential, assertShape } from './util'
export { stringifyFile, parseFile } from './database/util'
export { createSchema } from './schema/createSchema'
export { buildDotTinaFiles }

export type DummyType = unknown

export const buildSchema = async (
  database: Database,
  config: Config,
  flags?: string[]
) => {
  return buildDotTinaFiles({
    database,
    config: config,
    flags,
  })
}

export const getASTSchema = async (database: Database) => {
  const gqlAst = await database.getGraphQLSchemaFromBridge()
  return buildASTSchema(gqlAst)
}

export type TinaSchema = Schema
export type { TinaTemplate, Schema, Collection }

// Bridge exports
export {
  FilesystemBridge,
  AuditFileSystemBridge,
} from './database/bridge/filesystem'
export { GithubBridge } from './database/bridge/github'
export { IsomorphicBridge } from './database/bridge/isomorphic'
export type { Bridge } from './database/bridge'
