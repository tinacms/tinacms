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
  FieldDefinitionNode,
  ScalarTypeDefinitionNode,
  InputValueDefinitionNode,
  ObjectTypeDefinitionNode,
  InterfaceTypeDefinitionNode,
  NamedTypeNode,
  UnionTypeDefinitionNode,
  TypeDefinitionNode,
  DirectiveNode,
  EnumTypeDefinitionNode,
  InputObjectTypeDefinitionNode,
  DocumentNode,
} from 'graphql'
import _ from 'lodash'

/**
 * the `gql` module provides functions and types which can be
 * used to build up the GraphQL AST. The primary reason for us using
 * this instead of the [builders provided by the graphql package](https://graphql.org/graphql-js/type/#examples)
 * is due to the dynamic and asynchronous nature of our needs.
 *
 * The tradeoff is a low-level API that's often more verbose, and it's
 * not a complete match of the GraphQL spec, so additional properties will likely
 * be needed as our needs grow.
 */
export const astBuilder = {
  /**
   * `FormFieldBuilder` acts as a shortcut to building an entire `ObjectTypeDefinition`, we use this
   * because all Tina field objects share a common set of fields ('name', 'label', 'component')
   */
  FormFieldBuilder: ({
    name,
    additionalFields,
  }: {
    name: string
    additionalFields?: FieldDefinitionNode[]
  }) => {
    return astBuilder.ObjectTypeDefinition({
      name: name,
      interfaces: [astBuilder.NamedType({ name: 'FormField' })],
      fields: [
        astBuilder.FieldDefinition({
          name: 'name',
          required: true,
          type: astBuilder.TYPES.String,
        }),
        astBuilder.FieldDefinition({
          name: 'label',
          required: true,
          type: astBuilder.TYPES.String,
        }),
        astBuilder.FieldDefinition({
          name: 'component',
          required: true,
          type: astBuilder.TYPES.String,
        }),
        ...(additionalFields || []),
      ],
    })
  },
  ScalarTypeDefinition: ({
    name,
    description,
  }: {
    name: string
    description?: string
  }): ScalarTypeDefinitionNode => {
    return {
      kind: 'ScalarTypeDefinition',
      name: {
        kind: 'Name',
        value: name,
      },
      description: {
        kind: 'StringValue',
        value: description || '',
      },
      directives: [],
    }
  },
  InputValueDefinition: ({
    name,
    type,
    list,
    required,
  }: {
    name: string
    type: string | InputObjectTypeDefinitionNode | EnumTypeDefinitionNode
    list?: boolean
    required?: boolean
  }) => {
    let res = {}
    const namedType = {
      kind: 'NamedType' as const,
      name: {
        kind: 'Name' as const,
        value: type,
      },
    }
    const def = {
      kind: 'InputValueDefinition' as const,
      name: {
        kind: 'Name' as const,
        value: name,
      },
    }
    if (list) {
      if (required) {
        res = {
          ...def,
          type: {
            kind: 'ListType' as const,
            type: {
              kind: 'NonNullType',
              type: namedType,
            },
          },
        }
      } else {
        res = {
          ...def,
          type: {
            kind: 'ListType' as const,
            type: namedType,
          },
        }
      }
    } else {
      if (required) {
        res = {
          ...def,
          type: {
            kind: 'NonNullType',
            type: namedType,
          },
        }
      } else {
        res = {
          ...def,
          type: namedType,
        }
      }
    }

    return res as InputValueDefinitionNode
  },
  EnumDefinition: (props: {
    name: string
    required?: boolean
    values: string[]
  }): EnumTypeDefinitionNode => {
    return {
      kind: 'EnumTypeDefinition',
      name: {
        kind: 'Name',
        value: props.name,
      },
      values: props.values.map((val) => {
        return {
          kind: 'EnumValueDefinition',
          name: {
            kind: 'Name',
            value: val,
          },
        }
      }),
    }
  },
  FieldDefinition: ({
    name,
    type,
    args = [],
    list,
    required,
  }: {
    name: string
    type: string | TypeDefinitionNode
    required?: boolean
    list?: boolean
    args?: InputValueDefinitionNode[]
  }) => {
    let res = {}
    const namedType = {
      kind: 'NamedType' as const,
      name: {
        kind: 'Name' as const,
        value: type,
      },
    }
    const def = {
      kind: 'FieldDefinition' as const,
      name: {
        kind: 'Name' as const,
        value: name,
      },
      arguments: args,
    }
    if (list) {
      if (required) {
        res = {
          ...def,
          type: {
            kind: 'NonNullType' as const,
            type: {
              kind: 'ListType' as const,
              type: {
                kind: 'NonNullType',
                type: namedType,
              },
            },
          },
        }
      } else {
        res = {
          ...def,
          type: {
            kind: 'ListType' as const,
            type: namedType,
          },
        }
      }
    } else {
      if (required) {
        res = {
          ...def,
          type: {
            kind: 'NonNullType' as const,
            type: namedType,
          },
        }
      } else {
        res = {
          ...def,
          type: namedType,
        }
      }
    }

    return res as FieldDefinitionNode
  },
  InterfaceTypeDefinition: ({
    name,
    fields,
    description = '',
  }: {
    name: string
    description?: string
    fields: FieldDefinitionNode[]
  }): InterfaceTypeDefinitionNode => {
    return {
      kind: 'InterfaceTypeDefinition',
      description: { kind: 'StringValue', value: description },
      name: {
        kind: 'Name',
        value: name,
      },
      interfaces: [],
      directives: [],
      fields: fields,
    }
  },
  InputObjectTypeDefinition: ({
    name,
    fields,
  }: {
    name: string
    fields: InputValueDefinitionNode[] | ObjectTypeDefinitionNode[]
  }): InputObjectTypeDefinitionNode => ({
    kind: 'InputObjectTypeDefinition' as const,
    name: {
      kind: 'Name' as const,
      value: name,
    },
    // @ts-ignore FIXME; this is being handled properly but we're lying to
    // ts and then fixing it in the `extractInlineTypes` function
    fields,
  }),
  UnionTypeDefinition: ({
    name,
    types,
  }: {
    name: string
    types: (string | TypeDefinitionNode)[]
  }): UnionTypeDefinitionNode => ({
    kind: 'UnionTypeDefinition' as const,
    name: {
      kind: 'Name' as const,
      value: name,
    },
    directives: [],
    // @ts-ignore FIXME; this is being handled properly but we're lying to
    // ts and then fixing it in the `extractInlineTypes` function
    types: types.map((name) => ({
      kind: 'NamedType' as const,
      name: {
        kind: 'Name' as const,
        value: name,
      },
    })),
  }),
  NamedType: ({ name }: { name: string }): NamedTypeNode => {
    return {
      kind: 'NamedType',
      name: {
        kind: 'Name',
        value: name,
      },
    }
  },
  ObjectTypeDefinition: ({
    name,
    fields,
    interfaces = [],
    directives = [],
    args = [],
  }: {
    name: string
    fields: FieldDefinitionNode[]
    interfaces?: NamedTypeNode[]
    directives?: DirectiveNode[]
    args?: NamedTypeNode[]
  }): ObjectTypeDefinitionNode => ({
    kind: 'ObjectTypeDefinition' as const,
    interfaces,
    directives,
    name: {
      kind: 'Name' as const,
      value: name,
    },
    fields,
  }),
  TYPES: {
    Scalar: (type: scalarNames) => {
      const scalars = {
        string: 'String',
        boolean: 'Boolean',
        number: 'Int', // FIXME - needs to be float or int
        datetime: 'String', // FIXME
        image: 'String', // FIXME
        text: 'String',
      }
      return scalars[type]
    },
    MultiCollectionDocument: 'DocumentNode',
    CollectionDocumentUnion: 'DocumentUnion',
    String: 'String',
    Reference: 'Reference',
    Collection: 'Collection',
    ID: 'ID',
    SystemInfo: 'SystemInfo',
    Boolean: 'Boolean',
    Node: 'Node',
    PageInfo: 'PageInfo',
    Connection: 'Connection',
    Number: 'Int',
    Document: 'Document',
  },
  toGraphQLAst: (ast: {
    globalTemplates: TypeDefinitionNode[]
    query: TypeDefinitionNode
    definitions: TypeDefinitionNode[]
  }): DocumentNode => {
    const definitions = _.uniqBy(
      [
        ...extractInlineTypes(ast.query),
        ...extractInlineTypes(ast.globalTemplates),
        ...ast.definitions,
      ],
      (field) => field.name.value
    )

    return {
      kind: 'Document',
      definitions,
    }
  },
}

type scalarNames =
  | 'string'
  | 'boolean'
  | 'datetime'
  | 'image'
  | 'text'
  | 'number'

const capitalize = (s: string) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export const extractInlineTypes = (
  item: TypeDefinitionNode | TypeDefinitionNode[]
) => {
  if (Array.isArray(item)) {
    // @ts-ignore
    const accumulator: TypeDefinitionNode[] = item.map((i) => {
      return extractInlineTypes(i)
    })
    return _.flattenDeep(accumulator)
  } else {
    const accumulator: TypeDefinitionNode[] = [item]
    // @ts-ignore
    for (const node of walk(item)) {
      if (node.kind === 'UnionTypeDefinition') {
        // @ts-ignore
        node.types = _.uniqBy(node.types, (type) => type.name.value)
      }
      // @ts-ignore
      if (node.kind === 'NamedType') {
        // @ts-ignore
        if (typeof node.name.value !== 'string') {
          // @ts-ignore
          accumulator.push(node.name.value)
          // @ts-ignore
          node.name.value = node.name.value.name.value
        }
      }
    }

    return accumulator
  }
}

export function* walk(
  maybeNode: TypeDefinitionNode,
  visited = new WeakSet()
): IterableIterator<TypeDefinitionNode> {
  if (typeof maybeNode === 'string') {
    return
  }

  if (visited.has(maybeNode)) {
    return
  }

  // Traverse node's properties first
  for (const value of Object.values(maybeNode)) {
    if (Array.isArray(value)) {
      for (const element of value) {
        yield* walk(element, visited)
      }
    } else {
      yield* walk(value, visited)
    }
  }
  // Then pass it back to our callback, which will mutate it
  yield maybeNode
  visited.add(maybeNode)
}

export function addNamespaceToSchema<T extends object | string>(
  maybeNode: T,
  namespace: string[] = []
): T {
  if (typeof maybeNode === 'string') {
    return maybeNode
  }
  if (typeof maybeNode === 'boolean') {
    return maybeNode
  }

  // @ts-ignore
  const newNode: {
    [key in keyof T]: (T & { namespace?: string[] }) | string
  } = maybeNode
  // Traverse node's properties first
  const keys = Object.keys(maybeNode)
  Object.values(maybeNode).map((m, index) => {
    const key = keys[index]
    if (Array.isArray(m)) {
      // @ts-ignore
      newNode[key] = m.map((element) => {
        if (!element.hasOwnProperty('name')) {
          return element
        }
        const value = element.name || element.value // options field accepts an object with `value`  instead of `name`
        return addNamespaceToSchema(element, [...namespace, value])
      })
    } else {
      if (!m.hasOwnProperty('name')) {
        // @ts-ignore
        newNode[key] = m
      } else {
        // @ts-ignore
        newNode[key] = addNamespaceToSchema(m, [...namespace, m.name])
      }
    }
  })
  // @ts-ignore
  return { ...newNode, namespace: namespace }
}

const generateNamespacedFieldName = (names: string[], suffix: string = '') => {
  return (suffix ? [...names, suffix] : names).map(capitalize).join('')
}

export const NAMER = {
  dataFilterTypeNameOn: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, '_FilterOn')
  },
  dataFilterTypeName: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, 'Filter')
  },
  dataMutationTypeNameOn: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, '_MutationOn')
  },
  dataMutationTypeName: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, 'Mutation')
  },
  mutationName: (namespace: string[]) => {
    return 'update' + generateNamespacedFieldName(namespace, 'Document')
  },
  queryName: (namespace: string[]) => {
    return 'get' + generateNamespacedFieldName(namespace, 'Document')
  },
  generateQueryListName: (namespace: string[]) => {
    return 'get' + generateNamespacedFieldName(namespace, 'List')
  },
  collectionTypeName: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, 'Collection')
  },
  documentTypeName: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, 'Document')
  },
  dataTypeName: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, '')
  },
  referenceConnectionType: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, 'Connection')
  },
  referenceConnectionEdgesTypeName: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, 'ConnectionEdges')
  },
}
