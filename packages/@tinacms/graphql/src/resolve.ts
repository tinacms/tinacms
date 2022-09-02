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

import {
  graphql,
  buildASTSchema,
  getNamedType,
  print,
  GraphQLError,
  parse,
} from 'graphql'
import type { TinaSchema } from '@tinacms/schema-tools'
import { createSchema } from './schema'
import { createResolver } from './resolver'
import { assertShape } from './util'
import { optimizeDocuments } from '@graphql-tools/relay-operation-optimizer'

import type { GraphQLResolveInfo } from 'graphql'
import type { Database } from './database'
import { NAMER } from './ast-builder'
import type { GraphQLConfig } from './types'
import { handleFetchErrorError } from './resolver/error'

export const resolve = async ({
  config,
  query,
  variables,
  database,
  silenceErrors,
  verbose,
  isAudit,
}: {
  config?: GraphQLConfig
  query: string
  variables: object
  database: Database
  silenceErrors?: boolean
  verbose?: boolean
  isAudit?: boolean
}) => {
  try {
    const verboseValue = verbose ?? true
    const graphQLSchemaAst = await database.getGraphQLSchema()
    const graphQLSchema = buildASTSchema(graphQLSchemaAst)

    const tinaConfig = await database.getTinaSchema()
    const tinaSchema = (await createSchema({
      // TODO: please update all the types to import from @tinacms/schema-tools
      // @ts-ignore
      schema: tinaConfig,
      // @ts-ignore
      flags: tinaConfig?.meta?.flags,
    })) as unknown as TinaSchema
    const resolver = await createResolver({
      config,
      database,
      tinaSchema,
      isAudit: isAudit || false,
    })

    const res = await graphql({
      schema: graphQLSchema,
      source: query,
      variableValues: variables,
      contextValue: {
        database,
      },
      typeResolver: async (source, _args, info) => {
        if (source.__typename) return source.__typename

        const namedType = getNamedType(info.returnType).toString()
        const lookup = await database.getLookup(namedType)
        if (lookup.resolveType === 'unionData') {
          return lookup.typeMap[source._template]
        } else {
          throw new Error(`Unable to find lookup key for ${namedType}`)
        }
      },
      fieldResolver: async (
        source: { [key: string]: undefined | Record<string, unknown> } = {},
        _args: object = {},
        _context: object,
        info: GraphQLResolveInfo
      ) => {
        try {
          const args = JSON.parse(JSON.stringify(_args))
          const returnType = getNamedType(info.returnType).toString()
          const lookup = await database.getLookup(returnType)
          const isMutation = info.parentType.toString() === 'Mutation'
          const value = source[info.fieldName]

          /**
           * `collection`
           */
          if (returnType === 'Collection') {
            if (value) {
              return value
            }
            if (info.fieldName === 'collections') {
              const collectionNode = info.fieldNodes.find(
                (x) => x.name.value === 'collections'
              )
              const hasDocuments = collectionNode.selectionSet.selections.find(
                (x) => {
                  // @ts-ignore
                  return x?.name?.value === 'documents'
                }
              )
              return tinaSchema.getCollections().map((collection) => {
                return resolver.resolveCollection(
                  args,
                  collection.name,
                  Boolean(hasDocuments)
                )
              })
            }

            // The field is `collection`
            const collectionNode = info.fieldNodes.find(
              (x) => x.name.value === 'collection'
            )
            const hasDocuments = collectionNode.selectionSet.selections.find(
              (x) => {
                // @ts-ignore
                return x?.name?.value === 'documents'
              }
            )
            return resolver.resolveCollection(
              args,
              args.collection,
              Boolean(hasDocuments)
            )
          }

          /**
           * `getOptimizedQuery`
           *
           * Returns a version of the query with fragments inlined. Eg.
           * ```graphql
           * {
           *   getPostDocument(relativePath: "") {
           *     data {
           *       ...PostFragment
           *     }
           *   }
           * }
           *
           * fragment PostFragment on Post {
           *   title
           * }
           * ```
           * Turns into
           * ```graphql
           * {
           *   getPostDocument(relativePath: "") {
           *     data {
           *       title
           *     }
           *   }
           * }
           */
          if (info.fieldName === 'getOptimizedQuery') {
            try {
              const [optimizedQuery] = optimizeDocuments(
                info.schema,
                [parse(args.queryString)],
                {
                  assumeValid: true,
                  // Include actually means to keep them as part of the document.
                  // We want to merge them into the query so there's a single top-level node
                  includeFragments: false,
                  noLocation: true,
                }
              )
              return print(optimizedQuery)
            } catch (e) {
              throw new Error(
                `Invalid query provided, Error message: ${e.message}`
              )
            }
          }

          // We assume the value is already fully resolved
          if (!lookup) {
            return value
          }

          const isCreation = lookup[info.fieldName] === 'create'

          /**
           * From here, we need more information on how to resolve this, aided
           * by the lookup value for the given return type, we can enrich the request
           * with more contextual information that we gathered at build-time.
           */
          switch (lookup.resolveType) {
            /**
             * `node(id: $id)`
             */
            case 'nodeDocument':
              assertShape<{ id: string }>(args, (yup) =>
                yup.object({ id: yup.string().required() })
              )
              return resolver.getDocument(args.id)
            case 'multiCollectionDocument':
              if (typeof value === 'string') {
                /**
                 * This is a reference value (`director: /path/to/george.md`)
                 */
                return resolver.getDocument(value)
              }
              if (
                args &&
                args.collection &&
                info.fieldName === 'addPendingDocument'
              ) {
                /**
                 * `addPendingDocument`
                 * FIXME: this should probably be it's own lookup
                 */
                return resolver.resolveDocument({
                  args: { ...args, params: {} },
                  collection: args.collection,
                  isMutation,
                  isCreation: true,
                  isAddPendingDocument: true,
                })
              }
              if (
                [
                  NAMER.documentQueryName(),
                  'createDocument',
                  'updateDocument',
                  'deleteDocument',
                ].includes(info.fieldName)
              ) {
                /**
                 * `getDocument`/`createDocument`/`updateDocument`
                 */
                const result = await resolver.resolveDocument({
                  args,
                  collection: args.collection,
                  isMutation,
                  isCreation,
                  // Right now this is the only case for deletion
                  isDeletion: info.fieldName === 'deleteDocument',
                  isAddPendingDocument: false,
                  isCollectionSpecific: false,
                })

                return result
              }
              return value
            /**
             * eg `getMovieDocument.data.actors`
             */
            case 'multiCollectionDocumentList':
              if (Array.isArray(value)) {
                return {
                  totalCount: value.length,
                  edges: value.map((document) => {
                    return { node: document }
                  }),
                }
                // TODO when jeffs back: Look at this to make sure its OK to do this. (I am pretty sure it is -- Logan)
                // Fixes https://github.com/tinacms/tinacms/issues/2886
              } else if (
                info.fieldName === 'documents' &&
                value?.collection &&
                value?.hasDocuments
              ) {
                // use the collecion and hasDocuments to resolve the documents
                return resolver.resolveCollectionConnection({
                  args,
                  // @ts-ignore
                  collection: value.collection,
                })
              } else {
                throw new Error(
                  `Expected an array for result of ${info.fieldName} at ${info.path}`
                )
              }
            /**
             * Collections-specific getter
             * eg. `getPostDocument`/`createPostDocument`/`updatePostDocument`
             *
             * if coming from a query result
             * the field will be `node`
             */
            case 'collectionDocument':
              if (value) {
                return value
              }
              const result =
                value ||
                (await resolver.resolveDocument({
                  args,
                  collection: lookup.collection,
                  isMutation,
                  isCreation,
                  isAddPendingDocument: false,
                  isCollectionSpecific: true,
                }))
              return result
            /**
             * Collections-specific list getter
             * eg. `getPageList`
             */
            case 'collectionDocumentList':
              return resolver.resolveCollectionConnection({
                args,
                collection: tinaSchema.getCollection(lookup.collection),
              })
            /**
             * A polymorphic data set, it can be from a document's data
             * of any nested object which can be one of many shapes
             *
             * ```graphql
             * getPostDocument(relativePath: $relativePath) {
             *   data {...} <- this part
             * }
             * ```
             * ```graphql
             * getBlockDocument(relativePath: $relativePath) {
             *   data {
             *     blocks {...} <- or this part
             *   }
             * }
             * ```
             */
            case 'unionData':
              // `unionData` is used by the typeResolver, need to keep this check in-place
              // This is an array in many cases so it's easier to just pass it through
              // to be handled by the `typeResolver`
              if (!value) {
                if (args.relativePath) {
                  // FIXME: unionData doesn't have enough info
                  const result = await resolver.resolveDocument({
                    args,
                    collection: lookup.collection,
                    isMutation,
                    isCreation,
                    isAddPendingDocument: false,
                    isCollectionSpecific: true,
                  })
                  return result
                }
              }
              return value
            default:
              console.error(lookup)
              throw new Error(`Unexpected resolve type`)
          }
        } catch (e) {
          handleFetchErrorError(e, verboseValue)
        }
      },
    })

    if (res.errors) {
      if (!silenceErrors) {
        res.errors.map((e) => {
          console.error(e.toString())

          if (verboseValue) {
            console.error('More error context below')
            console.error(e.message)
            console.error(e)
          }
        })
      }
    }
    return res
  } catch (e) {
    if (!silenceErrors) {
      console.error(e)
    }
    if (e instanceof GraphQLError) {
      return {
        errors: [e],
      }
    } else {
      throw e
    }
  }
}
