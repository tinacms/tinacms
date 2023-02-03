/**

*/

import fs from 'fs-extra'
import path from 'path'
import { buildASTSchema } from 'graphql'

import type {
  TinaCloudSchema as TinaCloudSchemaBase,
  TinaCloudCollection as TinaCloudCollectionBase,
  TinaCloudTemplateBase as TinaTemplate,
  TinaFieldBase,
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

export { sequential, assertShape } from './util'
export { stringifyFile, parseFile } from './database/util'
export { createSchema } from './schema/createSchema'
export { buildDotTinaFiles }

export type DummyType = unknown

export const buildSchema = async (
  rootPath: string,
  database: Database,
  flags?: string[]
) => {
  const tempConfig = path.join(rootPath, '.tina', '__generated__', 'config')
  const config = await fs
    .readFileSync(path.join(tempConfig, 'schema.json'))
    .toString()
  await fs.remove(tempConfig)

  // only build the files, do not index
  const { graphQLSchema, tinaSchema } = await buildDotTinaFiles({
    database,
    config: JSON.parse(config),
    flags,
  })

  return { graphQLSchema, tinaSchema }
}

export const getASTSchema = async (database: Database) => {
  const gqlAst = await database.getGraphQLSchemaFromBridge()
  return buildASTSchema(gqlAst)
}

export type TinaCloudSchema = TinaCloudSchemaBase<false>
// Alias to remove Cloud
export type TinaSchema = TinaCloudSchema
export type TinaCloudCollection = TinaCloudCollectionBase<false>
// Alias to remove Cloud
export type TinaCollection = TinaCloudCollectionBase<false>
export type TinaField = TinaFieldBase
export type { TinaTemplate }

// Bridge exports
export {
  FilesystemBridge,
  AuditFileSystemBridge,
} from './database/bridge/filesystem'
export { IsomorphicBridge } from './database/bridge/isomorphic'
export type { Bridge } from './database/bridge'
