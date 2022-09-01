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
import { resolve } from '../resolve'
import { buildASTSchema, printSchema } from 'graphql'
import { toMatchFile } from 'jest-file-snapshot'
import { createDatabase } from '../database'
import { Database } from '../database'
import { FilesystemBridge } from '@tinacms/datalayer'

import type { Store } from '@tinacms/datalayer'
import type { TinaCloudSchema } from '../types'
import { sequential } from '../util'
import { buildDotTinaFiles } from '../build'

class MockFilesystemBridge extends FilesystemBridge {
  constructor(rootPath: string) {
    super(rootPath)
  }
  async put(filepath: string, data: string) {
    // noop
  }
}

// FIXME: CI for macos runs very slow
jest.setTimeout(10000)

export const setup = async (
  rootPath: string,
  schema: TinaCloudSchema<false>,
  store: Store
): Promise<{
  database: Database
}> => {
  const setupBridge = new FilesystemBridge(rootPath)
  const setupDatabase = await createDatabase({
    bridge: setupBridge,
    store,
  })
  const { graphQLSchema, tinaSchema } = await buildDotTinaFiles({
    database: setupDatabase,
    config: schema,
  })
  await setupDatabase.indexContent({ graphQLSchema, tinaSchema })

  const bridge = new MockFilesystemBridge(rootPath)
  const database = await createDatabase({
    // @ts-ignore
    bridge,
    store,
  })
  const schemaString = await database.getGraphQLSchemaFromBridge()
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
  suffix?: string,
  queryName: string = '_query',
  folder: string = 'requests'
) => {
  const { database } = await setup(rootPath, schema, store)
  const basePath = path.join(rootPath, folder, fixture.name)

  const query = await fs
    .readFileSync(
      path.join(basePath, `${queryName}.${suffix ? `${suffix}.` : ''}gql`)
    )
    .toString()
  let variables = {}
  try {
    variables = JSON.parse(
      await fs.readFileSync(path.join(basePath, '_variables.json')).toString()
    )
  } catch (e) {}

  const response = await resolve({
    query,
    variables,
    database,
  })
  const responseString =
    fixture.assert === 'file'
      ? // @ts-ignore
        await database.flush(fixture.filename)
      : `${JSON.stringify(response, null, 2)}\n`

  const responses = [responseString]
  const expectedResponsePaths = [
    path.join(
      basePath,
      fixture.assert === 'file' ? '_response.md' : '_response.json'
    ),
  ]

  const directoryItems = await fs.readdir(
    path.join(rootPath, folder, fixture.name)
  )

  const mutations = directoryItems
    .filter((item) => item.includes('mutation'))
    .map((name) => name.split('.')[0])

  await sequential(mutations, async (mutationName) => {
    const mutationCount = mutationName.split('-')[0]
    const mutationString = await fs
      .readFileSync(path.join(basePath, `${mutationName}.${suffix}.gql`))
      .toString()
    let variables = {}
    try {
      variables = await fs.readFileSync(
        path.join(basePath, `${mutationCount}-variables.json`)
      )
    } catch (e) {
      // no variables provided
    }
    await resolve({
      query: mutationString,
      variables,
      database,
    })

    // FIXME: update builder so that "required"
    // mutations actually get required in the
    // mutation params schema
    // if (mutationResponse.errors?.length > 0) {
    //   console.log('nononon')
    // }

    const response = await resolve({
      query,
      variables,
      database,
    })
    // console.log(JSON.stringify(response, null, 2))
    const responseString =
      fixture.assert === 'file'
        ? // @ts-ignore
          await database.flush(fixture.filename)
        : `${JSON.stringify(response, null, 2)}\n`

    responses.push(responseString)
    expectedResponsePaths.push(
      path.join(
        basePath,
        `${mutationCount}-response.${fixture.assert === 'file' ? 'md' : 'json'}`
      )
    )
  })

  return {
    responses,
    expectedResponsePaths,
  }
}

export const setupFixture2 = async (
  rootPath: string,
  schema: TinaCloudSchema<false>,
  store: Store,
  fixture: Fixture,
  suffix?: string,
  queryName: string = '_query',
  folder: string = 'requests'
) => {
  const { database } = await setup(rootPath, schema, store)
  const basePath = path.join(rootPath, folder, fixture.name)

  const query = await fs
    .readFileSync(
      path.join(basePath, `${queryName}.${suffix ? `${suffix}.` : ''}gql`)
    )
    .toString()
  let variables = {}
  try {
    variables = JSON.parse(
      await fs.readFileSync(path.join(basePath, '_variables.json')).toString()
    )
  } catch (e) {}

  const response = await resolve({
    query,
    variables,
    database,
  })
  const responseString =
    fixture.assert === 'file'
      ? // @ts-ignore
        await database.flush(fixture.filename)
      : `${JSON.stringify(response, null, 2)}\n`

  const responses = [responseString]
  const expectedResponsePaths = [
    path.join(
      basePath,
      fixture.assert === 'file' ? '_response.md' : '_response.json'
    ),
  ]

  return {
    responses,
    expectedResponsePaths,
  }
}
