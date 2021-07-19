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
  parse,
  isLeafType,
  visit,
  GraphQLNamedType,
  GraphQLSchema,
  Visitor,
  ASTKindToNode,
  GraphQLField,
  DocumentNode,
  ASTNode,
  getNamedType,
  TypeInfo,
  visitWithTypeInfo,
  FieldNode,
  InlineFragmentNode,
  GraphQLObjectType,
  GraphQLUnionType,
  print,
  isScalarType,
} from 'graphql'
import set from 'lodash.set'
import get from 'lodash.get'
import { getFieldInterpretter } from './fieldInterpretter'

type VisitorType = Visitor<ASTKindToNode, ASTNode>

/**
 *
 * Given a valid GraphQL query,the `formify` will populate the query
 * with additional information needed by Tina on the frontend so we're able
 * to render a Tina form.
 *
 *  ```graphql
 *    query getPostsDocument($relativePath: String!) {
 *      getPostsDocument(relativePath: $relativePath) {
 *        data {
 *          ... on Post_Doc_Data {
 *            title
 *          }
 *        }
 *      }
 *    }
 *  ```
 *  Would become:
 *  ```graphql
 *  query getPostsDocument($relativePath: String!) {
 *    getPostsDocument(relativePath: $relativePath) {
 *      data {
 *        ... on Post_Doc_Data {
 *          title
 *        }
 *      }
 *      form {
 *        __typename
 *        ... on Post_Doc_Form {
 *          label
 *          name
 *          fields {
 *            # ...
 *          }
 *        }
 *      }
 *      values {
 *        __typename
 *        ... on Post_Doc_Values {
 *          title
 *          author
 *          image
 *          hashtags
 *          _body
 *          _template
 *        }
 *      }
 *      sys {
 *        filename
 *        basename
 *        breadcrumbs
 *        path
 *        relativePath
 *        extension
 *      }
 *    }
 *  }
 * ```
 */
export const formify = (query: DocumentNode, schema: GraphQLSchema) => {
  const typeInfo = new TypeInfo(schema)

  const pathsToPopulate: {
    path: string
    paths: {
      path: string[]
      ast: object
    }[]
  }[] = []

  const visitor: VisitorType = {
    leave(node, key, parent, path, ancestors) {
      const type = typeInfo.getType()
      if (type) {
        const namedType = getNamedType(type)

        if (namedType instanceof GraphQLObjectType) {
          const hasNodeInterface = !!namedType
            .getInterfaces()
            .find((i) => i.name === 'Node')
          if (hasNodeInterface) {
            // Instead of this, there's probably a more fine-grained visitor key to use
            if (typeof path[path.length - 1] === 'number') {
              assertIsObjectType(namedType)

              const valuesNode = namedType.getFields().values
              const namedValuesNode = getNamedType(
                valuesNode.type
              ) as GraphQLNamedType
              const pathForValues = [...path]
              pathForValues.push('selectionSet')
              pathForValues.push('selections')
              const valuesAst = buildValuesForType(namedValuesNode)
              // High number to make sure this index isn't taken
              // might be more performant for it to be a low number though
              // use setWith instead
              pathForValues.push(100)

              const formNode = namedType.getFields().form
              const namedFormNode = getNamedType(
                formNode.type
              ) as GraphQLNamedType

              const pathForForm = [...path]

              pathForForm.push('selectionSet')
              pathForForm.push('selections')
              // High number to make sure this index isn't taken
              // might be more performant for it to be a low number though
              // use setWith instead
              const formAst = buildFormForType(namedFormNode)
              pathForForm.push(101)

              const sysNode = namedType.getFields().sys
              const namedSysNode = getNamedType(
                sysNode.type
              ) as GraphQLNamedType
              const pathForSys = [...path]
              pathForSys.push('selectionSet')
              pathForSys.push('selections')
              const sysAst = buildSysForType(namedSysNode)
              pathForSys.push(102)

              pathsToPopulate.push({
                path: path.map((p) => p.toString()).join('-'),
                paths: [
                  {
                    path: pathForValues.map((p) => p.toString()),
                    ast: valuesAst,
                  },
                  {
                    path: pathForForm.map((p) => p.toString()),
                    ast: formAst,
                  },
                  {
                    path: pathForSys.map((p) => p.toString()),
                    ast: sysAst,
                  },
                ],
              })
            }
          }
        }
      }
    },
  }

  visit(query, visitWithTypeInfo(typeInfo, visitor))

  // We don't want to build form/value fields for nested nodes (for now)
  // so filter out paths which aren't "top-level" ones
  const topLevelPaths = pathsToPopulate.filter((p, i) => {
    const otherPaths = pathsToPopulate.filter((_, index) => index !== i)
    const isChildOfOtherPaths = otherPaths.some((op) => {
      if (p.path.startsWith(op.path)) {
        return true
      } else {
        return false
      }
    })
    if (isChildOfOtherPaths) {
      return false
    } else {
      return true
    }
  })
  topLevelPaths.map((p) => {
    p.paths.map((pathNode) => {
      set(query, pathNode.path, pathNode.ast)
    })
  })

  return query
}

/**
 *
 * Builds out `sys` values except for `section`
 *
 * TODO: if `sys` is already provided, use that, or provide
 * an alias query for this node
 *
 */
const buildSysForType = (type: GraphQLNamedType): FieldNode => {
  assertIsObjectType(type)

  return {
    kind: 'Field' as const,
    alias: {
      kind: 'Name',
      value: '_internalSys',
    },
    name: {
      kind: 'Name' as const,
      value: 'sys',
    },
    selectionSet: {
      kind: 'SelectionSet' as const,
      selections: buildSelectionsFields(
        Object.values(type.getFields()),
        (fields) => {
          return {
            continue: true,
            // prevent infinite loop by not include documents
            filteredFields: fields.filter(
              (field) => field.name !== 'documents'
            ),
          }
        }
      ),
    },
  }
}

const buildValuesForType = (type: GraphQLNamedType): FieldNode => {
  try {
    assertIsUnionType(type)

    return {
      kind: 'Field' as const,
      name: {
        kind: 'Name' as const,
        value: 'values',
      },
      selectionSet: {
        kind: 'SelectionSet' as const,
        selections: buildSelectionInlineFragments(type.getTypes()),
      },
    }
  } catch (e) {
    // FIXME: PRIMITIVE types
    return {
      kind: 'Field' as const,
      name: {
        kind: 'Name' as const,
        value: 'values',
      },
    }
  }
}

const buildFormForType = (type: GraphQLNamedType): FieldNode => {
  try {
    assertIsUnionType(type)

    return {
      kind: 'Field' as const,
      name: {
        kind: 'Name' as const,
        value: 'form',
      },
      selectionSet: {
        kind: 'SelectionSet' as const,
        selections: buildSelectionInlineFragments(type.getTypes()),
      },
    }
  } catch (e) {
    // FIXME: PRIMITIVE types
    return {
      kind: 'Field' as const,
      name: {
        kind: 'Name' as const,
        value: 'form',
      },
    }
  }
}

const buildSelectionInlineFragments = (
  types: GraphQLObjectType<any, any>[],
  callback?: (fields: GraphQLField<any, any>[]) => {
    continue: boolean
    filteredFields: GraphQLField<any, any>[]
  }
): InlineFragmentNode[] => {
  return types.map((type) => {
    return {
      kind: 'InlineFragment' as const,
      typeCondition: {
        kind: 'NamedType' as const,
        name: {
          kind: 'Name' as const,
          value: type.name,
        },
      },
      selectionSet: {
        kind: 'SelectionSet' as const,
        selections: [
          ...Object.values(type.getFields()).map((field): FieldNode => {
            const namedType = getNamedType(field.type)
            if (isLeafType(namedType)) {
              return {
                kind: 'Field' as const,
                name: {
                  kind: 'Name' as const,
                  value: field.name,
                },
              }
            } else if (namedType instanceof GraphQLUnionType) {
              return {
                kind: 'Field' as const,
                name: {
                  kind: 'Name' as const,
                  value: field.name,
                },
                selectionSet: {
                  kind: 'SelectionSet' as const,
                  selections: [
                    ...buildSelectionInlineFragments(
                      namedType.getTypes(),
                      callback
                    ),
                  ],
                },
              }
            } else if (namedType instanceof GraphQLObjectType) {
              return {
                kind: 'Field' as const,
                name: {
                  kind: 'Name' as const,
                  value: field.name,
                },
                selectionSet: {
                  kind: 'SelectionSet' as const,
                  selections: [
                    ...buildSelectionsFields(
                      Object.values(namedType.getFields()),
                      callback
                    ),
                  ],
                },
              }
            } else {
              throw new Error(
                `Unexpected GraphQL type for field ${namedType.name}`
              )
            }
          }),
        ],
      },
    }
  })
}

export const buildSelectionsFields = (
  fields: GraphQLField<any, any>[],
  callback?: (fields: GraphQLField<any, any>[]) => {
    continue: boolean
    filteredFields: GraphQLField<any, any>[]
  }
): FieldNode[] => {
  let filteredFields = fields
  if (callback) {
    const result = callback(fields)
    if (!result.continue) {
      if (
        fields.every((field) => {
          return !isScalarType(getNamedType(field.type))
        })
      ) {
        return [
          {
            kind: 'Field' as const,
            name: {
              kind: 'Name' as const,
              value: '__typename',
            },
          },
        ]
      }
      return buildSelectionsFields(
        result.filteredFields.filter((field) => {
          if (isScalarType(getNamedType(field.type))) {
            return true
          }
          return false
        })
      )
    } else {
      filteredFields = result.filteredFields
    }
  }

  return filteredFields.map((field): FieldNode => {
    const namedType = getNamedType(field.type)
    if (isLeafType(namedType)) {
      return {
        kind: 'Field' as const,
        name: {
          kind: 'Name' as const,
          value: field.name,
        },
      }
    } else if (namedType instanceof GraphQLUnionType) {
      return {
        kind: 'Field' as const,
        name: {
          kind: 'Name' as const,
          value: field.name,
        },
        selectionSet: {
          kind: 'SelectionSet' as const,
          selections: [
            ...buildSelectionInlineFragments(namedType.getTypes(), callback),
          ],
        },
      }
    } else if (namedType instanceof GraphQLObjectType) {
      return {
        kind: 'Field' as const,
        name: {
          kind: 'Name' as const,
          value: field.name,
        },
        selectionSet: {
          kind: 'SelectionSet' as const,
          selections: [
            ...buildSelectionsFields(
              Object.values(namedType.getFields()),
              callback
            ),
          ],
        },
      }
    } else {
      return {
        kind: 'Field' as const,
        name: {
          kind: 'Name' as const,
          value: field.name,
        },
        selectionSet: {
          kind: 'SelectionSet' as const,
          selections: [],
        },
      }
    }
  })
}

/**
 * The role of `splitQuery` is to look at a query and find all of the nodes
 * that could be returned by it, and to split that information into subsets of
 * the query's original graph. It returns the nodes being queried along with information
 * about what fragments they're using, how to query those nodes by themselves, and
 * finally how to mutate those nodes.
 *
 * The purpose of this is that while we represent our data as a Graph, it needs to be
 * delegated to our Tina form system, which is a lower-level API that has no knowledge
 * of our data needs, the form is focused solely on the task of submitting mutations for a
 * given document.
 */
export const splitQuery = (args: {
  queryString: string
  schema: GraphQLSchema
}) => {
  const { schema } = args
  const typeInfo = new TypeInfo(schema)
  const queryType = schema.getQueryType()
  const mutationType = schema.getMutationType()
  const queries: {
    [key: string]: {
      query: string
      mutation: string
      path: (number | string)[]
      fragments: string[]
    }
  } = {}
  const fragmentDefinitions: {
    name: string
    path: (string | number)[]
    fragment: string
    subFragments: string[]
  }[] = []
  const fragmentSpreads: {
    path: (string | number)[]
    fragment: string
    // fragments: typeof fragmentDefinitions[];
  }[] = []
  const queryAst = parse(args.queryString)
  const visitor: VisitorType = {
    leave: {
      FragmentDefinition(node, key, parent, path) {
        fragmentDefinitions.push({
          name: node.name.value,
          path: [...path],
          fragment: print(node),
          subFragments: [],
        })
      },
      FragmentSpread(node, key, parent, path) {
        fragmentSpreads.push({
          path: [...path],
          fragment: node.name.value,
          // fragments: [],
        })
      },
      Field(node, key, parent, path, ancestors) {
        const type = typeInfo.getType()
        if (type) {
          const namedType = getNamedType(type)

          const isGraphQLUnionType =
            namedType instanceof GraphQLUnionType &&
            namedType.name === 'SectionDocumentUnion'
          const isGraphQLObjectType = namedType instanceof GraphQLObjectType

          //TODO - Instead of doing this check, we should just check if fieldInterpretter below exists.
          // Leaving here for now as things may break on the calculation of fieldInterpretter's constructor args
          if (!isGraphQLUnionType && !isGraphQLObjectType) {
            return
          }

          if (
            namedType instanceof GraphQLObjectType &&
            !namedType.getInterfaces().find((i) => i.name === 'Node')
          ) {
            return
          }

          // @ts-ignore
          const f = Object.values(queryType?.getFields()).find((field) => {
            const queryNamedType = getNamedType(field.type)
            return queryNamedType.name === namedType.name
          })
          const mutationFields = mutationType?.getFields()
          if (!mutationFields) {
            throw new Error('oh no')
          }
          const m = Object.values(mutationFields).find((field) => {
            const mutationNamedType = getNamedType(field.type)
            return mutationNamedType.name === namedType.name
          })
          if (!f) {
            throw new Error('oh no')
          }
          const paramInputType = m?.args.find((arg) => {
            return arg.name === 'params'
          })
          if (!paramInputType) {
            throw new Error('oh no')
          }
          if (!m) {
            throw new Error('oh no')
          }

          const docAst = get(queryAst, path)

          const fieldInterpretter = getFieldInterpretter(namedType, {
            mutationName: m.name,
            fieldName: f.name,
            docAst,
            paramInputType,
          })

          if (!fieldInterpretter) {
            return
          }

          const newQuery = fieldInterpretter.getQuery()
          const newMutation = fieldInterpretter.getMutation()
          let dataPath = fieldInterpretter.getDataPath(path, ancestors)

          const pathCopy = [...path]
          queries[dataPath.join('.')] = {
            query: print(newQuery),
            mutation: print(newMutation),
            fragments: [],
            path: pathCopy,
          }
        }
      },
    },
  }
  visit(queryAst, visitWithTypeInfo(typeInfo, visitor))

  fragmentDefinitions.forEach((fragmentDefinition) => {
    // loop through all fragment spreads, see if your fragment definition is using any other fragments
    fragmentSpreads.forEach((fragmentSpread) => {
      if (hasSubArray(fragmentSpread.path, fragmentDefinition.path)) {
        fragmentDefinition.subFragments.push(fragmentSpread.fragment)
        // console.log(
        //   `Fragment definition ${fragmentDefinition.name} is using fragment spread ${fragmentSpread.fragment}`
        // );
      }
    })
  })

  const recursiveFragmentSpread = (
    fragmentName: string,
    fragmentDefinitionItems: typeof fragmentDefinitions,
    accumulator: string[]
  ) => {
    const fragmentDefinition = fragmentDefinitions.find(
      ({ name }) => fragmentName === name
    )
    if (!fragmentDefinition) {
      throw new Error(
        `Expected to find a fragment definition for ${fragmentName}`
      )
    }
    if (fragmentDefinition?.subFragments.length > 0) {
      fragmentDefinition?.subFragments.map((subFragment) => {
        accumulator.push(subFragment)

        const subFragmentDefinition = fragmentDefinitionItems.find(
          ({ name }) => subFragment === name
        )
        if (!subFragmentDefinition) {
          throw new Error(
            `Expected to find a fragment definition for ${subFragment}`
          )
        }
        if (subFragmentDefinition?.subFragments.length > 0) {
          recursiveFragmentSpread(
            subFragmentDefinition.name,
            fragmentDefinitionItems,
            accumulator
          )
        }
      })
    }
  }

  const keys = Object.keys(queries)
  Object.values(queries).forEach((query, index) => {
    const fragmentsForQuery: string[] = []
    fragmentSpreads.forEach((fragmentSpread) => {
      if (hasSubArray(fragmentSpread.path, query.path)) {
        fragmentsForQuery.push(fragmentSpread.fragment)

        recursiveFragmentSpread(
          fragmentSpread.fragment,
          fragmentDefinitions,
          fragmentsForQuery
        )
      }
    })
    if (fragmentsForQuery.length > 0) {
      // console.log(
      //   `Query operation ${
      //     keys[index]
      //   } is using fragments ${fragmentsForQuery.join(", ")}`
      // );
    } else {
      // console.log(`Query operation ${keys[index]} is not using any fragments`);
    }
    query.fragments = fragmentsForQuery
  })

  return { queries, fragments: fragmentDefinitions }
}

// Checks if main array has the same values at the same indeces for a sub array
const hasSubArray = (main: (number | string)[], sub: (number | string)[]) => {
  return sub.every((item, index) => {
    return main[index] === item
  })
}

function assertIsObjectType(
  type: GraphQLNamedType
): asserts type is GraphQLObjectType {
  if (type instanceof GraphQLObjectType) {
    // do nothing
  } else {
    throw new Error(
      `Expected an instance of GraphQLObjectType for type ${type.name}`
    )
  }
}
function assertIsUnionType(
  type: GraphQLNamedType
): asserts type is GraphQLUnionType {
  if (type instanceof GraphQLUnionType) {
    // do nothing
  } else {
    throw new Error(
      `Expected an instance of GraphQLUnionType for type ${type.name}`
    )
  }
}
