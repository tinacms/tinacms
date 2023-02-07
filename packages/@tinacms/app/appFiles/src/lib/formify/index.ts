/**

*/

import * as G from 'graphql'

type VisitorType = G.Visitor<G.ASTKindToNode, G.ASTNode>
type Info = { name: string; alias: string; fields?: Info[]; path?: string[] }
export type Blueprint2 = Info

export const formify = async ({
  schema,
  optimizedDocumentNode,
}: {
  schema: G.GraphQLSchema
  optimizedDocumentNode: G.DocumentNode
}): Promise<{
  formifiedQuery: G.DocumentNode
  blueprints: Blueprint2[]
}> => {
  const blueprints: Blueprint2[] = []
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
  const documentNodeWithName = G.visit(optimizedDocumentNode, visitor)
  const optimizedQuery = documentNodeWithName as G.DocumentNode
  const typeInfo = new G.TypeInfo(schema)

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

  const getPath = (
    path: readonly (string | number)[],
    node: G.ASTNode | readonly G.ASTNode[]
  ) => {
    let currentLevel = node
    const fieldPath: string[] = []
    path.forEach((item) => {
      // @ts-ignore not sure the best way to ensure this is indexable
      currentLevel = currentLevel[item]
      if (!Array.isArray(currentLevel)) {
        // @ts-ignore FIXME this array check doesn't seem to be doing anything for the types
        if (currentLevel.kind === 'Field') {
          fieldPath.push(currentLevel.name.value)
        }
      }
    })
    return fieldPath
  }

  const addBlueprints: G.VisitFn<G.ASTNode, G.FieldNode> = (
    node: G.FieldNode,
    _key,
    _parent,
    path,
    ancestors
  ): void => {
    const fieldPath = getPath(path, ancestors[0])
    const nextInfo = (innerNode: G.FieldNode) => {
      const fields: Info['fields'] = []
      G.visit(
        innerNode,
        G.visitWithTypeInfo(typeInfo, {
          Field: {
            enter: (node) => {
              typeInfo.enter(node)
              if (node.name.value !== innerNode.name.value) {
                if (node.selectionSet?.selections.length) {
                  const subInfo = nextInfo(node)
                  fields.push({
                    name: node.name.value,
                    alias: node.alias?.value || node.name.value,
                    fields: subInfo.fields,
                  })
                  // Stop visiting this subtree, it'll be visited from the next nextInfo() call
                  return false
                } else {
                  fields.push({
                    name: node.name.value,
                    alias: node.alias?.value || node.name.value,
                  })
                }
              }
            },
            leave: (node) => {
              typeInfo.leave(node)
            },
          },
        })
      )
      if (fields?.length) {
        return {
          name: innerNode.name.value,
          alias: innerNode.alias?.value || innerNode.name.value,
          fields,
        }
      } else {
        return {
          name: innerNode.name.value,
          alias: innerNode.alias?.value || innerNode.name.value,
        }
      }
    }
    const result = nextInfo(node)
    const mergeFields = (fields: Info['fields']): Info['fields'] => {
      if (!fields) {
        return []
      }
      const groupBy = <T extends { [key: string]: any }>(
        items: T[],
        key: string
      ) =>
        items.reduce(
          (result: { [key: string]: T[] }, item: T) => ({
            ...result,
            [item[key]]: [...(result[item[key]] || []), item],
          }),
          {}
        )

      const groups = groupBy(fields, 'alias') as { [name: string]: Info[] }
      const groupedFields: Info[] = []
      Object.entries(groups).forEach(([name, items]) => {
        const subFields: Info[] = []
        items.forEach((item) => {
          item.fields?.forEach((field) => subFields.push(field))
        })
        const fieldName = items[0].name
        const fieldAlias = items[0].alias
        if (subFields?.length) {
          groupedFields.push({
            name: fieldName,
            alias: fieldAlias,
            fields: subFields,
          })
        } else {
          groupedFields.push({ name: fieldName, alias: fieldAlias })
        }
      })
      return groupedFields
    }
    const fields = mergeFields(result.fields)
    if (
      // blueprints.find(({ path }) =>
      //   fieldPath.join('.').startsWith(path.join('.'))
      // )
      false
    ) {
      // skip because this is a nested blueperint
    } else {
      if (fields?.length) {
        blueprints.push({
          name: result.name,
          alias: result.alias,
          fields,
          path: fieldPath,
        })
      } else {
        blueprints.push({
          name: result.name,
          alias: result.alias,
          path: fieldPath,
        })
      }
    }
  }

  const formifyVisitor: VisitorType = {
    InlineFragment: {
      enter: (node) => {
        typeInfo.enter(node)
      },
      leave: (node) => {
        typeInfo.leave(node)
      },
    },
    Field: {
      enter: (node, key, parent, path, ancestors) => {
        typeInfo.enter(node)
        const type = typeInfo.getType()
        if (type) {
          const namedType = G.getNamedType(type)
          if (G.isInterfaceType(namedType)) {
            if (namedType.name === 'Node') {
              return addMetaFields(node, key, parent, path, ancestors)
            }
          }
          if (G.isUnionType(namedType)) {
            const types = namedType.getTypes()
            if (
              types.every((type) => {
                return type
                  .getInterfaces()
                  .some((intfc) => intfc.name === 'Node')
              })
            ) {
              return addMetaFields(node, key, parent, path, ancestors)
            }
          }
          if (G.isObjectType(namedType)) {
            if (
              namedType.getInterfaces().some((intfc) => intfc.name === 'Node')
            ) {
              return addMetaFields(node, key, parent, path, ancestors)
            }
          }
        }
      },
    },
  }
  const blueprintVisitor: VisitorType = {
    InlineFragment: {
      enter: (node) => {
        typeInfo.enter(node)
      },
      leave: (node) => {
        typeInfo.leave(node)
      },
    },
    Field: {
      enter: (node, key, parent, path, ancestors) => {
        typeInfo.enter(node)
        const type = typeInfo.getType()
        if (type) {
          const namedType = G.getNamedType(type)
          if (G.isInterfaceType(namedType)) {
            if (namedType.name === 'Node') {
              addBlueprints(node, key, parent, path, ancestors)
              return false
            }
          }
          if (G.isUnionType(namedType)) {
            const types = namedType.getTypes()
            if (
              types.every((type) => {
                return type
                  .getInterfaces()
                  .some((intfc) => intfc.name === 'Node')
              })
            ) {
              addBlueprints(node, key, parent, path, ancestors)
              return false
            }
          }
          if (G.isObjectType(namedType)) {
            if (
              namedType.getInterfaces().some((intfc) => intfc.name === 'Node')
            ) {
              addBlueprints(node, key, parent, path, ancestors)
              return false
            }
          }
        }
      },
    },
  }
  const formifiedQuery = G.visit(
    optimizedQuery,
    G.visitWithTypeInfo(typeInfo, formifyVisitor)
  )
  G.visit(formifiedQuery, G.visitWithTypeInfo(typeInfo, blueprintVisitor))

  return { formifiedQuery, blueprints }
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
        __typename
      }
      __typename
    }
  }
 }`)
const metaFields: G.SelectionNode[] =
  // @ts-ignore
  node.definitions[0].selectionSet.selections
