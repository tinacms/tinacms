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
        const { formifiedQuery } = await formify({
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

type TinaDocumentField = {
  path: string[]
  aliasPath: string[]
}
type TinaDocumentNode = {
  path: { name: string; alias: string; list?: boolean }[]
}

export const formify = async ({
  schema,
  query,
  getOptimizedQuery,
}: {
  schema: GraphQLSchema
  query: string
  getOptimizedQuery: (query: DocumentNode) => Promise<DocumentNode>
}): Promise<{ formifiedQuery: DocumentNode; nodes: TinaDocumentNode[] }> => {
  const nodes: TinaDocumentNode[] = []
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

  const formifyConnection = ({
    namedFieldType,
    selectionNode,
    path,
  }: {
    namedFieldType: G.GraphQLNamedType
    selectionNode: G.FieldNode
    path: { name: string; alias: string }[]
  }): G.SelectionNode => {
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
                        (subSelectionNode) => {
                          switch (subSelectionNode.kind) {
                            case 'Field':
                              if (subSelectionNode.name.value === NODE_NAME) {
                                const nodeField =
                                  edgeType.getFields()[NODE_NAME]
                                return formifyNode({
                                  fieldOrInlineFragmentNode: subSelectionNode,
                                  type: nodeField.type,
                                  path: [
                                    ...path,
                                    util.getNameAndAlias(selectionNode),
                                    util.getNameAndAlias(
                                      subSelectionNode,
                                      true
                                    ),
                                  ],
                                })
                              } else {
                                return subSelectionNode
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
    type,
    path,
  }: {
    fieldOrInlineFragmentNode: T
    type: G.GraphQLOutputType
    path: { name: string; alias: string }[]
  }) {
    let extraFields = []
    const namedType = G.getNamedType(type)

    const formifiedNode = {
      ...fieldOrInlineFragmentNode,
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          ...fieldOrInlineFragmentNode.selectionSet.selections.map(
            (selectionNode) => {
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
                  if (G.isInterfaceType(namedType)) {
                    const subType =
                      schema.getImplementations(namedType).objects[
                        selectionNode.typeCondition.name.value
                      ]
                    return formifyNode({
                      fieldOrInlineFragmentNode: selectionNode,
                      type: subType,
                      path,
                    })
                  }
                  util.ensureUnionType(namedType)
                  const subType = util.getSelectedUnionType(
                    namedType,
                    selectionNode
                  )
                  return formifyNode({
                    fieldOrInlineFragmentNode: selectionNode,
                    type: subType,
                    path,
                  })
                case 'Field':
                  if (selectionNode.name.value === DATA_NODE_NAME) {
                    /**
                     * This is the primary purpose of formify, adding fields like
                     * `form`, `values` and `_internalSys`
                     */
                    extraFields = util.metaFields
                    if (G.isObjectType(namedType)) {
                      const field = util.getObjectField(
                        namedType,
                        selectionNode
                      )
                      const namedSubType = G.getNamedType(field.type)
                      util.ensureObjectType(namedSubType)
                      return {
                        ...selectionNode,
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            ...selectionNode.selectionSet.selections.map(
                              (subSelectionNode) => {
                                switch (subSelectionNode.kind) {
                                  case 'Field':
                                    const subSelectionField =
                                      util.getObjectField(
                                        namedSubType,
                                        subSelectionNode
                                      )
                                    if (!subSelectionField) {
                                      return subSelectionNode
                                    }
                                    return formifyField({
                                      fieldNode: subSelectionNode,
                                      parentType: field.type,
                                      path: [
                                        ...path,
                                        util.getNameAndAlias(
                                          subSelectionNode,
                                          G.isListType(subSelectionField.type)
                                        ),
                                      ],
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

    return formifiedNode
  }

  const formifyField = ({
    fieldNode,
    parentType,
    path,
  }: {
    fieldNode: G.FieldNode
    parentType: G.GraphQLOutputType
    path: { name: string; alias: string }[]
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
                const subField = util.getObjectField(namedType, selectionNode)
                if (!subField) {
                  return fieldNode
                }
                if (G.isScalarType(G.getNamedType(subField.type))) {
                  return selectionNode
                }
                return {
                  ...selectionNode,
                  selectionSet: {
                    kind: 'SelectionSet' as const,
                    selections: selectionNode.selectionSet.selections.map(
                      (subSelectionNode) => {
                        switch (subSelectionNode.kind) {
                          case 'Field':
                            if (subSelectionNode.name.value === '__typename') {
                              return subSelectionNode
                            }
                            throw new FormifyError('NOOP')
                          case 'InlineFragment':
                            const subNamedType = G.getNamedType(subField.type)
                            util.ensureNodeField(subNamedType)
                            return formifyNode({
                              fieldOrInlineFragmentNode: subSelectionNode,
                              type: subField.type,
                              path,
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
              case 'InlineFragment':
                util.ensureUnionType(namedType)
                if (util.isNodeField(namedType)) {
                  const parentType = util.getSelectedUnionType(
                    namedType,
                    selectionNode
                  )
                  return formifyNode({
                    fieldOrInlineFragmentNode: selectionNode,
                    type: parentType,
                    path,
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
                            const subType = util.getSelectedUnionType(
                              namedType,
                              selectionNode
                            )
                            return formifyField({
                              fieldNode: subSelectionNode,
                              parentType: subType,
                              path,
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
  const formifiedQuery: DocumentNode = {
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
                      type: field.type,
                      path: [util.getNameAndAlias(selectionNode)],
                    })
                  } else if (util.isConnectionField(namedFieldType)) {
                    return formifyConnection({
                      namedFieldType,
                      selectionNode,
                      path: [util.getNameAndAlias(selectionNode)],
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
                          (subSelectionNode) => {
                            switch (subSelectionNode.kind) {
                              case 'Field':
                                if (
                                  subSelectionNode.name.value ===
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
                                    selectionNode: subSelectionNode,
                                    path: [
                                      util.getNameAndAlias(subSelectionNode),
                                    ],
                                  })
                                }
                                return subSelectionNode
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
  nodes.map((node) => {
    const namePath = []
    const aliasPath = []
    node.path.forEach((p) => {
      namePath.push(p.name)
      aliasPath.push(p.alias)
      if (p.list) {
        namePath.push('NUM')
        aliasPath.push('NUM')
      }
    })
    const stringFormat = JSON.stringify(
      {
        namePath: namePath.join('.'),
        aliasPath: aliasPath.join('.'),
      },
      null,
      2
    )

    // console.log(stringFormat)
  })
  return { formifiedQuery, nodes }
}
