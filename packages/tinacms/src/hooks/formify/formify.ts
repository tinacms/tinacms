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

import * as G from 'graphql'
import * as util from './util'
import type { DocumentBlueprint } from './types'

type VisitorType = G.Visitor<G.ASTKindToNode, G.ASTNode>

const NOOP = 'This is either an error or is not yet supported'
const UNEXPECTED =
  'Formify encountered an unexpected error, please contact support'
const EDGES_NODE_NAME = 'edges'
const NODE_NAME = 'node'
const COLLECTION_FIELD_NAME = 'getCollection'
const COLLECTIONS_FIELD_NAME = 'getCollections'
const COLLECTIONS_DOCUMENTS_NAME = 'documents'
export const DATA_NODE_NAME = 'data'

export const formify = async ({
  schema,
  query,
  getOptimizedQuery,
}: {
  schema: G.GraphQLSchema
  query: string
  getOptimizedQuery: (query: G.DocumentNode) => Promise<G.DocumentNode>
}): Promise<{
  formifiedQuery: G.DocumentNode
  blueprints: DocumentBlueprint[]
}> => {
  const blueprints: DocumentBlueprint[] = []
  const documentNode = G.parse(query)
  const visitor: VisitorType = {
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
  const documentNodeWithName = G.visit(documentNode, visitor)
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
          (selectionNode2) => {
            switch (selectionNode2.kind) {
              case 'Field':
                if (selectionNode2.name.value === EDGES_NODE_NAME) {
                  const edgeField = namedFieldType.getFields()[EDGES_NODE_NAME]
                  const edgeType = G.getNamedType(edgeField.type)
                  util.ensureObjectType(edgeType)
                  const path2 = [
                    ...path,
                    util.getNameAndAlias(selectionNode2, true, false),
                  ]
                  return {
                    ...selectionNode2,
                    selectionSet: {
                      kind: 'SelectionSet' as const,
                      selections: selectionNode2.selectionSet.selections.map(
                        (subSelectionNode) => {
                          switch (subSelectionNode.kind) {
                            case 'Field':
                              if (subSelectionNode.name.value === NODE_NAME) {
                                const nodeField =
                                  edgeType.getFields()[NODE_NAME]
                                const path3 = [
                                  ...path2,
                                  util.getNameAndAlias(
                                    subSelectionNode,
                                    false,
                                    true
                                  ),
                                ]
                                return formifyNode({
                                  fieldOrInlineFragmentNode: subSelectionNode,
                                  type: nodeField.type,
                                  path: path3,
                                  showInSidebar: false,
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
                return selectionNode2
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
    showInSidebar = false,
  }: {
    // FIXME: this generic isn't working
    fieldOrInlineFragmentNode: T
    type: G.GraphQLOutputType
    path: { name: string; alias: string }[]
    showInSidebar: boolean
  }) {
    let extraFields = []
    const namedType = G.getNamedType(type)

    let hasDataJSONField = false
    let hasValuesField = false
    let shouldFormify = false
    fieldOrInlineFragmentNode.selectionSet.selections.forEach((selection) => {
      if (selection.kind === 'Field') {
        if (selection.name.value === 'dataJSON') {
          shouldFormify = true
          hasDataJSONField = true
        }
        if (selection.name.value === 'values') {
          shouldFormify = true
          hasValuesField = true
        }
        if (selection.name.value === 'data') {
          shouldFormify = true
        }
      }
    })

    if (shouldFormify) {
      blueprints.push({
        id: util.getBlueprintId(path),
        path,
        selection: fieldOrInlineFragmentNode,
        fields: [],
        showInSidebar: showInSidebar,
        hasDataJSONField,
        hasValuesField,
      })
      /**
       * This is the primary purpose of formify, adding fields like
       * `form`, `values` and `_internalSys`
       */
      extraFields = util.metaFields
    }

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
                    const subType = schema
                      .getImplementations(namedType)
                      .objects.find(
                        (item) =>
                          item.name === selectionNode.typeCondition.name.value
                      )
                    return formifyNode({
                      fieldOrInlineFragmentNode: selectionNode,
                      type: subType,
                      path,
                      showInSidebar: false,
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
                    showInSidebar,
                  })
                case 'Field':
                  if (selectionNode.name.value === DATA_NODE_NAME) {
                    const path2 = [
                      ...path,
                      util.getNameAndAlias(selectionNode, false, false),
                    ]
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
                                    const subSelectionType = G.getNamedType(
                                      subSelectionField.type
                                    )
                                    return formifyField({
                                      fieldNode: subSelectionNode,
                                      parentType: field.type,
                                      path: [
                                        ...path2,
                                        util.getNameAndAlias(
                                          subSelectionNode,
                                          G.isListType(subSelectionField.type),
                                          util.isNodeField(subSelectionType)
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
                    throw new FormifyError('UNEXPECTED')
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
    const fieldBlueprint = {
      id: util.getBlueprintId([...path]),
      documentBlueprintId: util.getRelativeBlueprint(path),
      path: [...path],
    }
    const blueprint = blueprints.find(
      (blueprint) => blueprint.id === util.getRelativeBlueprint(path)
    )
    blueprint.fields.push(fieldBlueprint)

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
                  const newPath = [
                    ...path,
                    util.getNameAndAlias(
                      selectionNode,
                      G.isListType(subField.type),
                      false
                    ),
                  ]
                  const fieldBlueprint = {
                    id: util.getBlueprintId(newPath),
                    documentBlueprintId: util.getRelativeBlueprint(newPath),
                    path: newPath,
                  }
                  const blueprint = blueprints.find(
                    (blueprint) =>
                      blueprint.id === util.getRelativeBlueprint(path)
                  )
                  blueprint.fields.push(fieldBlueprint)
                  return selectionNode
                }
                const subFieldType = subField.type
                const namedSubFieldType = G.getNamedType(subFieldType)

                const newPath = [
                  ...path,
                  util.getNameAndAlias(
                    selectionNode,
                    G.isListType(subFieldType),
                    util.isNodeField(namedSubFieldType)
                  ),
                ]
                const fieldBlueprint = {
                  id: util.getBlueprintId(newPath),
                  documentBlueprintId: util.getRelativeBlueprint(newPath),
                  path: newPath,
                }
                const blueprint = blueprints.find(
                  (blueprint) =>
                    blueprint.id === util.getRelativeBlueprint(path)
                )
                blueprint.fields.push(fieldBlueprint)

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
                            util.ensureObjectType(namedSubFieldType)
                            const subField1 = util.getObjectField(
                              namedSubFieldType,
                              subSelectionNode
                            )
                            const subType1 = subField1.type
                            const namedSubType2 = G.getNamedType(subType1)
                            return formifyField({
                              fieldNode: subSelectionNode,
                              parentType: subFieldType,
                              path: [
                                ...path,
                                util.getNameAndAlias(
                                  subSelectionNode,
                                  G.isListType(subType1),
                                  util.isNodeField(namedSubType2)
                                ),
                              ],
                            })
                          case 'InlineFragment':
                            const subNamedType = G.getNamedType(subField.type)
                            util.ensureNodeField(subNamedType)
                            util.ensureUnionType(subNamedType)

                            const subType = util.getSelectedUnionType(
                              subNamedType,
                              subSelectionNode
                            )

                            const newPath = [
                              ...path,
                              util.getNameAndAlias(
                                selectionNode,
                                G.isListType(subField.type),
                                true
                              ),
                            ]
                            return formifyNode({
                              fieldOrInlineFragmentNode: subSelectionNode,
                              type: subType,
                              path: newPath,
                              showInSidebar: false,
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
                  const parentType2 = util.getSelectedUnionType(
                    namedType,
                    selectionNode
                  )

                  return formifyNode({
                    fieldOrInlineFragmentNode: selectionNode,
                    type: parentType2,
                    path,
                    showInSidebar: false,
                  })
                }

                const subType = util.getSelectedUnionType(
                  namedType,
                  selectionNode
                )
                const namedSubType = G.getNamedType(subType)

                return {
                  ...selectionNode,
                  selectionSet: {
                    kind: 'SelectionSet' as const,
                    selections: selectionNode.selectionSet.selections.map(
                      (subSelectionNode) => {
                        switch (subSelectionNode.kind) {
                          case 'Field':
                            util.ensureObjectType(namedSubType)
                            const subField = util.getObjectField(
                              namedSubType,
                              subSelectionNode
                            )
                            const subType2 = subField.type
                            const namedSubType2 = G.getNamedType(subType2)
                            return formifyField({
                              fieldNode: subSelectionNode,
                              parentType: subType,
                              path: [
                                ...path,
                                util.getNameAndAlias(
                                  subSelectionNode,
                                  G.isListType(subType2),
                                  util.isNodeField(namedSubType2)
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
  const formifiedQuery: G.DocumentNode = {
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
                      path: [util.getNameAndAlias(selectionNode, false, true)],
                      // NOTE: for now, only top-level, non-list queries are
                      // shown in the sidebar
                      showInSidebar: true,
                    })
                  } else if (util.isConnectionField(namedFieldType)) {
                    return formifyConnection({
                      namedFieldType,
                      selectionNode,
                      path: [util.getNameAndAlias(selectionNode, false, false)],
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
                    const path = [
                      util.getNameAndAlias(selectionNode, false, false),
                    ]
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
                                      ...path,
                                      util.getNameAndAlias(
                                        subSelectionNode,
                                        G.isListType(docType),
                                        util.isNodeField(docType)
                                      ),
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
  return { formifiedQuery, blueprints }
}

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
