/**

*/

import { graphql, buildASTSchema, getNamedType, GraphQLError } from 'graphql'
import type { TinaSchema } from '@tinacms/schema-tools'
import type { GraphQLConfig } from './types'
import { createSchema } from './schema/createSchema'
import { createResolver } from './resolver'
import { assertShape, get } from './util'
import set from 'lodash.set'

import type { GraphQLResolveInfo } from 'graphql'
import type { Database } from './database'
import { NAMER } from './ast-builder'
import { handleFetchErrorError } from './resolver/error'
import { checkPasswordHash, mapUserFields } from './auth/utils'
import { NotFoundError } from './error'

export const resolve = async ({
  config,
  query,
  variables,
  database,
  silenceErrors,
  verbose,
  isAudit,
  ctxUser,
}: {
  config?: GraphQLConfig
  query: string
  variables: object
  database: Database
  silenceErrors?: boolean
  verbose?: boolean
  isAudit?: boolean
  ctxUser?: { sub: string }
}) => {
  try {
    const verboseValue = verbose ?? true
    const graphQLSchemaAst = await database.getGraphQLSchema()
    if (!graphQLSchemaAst) {
      throw new GraphQLError('GraphQL schema not found')
    }
    const graphQLSchema = buildASTSchema(graphQLSchemaAst)

    const tinaConfig = await database.getTinaSchema()
    const tinaSchema = (await createSchema({
      // TODO: please update all the types to import from @tinacms/schema-tools
      // @ts-ignore
      schema: tinaConfig,
      // @ts-ignore
      flags: tinaConfig?.meta?.flags,
    })) as unknown as TinaSchema
    const resolver = createResolver({
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
        }
        throw new Error(`Unable to find lookup key for ${namedType}`)
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
              // Deprecated
              return args.queryString
            } catch (e) {
              throw new Error(
                `Invalid query provided, Error message: ${e.message}`
              )
            }
          }

          if (
            info.fieldName === 'authenticate' ||
            info.fieldName === 'authorize'
          ) {
            const sub = args.sub || ctxUser?.sub
            const collection = tinaSchema
              .getCollections()
              .find((c) => c.isAuthCollection)
            if (!collection) {
              throw new Error('Auth collection not found')
            }

            const userFields = mapUserFields(collection, ['_rawData'])
            if (!userFields.length) {
              throw new Error(
                `No user field found in collection ${collection.name}`
              )
            }
            if (userFields.length > 1) {
              throw new Error(
                `Multiple user fields found in collection ${collection.name}`
              )
            }
            const userField = userFields[0]

            const realPath = `${collection.path}/index.json`
            const userDoc = await resolver.getDocument(realPath)
            const users = get(userDoc, userField.path)
            if (!users) {
              throw new Error('No users found')
            }
            const { idFieldName, passwordFieldName } = userField
            if (!idFieldName) {
              throw new Error('No uid field found on user field')
            }
            const user = users.find((u) => u[idFieldName] === sub)
            if (!user) {
              return null
            }

            if (info.fieldName === 'authenticate') {
              const saltedHash = get(user, [passwordFieldName || '', 'value'])
              if (!saltedHash) {
                throw new Error('No password field found on user field')
              }

              const matches = await checkPasswordHash({
                saltedHash,
                password: args.password,
              })

              if (matches) {
                return user
              }
              return null
            }
            return user
          }

          if (info.fieldName === 'updatePassword') {
            if (!ctxUser?.sub) {
              throw new Error('Not authorized')
            }

            if (!args.password) {
              throw new Error('No password provided')
            }

            const collection = tinaSchema
              .getCollections()
              .find((c) => c.isAuthCollection)
            if (!collection) {
              throw new Error('Auth collection not found')
            }

            const userFields = mapUserFields(collection, ['_rawData'])
            if (!userFields.length) {
              throw new Error(
                `No user field found in collection ${collection.name}`
              )
            }
            if (userFields.length > 1) {
              throw new Error(
                `Multiple user fields found in collection ${collection.name}`
              )
            }
            const userField = userFields[0]
            const realPath = `${collection.path}/index.json`
            const userDoc = await resolver.getDocument(realPath)
            const users = get(userDoc, userField.path)
            if (!users) {
              throw new Error('No users found')
            }
            const { idFieldName, passwordFieldName } = userField
            const user = users.find((u) => u[idFieldName] === ctxUser.sub)
            if (!user) {
              throw new Error('Not authorized')
            }

            user[passwordFieldName] = {
              value: args.password,
              passwordChangeRequired: false,
            }

            const params = {}
            set(
              params,
              userField.path.slice(1), // remove _rawData from users path
              users.map((u) => {
                if (user[idFieldName] === u[idFieldName]) {
                  return user
                }
                return {
                  // don't overwrite other users' passwords
                  ...u,
                  [passwordFieldName]: {
                    ...u[passwordFieldName],
                    value: '',
                  },
                }
              })
            )

            await resolver.updateResolveDocument({
              collection,
              args: { params },
              realPath,
              isCollectionSpecific: true,
              isAddPendingDocument: false,
            })

            return true
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
              if (typeof value === 'string' && value !== '') {
                /**
                 * This is a reference value (`director: /path/to/george.md`)
                 */
                return resolver.getDocument(value)
              }
              if (args?.collection && info.fieldName === 'addPendingDocument') {
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
                  'createFolder',
                ].includes(info.fieldName)
              ) {
                /**
                 * `getDocument`/`createDocument`/`updateDocument`/`deleteDocument`/`createFolder`
                 */
                const result = await resolver.resolveDocument({
                  args,
                  collection: args.collection,
                  isMutation,
                  isCreation,
                  // Right now this is the only case for deletion
                  isDeletion: info.fieldName === 'deleteDocument',
                  isFolderCreation: info.fieldName === 'createFolder',
                  isUpdateName: Boolean(args?.params?.relativePath),
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
              }
              if (
                info.fieldName === 'documents' &&
                value?.collection &&
                value?.hasDocuments
              ) {
                let filter = args.filter

                // When querying for documents, filter has shape filter { [collectionName]: { ... }} but we need to pass the filter directly to the resolver
                if (
                  // 1. Make sure that the filter exists
                  typeof args?.filter !== 'undefined' &&
                  args?.filter !== null &&
                  // 2. Make sure that the collection name exists
                  // @ts-ignore
                  typeof value?.collection?.name === 'string' &&
                  // 3. Make sure that the collection name is in the filter and is not undefined
                  // @ts-ignore
                  Object.keys(args.filter).includes(value?.collection?.name) &&
                  // @ts-ignore
                  typeof args.filter[value?.collection?.name] !== 'undefined'
                ) {
                  // Since 1. 2. and 3. are true, we can safely assume that the filter exists and is not undefined

                  // @ts-ignore
                  filter = args.filter[value.collection.name]
                }
                // use the collection and hasDocuments to resolve the documents
                return resolver.resolveCollectionConnection({
                  args: {
                    ...args,
                    filter,
                  },
                  // @ts-ignore
                  collection: value.collection,
                })
              }
              throw new Error(
                `Expected an array for result of ${info.fieldName} at ${info.path}`
              )
            /**
             * Collections-specific getter
             * eg. `getPostDocument`/`createPostDocument`/`updatePostDocument`
             *
             * if coming from a query result
             * the field will be `node`
             */
            case 'collectionDocument': {
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
            }
            /**
             * Collections-specific list getter
             * eg. `getPageList`
             */
            case 'collectionDocumentList':
              return resolver.resolveCollectionConnection({
                args,
                collection: tinaSchema.getCollection(lookup.collection),
              })
            case 'reverseCollectionDocumentList':
              return resolver.resolveCollectionConnection({
                args: {
                  ...args,
                  reverseRef: {
                    id: source['id'],
                    collection: source['_collection'],
                  },
                },
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
              throw new Error('Unexpected resolve type')
          }
        } catch (e) {
          handleFetchErrorError(e, verboseValue)
        }
      },
    })

    if (res.errors) {
      if (!silenceErrors) {
        res.errors.map((e) => {
          if (e instanceof NotFoundError) {
            // do nothing
          } else {
            console.error(e.toString())

            if (verboseValue) {
              console.error('More error context below')
              console.error(e.message)
              console.error(e)
            }
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
    }
    throw e
  }
}
