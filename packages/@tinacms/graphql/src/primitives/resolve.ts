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
import {
  graphql,
  buildASTSchema,
  getNamedType,
  print,
  OperationDefinitionNode,
  FieldNode,
  visit,
  FragmentDefinitionNode,
  Visitor,
  ASTKindToNode,
  ASTNode,
  GraphQLFieldMap,
  GraphQLError,
  parse,
  TypeInfo,
  visitWithTypeInfo,
  GraphQLUnionType,
} from 'graphql'
import { createSchema } from './schema'
import { createResolver } from './resolver'
import { assertShape } from './util'

import type { GraphQLResolveInfo } from 'graphql'
import type { Database } from './database'
import type { TinaCloudCollection } from './types'
import { Path } from 'graphql/jsutils/Path'
import { NAMER } from './ast-builder'

type VisitorType = Visitor<ASTKindToNode, ASTNode>
type Frag = { name: string; node: FragmentDefinitionNode; subFrags: string[] }
type ReferenceQuery = {
  path: (string | number)[]
  dataPath: (string | number)[]
  queryString: string
}
type PreparedMutation = {
  path: (string | number)[]
  string: string
  includeCollection: boolean
}

export const resolve = async ({
  query,
  variables,
  database,
}: {
  query: string
  variables: object
  database: Database
}) => {
  try {
    const graphQLSchemaAst = await database.getGraphQLSchema()
    const graphQLSchema = buildASTSchema(graphQLSchemaAst)

    const config = await database.getTinaSchema()
    const tinaSchema = await createSchema({ schema: config })
    const resolver = await createResolver({ database, tinaSchema })
    const paths: ReferenceQuery[] = []
    const mutationPaths: PreparedMutation[] = []

    const ast = parse(query)
    const typeInfo = new TypeInfo(graphQLSchema)

    const referencePathVisitor = (): VisitorType => {
      return {
        leave: {
          // Loop through all field nodes
          Field(node, key, parent, path, ancestors) {
            const type = typeInfo.getType()
            if (type) {
              const realType = getNamedType(type)
              if (realType instanceof GraphQLUnionType) {
                const hasNodeInterface = !!realType
                  .getTypes()
                  .find((objectType) =>
                    objectType
                      .getInterfaces()
                      .find((intfc) => intfc.name === 'Node')
                  )
                // If they're part of a union _AND_ their types use the `Node` interface...
                if (hasNodeInterface) {
                  const p: string[] = []
                  // build the path to their nodes by traversing the ancestor tree and grabbing each Field node
                  // the resulting shape is something like `[getPostsDocument, data, author]`
                  ancestors.forEach((item: any, index) => {
                    const activePath = path[index]
                    const result = item[activePath]
                    if (result?.name?.value) {
                      if (result.kind === 'Field') {
                        p.push(result.name.value)
                      }
                    }
                  })
                  const referenceQuery = buildReferenceQuery(node, [
                    ...p,
                    node.name.value,
                  ])
                  if (referenceQuery) {
                    paths.push(referenceQuery)
                  }
                }
              }
            }
          },
        },
      }
    }
    visit(ast, visitWithTypeInfo(typeInfo, referencePathVisitor()))

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
        const args = JSON.parse(JSON.stringify(_args))
        const returnType = getNamedType(info.returnType).toString()
        const lookup = await database.getLookup(returnType)
        const isMutation = info.parentType.toString() === 'Mutation'
        const value = source[info.fieldName]

        /**
         * `getCollection`
         */
        if (returnType === 'Collection') {
          if (value) {
            return value
          }
          if (info.fieldName === 'getCollections') {
            return tinaSchema.getCollections().map((collection) => {
              return resolver.resolveCollection(collection.name)
            })
          }
          return resolver.resolveCollection(args.collection)
        }

        /**
         * `getDocumentFields`
         */
        if (info.fieldName === 'getDocumentFields') {
          return resolver.getDocumentFields()
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
                value,
                args: { ...args, params: {} },
                collection: args.collection,
                isMutation,
                isCreation: true,
              })
            }
            if (
              ['getDocument', 'createDocument', 'updateDocument'].includes(
                info.fieldName
              )
            ) {
              /**
               * `getDocument`/`createDocument`/`updateDocument`
               */
              const result = await resolver.resolveDocument({
                value,
                args,
                collection: args.collection,
                isMutation,
                isCreation,
              })

              if (!isMutation) {
                const mutationPath = buildMutationPath(info, {
                  // @ts-ignore
                  relativePath: result.sys.relativePath,
                })
                if (mutationPath) {
                  mutationPaths.push(mutationPath)
                }
              }

              return result
            }
            return value
          /**
           * eg `getMovieDocument.data.actors`
           */
          case 'multiCollectionDocumentList':
            return {
              totalCount: value.length,
              edges: value.map((document) => {
                return { node: document }
              }),
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
                value,
                args,
                collection: lookup.collection,
                isMutation,
                isCreation,
              }))
            if (!isMutation) {
              const mutationPath = buildMutationPath(info, {
                collection: tinaSchema.getCollection(lookup.collection),
                // @ts-ignore
                relativePath: result.sys.relativePath,
              })
              if (mutationPath) {
                mutationPaths.push(mutationPath)
              }
            }
            return result

          /**
           * Collections-specific list getter
           * eg. `getPageList`
           */
          case 'collectionDocumentList':
            return resolver.resolveCollectionConnection({ args, lookup })
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
            return value
          default:
            console.error(lookup)
            throw new Error(`Unexpected resolve type`)
        }
      },
    })

    /**
     * This code will benefit from supporting nested forms. Right now, the way it works
     * is whenever we come across a reference field, we store some info about it, and when
     * it's `value` changes in a tina form, we use this info to refetch the data (since the
     * reference has changed, the data needs to change too). It's an imperative approach
     * which doesn't fit well with the highly-dynamic nature of the GraphQL system.
     *
     * ```js
     *  {
     *    // the location of this node's form
     *    path: [ 'data', 'getPostsDocument', 'form' ],
     *    // the path to the data node of the reference
     *    dataPath: [ 'getPostsDocument', 'data', 'author' ],
     *    // ths part of the query we're referencing
     *    queryString: 'query GetNode($id: String!) {\n' +
     *      '  node(id: $id) {\n' +
     *      '    ... on AuthorsDocument {\n' +
     *      '      data {\n' +
     *      '        name\n' +
     *      '        avatar\n' +
     *      '      }\n' +
     *      '    }\n' +
     *      '  }\n' +
     *      '}'
     *  }
     * ```
     * But with support for nested forms we don't need any of this, each reference can just
     * build itself async and it will likely be far simpler from the backend.
     */
    paths.forEach((p) => {
      // We're only concerned with which form this path belongs to, so ignore anything after the 3rd value:
      // p.path could be something like: ['data', 'getPostsDocument', 'form', 'some-field']
      const item = _.get(res, p.path.slice(0, 3))
      if (item) {
        item.paths = [...(item.paths || []), p]
      }
    })
    mutationPaths.forEach((mutationPath) => {
      const item = _.get(res, mutationPath.path)
      if (item) {
        item.mutationInfo = mutationPath
      }
    })
    return res
  } catch (e) {
    console.log(e)
    if (e instanceof GraphQLError) {
      return {
        errors: [e],
      }
    } else {
      throw e
    }
  }
}

const buildPath = (path: Path, accum: (string | number)[]) => {
  if (path.prev) {
    buildPath(path.prev, accum)
  }
  accum.push(path.key)
  return accum
}

const buildReferenceQuery = (
  fieldNode: FieldNode,
  path: any
  // @ts-ignore
): ReferenceQuery | undefined => {
  if (fieldNode) {
    const p = path.map((item: any) => (item === 'data' ? 'form' : item))
    const dataPath = path
    const newNode: FieldNode = {
      ...fieldNode,
      name: { kind: 'Name', value: 'node' },
      arguments: [
        {
          kind: 'Argument',
          name: {
            kind: 'Name',
            value: 'id',
          },
          value: {
            kind: 'Variable',
            name: {
              kind: 'Name',
              value: 'id',
            },
          },
        },
      ],
    }
    const q: OperationDefinitionNode = {
      kind: 'OperationDefinition',
      operation: 'query',
      name: {
        value: 'GetNode',
        kind: 'Name',
      },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: {
              kind: 'Name',
              value: 'id',
            },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: {
                kind: 'Name',
                value: 'String',
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [newNode],
      },
    }
    const queryString = print(q)
    return {
      path: ['data', ...p.slice(0, -1)],
      dataPath,
      queryString: queryString,
    }
  }
}

const buildMutationPath = (
  info: GraphQLResolveInfo,
  {
    collection,
    relativePath,
  }: {
    collection?: TinaCloudCollection<false>
    relativePath: string
  }
) => {
  const queryNode = info.fieldNodes.find(
    (fn) => fn.name.value === info.fieldName
  )
  if (!queryNode) {
    throw new Error(`exptected to find field node for ${info.fieldName}`)
  }
  const mutationName = collection
    ? NAMER.updateName([collection.name])
    : 'updateDocument'
  const mutations = JSON.parse(
    JSON.stringify(info.schema.getMutationType()?.getFields())
  ) as GraphQLFieldMap<any, any>

  const mutation = mutations[mutationName]
  if (!mutation) {
    throw new Error(`exptected to find mutation for ${mutationName}`)
  }
  const mutationNode = mutations[mutationName].astNode
  const newNode: FieldNode = {
    ...queryNode,
    name: { kind: 'Name', value: mutation.name },
    arguments: mutationNode?.arguments?.map((argument) => {
      if (argument.name.value === 'relativePath') {
        return {
          kind: 'Argument',
          name: {
            kind: 'Name',
            value: argument.name.value,
          },
          value: {
            kind: 'StringValue',
            value: relativePath,
          },
        }
      }
      return {
        kind: 'Argument',
        name: {
          kind: 'Name',
          value: argument.name.value,
        },
        value: {
          kind: 'Variable',
          name: {
            kind: 'Name',
            value: argument.name.value,
          },
        },
      }
    }),
  }
  const paramArgs = mutationNode?.arguments?.find(
    (arg) => arg.name.value === 'params'
  )
  if (!paramArgs) {
    throw new Error(
      `Expected to find argument named params for mutation ${mutationName}`
    )
  }
  const q: OperationDefinitionNode = {
    kind: 'OperationDefinition',
    operation: 'mutation',
    name: {
      value: 'UpdateDocument',
      kind: 'Name',
    },
    variableDefinitions: [
      {
        kind: 'VariableDefinition',
        variable: {
          kind: 'Variable',
          name: {
            kind: 'Name',
            value: 'params',
          },
        },
        type: paramArgs?.type,
      },
    ],
    selectionSet: {
      kind: 'SelectionSet',
      selections: [newNode],
    },
  }
  const mutationString = addFragmentsToQuery(info, newNode, q)

  return {
    path: ['data', ...buildPath(info.path, []), 'form'],
    string: mutationString,
    includeCollection: collection ? false : true,
    includeTemplate: collection ? !!collection.templates : false,
  }
}
function addFragmentsToQuery(
  info: GraphQLResolveInfo,
  fieldNode: FieldNode,
  q: OperationDefinitionNode
) {
  const fragmentSpreadVisitor = (frag: Frag): VisitorType => {
    return {
      leave: {
        FragmentSpread(node) {
          frag.subFrags.push(node.name.value)
        },
      },
    }
  }
  const frags: Frag[] = []
  Object.entries(info.fragments).map(([fragmentName, fragmentDefinition]) => {
    const frag = {
      name: fragmentName,
      node: fragmentDefinition,
      subFrags: [],
    }
    frags.push(frag)
    visit(fragmentDefinition, fragmentSpreadVisitor(frag))
  })
  const n: { query: string; fragments: string[] } = {
    query: print(fieldNode),
    fragments: [],
  }
  const visitor: VisitorType = {
    leave: {
      FragmentSpread(node) {
        n.fragments.push(node.name.value)
      },
    },
  }
  visit(fieldNode, visitor)
  const getFrags = (fragNames: string[], accum: FragmentDefinitionNode[]) => {
    fragNames.forEach((fragName) => {
      const frag = frags.find((f) => f.name === fragName)
      if (!frag) {
        throw new Error(`Unable to find fragment ${fragName}`)
      }
      accum.push(frag.node)
      if (frag.subFrags) {
        getFrags(frag.subFrags, accum)
      }
    })
    return accum
  }
  const fragss = getFrags(n.fragments, [])
  const queryString = `${fragss.map((f) => print(f)).join('\n')}\n${print(q)}`
  return queryString
}
