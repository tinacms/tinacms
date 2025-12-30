import {
  graphql,
  buildASTSchema,
  getNamedType,
  GraphQLError,
  type GraphQLResolveInfo,
} from 'graphql';
import type { Collection, TinaSchema } from '@tinacms/schema-tools';

import type { GraphQLConfig } from './types';
import type { Database } from './database';
import { createSchema } from './schema/createSchema';
import { createResolver, Resolver } from './resolver';
import { assertShape } from './util';
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
      schema: tinaConfig,
      // @ts-expect-error
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
          /*
           * 'collections' and 'collection'.
           */
          const returnType = getNamedType(info.returnType).toString();
          if (returnType === 'Collection') {
            const possibleCollectionValue = source[info.fieldName];
            if (possibleCollectionValue) {
              return possibleCollectionValue;
            }
            if (info.fieldName === 'collections') {
              return handleCollectionsField(info, tinaSchema, resolver, args);
            }
            // The field is `collection`
            return handleCollectionField(info, args, resolver);
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

          const lookup = await database.getLookup(returnType);
          // We assume the value is already fully resolved
          if (!lookup) {
            return source[info.fieldName];
          }

          const isCreation = lookup[info.fieldName] === 'create';
          const isMutation = info.parentType.toString() === 'Mutation';

          /*
           * From here, we need more information on how to resolve this, aided
           * by the lookup value for the given return type, we can enrich the request
           * with more contextual information that we gathered at build-time.
           */
          switch (lookup.resolveType) {
            /*
             * `node(id: $id)`
             */
            case 'nodeDocument':
              assertShape<{ id: string }>(args, (yup) =>
                yup.object({ id: yup.string().required() })
              );
              return resolver.getDocument(args.id);

            case 'multiCollectionDocument':
              const possibleValue = source[info.fieldName];
              if (typeof possibleValue === 'string' && possibleValue !== '') {
                // This is a reference value (`director: /path/to/george.md`)
                return resolver.getDocument(possibleValue);
              }

              if (
                [
                  NAMER.documentQueryName(),
                  'addPendingDocument',
                  'createDocument',
                  'updateDocument',
                  'deleteDocument',
                  'createFolder',
                ].includes(info.fieldName)
              ) {
                assertShape<{
                  collection: string;
                  relativePath: string;
                }>(args, (yup) =>
                  yup.object({
                    collection: yup.string().required(),
                    relativePath: yup.string().required(),
                  })
                );

                if (isMutation) {
                  switch (info.fieldName) {
                    case 'addPendingDocument':
                      return resolver.resolveAddPendingDocument({
                        collectionName: args.collection,
                        relativePath: args.relativePath,
                        templateName: (args as { template?: string }).template,
                      });
                    case 'createFolder':
                      return resolver.resolveCreateFolder({
                        collectionName: args.collection,
                        relativePath: args.relativePath,
                      });
                    case 'createDocument': {
                      assertShape<{
                        params: {
                          // [args.collection]: Record<string, unknown>; .. effectively.
                        };
                      }>(args, (yup) =>
                        yup.object({
                          params: yup
                            .object()
                            .shape({
                              [args.collection]: yup.object().required(),
                            })
                            .required(),
                        })
                      );
                      return resolver.resolveCreateDocument({
                        collectionName: args.collection,
                        relativePath: args.relativePath,
                        body: args.params[args.collection],
                      });
                    }
                    case 'updateDocument': {
                      assertShape<{
                        params: {
                          relativePath: string;
                        };
                      }>(args, (yup) =>
                        yup.object({
                          params: yup
                            .object()
                            .shape({
                              relativePath: yup.string().optional(),
                            })
                            .required(),
                        })
                      );
                      const newRelativePath = args.params.relativePath;
                      const newBody = args.params[args.collection] as
                        | Record<string, unknown>
                        | undefined;
                      return resolver.resolveUpdateDocument({
                        collectionName: args.collection,
                        relativePath: args.relativePath,
                        newRelativePath,
                        newBody,
                      });
                    }
                    case 'deleteDocument':
                      return resolver.resolveDeleteDocument({
                        collectionName: args.collection,
                        relativePath: args.relativePath,
                      });
                  }
                } else if (info.fieldName === NAMER.documentQueryName()) {
                  return resolver.resolveRetrievedDocument({
                    collectionName: args.collection,
                    relativePath: args.relativePath,
                  });
                }
              }

              return possibleValue;

            /*
             * eg `getMovieDocument.data.actors`
             */
            case 'multiCollectionDocumentList':
              const listValue = source[info.fieldName];
              if (Array.isArray(listValue)) {
                return {
                  totalCount: listValue.length,
                  edges: listValue.map((document) => {
                    return { node: document };
                  }),
                };
              }
              if (
                info.fieldName === 'documents' &&
                listValue?.collection &&
                listValue?.hasDocuments
              ) {
                const documentsArgs = args as {
                  filter?: Record<string, any>;
                  first?: number;
                  after?: string;
                };

                // When querying for documents, filter has shape filter { [collectionName]: { ... }} but we need to pass the filter directly to the resolver
                const collectionName = (
                  listValue.collection as { name?: string }
                )?.name;
                const filter =
                  (collectionName && documentsArgs.filter?.[collectionName]) ??
                  documentsArgs.filter;
                // use the collection and hasDocuments to resolve the documents
                return resolver.resolveCollectionConnection({
                  args: {
                    ...documentsArgs,
                    filter,
                  },
                  collection: listValue.collection as Collection<true>,
                });
              }
              throw new Error(
                `Expected an array for result of ${info.fieldName} at ${info.path}`
              );

            /*
             * Collections-specific getter
             * eg. `getPostDocument`/`createPostDocument`/`updatePostDocument`
             *
             * if coming from a query result
             * the field will be `node`
             */
            case 'collectionDocument': {
              const possibleDocValue = source[info.fieldName];
              if (possibleDocValue) {
                return possibleDocValue;
              }

              assertShape<{
                relativePath: string;
              }>(args, (yup) =>
                yup.object({
                  relativePath: yup.string().required(),
                })
              );

              if (isMutation) {
                assertShape<{
                  params: Record<string, unknown>;
                }>(args, (yup) =>
                  yup.object({
                    params: yup.object().required(),
                  })
                );
                if (isCreation) {
                  return resolver.resolveCreateDocument({
                    collectionName: lookup.collection,
                    relativePath: args.relativePath,
                    body: args.params,
                  });
                } else {
                  // Note that document renaming is not supported.
                  return resolver.resolveUpdateDocument({
                    collectionName: lookup.collection,
                    relativePath: args.relativePath,
                    newBody: args.params,
                  });
                }
              } else {
                return resolver.resolveRetrievedDocument({
                  collectionName: lookup.collection,
                  relativePath: args.relativePath,
                });
              }
            }

            /*
             * Collections-specific list getter
             * eg. `getPageList`
             */
            case 'collectionDocumentList':
              // Cast args to an acceptable type for the resolver
              const collectionArgs = args as Record<
                string,
                string | number | Record<string, object>
              >;
              return resolver.resolveCollectionConnection({
                args: collectionArgs,
                collection: tinaSchema.getCollection(lookup.collection),
              });

            /*
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
              const unionValue = source[info.fieldName];
              if (!unionValue) {
                const unionArgs = args as { relativePath?: string };
                if (unionArgs.relativePath) {
                  // FIXME: there is a bug in the lookup generation where the create fieldname is not generated.
                  // Therefore, you cannot create a new item using create{{ COLLECTION-NAME }}.
                  assertShape<{
                    relativePath: string;
                  }>(args, (yup) =>
                    yup.object({
                      relativePath: yup.string().required(),
                    })
                  );
                  if (isMutation) {
                    assertShape<{
                      params: Record<string, unknown>;
                    }>(args, (yup) =>
                      yup.object({
                        params: yup.object().required(),
                      })
                    );
                    if (isCreation) {
                      return resolver.resolveCreateDocument({
                        collectionName: lookup.collection,
                        relativePath: args.relativePath,
                        body: args.params,
                      });
                    } else {
                      return resolver.resolveUpdateDocument({
                        collectionName: lookup.collection,
                        relativePath: args.relativePath,
                        newBody: args.params,
                      });
                    }
                  } else {
                    return resolver.resolveRetrievedDocument({
                      collectionName: lookup.collection,
                      relativePath: args.relativePath,
                    });
                  }
                }
              }
              return unionValue;

            default:
              console.error(
                `Could not recognize resolve type '${lookup.resolveType}'.`
              );
              console.error(
                'The field resolver needs to be updated to handle this new type.'
              );
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

const handleCollectionsField = (
  info: GraphQLResolveInfo,
  tinaSchema: TinaSchema,
  resolver: Resolver,
  args: unknown
) => {
  const collectionNode = info.fieldNodes.find(
    (x) => x.name.value === 'collections'
  );
  const hasDocuments = collectionNode.selectionSet.selections.find(
    (x) => x.kind == 'Field' && x?.name?.value === 'documents'
  );
  return tinaSchema.getCollections().map((collection) => {
    return resolver.resolveCollection(
      args,
      collection.name,
      Boolean(hasDocuments)
    );
  });
};

const handleCollectionField = (
  info: GraphQLResolveInfo,
  args: unknown,
  resolver: Resolver
) => {
  const collectionNode = info.fieldNodes.find(
    (x) => x.name.value === 'collection'
  );
  const hasDocuments = collectionNode.selectionSet.selections.find(
    (x) => x.kind == 'Field' && x?.name?.value === 'documents'
  );
  assertShape<{ collection: string }>(args, (yup) =>
    yup.object({
      collection: yup.string().required(),
    })
  );
  return resolver.resolveCollection(
    args,
    args.collection,
    Boolean(hasDocuments)
  );
};
