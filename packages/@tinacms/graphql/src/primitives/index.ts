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
import { GithubBridge } from './database/github'
import { createDatabase } from './database'

export { createDatabase, resolve, indexDB }
export type { TinaCloudSchema } from './types'

export const gql = async ({
  rootPath,
  query,
  variables,
}: {
  rootPath: string
  query: string
  variables: object
}) => {
  const database = await createDatabase({
    rootPath,
  })

  return resolve({
    database,
    query,
    variables,
  })
}

export const githubRoute = async ({
  rootPath = '',
  query,
  variables,
  branch,
  ...githubArgs
}: {
  accessToken: string
  owner: string
  repo: string
  query: string
  variables: object
  rootPath?: string
  branch: string
}) => {
  const gh = new GithubBridge({
    rootPath,
    ref: branch,
    ...githubArgs,
  })
  const database = await createDatabase({
    bridge: gh,
  })
  return resolve({
    database,
    query,
    variables,
  })
}

export const buildSchema = async (rootPath: string) => {
  const config = await fs
    .readFileSync(
      path.join(rootPath, '.tina', '__generated__', 'config', 'schema.json')
    )
    .toString()
  const database = await createDatabase({
    rootPath,
  })

  await indexDB({ database, config: JSON.parse(config) })
  const gqlAst = await database.getGraphQLSchema()
  return buildASTSchema(gqlAst)
}
