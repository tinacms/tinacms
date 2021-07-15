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

import { parse, printSchema, GraphQLSchema } from 'graphql'
import { codegen } from '@graphql-codegen/core'
import { plugin as typescriptPlugin } from '@graphql-codegen/typescript'
import { plugin as typescriptOperationsPlugin } from '@graphql-codegen/typescript-operations'
import { logger } from '../logger'

export const generateTypes = async (schema: GraphQLSchema) => {
  logger.info('Generating types...')
  try {
    const res = await codegen({
      filename: process.cwd() + '/.forestry/autoschema.gql',
      schema: parse(printSchema(schema)),
      documents: [],
      config: {},
      plugins: [{ typescript: {} }, { typescriptOperations: {} }],
      pluginMap: {
        typescript: {
          plugin: typescriptPlugin,
        },
        typescriptOperations: {
          plugin: typescriptOperationsPlugin,
        },
      },
    })
    return res
  } catch (e) {
    console.error(e)
  }
}
