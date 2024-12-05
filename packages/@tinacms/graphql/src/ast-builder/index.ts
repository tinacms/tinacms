/**

*/

import {
  type FieldDefinitionNode,
  type ScalarTypeDefinitionNode,
  type InputValueDefinitionNode,
  type ObjectTypeDefinitionNode,
  type InterfaceTypeDefinitionNode,
  type NamedTypeNode,
  type UnionTypeDefinitionNode,
  type TypeDefinitionNode,
  type DirectiveNode,
  type EnumTypeDefinitionNode,
  type InputObjectTypeDefinitionNode,
  type DocumentNode,
  type FragmentDefinitionNode,
  type SelectionNode,
  SelectionSetNode,
  type FieldNode,
  type InlineFragmentNode,
  type OperationDefinitionNode,
  type VariableDefinitionNode,
  type ArgumentNode,
} from 'graphql'
import { flattenDeep, lastItem } from '../util'
import uniqBy from 'lodash.uniqby'

export const SysFieldDefinition = {
  kind: 'Field' as const,
  name: {
    kind: 'Name' as const,
    value: '_sys',
  },
  arguments: [],
  directives: [],
  selectionSet: {
    kind: 'SelectionSet' as const,
    selections: [
      // {
      //   kind: 'Field' as const,
      //   name: {
      //     kind: 'Name' as const,
      //     value: 'title',
      //   },
      //   arguments: [],
      //   directives: [],
      // },
      {
        kind: 'Field' as const,
        name: {
          kind: 'Name' as const,
          value: 'filename',
        },
        arguments: [],
        directives: [],
      },
      {
        kind: 'Field' as const,
        name: {
          kind: 'Name' as const,
          value: 'basename',
        },
        arguments: [],
        directives: [],
      },
      {
        kind: 'Field' as const,
        name: {
          kind: 'Name' as const,
          value: 'hasReferences',
        },
        arguments: [],
        directives: [],
      },
      {
        kind: 'Field' as const,
        name: {
          kind: 'Name' as const,
          value: 'breadcrumbs',
        },
        arguments: [],
        directives: [],
      },
      {
        kind: 'Field' as const,
        name: {
          kind: 'Name' as const,
          value: 'path',
        },
        arguments: [],
        directives: [],
      },
      {
        kind: 'Field' as const,
        name: {
          kind: 'Name' as const,
          value: 'relativePath',
        },
        arguments: [],
        directives: [],
      },
      {
        kind: 'Field' as const,
        name: {
          kind: 'Name' as const,
          value: 'extension',
        },
        arguments: [],
        directives: [],
      },
    ],
  },
}

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
  FieldNodeDefinition: ({
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
  }) =>
    ({
      name: { kind: 'Name' as const, value: name },
      kind: 'Field' as const,
    } as FieldNode),
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
    // Default to true
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

    // list
    if (list) {
      // list and required
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
        // list and not required
      } else {
        res = {
          ...def,
          type: {
            kind: 'ListType' as const,
            type: namedType,
          },
        }
      }
      // Not a list
    } else {
      // Not a list and required
      if (required) {
        res = {
          ...def,
          type: {
            kind: 'NonNullType' as const,
            type: namedType,
          },
        }
        // Not a list and not required
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
  FieldWithSelectionSetDefinition: ({
    name,
    selections,
  }: {
    name: string
    selections: SelectionNode[]
  }) => {
    return {
      name: { kind: 'Name' as const, value: name },
      kind: 'Field' as const,
      selectionSet: {
        kind: 'SelectionSet' as const,
        selections,
      },
    }
  },
  InlineFragmentDefinition: ({
    name,
    selections,
  }: {
    name: string
    selections: SelectionNode[]
  }): InlineFragmentNode => {
    return {
      kind: 'InlineFragment' as const,
      selectionSet: {
        kind: 'SelectionSet' as const,
        selections,
      },
      typeCondition: {
        kind: 'NamedType' as const,
        name: {
          kind: 'Name' as const,
          value: name,
        },
      },
    }
  },
  FragmentDefinition: ({
    name,
    fragmentName,
    selections,
  }: {
    name: string
    fragmentName: string
    selections: SelectionNode[]
  }): FragmentDefinitionNode => {
    return {
      kind: 'FragmentDefinition' as const,
      name: {
        kind: 'Name' as const,
        value: fragmentName,
      },
      typeCondition: {
        kind: 'NamedType' as const,
        name: {
          kind: 'Name' as const,
          value: name,
        },
      },
      directives: [],
      selectionSet: {
        kind: 'SelectionSet' as const,
        selections,
      },
    }
  },
  TYPES: {
    Scalar: (type: scalarNames) => {
      const scalars = {
        string: 'String',
        boolean: 'Boolean',
        number: 'Float', // FIXME - needs to be float or int
        datetime: 'String', // FIXME
        image: 'String', // FIXME
        text: 'String',
      }
      return scalars[type]
    },
    MultiCollectionDocument: 'DocumentNode',
    CollectionDocumentUnion: 'DocumentUnion',
    Folder: 'Folder',
    String: 'String',
    Password: 'Password',
    Reference: 'Reference',
    Collection: 'Collection',
    ID: 'ID',
    SystemInfo: 'SystemInfo',
    Boolean: 'Boolean',
    JSON: 'JSON',
    Node: 'Node',
    PageInfo: 'PageInfo',
    Connection: 'Connection',
    Number: 'Float',
    Document: 'Document',
  },

  QueryOperationDefinition: ({
    queryName,
    fragName,
  }: {
    queryName: string
    fragName: string
  }): OperationDefinitionNode => {
    return {
      kind: 'OperationDefinition' as const,
      operation: 'query' as const,
      name: {
        kind: 'Name' as const,
        value: queryName,
      },
      variableDefinitions: [
        {
          kind: 'VariableDefinition' as const,
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name' as const, value: 'String' },
            },
          },
          variable: {
            kind: 'Variable' as const,
            name: { kind: 'Name' as const, value: 'relativePath' },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet' as const,
        selections: [
          {
            kind: 'Field',
            name: {
              kind: 'Name',
              value: queryName,
            },
            arguments: [
              {
                kind: 'Argument',
                name: {
                  kind: 'Name',
                  value: 'relativePath',
                },
                value: {
                  kind: 'Variable',
                  name: {
                    kind: 'Name',
                    value: 'relativePath',
                  },
                },
              },
            ],
            directives: [],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'InlineFragment' as const,
                  typeCondition: {
                    kind: 'NamedType' as const,
                    name: {
                      kind: 'Name' as const,
                      value: 'Document',
                    },
                  },
                  directives: [],
                  selectionSet: {
                    kind: 'SelectionSet' as const,
                    selections: [
                      SysFieldDefinition,
                      {
                        kind: 'Field',
                        name: {
                          kind: 'Name',
                          value: 'id',
                        },
                        arguments: [],
                        directives: [],
                      },
                    ],
                  },
                },
                {
                  kind: 'FragmentSpread',
                  name: {
                    kind: 'Name',
                    value: fragName,
                  },
                  directives: [],
                },
              ],
            },
          },
        ],
      },
    }
  },

  ListQueryOperationDefinition: ({
    queryName,
    fragName,
    filterType,
    dataLayer,
  }: {
    queryName: string
    fragName: string
    filterType: string
    dataLayer: boolean
  }): OperationDefinitionNode => {
    const variableDefinitions: VariableDefinitionNode[] = [
      {
        kind: 'VariableDefinition',
        variable: {
          kind: 'Variable',
          name: {
            kind: 'Name',
            value: 'before',
          },
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'String',
          },
        },
        directives: [],
      },
      {
        kind: 'VariableDefinition',
        variable: {
          kind: 'Variable',
          name: {
            kind: 'Name',
            value: 'after',
          },
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'String',
          },
        },
        directives: [],
      },
      {
        kind: 'VariableDefinition',
        variable: {
          kind: 'Variable',
          name: {
            kind: 'Name',
            value: 'first',
          },
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'Float',
          },
        },
        directives: [],
      },
      {
        kind: 'VariableDefinition',
        variable: {
          kind: 'Variable',
          name: {
            kind: 'Name',
            value: 'last',
          },
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'Float',
          },
        },
        directives: [],
      },
      {
        kind: 'VariableDefinition',
        variable: {
          kind: 'Variable',
          name: {
            kind: 'Name',
            value: 'sort',
          },
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'String',
          },
        },
        directives: [],
      },
    ]
    const queryArguments: ArgumentNode[] = [
      {
        kind: 'Argument',
        name: {
          kind: 'Name',
          value: 'before',
        },
        value: {
          kind: 'Variable',
          name: {
            kind: 'Name',
            value: 'before',
          },
        },
      },
      {
        kind: 'Argument',
        name: {
          kind: 'Name',
          value: 'after',
        },
        value: {
          kind: 'Variable',
          name: {
            kind: 'Name',
            value: 'after',
          },
        },
      },
      {
        kind: 'Argument',
        name: {
          kind: 'Name',
          value: 'first',
        },
        value: {
          kind: 'Variable',
          name: {
            kind: 'Name',
            value: 'first',
          },
        },
      },
      {
        kind: 'Argument',
        name: {
          kind: 'Name',
          value: 'last',
        },
        value: {
          kind: 'Variable',
          name: {
            kind: 'Name',
            value: 'last',
          },
        },
      },
      {
        kind: 'Argument',
        name: {
          kind: 'Name',
          value: 'sort',
        },
        value: {
          kind: 'Variable',
          name: {
            kind: 'Name',
            value: 'sort',
          },
        },
      },
    ]

    if (dataLayer) {
      queryArguments.push({
        kind: 'Argument',
        name: {
          kind: 'Name',
          value: 'filter',
        },
        value: {
          kind: 'Variable',
          name: {
            kind: 'Name',
            value: 'filter',
          },
        },
      })

      variableDefinitions.push({
        kind: 'VariableDefinition',
        variable: {
          kind: 'Variable',
          name: {
            kind: 'Name',
            value: 'filter',
          },
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: filterType,
          },
        },
        directives: [],
      })
    }

    return {
      kind: 'OperationDefinition',
      operation: 'query',
      name: {
        kind: 'Name',
        value: queryName,
      },
      variableDefinitions,
      directives: [],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: {
              kind: 'Name',
              value: queryName,
            },
            arguments: queryArguments,
            directives: [],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: {
                    kind: 'Name',
                    value: 'pageInfo',
                  },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: {
                          kind: 'Name',
                          value: 'hasPreviousPage',
                        },
                        arguments: [],
                        directives: [],
                      },
                      {
                        kind: 'Field',
                        name: {
                          kind: 'Name',
                          value: 'hasNextPage',
                        },
                        arguments: [],
                        directives: [],
                      },
                      {
                        kind: 'Field',
                        name: {
                          kind: 'Name',
                          value: 'startCursor',
                        },
                        arguments: [],
                        directives: [],
                      },
                      {
                        kind: 'Field',
                        name: {
                          kind: 'Name',
                          value: 'endCursor',
                        },
                        arguments: [],
                        directives: [],
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: {
                    kind: 'Name',
                    value: 'totalCount',
                  },
                  arguments: [],
                  directives: [],
                },
                {
                  kind: 'Field',
                  name: {
                    kind: 'Name',
                    value: 'edges',
                  },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: {
                          kind: 'Name',
                          value: 'cursor',
                        },
                        arguments: [],
                        directives: [],
                      },
                      {
                        kind: 'Field',
                        name: {
                          kind: 'Name',
                          value: 'node',
                        },
                        arguments: [],
                        directives: [],
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'InlineFragment' as const,
                              typeCondition: {
                                kind: 'NamedType' as const,
                                name: {
                                  kind: 'Name' as const,
                                  value: 'Document',
                                },
                              },
                              directives: [],
                              selectionSet: {
                                kind: 'SelectionSet' as const,
                                selections: [
                                  SysFieldDefinition,
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'id',
                                    },
                                    arguments: [],
                                    directives: [],
                                  },
                                ],
                              },
                            },
                            {
                              kind: 'FragmentSpread',
                              name: {
                                kind: 'Name',
                                value: fragName,
                              },
                              directives: [],
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    }
  },
  toGraphQLAst: (ast: {
    globalTemplates: TypeDefinitionNode[]
    query: TypeDefinitionNode
    definitions: TypeDefinitionNode[]
  }): DocumentNode => {
    const definitions = uniqBy(
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
    return flattenDeep(accumulator)
  }
  const accumulator: TypeDefinitionNode[] = [item]
  // @ts-ignore
  for (const node of walk(item)) {
    if (node.kind === 'UnionTypeDefinition') {
      // @ts-ignore
      node.types = uniqBy(node.types, (type) => type.name.value)
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
        // @ts-ignore
        yield* walk(element, visited)
      }
    } else {
      // @ts-ignore
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
        if (!element) {
          return
        }
        if (!element.hasOwnProperty('name')) {
          return element
        }
        const value = element.name || element.value // options field accepts an object with `value`  instead of `name`
        return addNamespaceToSchema(element, [...namespace, value])
      })
    } else {
      if (!m) {
        return
      }
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
  dataMutationUpdateTypeName: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, 'UpdateMutation')
  },
  updateName: (namespace: string[]) => {
    return `update${generateNamespacedFieldName(namespace)}`
  },
  createName: (namespace: string[]) => {
    return `create${generateNamespacedFieldName(namespace)}`
  },
  documentQueryName: () => {
    return 'document'
  },
  documentConnectionQueryName: () => {
    return 'documentConnection'
  },
  collectionQueryName: () => {
    return 'collection'
  },
  collectionListQueryName: () => {
    return 'collections'
  },
  queryName: (namespace: string[]) => {
    return String(lastItem(namespace))
  },
  generateQueryListName: (namespace: string[]) => {
    return `${lastItem(namespace)}Connection`
  },
  generateReverseQueryListName: (namespace: string[]) => {
    return `${lastItem(namespace)}ReverseConnection`
  },
  fragmentName: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, '') + 'Parts'
  },
  collectionTypeName: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, 'Collection')
  },
  documentTypeName: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace)
  },
  dataTypeName: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, '')
  },
  referenceConnectionType: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, 'Connection')
  },
  reverseReferenceConnectionType: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, 'ReverseConnection')
  },
  referenceConnectionEdgesTypeName: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, 'ConnectionEdges')
  },
}
