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
import { astBuilder } from './ast-builder'
import { sequential } from './util'
import { parseFile } from './database/util'
import { createBuilder } from './builder'
import { createSchema } from './schema'
import { extractInlineTypes } from './ast-builder'
import path from 'path'

import { FieldDefinitionNode } from 'graphql'
import type { Builder } from './builder'
import type { TinaSchema } from './schema'
import { Database } from './database'
import { TinaField } from '..'

// @ts-ignore: FIXME: check that cloud schema is what it says it is
export const indexDB = async ({
  database,
  config,
  experimentalData,
}: {
  database: Database
  config: TinaSchema['config']
  experimentalData?: boolean
}) => {
  const tinaSchema = await createSchema({ schema: config })
  const builder = await createBuilder({
    database,
    tinaSchema,
    experimentalData,
  })
  const graphQLSchema = await _buildSchema(builder, tinaSchema)
  await database.put('_graphql', graphQLSchema)
  // @ts-ignore
  await database.put('_schema', tinaSchema.schema)
  if (experimentalData) {
    // Uncomment to test filtering
    await database.store.put('_graphql', graphQLSchema)
    await database.store.put('_schema', tinaSchema.schema)
    await _indexContent(tinaSchema, database)
  }
}

const _indexContent = async (tinaSchema: TinaSchema, database: Database) => {
  await sequential(tinaSchema.getCollections(), async (collection) => {
    const documentPaths = await database.bridge.glob(collection.path)
    await sequential(documentPaths, async (documentPath) => {
      const dataString = await database.bridge.get(documentPath)
      const data = parseFile(dataString, path.extname(documentPath), (yup) =>
        yup.object({})
      )
      await database.store.put(documentPath, data)
      await _indexCollectable({
        record: documentPath,
        //@ts-ignore
        field: collection,
        value: data,
        prefix: `${collection.name}`,
        database,
      })
    })
  })
}

const _indexCollectable = async ({
  field,
  value,
  ...rest
}: {
  record: string
  value: object
  prefix: string
  field: TinaField
  database: Database
}) => {
  let template
  if (field.templates) {
    template = field.templates.find((t) => t.name === value._template)
  } else {
    template = field
  }
  await _indexAttributes({
    record: rest.record,
    data: value,
    prefix: `${rest.prefix}#${template.name}`,
    fields: template.fields,
    database: rest.database,
  })
}

const _indexAttributes = async ({
  data,
  fields,
  ...rest
}: {
  record: string
  data: object
  prefix: string
  fields: TinaField[]
  database: Database
}) => {
  await sequential(fields, async (field) => {
    const value = data[field.name]
    if (!value) {
      return true
    }

    switch (field.type) {
      case 'boolean':
      case 'string':
      case 'number':
      case 'datetime':
        await _indexAttribute({ value, field, ...rest })

        return true

      case 'object':
        if (field.list) {
          await sequential(value, async (item) => {
            await _indexCollectable({ field, value: item, ...rest })
          })
        } else {
          await _indexCollectable({ field, value, ...rest })
        }
        return true
      case 'reference':
        await _indexAttribute({ value, field, ...rest })
        return true
    }
    return true
  })
}

const _indexAttribute = async ({
  record,
  value,
  prefix,
  field,
  database,
}: {
  record: string
  value: string
  prefix: string
  field: TinaField
  database: Database
}) => {
  const stringValue = value.toString().substr(0, 100)
  const fieldName = `__attribute__${prefix}#${field.name}#${stringValue}`
  const existingRecords = (await database.store.get(fieldName)) || []
  // FIXME: only indexing on the first 100 characters, a "startsWith" query will be handy
  // @ts-ignore
  const uniqueItems = [...new Set([...existingRecords, record])]
  await database.store.put(fieldName, uniqueItems)
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
  return {
    kind: 'Document',
    definitions: _.uniqBy(
      // @ts-ignore
      extractInlineTypes(definitions),
      (node) => node.name.value
    ),
  }
}
