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
  GraphQLNamedType,
  DocumentNode,
  getNamedType,
  GraphQLObjectType,
  GraphQLUnionType,
  GraphQLArgument,
  ASTNode,
} from 'graphql'
import get from 'lodash.get'

interface FieldInterpretterProps {
  mutationName: string
  fieldName: string
  docAst: any
  paramInputType: GraphQLArgument
}

abstract class FieldInterpretter {
  protected mutationName: string
  protected fieldName: string
  protected docAst: any
  protected paramInputType: GraphQLArgument
  constructor({
    mutationName,
    fieldName,
    docAst,
    paramInputType,
  }: FieldInterpretterProps) {
    this.mutationName = mutationName
    this.fieldName = fieldName
    this.docAst = docAst
    this.paramInputType = paramInputType
  }

  abstract getQuery(): DocumentNode

  abstract getMutation(): DocumentNode

  abstract getDataPath(
    path: readonly (string | number)[],
    ancestors: any
  ): string[]
}

export const getFieldInterpretter = (
  namedType: GraphQLNamedType,
  args: FieldInterpretterProps
): FieldInterpretter | undefined => {
  if (
    namedType instanceof GraphQLUnionType &&
    namedType.name === 'SectionDocumentUnion'
  ) {
    return new SectionDocumentUnionInterpretter(args)
  }
  if (namedType instanceof GraphQLObjectType) {
    return new GraphQLObjectTypeInterpretter(args)
  }

  return
}

class SectionDocumentUnionInterpretter extends FieldInterpretter {
  getQuery(): DocumentNode {
    return {
      kind: 'Document' as const,
      definitions: [
        {
          kind: 'OperationDefinition' as const,
          operation: 'query',
          name: {
            kind: 'Name' as const,
            value: this.fieldName,
          },
          variableDefinitions: [
            {
              kind: 'VariableDefinition' as const,
              variable: {
                kind: 'Variable' as const,
                name: {
                  kind: 'Name' as const,
                  value: 'section',
                },
              },
              type: {
                kind: 'NonNullType' as const,
                type: {
                  kind: 'NamedType' as const,
                  name: {
                    kind: 'Name' as const,
                    value: 'String',
                  },
                },
              },
            },
            {
              kind: 'VariableDefinition' as const,
              variable: {
                kind: 'Variable' as const,
                name: {
                  kind: 'Name' as const,
                  value: 'relativePath',
                },
              },
              type: {
                kind: 'NonNullType' as const,
                type: {
                  kind: 'NamedType' as const,
                  name: {
                    kind: 'Name' as const,
                    value: 'String',
                  },
                },
              },
            },
          ],
          selectionSet: {
            kind: 'SelectionSet',
            selections: [
              {
                kind: 'Field',
                name: {
                  kind: 'Name',
                  value: this.fieldName,
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
                selectionSet: this.docAst.selectionSet,
              },
            ],
          },
        },
      ],
    }
  }

  getMutation(): DocumentNode {
    return {
      kind: 'Document' as const,
      definitions: [
        {
          kind: 'OperationDefinition' as const,
          operation: 'mutation',
          name: {
            kind: 'Name' as const,
            value: this.mutationName,
          },
          variableDefinitions: [
            {
              kind: 'VariableDefinition' as const,
              variable: {
                kind: 'Variable' as const,
                name: {
                  kind: 'Name' as const,
                  value: 'relativePath',
                },
              },
              type: {
                kind: 'NonNullType' as const,
                type: {
                  kind: 'NamedType' as const,
                  name: {
                    kind: 'Name' as const,
                    value: 'String',
                  },
                },
              },
            },
            {
              kind: 'VariableDefinition' as const,
              variable: {
                kind: 'Variable' as const,
                name: {
                  kind: 'Name' as const,
                  value: 'params',
                },
              },
              type: {
                kind: 'NonNullType' as const,
                type: {
                  kind: 'NamedType' as const,
                  name: {
                    kind: 'Name' as const,
                    value: getNamedType(this.paramInputType?.type).name,
                  },
                },
              },
            },
          ],
          selectionSet: {
            kind: 'SelectionSet',
            selections: [
              {
                kind: 'Field',
                name: {
                  kind: 'Name',
                  value: this.mutationName,
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
                  {
                    kind: 'Argument',
                    name: {
                      kind: 'Name',
                      value: 'params',
                    },
                    value: {
                      kind: 'Variable',
                      name: {
                        kind: 'Name',
                        value: 'params',
                      },
                    },
                  },
                ],
                directives: [],
                selectionSet: this.docAst.selectionSet,
              },
            ],
          },
        },
      ],
    }
  }

  getDataPath(path: readonly (string | number)[], ancestors: any): string[] {
    let dataPath: string[] = []
    const anc = ancestors[0]
    const pathAccum: (string | number)[] = []
    path.map((p, i) => {
      pathAccum.push(p)
      const item: ASTNode | ASTNode[] = get(anc, pathAccum)
      if (Array.isArray(item)) {
      } else {
        switch (item.kind) {
          case 'OperationDefinition':
            break
          case 'SelectionSet':
            break
          case 'InlineFragment':
            break
          case 'Field':
            dataPath.push(item.name?.value)
            break
        }
      }
    })
    return dataPath
  }
}

class GraphQLObjectTypeInterpretter extends FieldInterpretter {
  getQuery(): DocumentNode {
    return {
      kind: 'Document' as const,
      definitions: [
        {
          kind: 'OperationDefinition' as const,
          operation: 'query',
          name: {
            kind: 'Name' as const,
            value: this.fieldName,
          },
          variableDefinitions: [
            {
              kind: 'VariableDefinition' as const,
              variable: {
                kind: 'Variable' as const,
                name: {
                  kind: 'Name' as const,
                  value: 'relativePath',
                },
              },
              type: {
                kind: 'NonNullType' as const,
                type: {
                  kind: 'NamedType' as const,
                  name: {
                    kind: 'Name' as const,
                    value: 'String',
                  },
                },
              },
            },
          ],
          selectionSet: {
            kind: 'SelectionSet',
            selections: [
              {
                kind: 'Field',
                name: {
                  kind: 'Name',
                  value: this.fieldName,
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
                selectionSet: this.docAst.selectionSet,
              },
            ],
          },
        },
      ],
    }
  }

  getMutation(): DocumentNode {
    return {
      kind: 'Document' as const,
      definitions: [
        {
          kind: 'OperationDefinition' as const,
          operation: 'mutation',
          name: {
            kind: 'Name' as const,
            value: this.mutationName,
          },
          variableDefinitions: [
            {
              kind: 'VariableDefinition' as const,
              variable: {
                kind: 'Variable' as const,
                name: {
                  kind: 'Name' as const,
                  value: 'relativePath',
                },
              },
              type: {
                kind: 'NonNullType' as const,
                type: {
                  kind: 'NamedType' as const,
                  name: {
                    kind: 'Name' as const,
                    value: 'String',
                  },
                },
              },
            },
            {
              kind: 'VariableDefinition' as const,
              variable: {
                kind: 'Variable' as const,
                name: {
                  kind: 'Name' as const,
                  value: 'params',
                },
              },
              type: {
                kind: 'NonNullType' as const,
                type: {
                  kind: 'NamedType' as const,
                  name: {
                    kind: 'Name' as const,
                    value: getNamedType(this.paramInputType?.type).name,
                  },
                },
              },
            },
          ],
          selectionSet: {
            kind: 'SelectionSet',
            selections: [
              {
                kind: 'Field',
                name: {
                  kind: 'Name',
                  value: this.mutationName,
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
                  {
                    kind: 'Argument',
                    name: {
                      kind: 'Name',
                      value: 'params',
                    },
                    value: {
                      kind: 'Variable',
                      name: {
                        kind: 'Name',
                        value: 'params',
                      },
                    },
                  },
                ],
                directives: [],
                selectionSet: this.docAst.selectionSet,
              },
            ],
          },
        },
      ],
    }
  }

  getDataPath(path: readonly (string | number)[], ancestors: any): string[] {
    let dataPath: string[] = []
    const anc = ancestors[0]
    const pathAccum: (string | number)[] = []
    path.map((p, i) => {
      pathAccum.push(p)
      const item: ASTNode | ASTNode[] = get(anc, pathAccum)
      if (Array.isArray(item)) {
      } else {
        switch (item.kind) {
          case 'OperationDefinition':
            break
          case 'SelectionSet':
            break
          case 'InlineFragment':
            break
          case 'Field':
            const value = item.alias ? item.alias.value : item.name.value

            dataPath.push(value)
        }
      }
    })
    return dataPath
  }
}
