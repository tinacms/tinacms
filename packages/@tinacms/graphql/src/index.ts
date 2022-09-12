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

import fs from 'fs-extra'
import path from 'path'
import { buildASTSchema } from 'graphql'
import { buildDotTinaFiles } from './build'
export { resolve } from './resolve'
export * from './resolver/error'
export { createDatabase } from './database'
export type { QueryOptions } from './database'
import type { Database } from './database'
export type { Database } from './database'
export type { Store } from '@tinacms/datalayer'
export type { Bridge } from './database/bridge'
export { sequential, assertShape } from './util'
export { stringifyFile, parseFile } from './database/util'
export { createSchema } from './schema'
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
  await fs.rm(tempConfig, { recursive: true })

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

import type {
  TinaCloudSchema as TinaCloudSchemaBase,
  TinaCloudCollection as TinaCloudCollectionBase,
  TinaCloudTemplateBase as TinaTemplate,
  TinaFieldBase,
} from './types'

export type TinaCloudSchema = TinaCloudSchemaBase<false>
// Alias to remove Cloud
export type TinaSchema = TinaCloudSchema
export type TinaCloudCollection = TinaCloudCollectionBase<false>
// Alias to remove Cloud
export type TinaCollection = TinaCloudCollectionBase<false>
export type TinaField = TinaFieldBase
export type { TinaTemplate }
