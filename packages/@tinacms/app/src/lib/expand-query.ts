import * as G from 'graphql'

export const expandQuery = ({
  schema,
  documentNode,
}: {
  schema: G.GraphQLSchema
  documentNode: G.DocumentNode
}): G.DocumentNode => {
  const documentNodeWithTypenames = addTypenameToDocument(documentNode)
  return addMetaFieldsToQuery(documentNodeWithTypenames, new G.TypeInfo(schema))
}

const addTypenameToDocument = (doc: G.DocumentNode) => {
  function isField(selection: G.SelectionNode): selection is G.FieldNode {
    return selection.kind === 'Field'
  }
  return G.visit(doc, {
    SelectionSet: {
      enter(node, _key, parent) {
        // Don't add __typename to OperationDefinitions.
        if (
          parent &&
          (parent as G.OperationDefinitionNode).kind ===
            G.Kind.OPERATION_DEFINITION
        ) {
          return
        }

        // No changes if no selections.
        const { selections } = node
        if (!selections) {
          return
        }

        // If selections already have a __typename, or are part of an
        // introspection query, do nothing.
        const skip = selections.some((selection) => {
          return (
            isField(selection) &&
            (selection.name.value === '__typename' ||
              selection.name.value.lastIndexOf('__', 0) === 0)
          )
        })
        if (skip) {
          return
        }

        // If this SelectionSet is @export-ed as an input variable, it should
        // not have a __typename field (see issue #4691).
        const field = parent as G.FieldNode
        if (
          isField(field) &&
          field.directives &&
          field.directives.some((d) => d.name.value === 'export')
        ) {
          return
        }

        // Create and return a new SelectionSet with a __typename Field.
        return {
          ...node,
          selections: [...selections, TYPENAME_FIELD],
        }
      },
    },
  })
}

const CONTENT_SOURCE_FIELD: G.FieldNode = {
  kind: G.Kind.FIELD,
  name: {
    kind: G.Kind.NAME,
    value: '_content_source',
  },
}
const METADATA_FIELD: G.FieldNode = {
  kind: G.Kind.FIELD,
  name: {
    kind: G.Kind.NAME,
    value: '_tina_metadata',
  },
}

const TYPENAME_FIELD: G.FieldNode = {
  kind: G.Kind.FIELD,
  name: {
    kind: G.Kind.NAME,
    value: '__typename',
  },
}

const addMetadataField = (
  node: G.FieldNode | G.InlineFragmentNode | G.FragmentDefinitionNode
): G.ASTNode => {
  return {
    ...node,
    selectionSet: {
      ...(node.selectionSet || {
        kind: 'SelectionSet',
        selections: [],
      }),
      selections:
        [
          ...(node.selectionSet?.selections || []),
          METADATA_FIELD,
          CONTENT_SOURCE_FIELD,
        ] || [],
    },
  }
}

const addMetaFieldsToQuery = (
  documentNode: G.DocumentNode,
  typeInfo: G.TypeInfo
) => {
  const addMetaFields: G.VisitFn<G.ASTNode, G.FieldNode> = (
    node: G.FieldNode
  ): G.ASTNode => {
    return {
      ...node,
      selectionSet: {
        ...(node.selectionSet || {
          kind: 'SelectionSet',
          selections: [],
        }),
        selections:
          [...(node.selectionSet?.selections || []), ...metaFields] || [],
      },
    }
  }

  const formifyVisitor: G.Visitor<G.ASTKindToNode, G.ASTNode> = {
    FragmentDefinition: {
      enter: (node, key, parent, path, ancestors) => {
        typeInfo.enter(node)
        const type = typeInfo.getType()
        if (type) {
          const namedType = G.getNamedType(type)
          if (G.isObjectType(namedType)) {
            if (namedType.getFields()['_tina_metadata']) {
              return addMetadataField(node)
            }
          }
          return node
        }
      },
    },
    InlineFragment: {
      enter: (node, key, parent, path, ancestors) => {
        typeInfo.enter(node)
        const type = typeInfo.getType()
        if (type) {
          const namedType = G.getNamedType(type)
          if (G.isObjectType(namedType)) {
            if (namedType.getFields()['_tina_metadata']) {
              return addMetadataField(node)
            }
          }
          return node
        }
      },
    },
    Field: {
      enter: (node, key, parent, path, ancestors) => {
        typeInfo.enter(node)
        const type = typeInfo.getType()
        if (type) {
          if (isNodeType(type)) {
            return addMetaFields(node, key, parent, path, ancestors)
          }
          const namedType = G.getNamedType(type)
          if (G.isObjectType(namedType)) {
            if (namedType.getFields()['_tina_metadata']) {
              return addMetadataField(node)
            }
            return node
          }
        }
        return node
      },
    },
  }
  return G.visit(documentNode, G.visitWithTypeInfo(typeInfo, formifyVisitor))
}
/**
 * This is a dummy query which we pull apart and spread
 * back into the the selectionSet for all "Node" fields
 */
const node = G.parse(`
 query Sample {
  ...on Document {
    _internalValues: _values
    _internalSys: _sys {
      breadcrumbs
      basename
      filename
      path
      extension
      relativePath
      title
      template
      collection {
        name
        slug
        label
        path
        format
        matches
        templates
        fields
      }
    }
  }
 }`)
const metaFields: G.SelectionNode[] =
  // @ts-ignore
  node.definitions[0].selectionSet.selections

export const isNodeType = (type: G.GraphQLOutputType) => {
  const namedType = G.getNamedType(type)
  if (G.isInterfaceType(namedType)) {
    if (namedType.name === 'Node') {
      return true
    }
  }
  if (G.isUnionType(namedType)) {
    const types = namedType.getTypes()
    if (
      types.every((type) => {
        return type.getInterfaces().some((intfc) => intfc.name === 'Node')
      })
    ) {
      return true
    }
  }
  if (G.isObjectType(namedType)) {
    if (namedType.getInterfaces().some((intfc) => intfc.name === 'Node')) {
      return true
    }
  }
}

export const isConnectionType = (type: G.GraphQLOutputType) => {
  const namedType = G.getNamedType(type)
  if (G.isInterfaceType(namedType)) {
    if (namedType.name === 'Connection') {
      return true
    }
  }
  if (G.isUnionType(namedType)) {
    const types = namedType.getTypes()
    if (
      types.every((type) => {
        return type.getInterfaces().some((intfc) => intfc.name === 'Connection')
      })
    ) {
      return true
    }
  }
  if (G.isObjectType(namedType)) {
    if (
      namedType.getInterfaces().some((intfc) => intfc.name === 'Connection')
    ) {
      return true
    }
  }
}
