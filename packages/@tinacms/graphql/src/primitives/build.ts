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
import { print } from 'graphql'
import type { FragmentDefinitionNode } from 'graphql'

import { astBuilder } from './ast-builder'
import { sequential } from './util'
import { createBuilder } from './builder'
import { createSchema } from './schema'
import { extractInlineTypes } from './ast-builder'

import type { FieldDefinitionNode } from 'graphql'
import type { Builder } from './builder'
import type { TinaSchema } from './schema'
import { buildSKD } from '../sdkBuilder'

// @ts-ignore: FIXME: check that cloud schema is what it says it is
export const indexDB = async ({ database, config }) => {
  const tinaSchema = await createSchema({ schema: config })
  const builder = await createBuilder({ database, tinaSchema })
  const graphQLSchema = await _buildSchema(builder, tinaSchema)
  await database.put('_graphql', graphQLSchema)
  await database.put('_schema', tinaSchema.schema)
}

const _buildSchema = async (builder: Builder, tinaSchema: TinaSchema) => {
  /**
   * Definitions for the GraphQL AST
   */
  const definitions = []
  definitions.push(await builder.buildStaticDefinitions())
  const queryTypeDefinitionFields: FieldDefinitionNode[] = []
  const fragmentDefinitionsFields: FragmentDefinitionNode[] = []
  const mutationTypeDefinitionFields: FieldDefinitionNode[] = []

  const collections = tinaSchema.getCollections()

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
    await builder.buildCreateCollectionDocumentMutation(collections)
  )
  queryTypeDefinitionFields.push(
    await builder.multiCollectionDocumentList(collections)
  )
  queryTypeDefinitionFields.push(await builder.multiCollectionDocumentFields())

  /**
   * Collection queries/mutations
   */
  await sequential(collections, async (collection) => {
    const collectionAST = await builder.collectionDocument(collection)
    const posableFrag = await builder.collectionFragment(collection)
    posableFrag &&
      fragmentDefinitionsFields.push(posableFrag as FragmentDefinitionNode)

    queryTypeDefinitionFields.push(collectionAST)

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

  definitions.push(...fragmentDefinitionsFields)
  const doc = {
    kind: 'Document' as const,
    definitions: _.uniqBy(
      // @ts-ignore
      extractInlineTypes(definitions),
      (node) => node.name.value
    ),
  }

  const fragDoc = {
    kind: 'Document' as const,
    definitions: _.uniqBy(
      // @ts-ignore
      extractInlineTypes(fragmentDefinitionsFields),
      (node) => node.name.value
    ),
  }

  // TODO: These should possibly be outputted somewhere else?
  const fragPath = process.cwd() + '/.tina/__generated__/frags.gql'
  await fs.outputFileSync(fragPath, print(fragDoc))
  const sdk = buildSKD(tinaSchema)
  const clientPath = process.cwd() + '/.tina/__generated__/client.ts'
  await fs.outputFileSync(clientPath, sdk)

  return doc
}
