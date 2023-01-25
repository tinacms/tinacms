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
  FragmentDefinitionNode,
  SelectionNode,
  SelectionSetNode,
  FieldNode,
  InlineFragmentNode,
  OperationDefinitionNode,
  VariableDefinitionNode,
  ArgumentNode,
  Kind,
  ConstDirectiveNode,
  OperationTypeNode,
} from 'graphql'
import _ from 'lodash'
import { lastItem } from '../util'

const SysFieldDefinition: FieldNode = {
  kind: Kind.FIELD,
  name: {
    kind: Kind.NAME,
    value: '_sys',
  },
  arguments: [],
  directives: [],
  selectionSet: {
    kind: Kind.SELECTION_SET,
    selections: [
      // {
      //   kind: Kind.FIELD,
      //   name: {
      //     kind: Kind.NAME,
      //     value: 'title',
      //   },
      //   arguments: [],
      //   directives: [],
      // },
      {
        kind: Kind.FIELD,
        name: {
          kind: Kind.NAME,
          value: 'filename',
        },
        arguments: [],
        directives: [],
      },
      {
        kind: Kind.FIELD,
        name: {
          kind: Kind.NAME,
          value: 'basename',
        },
        arguments: [],
        directives: [],
      },
      {
        kind: Kind.FIELD,
        name: {
          kind: Kind.NAME,
          value: 'breadcrumbs',
        },
        arguments: [],
        directives: [],
      },
      {
        kind: Kind.FIELD,
        name: {
          kind: Kind.NAME,
          value: 'path',
        },
        arguments: [],
        directives: [],
      },
      {
        kind: Kind.FIELD,
        name: {
          kind: Kind.NAME,
          value: 'relativePath',
        },
        arguments: [],
        directives: [],
      },
      {
        kind: Kind.FIELD,
        name: {
          kind: Kind.NAME,
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
      kind: Kind.SCALAR_TYPE_DEFINITION,
      name: {
        kind: Kind.NAME,
        value: name,
      },
      description: {
        kind: Kind.STRING,
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
      kind: Kind.NAMED_TYPE,
      name: {
        kind: Kind.NAME,
        value: type,
      },
    }
    const def = {
      kind: Kind.INPUT_VALUE_DEFINITION,
      name: {
        kind: Kind.NAME,
        value: name,
      },
    }
    if (list) {
      if (required) {
        res = {
          ...def,
          type: {
            kind: Kind.LIST_TYPE,
            type: {
              kind: Kind.NON_NULL_TYPE,
              type: namedType,
            },
          },
        }
      } else {
        res = {
          ...def,
          type: {
            kind: Kind.LIST_TYPE,
            type: namedType,
          },
        }
      }
    } else {
      if (required) {
        res = {
          ...def,
          type: {
            kind: Kind.NON_NULL_TYPE,
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
      kind: Kind.ENUM_TYPE_DEFINITION,
      name: {
        kind: Kind.NAME,
        value: props.name,
      },
      values: props.values.map((val) => {
        return {
          kind: Kind.ENUM_VALUE_DEFINITION,
          name: {
            kind: Kind.NAME,
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
      name: { kind: Kind.NAME, value: name },
      kind: Kind.FIELD,
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
      kind: Kind.NAMED_TYPE,
      name: {
        kind: Kind.NAME,
        value: type,
      },
    }
    const def = {
      kind: Kind.FIELD_DEFINITION,
      name: {
        kind: Kind.NAME,
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
            kind: Kind.NON_NULL_TYPE,
            type: {
              kind: Kind.LIST_TYPE,
              type: {
                kind: Kind.NON_NULL_TYPE,
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
            kind: Kind.LIST_TYPE,
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
            kind: Kind.NON_NULL_TYPE,
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
      kind: Kind.INTERFACE_TYPE_DEFINITION,
      description: { kind: Kind.STRING, value: description },
      name: {
        kind: Kind.NAME,
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
    kind: Kind.INPUT_OBJECT_TYPE_DEFINITION,
    name: {
      kind: Kind.NAME,
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
    kind: Kind.UNION_TYPE_DEFINITION,
    name: {
      kind: Kind.NAME,
      value: name,
    },
    directives: [],
    // @ts-ignore FIXME; this is being handled properly but we're lying to
    // ts and then fixing it in the `extractInlineTypes` function
    types: types.map((name) => ({
      kind: Kind.NAMED_TYPE,
      name: {
        kind: Kind.NAME,
        value: name,
      },
    })),
  }),
  NamedType: ({ name }: { name: string }): NamedTypeNode => {
    return {
      kind: Kind.NAMED_TYPE,
      name: {
        kind: Kind.NAME,
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
    directives?: ConstDirectiveNode[]
    args?: NamedTypeNode[]
  }): ObjectTypeDefinitionNode => ({
    kind: Kind.OBJECT_TYPE_DEFINITION,
    interfaces,
    directives,
    name: {
      kind: Kind.NAME,
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
      name: { kind: Kind.NAME, value: name },
      kind: Kind.FIELD,
      selectionSet: {
        kind: Kind.SELECTION_SET,
        selections,
      },
    } as const
  },
  InlineFragmentDefinition: ({
    name,
    selections,
  }: {
    name: string
    selections: SelectionNode[]
  }): InlineFragmentNode => {
    return {
      kind: Kind.INLINE_FRAGMENT,
      selectionSet: {
        kind: Kind.SELECTION_SET,
        selections,
      },
      typeCondition: {
        kind: Kind.NAMED_TYPE,
        name: {
          kind: Kind.NAME,
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
      kind: Kind.FRAGMENT_DEFINITION,
      name: {
        kind: Kind.NAME,
        value: fragmentName,
      },
      typeCondition: {
        kind: Kind.NAMED_TYPE,
        name: {
          kind: Kind.NAME,
          value: name,
        },
      },
      directives: [],
      selectionSet: {
        kind: Kind.SELECTION_SET,
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
    String: 'String',
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
      kind: Kind.OPERATION_DEFINITION,
      operation: OperationTypeNode.QUERY,
      name: {
        kind: Kind.NAME,
        value: queryName,
      },
      variableDefinitions: [
        {
          kind: Kind.VARIABLE_DEFINITION,
          type: {
            kind: Kind.NON_NULL_TYPE,
            type: {
              kind: Kind.NAMED_TYPE,
              name: { kind: Kind.NAME, value: 'String' },
            },
          },
          variable: {
            kind: Kind.VARIABLE,
            name: { kind: Kind.NAME, value: 'relativePath' },
          },
        },
      ],
      selectionSet: {
        kind: Kind.SELECTION_SET,
        selections: [
          {
            kind: Kind.FIELD,
            name: {
              kind: Kind.NAME,
              value: queryName,
            },
            arguments: [
              {
                kind: Kind.ARGUMENT,
                name: {
                  kind: Kind.NAME,
                  value: 'relativePath',
                },
                value: {
                  kind: Kind.VARIABLE,
                  name: {
                    kind: Kind.NAME,
                    value: 'relativePath',
                  },
                },
              },
            ],
            directives: [],
            selectionSet: {
              kind: Kind.SELECTION_SET,
              selections: [
                {
                  kind: Kind.INLINE_FRAGMENT,
                  typeCondition: {
                    kind: Kind.NAMED_TYPE,
                    name: {
                      kind: Kind.NAME,
                      value: 'Document',
                    },
                  },
                  directives: [],
                  selectionSet: {
                    kind: Kind.SELECTION_SET,
                    selections: [
                      SysFieldDefinition,
                      {
                        kind: Kind.FIELD,
                        name: {
                          kind: Kind.NAME,
                          value: 'id',
                        },
                        arguments: [],
                        directives: [],
                      },
                    ],
                  },
                },
                {
                  kind: Kind.FRAGMENT_SPREAD,
                  name: {
                    kind: Kind.NAME,
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
        kind: Kind.VARIABLE_DEFINITION,
        variable: {
          kind: Kind.VARIABLE,
          name: {
            kind: Kind.NAME,
            value: 'before',
          },
        },
        type: {
          kind: Kind.NAMED_TYPE,
          name: {
            kind: Kind.NAME,
            value: 'String',
          },
        },
        directives: [],
      },
      {
        kind: Kind.VARIABLE_DEFINITION,
        variable: {
          kind: Kind.VARIABLE,
          name: {
            kind: Kind.NAME,
            value: 'after',
          },
        },
        type: {
          kind: Kind.NAMED_TYPE,
          name: {
            kind: Kind.NAME,
            value: 'String',
          },
        },
        directives: [],
      },
      {
        kind: Kind.VARIABLE_DEFINITION,
        variable: {
          kind: Kind.VARIABLE,
          name: {
            kind: Kind.NAME,
            value: 'first',
          },
        },
        type: {
          kind: Kind.NAMED_TYPE,
          name: {
            kind: Kind.NAME,
            value: 'Float',
          },
        },
        directives: [],
      },
      {
        kind: Kind.VARIABLE_DEFINITION,
        variable: {
          kind: Kind.VARIABLE,
          name: {
            kind: Kind.NAME,
            value: 'last',
          },
        },
        type: {
          kind: Kind.NAMED_TYPE,
          name: {
            kind: Kind.NAME,
            value: 'Float',
          },
        },
        directives: [],
      },
      {
        kind: Kind.VARIABLE_DEFINITION,
        variable: {
          kind: Kind.VARIABLE,
          name: {
            kind: Kind.NAME,
            value: 'sort',
          },
        },
        type: {
          kind: Kind.NAMED_TYPE,
          name: {
            kind: Kind.NAME,
            value: 'String',
          },
        },
        directives: [],
      },
    ]
    const queryArguments: ArgumentNode[] = [
      {
        kind: Kind.ARGUMENT,
        name: {
          kind: Kind.NAME,
          value: 'before',
        },
        value: {
          kind: Kind.VARIABLE,
          name: {
            kind: Kind.NAME,
            value: 'before',
          },
        },
      },
      {
        kind: Kind.ARGUMENT,
        name: {
          kind: Kind.NAME,
          value: 'after',
        },
        value: {
          kind: Kind.VARIABLE,
          name: {
            kind: Kind.NAME,
            value: 'after',
          },
        },
      },
      {
        kind: Kind.ARGUMENT,
        name: {
          kind: Kind.NAME,
          value: 'first',
        },
        value: {
          kind: Kind.VARIABLE,
          name: {
            kind: Kind.NAME,
            value: 'first',
          },
        },
      },
      {
        kind: Kind.ARGUMENT,
        name: {
          kind: Kind.NAME,
          value: 'last',
        },
        value: {
          kind: Kind.VARIABLE,
          name: {
            kind: Kind.NAME,
            value: 'last',
          },
        },
      },
      {
        kind: Kind.ARGUMENT,
        name: {
          kind: Kind.NAME,
          value: 'sort',
        },
        value: {
          kind: Kind.VARIABLE,
          name: {
            kind: Kind.NAME,
            value: 'sort',
          },
        },
      },
    ]

    if (dataLayer) {
      queryArguments.push({
        kind: Kind.ARGUMENT,
        name: {
          kind: Kind.NAME,
          value: 'filter',
        },
        value: {
          kind: Kind.VARIABLE,
          name: {
            kind: Kind.NAME,
            value: 'filter',
          },
        },
      })

      variableDefinitions.push({
        kind: Kind.VARIABLE_DEFINITION,
        variable: {
          kind: Kind.VARIABLE,
          name: {
            kind: Kind.NAME,
            value: 'filter',
          },
        },
        type: {
          kind: Kind.NAMED_TYPE,
          name: {
            kind: Kind.NAME,
            value: filterType,
          },
        },
        directives: [],
      })
    }

    return {
      kind: Kind.OPERATION_DEFINITION,
      operation: OperationTypeNode.QUERY,
      name: {
        kind: Kind.NAME,
        value: queryName,
      },
      variableDefinitions,
      directives: [],
      selectionSet: {
        kind: Kind.SELECTION_SET,
        selections: [
          {
            kind: Kind.FIELD,
            name: {
              kind: Kind.NAME,
              value: queryName,
            },
            arguments: queryArguments,
            directives: [],
            selectionSet: {
              kind: Kind.SELECTION_SET,
              selections: [
                {
                  kind: Kind.FIELD,
                  name: {
                    kind: Kind.NAME,
                    value: 'pageInfo',
                  },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: Kind.SELECTION_SET,
                    selections: [
                      {
                        kind: Kind.FIELD,
                        name: {
                          kind: Kind.NAME,
                          value: 'hasPreviousPage',
                        },
                        arguments: [],
                        directives: [],
                      },
                      {
                        kind: Kind.FIELD,
                        name: {
                          kind: Kind.NAME,
                          value: 'hasNextPage',
                        },
                        arguments: [],
                        directives: [],
                      },
                      {
                        kind: Kind.FIELD,
                        name: {
                          kind: Kind.NAME,
                          value: 'startCursor',
                        },
                        arguments: [],
                        directives: [],
                      },
                      {
                        kind: Kind.FIELD,
                        name: {
                          kind: Kind.NAME,
                          value: 'endCursor',
                        },
                        arguments: [],
                        directives: [],
                      },
                    ],
                  },
                },
                {
                  kind: Kind.FIELD,
                  name: {
                    kind: Kind.NAME,
                    value: 'totalCount',
                  },
                  arguments: [],
                  directives: [],
                },
                {
                  kind: Kind.FIELD,
                  name: {
                    kind: Kind.NAME,
                    value: 'edges',
                  },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: Kind.SELECTION_SET,
                    selections: [
                      {
                        kind: Kind.FIELD,
                        name: {
                          kind: Kind.NAME,
                          value: 'cursor',
                        },
                        arguments: [],
                        directives: [],
                      },
                      {
                        kind: Kind.FIELD,
                        name: {
                          kind: Kind.NAME,
                          value: 'node',
                        },
                        arguments: [],
                        directives: [],
                        selectionSet: {
                          kind: Kind.SELECTION_SET,
                          selections: [
                            {
                              kind: Kind.INLINE_FRAGMENT,
                              typeCondition: {
                                kind: Kind.NAMED_TYPE,
                                name: {
                                  kind: Kind.NAME,
                                  value: 'Document',
                                },
                              },
                              directives: [],
                              selectionSet: {
                                kind: Kind.SELECTION_SET,
                                selections: [
                                  SysFieldDefinition,
                                  {
                                    kind: Kind.FIELD,
                                    name: {
                                      kind: Kind.NAME,
                                      value: 'id',
                                    },
                                    arguments: [],
                                    directives: [],
                                  },
                                ],
                              },
                            },
                            {
                              kind: Kind.FRAGMENT_SPREAD,
                              name: {
                                kind: Kind.NAME,
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
    const definitions = _.uniqBy(
      [
        ...extractInlineTypes(ast.query),
        ...extractInlineTypes(ast.globalTemplates),
        ...ast.definitions,
      ],
      (field) => field.name.value
    )

    return {
      kind: Kind.DOCUMENT,
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
  referenceConnectionEdgesTypeName: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, 'ConnectionEdges')
  },
}
