/**

*/

import { graphql, buildASTSchema, getNamedType, GraphQLError } from 'graphql';
import type { Collection } from '@tinacms/schema-tools';
import type { GraphQLConfig } from './types';
import { createSchema } from './schema/createSchema';
import { createResolver } from './resolver';
import { assertShape } from './util';

import type { GraphQLResolveInfo } from 'graphql';
import type { Database } from './database';
import { NAMER } from './ast-builder';
import { handleFetchErrorError } from './resolver/error';
import {
  handleAuthenticate,
  handleAuthorize,
  handleUpdatePassword,
} from './resolver/auth-fields';
import { NotFoundError } from './error';

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
  config?: GraphQLConfig;
  query: string;
  variables: object;
  database: Database;
  silenceErrors?: boolean;
  verbose?: boolean;
  isAudit?: boolean;
  ctxUser?: { sub: string };
}) => {
  try {
    const verboseValue = verbose ?? true;
    const graphQLSchemaAst = await database.getGraphQLSchema();
    if (!graphQLSchemaAst) {
      throw new GraphQLError('GraphQL schema not found');
    }
    const graphQLSchema = buildASTSchema(graphQLSchemaAst);

    const tinaConfig = await database.getTinaSchema();
    const tinaSchema = await createSchema({
      // TODO: please update all the types to import from @tinacms/schema-tools
      // @ts-ignore
      schema: tinaConfig,
      // @ts-ignore
      flags: tinaConfig?.meta?.flags,
    });
    const resolver = createResolver({
      config,
      database,
      tinaSchema,
      isAudit: isAudit || false,
    });

    const res = await graphql({
      schema: graphQLSchema,
      source: query,
      variableValues: variables,
      contextValue: {
        database,
      },
      typeResolver: async (source, _args, info) => {
        if (source.__typename) return source.__typename;

        const namedType = getNamedType(info.returnType).toString();
        const lookup = await database.getLookup(namedType);
        if (lookup.resolveType === 'unionData') {
          return lookup.typeMap[source._template];
        }
        throw new Error(`Unable to find lookup key for ${namedType}`);
      },
      fieldResolver: async (
        source: { [key: string]: undefined | Record<string, unknown> } = {},
        args: unknown = {},
        _context: object,
        info: GraphQLResolveInfo
      ) => {
        try {
          const returnType = getNamedType(info.returnType).toString();
          const lookup = await database.getLookup(returnType);
          const isMutation = info.parentType.toString() === 'Mutation';
          const value = source[info.fieldName];

          /**
           * `collection`
           */
          if (returnType === 'Collection') {
            if (value) {
              return value;
            }
            if (info.fieldName === 'collections') {
              const collectionNode = info.fieldNodes.find(
                (x) => x.name.value === 'collections'
              );
              const hasDocuments = collectionNode.selectionSet.selections.find(
                (x) => {
                  // @ts-ignore
                  return x?.name?.value === 'documents';
                }
              );
              return tinaSchema.getCollections().map((collection) => {
                return resolver.resolveCollection(
                  args,
                  collection.name,
                  Boolean(hasDocuments)
                );
              });
            }

            // The field is `collection`
            const collectionNode = info.fieldNodes.find(
              (x) => x.name.value === 'collection'
            );
            const hasDocuments = collectionNode.selectionSet.selections.find(
              (x) => {
                // @ts-ignore
                return x?.name?.value === 'documents';
              }
            );
            assertShape<{ collection: string }>(
              args,
              (yup) => yup.object({
                collection: yup.string().required()
              })
            );
            return resolver.resolveCollection(
              args,
              args.collection,
              Boolean(hasDocuments)
            );
          }

          if (info.fieldName === 'getOptimizedQuery') {
            // Deprecated - returns query string as-is
            return (args as { queryString?: string }).queryString || '';
          }

          if (info.fieldName === 'authenticate') {
            const authArgs = args as { sub?: string; password?: string };
            return handleAuthenticate({
              tinaSchema,
              resolver,
              sub: authArgs.sub,
              password: authArgs.password,
              info,
              ctxUser,
            });
          }

          if (info.fieldName === 'authorize') {
            const authArgs = args as { sub?: string };
            return handleAuthorize({
              tinaSchema,
              resolver,
              sub: authArgs.sub,
              info,
              ctxUser,
            });
          }

          if (info.fieldName === 'updatePassword') {
            const authArgs = args as { password?: string };
            return handleUpdatePassword({
              tinaSchema,
              resolver,
              password: authArgs.password,
              info,
              ctxUser,
            });
          }

          // We assume the value is already fully resolved
          if (!lookup) {
            return value;
          }

          const isCreation = lookup[info.fieldName] === 'create';

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
              );
              return resolver.getDocument(args.id);
            case 'multiCollectionDocument':
              if (typeof value === 'string' && value !== '') {
                /**
                 * This is a reference value (`director: /path/to/george.md`)
                 */
                return resolver.getDocument(value);
              }
              if (info.fieldName === 'addPendingDocument') {
                assertShape<{ collection: string }>(
                  args,
                  (yup) => yup.object({
                    collection: yup.string().required()
                  })
                );
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
                });
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
                assertShape<{
                  collection: string;
                  relativePath?: string;
                  params?: { relativePath?: string }
                }>(
                  args,
                  (yup) => yup.object({
                    collection: yup.string().required(),
                    relativePath: yup.string().optional(),
                    params: yup.object({
                      relativePath: yup.string().optional()
                    }).optional()
                  })
                );
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
                });

                return result;
              }
              return value;
            /**
             * eg `getMovieDocument.data.actors`
             */
            case 'multiCollectionDocumentList':
              if (Array.isArray(value)) {
                return {
                  totalCount: value.length,
                  edges: value.map((document) => {
                    return { node: document };
                  }),
                };
              }
              if (
                info.fieldName === 'documents' &&
                value?.collection &&
                value?.hasDocuments
              ) {
                const documentsArgs = args as {
                  filter?: Record<string, any>;
                  first?: number;
                  after?: string;
                };

                // When querying for documents, filter has shape filter { [collectionName]: { ... }} but we need to pass the filter directly to the resolver
                const collectionName = (value.collection as { name?: string })?.name;
                const filter = (collectionName && documentsArgs.filter?.[collectionName]) ?? documentsArgs.filter;
                // use the collection and hasDocuments to resolve the documents
                return resolver.resolveCollectionConnection({
                  args: {
                    ...documentsArgs,
                    filter,
                  },
                  collection: value.collection as Collection<true>,
                });
              }
              throw new Error(
                `Expected an array for result of ${info.fieldName} at ${info.path}`
              );
            /**
             * Collections-specific getter
             * eg. `getPostDocument`/`createPostDocument`/`updatePostDocument`
             *
             * if coming from a query result
             * the field will be `node`
             */
            case 'collectionDocument': {
              if (value) {
                return value;
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
                }));
              return result;
            }
            /**
             * Collections-specific list getter
             * eg. `getPageList`
             */
            case 'collectionDocumentList':
              // Cast args to an acceptable type for the resolver
              const collectionArgs = args as Record<string, string | number | Record<string, object>>;
              return resolver.resolveCollectionConnection({
                args: collectionArgs,
                collection: tinaSchema.getCollection(lookup.collection),
              });
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
                const unionArgs = args as { relativePath?: string };
                if (unionArgs.relativePath) {
                  // FIXME: unionData doesn't have enough info
                  const result = await resolver.resolveDocument({
                    args,
                    collection: lookup.collection,
                    isMutation,
                    isCreation,
                    isAddPendingDocument: false,
                    isCollectionSpecific: true,
                  });
                  return result;
                }
              }
              return value;
            default:
              console.error(lookup);
              throw new Error('Unexpected resolve type');
          }
        } catch (e) {
          handleFetchErrorError(e, verboseValue);
        }
      },
    });

    if (res.errors) {
      if (!silenceErrors) {
        res.errors.map((e) => {
          if (e instanceof NotFoundError) {
            // do nothing
          } else {
            console.error(e.toString());

            if (verboseValue) {
              console.error('More error context below');
              console.error(e.message);
              console.error(e);
            }
          }
        });
      }
    }
    return res;
  } catch (e) {
    if (!silenceErrors) {
      console.error(e);
    }
    if (e instanceof GraphQLError) {
      return {
        errors: [e],
      };
    }
    throw e;
  }
};
