/**

*/

import { GraphQLSchema, parse, printSchema } from 'graphql'

import { AddGeneratedClient } from './plugin'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { codegen } from '@graphql-codegen/core'
// See https://www.graphql-tools.com/docs/documents-loading for more examples of the `load documents function`
import { loadDocuments } from '@graphql-tools/load'
import { plugin as typescriptOperationsPlugin } from '@graphql-codegen/typescript-operations'
import { plugin as typescriptPlugin } from '@graphql-codegen/typescript'
// Docs: https://www.graphql-code-generator.com/docs/plugins/typescript-generic-sdk
import { plugin as typescriptSdkPlugin } from './sdkPlugin'

export const generateTypes = async (
  schema: GraphQLSchema,
  queryPathGlob = process.cwd(),
  fragDocPath = process.cwd(),
  apiURL: string
) => {
  let docs = []
  let fragDocs = []

  docs = await loadGraphQLDocuments(queryPathGlob)
  fragDocs = await loadGraphQLDocuments(fragDocPath)

  // See https://www.graphql-code-generator.com/docs/getting-started/programmatic-usage for more details
  const res = await codegen({
    // Filename is not used. This is because the typescript plugin returns a string instead of writing to a file.
    filename: process.cwd(),
    schema: parse(printSchema(schema)),
    documents: [...docs, ...fragDocs],
    config: {},
    plugins: [
      { typescript: {} },
      { typescriptOperations: {} },
      {
        typescriptSdk: {},
      },
      { AddGeneratedClient: {} },
    ],
    pluginMap: {
      typescript: {
        plugin: typescriptPlugin,
      },
      typescriptOperations: {
        plugin: typescriptOperationsPlugin,
      },
      typescriptSdk: {
        plugin: typescriptSdkPlugin,
      },
      AddGeneratedClient: AddGeneratedClient(apiURL),
    },
  })
  return res
}

const loadGraphQLDocuments = async (globPath: string) => {
  let result = []
  try {
    result = await loadDocuments(globPath, {
      loaders: [new GraphQLFileLoader()],
    })
  } catch (e) {
    if (
      // https://www.graphql-tools.com/docs/documents-loading#no-files-found
      (e.message || '').includes(
        'Unable to find any GraphQL type definitions for the following pointers:'
      )
    ) {
      // don't blow up if folder doesn't exist
    } else {
      throw e
    }
  }
  return result
}
