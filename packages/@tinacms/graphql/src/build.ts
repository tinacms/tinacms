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

import _ from 'lodash'
import fs from 'fs-extra'
import { print, OperationDefinitionNode, DocumentNode } from 'graphql'
import type { FragmentDefinitionNode, FieldDefinitionNode } from 'graphql'

import { astBuilder, NAMER } from './ast-builder'
import { sequential } from './util'
import { createBuilder } from './builder'
import { createSchema } from './schema'
import { extractInlineTypes } from './ast-builder'
import path from 'path'

import type { Builder } from './builder'
import type { TinaSchema } from './schema'
import { Database } from './database'

export const buildDotTinaFiles = async ({
  database,
  config,
  flags = [],
  buildSDK = true,
}: {
  database: Database
  config: TinaSchema['config']
  flags?: string[]
  buildSDK?: boolean
}) => {
  if (database.store.supportsIndexing()) {
    if (flags.indexOf('experimentalData') === -1) {
      flags.push('experimentalData')
    }
  }
  const tinaSchema = await createSchema({ schema: config, flags })
  const builder = await createBuilder({
    database,
    tinaSchema,
  })
  let graphQLSchema: DocumentNode
  if (database.bridge.supportsBuilding()) {
    graphQLSchema = await _buildSchema(builder, tinaSchema)
    await database.putConfigFiles({ graphQLSchema, tinaSchema })
  } else {
    graphQLSchema = JSON.parse(
      await database.bridge.get('.tina/__generated__/_graphql.json')
    )
  }
  if (buildSDK) {
    await _buildFragments(builder, tinaSchema, database.bridge.rootPath)
    await _buildQueries(builder, tinaSchema, database.bridge.rootPath)
  }
  return { graphQLSchema, tinaSchema }
}

const _buildFragments = async (
  builder: Builder,
  tinaSchema: TinaSchema,
  rootPath: string
) => {
  const fragmentDefinitionsFields: FragmentDefinitionNode[] = []
  const collections = tinaSchema.getCollections()

  await sequential(collections, async (collection) => {
    const frag = (await builder.collectionFragment(
      collection
    )) as FragmentDefinitionNode

    fragmentDefinitionsFields.push(frag)
  })

  const fragDoc = {
    kind: 'Document' as const,
    definitions: _.uniqBy(
      // @ts-ignore
      extractInlineTypes(fragmentDefinitionsFields),
      (node) => node.name.value
    ),
  }

  // TODO: These should possibly be outputted somewhere else?
  const fragPath = path.join(rootPath, '.tina', '__generated__')

  await fs.outputFile(path.join(fragPath, 'frags.gql'), print(fragDoc))
  // is the file bigger then 100kb?
  if (
    (await (await fs.stat(path.join(fragPath, 'frags.gql'))).size) >
    // convert to 100 kb to bytes
    100 * 1024
  ) {
    console.warn(
      'Warning: frags.gql is very large (>100kb). Consider setting the reference depth to 1 or 0. See code snippet below.'
    )
    console.log(
      `const schema = defineSchema({
        config: {
            client: {
                referenceDepth: 1,
            },
        }
        // ...
    })`
    )
  }
  //   await fs.outputFileSync(
  //     path.join(fragPath, 'frags.json'),
  //     JSON.stringify(fragDoc, null, 2)
  //   )
}

const _buildQueries = async (
  builder: Builder,
  tinaSchema: TinaSchema,
  rootPath: string
) => {
  const operationsDefinitions: OperationDefinitionNode[] = []

  const collections = tinaSchema.getCollections()

  await sequential(collections, async (collection) => {
    const queryName = NAMER.queryName(collection.namespace)
    const queryListName = NAMER.generateQueryListName(collection.namespace)

    const queryFilterTypeName = NAMER.dataFilterTypeName(collection.namespace)

    const fragName = NAMER.fragmentName(collection.namespace)

    operationsDefinitions.push(
      astBuilder.QueryOperationDefinition({ fragName, queryName })
    )

    operationsDefinitions.push(
      astBuilder.ListQueryOperationDefinition({
        fragName,
        queryName: queryListName,
        filterType: queryFilterTypeName,
        // look for flag to see if the data layer is enabled
        dataLayer: Boolean(
          tinaSchema.config?.meta?.flags?.find((x) => x === 'experimentalData')
        ),
      })
    )
  })

  const queryDoc = {
    kind: 'Document' as const,
    definitions: _.uniqBy(
      // @ts-ignore
      extractInlineTypes(operationsDefinitions),
      (node) => node.name.value
    ),
  }

  const fragPath = path.join(rootPath, '.tina', '__generated__')

  await fs.outputFile(path.join(fragPath, 'queries.gql'), print(queryDoc))
  // We dont this them for now
  // await fs.outputFileSync(
  //   path.join(fragPath, 'queries.json'),
  //   JSON.stringify(queryDoc, null, 2)
  // )
}

const _buildSchema = async (builder: Builder, tinaSchema: TinaSchema) => {
  /**
   * Definitions for the GraphQL AST
   */
  const definitions = []
  definitions.push(await builder.buildStaticDefinitions())
  const queryTypeDefinitionFields: FieldDefinitionNode[] = []
  const mutationTypeDefinitionFields: FieldDefinitionNode[] = []

  const collections = tinaSchema.getCollections()

  queryTypeDefinitionFields.push(
    astBuilder.FieldDefinition({
      name: 'getOptimizedQuery',
      args: [
        astBuilder.InputValueDefinition({
          name: 'queryString',
          type: astBuilder.TYPES.String,
          required: true,
        }),
      ],
      type: astBuilder.TYPES.String,
    })
  )
  /**
   * One-off collection queries
   */
  queryTypeDefinitionFields.push(
    await builder.buildCollectionDefinition(collections)
  )
  queryTypeDefinitionFields.push(
    await builder.buildMultiCollectionDefinition(collections)
  )
  /**
   * Multi-collection queries/mutation
   */
  queryTypeDefinitionFields.push(await builder.multiNodeDocument())
  queryTypeDefinitionFields.push(
    await builder.multiCollectionDocument(collections)
  )
  mutationTypeDefinitionFields.push(
    await builder.addMultiCollectionDocumentMutation()
  )
  mutationTypeDefinitionFields.push(
    await builder.buildUpdateCollectionDocumentMutation(collections)
  )
  mutationTypeDefinitionFields.push(
    await builder.buildDeleteCollectionDocumentMutation(collections)
  )
  mutationTypeDefinitionFields.push(
    await builder.buildCreateCollectionDocumentMutation(collections)
  )

  /**
   * Collection queries/mutations/fragments
   */
  await sequential(collections, async (collection) => {
    queryTypeDefinitionFields.push(await builder.collectionDocument(collection))

    mutationTypeDefinitionFields.push(
      await builder.updateCollectionDocumentMutation(collection)
    )
    mutationTypeDefinitionFields.push(
      await builder.createCollectionDocumentMutation(collection)
    )
    queryTypeDefinitionFields.push(
      await builder.collectionDocumentList(collection)
    )
  })

  definitions.push(
    astBuilder.ObjectTypeDefinition({
      name: 'Query',
      fields: queryTypeDefinitionFields,
    })
  )
  definitions.push(
    astBuilder.ObjectTypeDefinition({
      name: 'Mutation',
      fields: mutationTypeDefinitionFields,
    })
  )

  const doc = {
    kind: 'Document' as const,
    definitions: _.uniqBy(
      // @ts-ignore
      extractInlineTypes(definitions),
      (node) => node.name.value
    ),
  }

  return doc
}
