/**

*/

import _ from 'lodash'
import fs from 'fs-extra'
import { print, OperationDefinitionNode, DocumentNode } from 'graphql'
import { TinaSchema, Config } from '@tinacms/schema-tools'
import type { FragmentDefinitionNode, FieldDefinitionNode } from 'graphql'

import { astBuilder, NAMER } from './ast-builder'
import { sequential } from './util'
import { createBuilder } from './builder'
import { createSchema } from './schema/createSchema'
import { extractInlineTypes } from './ast-builder'
import path from 'path'

import type { Builder } from './builder'
import { Database } from './database'

export const buildDotTinaFiles = async ({
  database,
  config,
  flags = [],
  buildSDK = true,
}: {
  database: Database
  config: Config
  flags?: string[]
  buildSDK?: boolean
}) => {
  if (flags.indexOf('experimentalData') === -1) {
    flags.push('experimentalData')
  }
  const { schema } = config
  const tinaSchema = await createSchema({
    schema: { ...schema, config },
    flags,
  })
  const builder = await createBuilder({
    database,
    tinaSchema,
  })
  let graphQLSchema: DocumentNode
  if (database.bridge.supportsBuilding()) {
    graphQLSchema = await _buildSchema(builder, tinaSchema)
    await database.putConfigFiles({ graphQLSchema, tinaSchema })
  } else {
    // TODO: Does this need to be updated to support the recent
    // change from the `.tina` folder to the new `tina` folder?
    graphQLSchema = JSON.parse(
      await database.bridge.get('.tina/__generated__/_graphql.json')
    )
  }
  let fragDoc = ''
  let queryDoc = ''
  if (buildSDK) {
    fragDoc = await _buildFragments(
      builder,
      tinaSchema,
      database.bridge.rootPath
    )
    queryDoc = await _buildQueries(
      builder,
      tinaSchema,
      database.bridge.rootPath
    )
  }
  return { graphQLSchema, tinaSchema, fragDoc, queryDoc }
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

  return print(fragDoc)
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

  return print(queryDoc)
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
