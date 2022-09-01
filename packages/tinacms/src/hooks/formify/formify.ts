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
import * as util from './formify-utils'
import type { DocumentBlueprint, BlueprintPath } from './types'

type VisitorType = G.Visitor<G.ASTKindToNode, G.ASTNode>

const NOOP = 'This is either an error or is not yet supported'
const UNEXPECTED =
  'Formify encountered an unexpected error, please contact support'
const EDGES_NODE_NAME = 'edges'
const NODE_NAME = 'node'
const COLLECTION_FIELD_NAME = 'collection'
const COLLECTIONS_FIELD_NAME = 'collections'
const COLLECTIONS_DOCUMENTS_NAME = 'documents'

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
    parentType,
    selectionNode,
    path,
  }: {
    parentType: G.GraphQLOutputType
    selectionNode: G.FieldNode
    path?: { name: string; alias: string }[]
  }): G.SelectionNode => {
    return {
      ...selectionNode,
      selectionSet: {
        kind: 'SelectionSet' as const,
        selections: selectionNode.selectionSet.selections.map(
          (selectionNode2) => {
            switch (selectionNode2.kind) {
              case 'Field':
                if (selectionNode2.name.value === EDGES_NODE_NAME) {
                  const edgeField = util.getObjectField(
                    parentType,
                    selectionNode2
                  )
                  const edgesPath = util.buildPath({
                    fieldNode: selectionNode2,
                    type: edgeField.type,
                    path,
                  })
                  return {
                    ...selectionNode2,
                    selectionSet: {
                      kind: 'SelectionSet' as const,
                      selections: selectionNode2.selectionSet.selections.map(
                        (subSelectionNode) => {
                          switch (subSelectionNode.kind) {
                            case 'Field':
                              if (subSelectionNode.name.value === NODE_NAME) {
                                const nodeField = util.getObjectField(
                                  edgeField.type,
                                  subSelectionNode
                                )

                                return formifyFieldNodeDocument({
                                  fieldNode: subSelectionNode,
                                  type: nodeField.type,
                                  path: util.buildPath({
                                    fieldNode: subSelectionNode,
                                    type: nodeField.type,
                                    path: edgesPath,
                                  }),
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

  type SelectionDocument<T extends G.InlineFragmentNode | G.FieldNode> =
    T extends G.InlineFragmentNode
      ? {
          inlineFragmentNode: T
          type: G.GraphQLOutputType
          path: BlueprintPath[]
          showInSidebar: boolean
        }
      : {
          fieldNode: T
          type: G.GraphQLOutputType
          path: BlueprintPath[]
          showInSidebar: boolean
        }

  function formifyInlineFragmentDocument({
    inlineFragmentNode,
    type,
    path,
    showInSidebar = false,
  }: SelectionDocument<G.InlineFragmentNode>): G.InlineFragmentNode {
    return formifyDocument({
      selection: inlineFragmentNode,
      type,
      path,
      showInSidebar,
    })
  }
  function formifyFieldNodeDocument({
    fieldNode,
    type,
    path,
    showInSidebar = false,
  }: SelectionDocument<G.FieldNode>): G.FieldNode {
    return formifyDocument({ selection: fieldNode, type, path, showInSidebar })
  }

  function formifyDocument<T extends G.InlineFragmentNode | G.FieldNode>({
    selection,
    type,
    path,
    showInSidebar = false,
  }: {
    selection: T
    type: G.GraphQLOutputType
    path: BlueprintPath[]
    showInSidebar: boolean
  }): T {
    let extraFields = []

    const hasDataJSONField = false
    let hasValuesField = false
    let shouldFormify = false
    selection.selectionSet.selections.forEach((selection) => {
      /**
       * This check makes sure we don't formify on inline fragments,
       * so shouldFormify only returns true for sub selection, which will be
       * a document
       * ```
       * {
       *   document(relativePath: $relativePath) {
       *      # don't want _sys and _values here
       *      ...on Author {
       *        # we want them here
       *        name
       *      }
       *   }
       * }
       */
      if (selection.kind === 'Field') {
        shouldFormify = true
        if (selection.name.value === '_values') {
          hasValuesField = true
        }
      }
    })

    if (shouldFormify) {
      blueprints.push({
        id: util.getBlueprintId(path),
        path,
        selection: selection,
        fields: [],
        showInSidebar: showInSidebar,
        hasDataJSONField,
        hasValuesField,
      })
      /**
       * This is the primary purpose of formify, adding fields like
       * `form`, `values` and `_internalSys`
       */
      // Note: for template collections this
      // is getting called twice, it's harmless but
      // might point to a design falw
      extraFields = util.metaFields
    }

    return {
      ...selection,
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          ...selection.selectionSet.selections.map((selectionNode) => {
            switch (selectionNode.kind) {
              /**
               * An inline fragment will be present when the document result is polymorphic,
               * when that's the case, we need to "step down" one level with a disambiguator
               * (eg. ...on PageDocument), then run formifyFieldNodeDocument again at this lower tier
               */
              case 'InlineFragment': {
                /**
                 * This is a somewhat special use-case for node(id: "")
                 */
                const namedType = G.getNamedType(type)
                if (G.isInterfaceType(namedType)) {
                  const subType = schema
                    .getImplementations(namedType)
                    .objects.find(
                      (item) =>
                        item.name === selectionNode.typeCondition.name.value
                    )
                  return formifyInlineFragmentDocument({
                    inlineFragmentNode: selectionNode,
                    type: subType,
                    path,
                    showInSidebar: true,
                  })
                }
                return formifyInlineFragmentNode({
                  inlineFragmentNode: selectionNode,
                  parentType: type,
                  path,
                  showInSidebar: true,
                })
              }
              case 'Field': {
                return formifyFieldNode({
                  fieldNode: selectionNode,
                  parentType: type,
                  path,
                })
              }
              default:
                throw new FormifyError('UNEXPECTED')
            }
          }),
          ...extraFields,
        ],
      },
    }
  }

  const formifyFieldNode = ({
    fieldNode,
    parentType,
    path,
  }: {
    fieldNode: G.FieldNode
    parentType: G.GraphQLOutputType
    path: BlueprintPath[]
  }) => {
    if (fieldNode.name.value === '__typename') {
      return fieldNode
    }
    const field = util.getObjectField(parentType, fieldNode)

    if (!field) {
      return fieldNode
    }

    const fieldPath = util.buildPath({
      fieldNode,
      type: field.type,
      parentTypename: G.getNamedType(parentType).name,
      path,
    })
    const blueprint = blueprints.find(
      (blueprint) => blueprint.id === util.getRelativeBlueprint(fieldPath)
    )
    /**
     * This would be a field like sys.filename
     * which has no need to be formified, so exit.
     */
    if (!blueprint) {
      return fieldNode
    }

    if (util.isSysField(fieldNode)) {
      return fieldNode
    }

    blueprint.fields.push({
      id: util.getBlueprintId(fieldPath),
      documentBlueprintId: blueprint.id,
      path: fieldPath,
    })

    if (util.isScalarType(field.type)) {
      return fieldNode
    }

    return {
      ...fieldNode,
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          ...fieldNode.selectionSet.selections.map((selectionNode) => {
            switch (selectionNode.kind) {
              case 'Field': {
                return formifyFieldNode({
                  fieldNode: selectionNode,
                  parentType: field.type,
                  path: fieldPath,
                })
              }
              case 'InlineFragment': {
                return formifyInlineFragmentNode({
                  inlineFragmentNode: selectionNode,
                  parentType: field.type,
                  path: fieldPath,
                  showInSidebar: false,
                })
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

  const formifyInlineFragmentNode = ({
    inlineFragmentNode,
    parentType,
    path,
    showInSidebar,
  }: {
    inlineFragmentNode: G.InlineFragmentNode
    parentType: G.GraphQLOutputType
    path: BlueprintPath[]
    showInSidebar: boolean
  }) => {
    const type = util.getSelectedUnionType(parentType, inlineFragmentNode)
    if (!type) {
      return inlineFragmentNode
    }

    if (util.isFormifiableDocument(type)) {
      return formifyInlineFragmentDocument({
        inlineFragmentNode: inlineFragmentNode,
        type,
        path,
        showInSidebar,
      })
    }

    return {
      ...inlineFragmentNode,
      selectionSet: {
        kind: 'SelectionSet' as const,
        selections: inlineFragmentNode.selectionSet.selections.map(
          (selectionNode) => {
            switch (selectionNode.kind) {
              case 'Field':
                return formifyFieldNode({
                  fieldNode: selectionNode,
                  parentType: type,
                  path,
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
  }

  const formifiedQuery: G.DocumentNode = {
    kind: 'Document',
    definitions: optimizedQuery.definitions.map((definition) => {
      typeInfo.enter(definition)
      util.ensureOperationDefinition(definition)
      const parentType = typeInfo.getType()

      return {
        ...definition,
        selectionSet: {
          kind: 'SelectionSet',
          selections: definition.selectionSet.selections.map(
            (selectionNode) => {
              switch (selectionNode.kind) {
                case 'Field':
                  const field = util.getObjectField(parentType, selectionNode)
                  const path = util.buildPath({
                    fieldNode: selectionNode,
                    type: field.type,
                  })
                  if (util.isFormifiableDocument(field.type)) {
                    return formifyFieldNodeDocument({
                      fieldNode: selectionNode,
                      type: field.type,
                      path,
                      // NOTE: for now, only top-level, non-list queries are
                      // shown in the sidebar
                      showInSidebar: true,
                    })
                  } else if (util.isConnectionField(field.type)) {
                    return formifyConnection({
                      parentType: field.type,
                      selectionNode,
                      path,
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
                    const path = util.buildPath({
                      fieldNode: selectionNode,
                      type: field.type,
                    })
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
                                  const subField = util.getObjectField(
                                    field.type,
                                    subSelectionNode
                                  )
                                  return formifyConnection({
                                    parentType: subField.type,
                                    selectionNode: subSelectionNode,
                                    path: util.buildPath({
                                      fieldNode: subSelectionNode,
                                      type: subField.type,
                                      path,
                                    }),
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
