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

import { indexDB } from '../build'
import { resolve } from '../resolve'
import fs from 'fs-extra'
import { buildASTSchema, printSchema, print, parse } from 'graphql'
import path from 'path'
import fg from 'fast-glob'

import type { TinaCloudSchema } from '../types'
import { createDatabase } from '../database'
import { Database } from '../database'
import { Bridge } from '../database/bridge'
import { sequential } from '../util'

export class InMemoryBridge implements Bridge {
  public rootPath: string
  private mockFileSystem: { [filepath: string]: string } | undefined
  constructor(rootPath: string) {
    this.rootPath = rootPath
  }
  public glob = async (pattern: string) => {
    const items = await fg(path.join(this.rootPath, pattern, '**/*'), {
      dot: true,
    })
    return items.map((item) => {
      return item.replace(this.rootPath, '')
    })
  }
  public get = async (filepath: string) => {
    const mockData = await this.getMockData()
    const value = mockData[filepath]
    if (!value) {
      throw new Error(`Unable to find record for ${filepath}`)
    }
    return value
  }
  public put = async (filepath: string, data: string) => {
    const mockData = await this.getMockData()
    this.mockFileSystem = { ...mockData, [filepath]: data }
  }

  public getMockData = async () => {
    if (!this.mockFileSystem) {
      const files = await this.glob('content')
      const mockFileSystem: { [filename: string]: string } = {}
      await sequential(files, async (file) => {
        const data = await fs
          .readFileSync(path.join(this.rootPath, file))
          .toString()
        mockFileSystem[file] = data
        return true
      })
      this.mockFileSystem = mockFileSystem
    }
    return this.mockFileSystem
  }
}

export const setup = async (
  rootPath: string,
  schema: TinaCloudSchema<false>,
  updateSnapshot?: boolean
): Promise<{
  database: Database
  schemaString: string
  expectedSchemaString: string
}> => {
  const bridge = new InMemoryBridge(rootPath)
  await bridge.getMockData()
  const database = await createDatabase({
    rootPath,
    bridge,
  })
  await indexDB({ database, config: schema })
  const schemaString = await database.getGraphQLSchema()
  // @ts-ignore
  const graphQLSchemaString = printSchema(buildASTSchema(schemaString))
  await fs.outputFileSync(
    path.join(rootPath, '.tina', '__generated__', 'schema.gql'),
    graphQLSchemaString
  )

  return {
    database,
    schemaString: 'hi',
    expectedSchemaString: 'hi',
    // schemaString: formattedSchemaString,
    // expectedSchemaString,
  }
}

export const setupFixture = async (
  rootPath: string,
  schema: TinaCloudSchema<false>,
  fixture: string
) => {
  const { database } = await setup(rootPath, schema)
  const request = await fs
    .readFileSync(path.join(rootPath, 'requests', fixture, 'request.gql'))
    .toString()
  const expectedReponse = await fs
    .readFileSync(path.join(rootPath, 'requests', fixture, 'response.json'))
    .toString()

  const response = await resolve({
    query: request,
    variables: {},
    database,
  })
  if (response.errors) {
    // console.log(response.errors)
  }

  const mutations = await Promise.all(
    Object.entries(JSON.parse(JSON.stringify(response?.data || {})))
      .map(async ([queryName, result]) => {
        const mutationPath = path.join(
          rootPath,
          'requests',
          fixture,
          'mutations',
          queryName,
          'request.gql'
        )
        if (fs.existsSync(mutationPath)) {
          const request = await fs.readFileSync(mutationPath).toString()
          // console.log(result.form.mutationInfo.string)
          // console.log(request)
          return {
            // @ts-ignore
            mutation: print(parse(result.form.mutationInfo.string)),
            expectedMutation: print(parse(request)),
          }
        } else {
          return false
        }
      })
      .filter(Boolean)
  )

  return {
    response,
    expectedReponse,
    mutations,
  }
}
