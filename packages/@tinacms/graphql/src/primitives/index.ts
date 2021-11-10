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
import { indexDB } from './build'
import { resolve } from './resolve'
import { buildASTSchema } from 'graphql'
import { GithubBridge } from './database/bridge/github'
import { GithubStore } from './database/store/github'
import { FilesystemBridge } from './database/bridge/filesystem'
import { FilesystemStore } from './database/store/filesystem'
import { createDatabase, Database } from './database'

export { GithubBridge, GithubStore, FilesystemBridge, FilesystemStore }

export { createDatabase, resolve, indexDB }
export type { TinaCloudSchema } from './types'

export const buildSchema = async (
  rootPath: string,
  database: Database,
  experimentalData?: boolean
) => {
  const config = await fs
    .readFileSync(
      path.join(rootPath, '.tina', '__generated__', 'config', 'schema.json')
    )
    .toString()
  await indexDB({ database, config: JSON.parse(config), experimentalData })
  const gqlAst = await database.getGraphQLSchema()
  return buildASTSchema(gqlAst)
}
