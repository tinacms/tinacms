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
import fs from 'fs-extra'
import { indexDB } from '../build'
import { resolve } from '../resolve'
import { buildASTSchema, printSchema } from 'graphql'
import { toMatchFile } from 'jest-file-snapshot'
import { createDatabase } from '../database'
import { Database } from '../database'
import { FilesystemBridge } from '../database/bridge/filesystem'

import type { Store } from '../database/store'
import type { TinaCloudSchema } from '../types'

export const setup = async (
  rootPath: string,
  schema: TinaCloudSchema<false>,
  store: Store
): Promise<{
  database: Database
}> => {
  const bridge = new FilesystemBridge(rootPath)
  const database = await createDatabase({
    bridge,
    store,
  })
  await indexDB({
    database,
    config: schema,
    experimentalData: store.supportsIndexing(),
  })
  const schemaString = await database.getGraphQLSchema()
  // @ts-ignore
  const graphQLSchemaString = printSchema(buildASTSchema(schemaString))
  await fs.outputFileSync(
    path.join(rootPath, '.tina', '__generated__', 'schema.gql'),
    graphQLSchemaString
  )

  return {
    database,
  }
}

expect.extend({ toMatchFile })

export const print = (fixture: Fixture) => {
  return `${fixture.description || fixture.name} ${
    fixture.expectError ? 'fails' : 'succeeds'
  }`
}

export type Fixture =
  | {
      description?: string
      name: string
      assert: 'output'
      message?: string
      expectError?: boolean
    }
  | {
      description?: string
      name: string
      assert: 'file'
      filename: string
      message?: string
      expectError?: boolean
    }

export const setupFixture = async (
  rootPath: string,
  schema: TinaCloudSchema<false>,
  store: Store,
  fixture: Fixture,
  suffix?: string
) => {
  const { database } = await setup(rootPath, schema, store)
  const request = await fs
    .readFileSync(
      path.join(
        rootPath,
        'requests',
        fixture.name,
        `request.${suffix ? `${suffix}.` : ''}gql`
      )
    )
    .toString()

  let variables = {}
  try {
    variables = JSON.parse(
      await fs
        .readFileSync(
          path.join(rootPath, 'requests', fixture.name, 'variables.json')
        )
        .toString()
    )
  } catch (e) {}
  const expectedResponsePath = await path.join(
    rootPath,
    'requests',
    fixture.name,
    fixture.assert === 'file' ? 'response.md' : 'response.json'
  )

  const response = await resolve({
    query: request,
    variables,
    database,
  })

  const responseString =
    fixture.assert === 'file'
      ? // @ts-ignore
        await database.store.flush(fixture.filename)
      : `${JSON.stringify(response, null, 2)}\n`

  return {
    response: responseString,
    expectedResponsePath,
  }
}
