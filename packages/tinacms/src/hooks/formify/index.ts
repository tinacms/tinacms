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
  visit,
  GraphQLSchema,
  Visitor,
  ASTKindToNode,
  DocumentNode,
  ASTNode,
} from 'graphql'
import React from 'react'
import * as G from 'graphql'
import * as util from './util'

import type { TinaCMS } from '@tinacms/toolkit'

type Action =
  | {
      type: 'setSchema'
      value: G.GraphQLSchema
    }
  | {
      type: 'setQuery'
      value: G.DocumentNode
    }
  | {
      type: 'addNode'
      value: DocNode
    }

export type DocNode = {
  path: readonly (string | number)[]
}
export type Dispatch = React.Dispatch<Action>

type State = {
  schema: G.GraphQLSchema
  query: G.DocumentNode
  status: 'pending' | 'ready' | 'done'
  nodes: DocNode[]
}
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'setSchema':
      return { ...state, status: 'ready', schema: action.value }
    case 'addNode':
      return { ...state, nodes: [...state.nodes, action.value] }
    case 'setQuery':
      return { ...state, status: 'done', query: action.value }
    default:
      return state
  }
}

type VisitorType = Visitor<ASTKindToNode, ASTNode>

const NOOP = 'This is either an error or is not yet supported'
const UNEXPECTED =
  'Formify encountered an unexpected error, please contact support'
const DATA_NODE_NAME = 'data'
const EDGES_NODE_NAME = 'edges'
const NODE_NAME = 'node'
const COLLECTION_FIELD_NAME = 'getCollection'
const COLLECTIONS_FIELD_NAME = 'getCollections'
const COLLECTIONS_DOCUMENTS_NAME = 'documents'

class FormifyError extends Error {
  constructor(code: 'NOOP' | 'UNEXPECTED', details?: string) {
    let message
    switch (code) {
      case 'NOOP':
        message = NOOP
        break
      case 'UNEXPECTED':
        message = UNEXPECTED
        break
      default:
        message = ''
        break
    }
    super(`${message} ${details || ''}`)
    this.name = 'FormifyError'
  }
}

/**
 * TODO: this is currently only used for testing, `formify` is where the primary logic is housed
 */
export const useFormify = ({ query, cms }: { query: string; cms: TinaCMS }) => {
  const [state, dispatch] = React.useReducer(reducer, {
    status: 'pending',
    schema: undefined,
    query: G.parse(query),
    nodes: [],
  })
  React.useEffect(() => {
    cms.api.tina.getSchema().then((schema) => {
      dispatch({ type: 'setSchema', value: schema })
    })
  }, [])
  React.useEffect(() => {
    const run = async () => {
      if (state.status === 'ready') {
        const formifiedQuery = await formify({
          schema: state.schema,
          query,
          getOptimizedQuery: cms.api.tina.getOptimizedQuery,
        })
        dispatch({ type: 'setQuery', value: formifiedQuery })
      }
    }
    run()
  }, [state.status])

  return {
    query: G.print(state.query),
    status: state.status,
    nodes: state.nodes,
  }
}

export const formify = async ({
  schema,
  query,
  getOptimizedQuery,
}: {
  schema: GraphQLSchema
  query: string
  getOptimizedQuery: (query: DocumentNode) => Promise<DocumentNode>
}): Promise<DocumentNode> => {
  const documentNode = G.parse(query)
  const visitor2: VisitorType = {
    OperationDefinition: (node) => {
      if (!node.name) {
        return {
          ...node,
          name: {
            kind: 'Name',
            // FIXME: add some sort of uuid to this
            value: `QueryOperation`,
          },
        }
      }
      return node
    },
  }
  const documentNodeWithName = visit(documentNode, visitor2)
  const optimizedQuery = await getOptimizedQuery(documentNodeWithName)
  const typeInfo = new G.TypeInfo(schema)

  const formifyConnection = ({ namedFieldType, selectionNode }) => {
    util.ensureObjectType(namedFieldType)
    return {
      ...selectionNode,
      selectionSet: {
        kind: 'SelectionSet' as const,
        selections: selectionNode.selectionSet.selections.map(
          (selectionNode) => {
            switch (selectionNode.kind) {
              case 'Field':
                if (selectionNode.name.value === EDGES_NODE_NAME) {
                  const edgeField = namedFieldType.getFields()[EDGES_NODE_NAME]
                  const edgeType = G.getNamedType(edgeField.type)
                  util.ensureObjectType(edgeType)
                  return {
                    ...selectionNode,
                    selectionSet: {
                      kind: 'SelectionSet' as const,
                      selections: selectionNode.selectionSet.selections.map(
                        (selectionNode) => {
                          switch (selectionNode.kind) {
                            case 'Field':
                              if (selectionNode.name.value === NODE_NAME) {
                                const nodeField =
                                  edgeType.getFields()[NODE_NAME]
                                return formifyNode({
                                  fieldOrInlineFragmentNode: selectionNode,
                                  parentType: nodeField.type,
                                })
                              } else {
                                return selectionNode
                              }
                            default:
                              throw new FormifyError('NOOP')
                          }
                        }
                      ),
                    },
                  }
                }
                return selectionNode
              default:
                throw new FormifyError('UNEXPECTED')
            }
          }
        ),
      },
    }
  }

  function formifyNode<T extends G.FieldNode | G.InlineFragmentNode>({
    fieldOrInlineFragmentNode,
    parentType,
  }: {
    fieldOrInlineFragmentNode: T
    parentType: G.GraphQLOutputType
  }): T {
    let extraFields = []
    return {
      ...fieldOrInlineFragmentNode,
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          ...fieldOrInlineFragmentNode.selectionSet.selections.map(
            (selectionNode) => {
              const namedParentType = G.getNamedType(parentType)
              switch (selectionNode.kind) {
                /**
                 * An inline fragment will be present when the document result is polymorphic,
                 * when that's the case, we need to "step down" one level with a disambiguator
                 * (eg. ...on PageDocument), then run formifyNode again at this lower tier
                 */
                case 'InlineFragment':
                  /**
                   * This is a somewhat special use-case for node(id: "")
                   */
                  if (G.isInterfaceType(namedParentType)) {
                    const type =
                      schema.getImplementations(namedParentType).objects[
                        selectionNode.typeCondition.name.value
                      ]
                    return formifyNode({
                      fieldOrInlineFragmentNode: selectionNode,
                      parentType: type,
                    })
                  }
                  util.ensureUnionType(namedParentType)
                  const type = util.getSelectedUnionType(
                    namedParentType,
                    selectionNode
                  )
                  return formifyNode({
                    fieldOrInlineFragmentNode: selectionNode,
                    parentType: type,
                  })
                case 'Field':
                  if (selectionNode.name.value === DATA_NODE_NAME) {
                    /**
                     * This is the primary purpose of formify, adding fields like
                     * `form`, `values` and `_internalSys`
                     */
                    extraFields = util.metaFields
                    if (G.isObjectType(namedParentType)) {
                      const field = util.getObjectField(
                        namedParentType,
                        selectionNode
                      )
                      const namedType = G.getNamedType(field.type)
                      util.ensureObjectType(namedType)
                      return {
                        ...selectionNode,
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            ...selectionNode.selectionSet.selections.map(
                              (subSelectionNode) => {
                                switch (subSelectionNode.kind) {
                                  case 'Field':
                                    return formifyField({
                                      fieldNode: subSelectionNode,
                                      parentType: field.type,
                                    })
                                  default:
                                    throw new FormifyError(
                                      'UNEXPECTED',
                                      `selection ${subSelectionNode.kind}`
                                    )
                                }
                              }
                            ),
                          ],
                        },
                      }
                    }
                    return selectionNode
                  }
                  return selectionNode
                default:
                  throw new FormifyError('UNEXPECTED')
              }
            }
          ),
          ...extraFields,
        ],
      },
    }
  }

  const formifyField = ({
    fieldNode,
    parentType,
  }: {
    fieldNode: G.FieldNode
    parentType: G.GraphQLOutputType
  }): G.FieldNode => {
    const namedParentType = G.getNamedType(parentType)
    util.ensureObjectType(namedParentType)
    const field = util.getObjectField(namedParentType, fieldNode)
    if (!field) {
      if (fieldNode.name.value === '__typename') {
        return fieldNode
      } else {
        throw new FormifyError(
          'UNEXPECTED',
          `field with no associated type ${fieldNode.name.value}`
        )
      }
    }
    const namedType = G.getNamedType(field.type)
    if (G.isScalarType(namedType)) {
      return fieldNode
    }
    return {
      ...fieldNode,
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          ...fieldNode.selectionSet.selections.map((selectionNode) => {
            switch (selectionNode.kind) {
              case 'Field':
                if (selectionNode.name.value === '__typename') {
                  return selectionNode
                }
                util.ensureObjectType(namedType)
                const field = util.getObjectField(namedType, selectionNode)
                if (!field) {
                  return fieldNode
                }
                if (G.isScalarType(G.getNamedType(field.type))) {
                  return selectionNode
                }
                return {
                  ...selectionNode,
                  selectionSet: {
                    kind: 'SelectionSet' as const,
                    selections: selectionNode.selectionSet.selections.map(
                      (selectionNode) => {
                        switch (selectionNode.kind) {
                          case 'Field':
                            return selectionNode
                          case 'InlineFragment':
                            const namedType = G.getNamedType(field.type)
                            util.ensureNodeField(namedType)
                            return formifyNode({
                              fieldOrInlineFragmentNode: selectionNode,
                              parentType: field.type,
                            })
                          default:
                            throw new FormifyError(
                              'UNEXPECTED',
                              `selection ${selectionNode.kind}`
                            )
                        }
                      }
                    ),
                  },
                }
              case 'InlineFragment':
                util.ensureUnionType(namedType)
                if (util.isNodeField(namedType)) {
                  const parentType = util.getSelectedUnionType(
                    namedType,
                    selectionNode
                  )
                  return formifyNode({
                    fieldOrInlineFragmentNode: selectionNode,
                    parentType: parentType,
                  })
                }
                return {
                  ...selectionNode,
                  selectionSet: {
                    kind: 'SelectionSet' as const,
                    selections: selectionNode.selectionSet.selections.map(
                      (subSelectionNode) => {
                        switch (subSelectionNode.kind) {
                          case 'Field':
                            const parentType = util.getSelectedUnionType(
                              namedType,
                              selectionNode
                            )
                            return formifyField({
                              fieldNode: subSelectionNode,
                              parentType: parentType,
                            })
                          default:
                            throw new FormifyError(
                              'UNEXPECTED',
                              `selection ${subSelectionNode.kind}`
                            )
                        }
                      }
                    ),
                  },
                }
              default:
                throw new FormifyError(
                  'UNEXPECTED',
                  `selection ${selectionNode.kind}`
                )
            }
          }),
        ],
      },
    }
  }
  return {
    kind: 'Document',
    definitions: optimizedQuery.definitions.map((definition) => {
      typeInfo.enter(definition)
      util.ensureOperationDefinition(definition)
      const type = typeInfo.getType()
      const namedType = G.getNamedType(type)
      util.ensureObjectType(namedType)
      return {
        ...definition,
        selectionSet: {
          kind: 'SelectionSet',
          selections: definition.selectionSet.selections.map(
            (selectionNode) => {
              switch (selectionNode.kind) {
                case 'Field':
                  const parentType = type
                  const namedParentType = G.getNamedType(parentType)
                  util.ensureObjectType(namedParentType)
                  const field = util.getObjectField(
                    namedParentType,
                    selectionNode
                  )
                  const namedFieldType = G.getNamedType(field.type)
                  if (util.isNodeField(namedFieldType)) {
                    return formifyNode({
                      fieldOrInlineFragmentNode: selectionNode,
                      parentType: field.type,
                    })
                  } else if (util.isConnectionField(namedFieldType)) {
                    return formifyConnection({
                      namedFieldType,
                      selectionNode,
                    })
                  }

                  /**
                   * `getCollection` and `getColletions` include a `documents` list field
                   * which can possibly be formified.
                   */
                  if (
                    selectionNode.name.value === COLLECTION_FIELD_NAME ||
                    selectionNode.name.value === COLLECTIONS_FIELD_NAME
                  ) {
                    return {
                      ...selectionNode,
                      selectionSet: {
                        kind: 'SelectionSet',
                        selections: selectionNode.selectionSet.selections.map(
                          (selectionNode) => {
                            switch (selectionNode.kind) {
                              case 'Field':
                                if (
                                  selectionNode.name.value ===
                                  COLLECTIONS_DOCUMENTS_NAME
                                ) {
                                  util.ensureObjectType(namedFieldType)
                                  const n =
                                    namedFieldType.getFields()[
                                      COLLECTIONS_DOCUMENTS_NAME
                                    ]
                                  const docType = G.getNamedType(n.type)
                                  return formifyConnection({
                                    namedFieldType: docType,
                                    selectionNode,
                                  })
                                }
                                return selectionNode
                              default:
                                throw new FormifyError('NOOP')
                            }
                          }
                        ),
                      },
                    }
                  }
                  throw new FormifyError('NOOP')
                default:
                  throw new FormifyError('UNEXPECTED')
              }
            }
          ),
        },
      }
    }),
  }
}
