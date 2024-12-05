/**

*/

import { print, type OperationDefinitionNode } from 'graphql'
import type {
  TinaSchema,
  Config,
  Collection,
  TinaField,
} from '@tinacms/schema-tools'
import type { FragmentDefinitionNode, FieldDefinitionNode } from 'graphql'
import uniqBy from 'lodash.uniqby'

import { astBuilder, NAMER } from './ast-builder'
import { sequential } from './util'
import { createBuilder } from './builder'
import { createSchema } from './schema/createSchema'
import { extractInlineTypes } from './ast-builder'

import type { Builder } from './builder'

export const buildDotTinaFiles = async ({
  config,
  flags = [],
  buildSDK = true,
}: {
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
    tinaSchema,
  })
  const graphQLSchema = await _buildSchema(builder, tinaSchema)
  let fragDoc = ''
  let queryDoc = ''
  if (buildSDK) {
    fragDoc = await _buildFragments(builder, tinaSchema)
    queryDoc = await _buildQueries(builder, tinaSchema)
  }
  return {
    graphQLSchema,
    tinaSchema,
    lookup: builder.lookupMap,
    fragDoc,
    queryDoc,
  }
}

const _buildFragments = async (builder: Builder, tinaSchema: TinaSchema) => {
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
    definitions: uniqBy(
      // @ts-ignore
      extractInlineTypes(fragmentDefinitionsFields),
      (node) => node.name.value
    ),
  }

  return print(fragDoc)
}

const _buildQueries = async (builder: Builder, tinaSchema: TinaSchema) => {
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
    definitions: uniqBy(
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
  definitions.push(builder.buildStaticDefinitions())
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
  mutationTypeDefinitionFields.push(
    await builder.buildCreateCollectionFolderMutation()
  )

  /**
   * Collection queries/mutations/fragments
   */
  await sequential(collections, async (collection) => {
    queryTypeDefinitionFields.push(await builder.collectionDocument(collection))

    if (collection.isAuthCollection) {
      queryTypeDefinitionFields.push(
        await builder.authenticationCollectionDocument(collection)
      )
      queryTypeDefinitionFields.push(
        await builder.authorizationCollectionDocument(collection)
      )
      mutationTypeDefinitionFields.push(
        await builder.updatePasswordMutation(collection)
      )
    }

    mutationTypeDefinitionFields.push(
      await builder.updateCollectionDocumentMutation(collection)
    )
    mutationTypeDefinitionFields.push(
      await builder.createCollectionDocumentMutation(collection)
    )
    queryTypeDefinitionFields.push(
      await builder.collectionDocumentList(collection)
    )
    if (collectionHasReferenceFields(collection)) {
      queryTypeDefinitionFields.push(
        await builder.reverseCollectionDocumentList(collection)
      )
    }
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

  return {
    kind: 'Document' as const,
    definitions: uniqBy(
      // @ts-ignore
      extractInlineTypes(definitions),
      (node) => node.name.value
    ),
  }
}

function collectionHasReferenceFields(collection: Collection<true>) {
  if (!collection.fields) {
    return false
  }
  for (const field of collection.fields) {
    if (field.type === 'reference') {
      return true
    } else if (field.type === 'object') {
      if (fieldHasReferenceFields(field)) {
        return true
      }
    }
  }
  return false
}

function fieldHasReferenceFields(field: TinaField) {
  if (field.type === 'object' && field.fields) {
    for (const subField of field.fields) {
      if (subField.type === 'reference') {
        return true
      } else if (subField.type === 'object') {
        if (fieldHasReferenceFields(subField)) {
          return true
        }
      }
    }
  }

  return false
}
