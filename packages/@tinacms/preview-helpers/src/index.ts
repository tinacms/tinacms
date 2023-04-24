import * as G from 'graphql'
import { z } from 'zod'
import { vercelStegaEncode } from '@vercel/stega'
import { tinaField } from 'tinacms/dist/react'
import type { TinaClient } from 'tinacms/dist/client'
import type { Plugin } from 'tinacms'

function encodeEditInfo(text: string, fieldName: string): string {
  return `${vercelStegaEncode({
    origin: 'tinacms',
    data: { fieldName },
  })}${text}`
}

type Payload = {
  id: string
  variables: object
  query: string
  data: object
  expandedQuery?: string
  expandedData?: object
  expandedQueryForResolver?: string
}

export const expandWithMetadata = async <
  D extends object,
  V extends object,
  Q extends string
>(
  props: { data: D; variables: V; query: Q },
  client: TinaClient<any>
): Promise<{ data: D; variables: V; query: Q }> => {
  const instrospectionResult = await client.request({
    query: G.getIntrospectionQuery(),
  })
  const clientSchema = G.buildClientSchema(instrospectionResult.data)
  // const astNode = await client.request({ query: G.getIntrospectionQuery() })
  // const clientSchema = G.buildClientSchema(astNode)
  const astNode = G.parse(G.printSchema(clientSchema))
  const astNodeWithMeta: G.DocumentNode = {
    ...astNode,
    definitions: astNode.definitions.map((def) => {
      if (def.kind === 'ObjectTypeDefinition') {
        return {
          ...def,
          fields: [
            ...(def.fields || []),
            {
              kind: 'FieldDefinition',
              name: {
                kind: 'Name',
                value: '_tina_metadata',
              },
              arguments: [],
              type: {
                kind: 'NonNullType',
                type: {
                  kind: 'NamedType',
                  name: {
                    kind: 'Name',
                    value: 'JSON',
                  },
                },
              },
            },
          ],
        }
      }
      return def
    }),
  }
  const schema = G.buildASTSchema(astNode)
  const schemaForResolver = G.buildASTSchema(astNodeWithMeta)
  const documentNode = G.parse(props.query)
  const expandedDocumentNode = expandQuery({ schema, documentNode })
  const expandedQuery = G.print(expandedDocumentNode)
  const expandedData = await client.request({
    query: expandedQuery,
    variables: props.variables,
  })

  const expandedDocumentNodeForResolver = expandQuery({
    schema: schemaForResolver,
    documentNode,
  })
  const expandedQueryForResolver = G.print(expandedDocumentNodeForResolver)

  // const payload = await expandPayload(p)
  // const { expandedQueryForResolver, variables, expandedData } = payload
  if (!expandedQueryForResolver || !expandedData) {
    throw new Error(`Unable to process payload which has not been expanded`)
  }

  const result = G.graphqlSync({
    schema: schemaForResolver,
    source: expandedQueryForResolver,
    variableValues: props.variables,
    rootValue: expandedData.data,
    fieldResolver: (source, args, context, info) => {
      const fieldName = info.fieldName
      const aliases: string[] = []
      info.fieldNodes.forEach((fieldNode) => {
        if (fieldNode.alias) {
          aliases.push(fieldNode.alias.value)
        }
      })
      let value = source[fieldName] as unknown
      if (!value) {
        aliases.forEach((alias) => {
          const aliasValue = source[alias]
          if (aliasValue) {
            value = aliasValue
          }
        })
      }
      if (fieldName === '_sys') {
        return source._internalSys
      }
      if (fieldName === '_values') {
        return source._internalValues
      }
      if (info.fieldName === '_tina_metadata') {
        if (value) {
          return value
        }
        // TODO: ensure all fields that have _tina_metadata
        // actually need it
        return {
          id: null,
          fields: [],
        }
      }
      if (isNodeType(info.returnType)) {
        if (!value) {
          return
        }
        return documentWithMetadata(documentSchema.passthrough().parse(value))
      }
      if (typeof value === 'string' && source?._tina_metadata) {
        // FIXME: hack to prevent breaking images
        if (isValidHttpUrl(value)) {
          return value
        } else {
          return encodeEditInfo(value, tinaField(source, info.fieldName))
        }
      }
      return value
    },
  })

  return { ...result, query: props.query, variables: props.variables } as {
    data: D
    variables: V
    query: Q
  }
}

function isValidHttpUrl(string: string) {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

const expandQuery = ({
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
        [...(node.selectionSet?.selections || []), METADATA_FIELD] || [],
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

type SystemInfo = {
  breadcrumbs: string[]
  basename: string
  filename: string
  path: string
  extension: string
  relativePath: string
  title?: string | null | undefined
  template: string
  // __typename: string
  collection: {
    name: string
    slug: string
    label: string
    path: string
    format?: string | null | undefined
    matches?: string | null | undefined
    // templates?: object
    // fields?: object
    // __typename: string
  }
}

type Document = {
  _values: Record<string, unknown>
  _sys: SystemInfo
}

type ResolvedDocument = {
  _internalValues: Record<string, unknown>
  _internalSys: SystemInfo
}

type Path = (string | number)[]

const objectWithMetadata = (obj: object, id: string, path: Path) => {
  const objWithMetadata: Record<string, unknown> = {}
  Object.entries(obj).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      objWithMetadata[key] = value.map((item, index) => {
        if (isObject(item)) {
          return objectWithMetadata(item, id, [...path, key, index])
        }
        return item
      })
    } else if (isObject(value)) {
      objWithMetadata[key] = objectWithMetadata(value, id, [...path, key])
    } else {
      objWithMetadata[key] = value
    }
  })

  const metaFields: Record<string, string> = {}
  Object.keys(obj)
    .filter(
      (item) =>
        !['_sys', '_internalSys', '__typename', '_internalValues'].includes(
          item
        )
    )
    .map((item) => {
      metaFields[item] = [...path, item].join('.')
    })

  return {
    ...objWithMetadata,
    _tina_metadata: {
      id,
      fields: metaFields,
    },
  }
}

const isObject = (item: unknown) => {
  if (typeof item === 'object' && !Array.isArray(item) && item !== null) {
    return true
  }
  return false
}

const sysSchema = z.object({
  breadcrumbs: z.array(z.string()),
  basename: z.string(),
  filename: z.string(),
  path: z.string(),
  extension: z.string(),
  relativePath: z.string(),
  title: z.string().optional().nullable(),
  template: z.string(),
  collection: z.object({
    name: z.string(),
    slug: z.string(),
    label: z.string(),
    path: z.string(),
    format: z.string().optional().nullable(),
    matches: z.string().optional().nullable(),
  }),
})

const documentSchema = z.object({
  _internalValues: z.record(z.unknown()),
  _internalSys: sysSchema,
})

const documentWithMetadata = (doc: ResolvedDocument) => {
  const documentWithMetadata: Record<string, unknown> = {}
  const id = doc._internalSys.path
  Object.entries(doc).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      documentWithMetadata[key] = value.map((item, index) => {
        if (isObject(item)) {
          return objectWithMetadata(item, id, [key, index])
        }
        return item
      })
    } else if (isObject(value)) {
      documentWithMetadata[key] = objectWithMetadata(value, id, [key])
    } else {
      documentWithMetadata[key] = value
    }
  })

  const metaFields: Record<string, string> = {}
  Object.keys(doc)
    .filter(
      (item) =>
        !['_sys', '_internalSys', '__typename', '_internalValues'].includes(
          item
        )
    )
    .map((item) => {
      metaFields[item] = item
    })

  return {
    ...documentWithMetadata,
    _tina_metadata: {
      id,
      fields: metaFields,
    },
  }
}

export interface PreviewHelperPlugin extends Plugin {
  __type: 'preview-helper'
  encodeEditInfo: typeof encodeEditInfo
}
export function createPreviewHelper(): PreviewHelperPlugin {
  return {
    __type: 'preview-helper',
    name: 'preview-helper',
    encodeEditInfo,
  }
}
