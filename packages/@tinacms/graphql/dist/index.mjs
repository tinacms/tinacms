// src/build.ts
import { print } from "graphql";
import uniqBy2 from "lodash.uniqby";

// src/util.ts
import * as yup from "yup";
import { GraphQLError } from "graphql";
var sequential = async (items, callback) => {
  const accum = [];
  if (!items) {
    return [];
  }
  const reducePromises = async (previous, endpoint) => {
    const prev = await previous;
    if (prev) {
      accum.push(prev);
    }
    return callback(endpoint, accum.length);
  };
  const result = await items.reduce(reducePromises, Promise.resolve());
  if (result) {
    accum.push(result);
  }
  return accum;
};
function assertShape(value, yupSchema, errorMessage) {
  const shape = yupSchema(yup);
  try {
    shape.validateSync(value);
  } catch (e) {
    const message = errorMessage || `Failed to assertShape - ${e.message}`;
    throw new GraphQLError(message, null, null, null, null, null, {
      stack: e.stack
    });
  }
}
var atob = (b64Encoded) => {
  return Buffer.from(b64Encoded, "base64").toString();
};
var btoa = (string2) => {
  return Buffer.from(string2).toString("base64");
};
var lastItem = (arr) => {
  return arr[arr.length - 1];
};
var get = (obj, path7, defaultValue = void 0) => {
  const travel = (regexp) => String.prototype.split.call(path7, regexp).filter(Boolean).reduce(
    (res, key) => res !== null && res !== void 0 ? res[key] : res,
    obj
  );
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === void 0 || result === obj ? defaultValue : result;
};
var flattenDeep = (arr) => arr.flatMap(
  (subArray, index) => Array.isArray(subArray) ? flattenDeep(subArray) : subArray
);

// src/ast-builder/index.ts
import uniqBy from "lodash.uniqby";
var SysFieldDefinition = {
  kind: "Field",
  name: {
    kind: "Name",
    value: "_sys"
  },
  arguments: [],
  directives: [],
  selectionSet: {
    kind: "SelectionSet",
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
        kind: "Field",
        name: {
          kind: "Name",
          value: "filename"
        },
        arguments: [],
        directives: []
      },
      {
        kind: "Field",
        name: {
          kind: "Name",
          value: "basename"
        },
        arguments: [],
        directives: []
      },
      {
        kind: "Field",
        name: {
          kind: "Name",
          value: "hasReferences"
        },
        arguments: [],
        directives: []
      },
      {
        kind: "Field",
        name: {
          kind: "Name",
          value: "breadcrumbs"
        },
        arguments: [],
        directives: []
      },
      {
        kind: "Field",
        name: {
          kind: "Name",
          value: "path"
        },
        arguments: [],
        directives: []
      },
      {
        kind: "Field",
        name: {
          kind: "Name",
          value: "relativePath"
        },
        arguments: [],
        directives: []
      },
      {
        kind: "Field",
        name: {
          kind: "Name",
          value: "extension"
        },
        arguments: [],
        directives: []
      }
    ]
  }
};
var astBuilder = {
  /**
   * `FormFieldBuilder` acts as a shortcut to building an entire `ObjectTypeDefinition`, we use this
   * because all Tina field objects share a common set of fields ('name', 'label', 'component')
   */
  FormFieldBuilder: ({
    name,
    additionalFields
  }) => {
    return astBuilder.ObjectTypeDefinition({
      name,
      interfaces: [astBuilder.NamedType({ name: "FormField" })],
      fields: [
        astBuilder.FieldDefinition({
          name: "name",
          required: true,
          type: astBuilder.TYPES.String
        }),
        astBuilder.FieldDefinition({
          name: "label",
          required: true,
          type: astBuilder.TYPES.String
        }),
        astBuilder.FieldDefinition({
          name: "component",
          required: true,
          type: astBuilder.TYPES.String
        }),
        ...additionalFields || []
      ]
    });
  },
  ScalarTypeDefinition: ({
    name,
    description
  }) => {
    return {
      kind: "ScalarTypeDefinition",
      name: {
        kind: "Name",
        value: name
      },
      description: {
        kind: "StringValue",
        value: description || ""
      },
      directives: []
    };
  },
  InputValueDefinition: ({
    name,
    type,
    list,
    required
  }) => {
    let res = {};
    const namedType = {
      kind: "NamedType",
      name: {
        kind: "Name",
        value: type
      }
    };
    const def = {
      kind: "InputValueDefinition",
      name: {
        kind: "Name",
        value: name
      }
    };
    if (list) {
      if (required) {
        res = {
          ...def,
          type: {
            kind: "ListType",
            type: {
              kind: "NonNullType",
              type: namedType
            }
          }
        };
      } else {
        res = {
          ...def,
          type: {
            kind: "ListType",
            type: namedType
          }
        };
      }
    } else {
      if (required) {
        res = {
          ...def,
          type: {
            kind: "NonNullType",
            type: namedType
          }
        };
      } else {
        res = {
          ...def,
          type: namedType
        };
      }
    }
    return res;
  },
  EnumDefinition: (props) => {
    return {
      kind: "EnumTypeDefinition",
      name: {
        kind: "Name",
        value: props.name
      },
      values: props.values.map((val) => {
        return {
          kind: "EnumValueDefinition",
          name: {
            kind: "Name",
            value: val
          }
        };
      })
    };
  },
  FieldNodeDefinition: ({
    name,
    type,
    args = [],
    list,
    required
  }) => ({
    name: { kind: "Name", value: name },
    kind: "Field"
  }),
  FieldDefinition: ({
    name,
    type,
    args = [],
    list,
    required
  }) => {
    let res = {};
    const namedType = {
      kind: "NamedType",
      name: {
        kind: "Name",
        value: type
      }
    };
    const def = {
      kind: "FieldDefinition",
      name: {
        kind: "Name",
        value: name
      },
      arguments: args
    };
    if (list) {
      if (required) {
        res = {
          ...def,
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: namedType
              }
            }
          }
        };
      } else {
        res = {
          ...def,
          type: {
            kind: "ListType",
            type: namedType
          }
        };
      }
    } else {
      if (required) {
        res = {
          ...def,
          type: {
            kind: "NonNullType",
            type: namedType
          }
        };
      } else {
        res = {
          ...def,
          type: namedType
        };
      }
    }
    return res;
  },
  InterfaceTypeDefinition: ({
    name,
    fields,
    description = ""
  }) => {
    return {
      kind: "InterfaceTypeDefinition",
      description: { kind: "StringValue", value: description },
      name: {
        kind: "Name",
        value: name
      },
      interfaces: [],
      directives: [],
      fields
    };
  },
  InputObjectTypeDefinition: ({
    name,
    fields
  }) => ({
    kind: "InputObjectTypeDefinition",
    name: {
      kind: "Name",
      value: name
    },
    // @ts-ignore FIXME; this is being handled properly but we're lying to
    // ts and then fixing it in the `extractInlineTypes` function
    fields
  }),
  UnionTypeDefinition: ({
    name,
    types
  }) => ({
    kind: "UnionTypeDefinition",
    name: {
      kind: "Name",
      value: name
    },
    directives: [],
    // @ts-ignore FIXME; this is being handled properly but we're lying to
    // ts and then fixing it in the `extractInlineTypes` function
    types: types.map((name2) => ({
      kind: "NamedType",
      name: {
        kind: "Name",
        value: name2
      }
    }))
  }),
  NamedType: ({ name }) => {
    return {
      kind: "NamedType",
      name: {
        kind: "Name",
        value: name
      }
    };
  },
  ObjectTypeDefinition: ({
    name,
    fields,
    interfaces = [],
    directives = [],
    args = []
  }) => ({
    kind: "ObjectTypeDefinition",
    interfaces,
    directives,
    name: {
      kind: "Name",
      value: name
    },
    fields
  }),
  FieldWithSelectionSetDefinition: ({
    name,
    selections
  }) => {
    return {
      name: { kind: "Name", value: name },
      kind: "Field",
      selectionSet: {
        kind: "SelectionSet",
        selections
      }
    };
  },
  InlineFragmentDefinition: ({
    name,
    selections
  }) => {
    return {
      kind: "InlineFragment",
      selectionSet: {
        kind: "SelectionSet",
        selections
      },
      typeCondition: {
        kind: "NamedType",
        name: {
          kind: "Name",
          value: name
        }
      }
    };
  },
  FragmentDefinition: ({
    name,
    fragmentName,
    selections
  }) => {
    return {
      kind: "FragmentDefinition",
      name: {
        kind: "Name",
        value: fragmentName
      },
      typeCondition: {
        kind: "NamedType",
        name: {
          kind: "Name",
          value: name
        }
      },
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections
      }
    };
  },
  TYPES: {
    Scalar: (type) => {
      const scalars = {
        string: "String",
        boolean: "Boolean",
        number: "Float",
        // FIXME - needs to be float or int
        datetime: "String",
        // FIXME
        image: "String",
        // FIXME
        text: "String"
      };
      return scalars[type];
    },
    MultiCollectionDocument: "DocumentNode",
    CollectionDocumentUnion: "DocumentUnion",
    Folder: "Folder",
    String: "String",
    Password: "Password",
    Reference: "Reference",
    Collection: "Collection",
    ID: "ID",
    SystemInfo: "SystemInfo",
    Boolean: "Boolean",
    JSON: "JSON",
    Node: "Node",
    PageInfo: "PageInfo",
    Connection: "Connection",
    Number: "Float",
    Document: "Document"
  },
  QueryOperationDefinition: ({
    queryName,
    fragName
  }) => {
    return {
      kind: "OperationDefinition",
      operation: "query",
      name: {
        kind: "Name",
        value: queryName
      },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" }
            }
          },
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "relativePath" }
          }
        }
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: {
              kind: "Name",
              value: queryName
            },
            arguments: [
              {
                kind: "Argument",
                name: {
                  kind: "Name",
                  value: "relativePath"
                },
                value: {
                  kind: "Variable",
                  name: {
                    kind: "Name",
                    value: "relativePath"
                  }
                }
              }
            ],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: {
                      kind: "Name",
                      value: "Document"
                    }
                  },
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      SysFieldDefinition,
                      {
                        kind: "Field",
                        name: {
                          kind: "Name",
                          value: "id"
                        },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                },
                {
                  kind: "FragmentSpread",
                  name: {
                    kind: "Name",
                    value: fragName
                  },
                  directives: []
                }
              ]
            }
          }
        ]
      }
    };
  },
  ListQueryOperationDefinition: ({
    queryName,
    fragName,
    filterType,
    dataLayer
  }) => {
    const variableDefinitions = [
      {
        kind: "VariableDefinition",
        variable: {
          kind: "Variable",
          name: {
            kind: "Name",
            value: "before"
          }
        },
        type: {
          kind: "NamedType",
          name: {
            kind: "Name",
            value: "String"
          }
        },
        directives: []
      },
      {
        kind: "VariableDefinition",
        variable: {
          kind: "Variable",
          name: {
            kind: "Name",
            value: "after"
          }
        },
        type: {
          kind: "NamedType",
          name: {
            kind: "Name",
            value: "String"
          }
        },
        directives: []
      },
      {
        kind: "VariableDefinition",
        variable: {
          kind: "Variable",
          name: {
            kind: "Name",
            value: "first"
          }
        },
        type: {
          kind: "NamedType",
          name: {
            kind: "Name",
            value: "Float"
          }
        },
        directives: []
      },
      {
        kind: "VariableDefinition",
        variable: {
          kind: "Variable",
          name: {
            kind: "Name",
            value: "last"
          }
        },
        type: {
          kind: "NamedType",
          name: {
            kind: "Name",
            value: "Float"
          }
        },
        directives: []
      },
      {
        kind: "VariableDefinition",
        variable: {
          kind: "Variable",
          name: {
            kind: "Name",
            value: "sort"
          }
        },
        type: {
          kind: "NamedType",
          name: {
            kind: "Name",
            value: "String"
          }
        },
        directives: []
      }
    ];
    const queryArguments = [
      {
        kind: "Argument",
        name: {
          kind: "Name",
          value: "before"
        },
        value: {
          kind: "Variable",
          name: {
            kind: "Name",
            value: "before"
          }
        }
      },
      {
        kind: "Argument",
        name: {
          kind: "Name",
          value: "after"
        },
        value: {
          kind: "Variable",
          name: {
            kind: "Name",
            value: "after"
          }
        }
      },
      {
        kind: "Argument",
        name: {
          kind: "Name",
          value: "first"
        },
        value: {
          kind: "Variable",
          name: {
            kind: "Name",
            value: "first"
          }
        }
      },
      {
        kind: "Argument",
        name: {
          kind: "Name",
          value: "last"
        },
        value: {
          kind: "Variable",
          name: {
            kind: "Name",
            value: "last"
          }
        }
      },
      {
        kind: "Argument",
        name: {
          kind: "Name",
          value: "sort"
        },
        value: {
          kind: "Variable",
          name: {
            kind: "Name",
            value: "sort"
          }
        }
      }
    ];
    if (dataLayer) {
      queryArguments.push({
        kind: "Argument",
        name: {
          kind: "Name",
          value: "filter"
        },
        value: {
          kind: "Variable",
          name: {
            kind: "Name",
            value: "filter"
          }
        }
      });
      variableDefinitions.push({
        kind: "VariableDefinition",
        variable: {
          kind: "Variable",
          name: {
            kind: "Name",
            value: "filter"
          }
        },
        type: {
          kind: "NamedType",
          name: {
            kind: "Name",
            value: filterType
          }
        },
        directives: []
      });
    }
    return {
      kind: "OperationDefinition",
      operation: "query",
      name: {
        kind: "Name",
        value: queryName
      },
      variableDefinitions,
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: {
              kind: "Name",
              value: queryName
            },
            arguments: queryArguments,
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: {
                    kind: "Name",
                    value: "pageInfo"
                  },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: {
                          kind: "Name",
                          value: "hasPreviousPage"
                        },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: {
                          kind: "Name",
                          value: "hasNextPage"
                        },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: {
                          kind: "Name",
                          value: "startCursor"
                        },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: {
                          kind: "Name",
                          value: "endCursor"
                        },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                },
                {
                  kind: "Field",
                  name: {
                    kind: "Name",
                    value: "totalCount"
                  },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: {
                    kind: "Name",
                    value: "edges"
                  },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: {
                          kind: "Name",
                          value: "cursor"
                        },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: {
                          kind: "Name",
                          value: "node"
                        },
                        arguments: [],
                        directives: [],
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "InlineFragment",
                              typeCondition: {
                                kind: "NamedType",
                                name: {
                                  kind: "Name",
                                  value: "Document"
                                }
                              },
                              directives: [],
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  SysFieldDefinition,
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "id"
                                    },
                                    arguments: [],
                                    directives: []
                                  }
                                ]
                              }
                            },
                            {
                              kind: "FragmentSpread",
                              name: {
                                kind: "Name",
                                value: fragName
                              },
                              directives: []
                            }
                          ]
                        }
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    };
  },
  toGraphQLAst: (ast) => {
    const definitions = uniqBy(
      [
        ...extractInlineTypes(ast.query),
        ...extractInlineTypes(ast.globalTemplates),
        ...ast.definitions
      ],
      (field) => field.name.value
    );
    return {
      kind: "Document",
      definitions
    };
  }
};
var capitalize = (s) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};
var extractInlineTypes = (item) => {
  if (Array.isArray(item)) {
    const accumulator2 = item.map((i) => {
      return extractInlineTypes(i);
    });
    return flattenDeep(accumulator2);
  }
  const accumulator = [item];
  for (const node of walk(item)) {
    if (node.kind === "UnionTypeDefinition") {
      node.types = uniqBy(node.types, (type) => type.name.value);
    }
    if (node.kind === "NamedType") {
      if (typeof node.name.value !== "string") {
        accumulator.push(node.name.value);
        node.name.value = node.name.value.name.value;
      }
    }
  }
  return accumulator;
};
function* walk(maybeNode, visited = /* @__PURE__ */ new WeakSet()) {
  if (typeof maybeNode === "string") {
    return;
  }
  if (visited.has(maybeNode)) {
    return;
  }
  for (const value of Object.values(maybeNode)) {
    if (Array.isArray(value)) {
      for (const element of value) {
        yield* walk(element, visited);
      }
    } else {
      yield* walk(value, visited);
    }
  }
  yield maybeNode;
  visited.add(maybeNode);
}
var generateNamespacedFieldName = (names, suffix = "") => {
  return (suffix ? [...names, suffix] : names).map(capitalize).join("");
};
var NAMER = {
  dataFilterTypeNameOn: (namespace) => {
    return generateNamespacedFieldName(namespace, "_FilterOn");
  },
  dataFilterTypeName: (namespace) => {
    return generateNamespacedFieldName(namespace, "Filter");
  },
  dataMutationTypeNameOn: (namespace) => {
    return generateNamespacedFieldName(namespace, "_MutationOn");
  },
  dataMutationTypeName: (namespace) => {
    return generateNamespacedFieldName(namespace, "Mutation");
  },
  dataMutationUpdateTypeName: (namespace) => {
    return generateNamespacedFieldName(namespace, "UpdateMutation");
  },
  updateName: (namespace) => {
    return `update${generateNamespacedFieldName(namespace)}`;
  },
  createName: (namespace) => {
    return `create${generateNamespacedFieldName(namespace)}`;
  },
  documentQueryName: () => {
    return "document";
  },
  documentConnectionQueryName: () => {
    return "documentConnection";
  },
  collectionQueryName: () => {
    return "collection";
  },
  collectionListQueryName: () => {
    return "collections";
  },
  queryName: (namespace) => {
    return String(lastItem(namespace));
  },
  generateQueryListName: (namespace) => {
    return `${lastItem(namespace)}Connection`;
  },
  fragmentName: (namespace) => {
    return generateNamespacedFieldName(namespace, "") + "Parts";
  },
  collectionTypeName: (namespace) => {
    return generateNamespacedFieldName(namespace, "Collection");
  },
  documentTypeName: (namespace) => {
    return generateNamespacedFieldName(namespace);
  },
  dataTypeName: (namespace) => {
    return generateNamespacedFieldName(namespace, "");
  },
  referenceConnectionType: (namespace) => {
    return generateNamespacedFieldName(namespace, "Connection");
  },
  referenceConnectionEdgesTypeName: (namespace) => {
    return generateNamespacedFieldName(namespace, "ConnectionEdges");
  }
};

// src/builder/static-definitions.ts
var interfaceDefinitions = [
  astBuilder.InterfaceTypeDefinition({
    name: "Node",
    fields: [
      astBuilder.FieldDefinition({
        name: "id",
        type: astBuilder.TYPES.ID,
        required: true
      })
    ]
  }),
  astBuilder.InterfaceTypeDefinition({
    name: "Document",
    fields: [
      astBuilder.FieldDefinition({
        name: "id",
        type: astBuilder.TYPES.ID,
        required: true
      }),
      astBuilder.FieldDefinition({
        name: "_sys",
        type: astBuilder.TYPES.SystemInfo
      }),
      astBuilder.FieldDefinition({
        name: "_values",
        type: astBuilder.TYPES.JSON,
        required: true
      })
    ]
  }),
  astBuilder.InterfaceTypeDefinition({
    name: "Connection",
    description: "A relay-compliant pagination connection",
    fields: [
      astBuilder.FieldDefinition({
        name: "totalCount",
        required: true,
        type: astBuilder.TYPES.Number
      }),
      astBuilder.FieldDefinition({
        name: "pageInfo",
        required: true,
        type: astBuilder.ObjectTypeDefinition({
          name: "PageInfo",
          fields: [
            astBuilder.FieldDefinition({
              name: "hasPreviousPage",
              required: true,
              type: astBuilder.TYPES.Boolean
            }),
            astBuilder.FieldDefinition({
              name: "hasNextPage",
              required: true,
              type: astBuilder.TYPES.Boolean
            }),
            astBuilder.FieldDefinition({
              name: "startCursor",
              required: true,
              type: astBuilder.TYPES.String
            }),
            astBuilder.FieldDefinition({
              name: "endCursor",
              required: true,
              type: astBuilder.TYPES.String
            })
          ]
        })
      })
    ]
  })
];
var scalarDefinitions = [
  astBuilder.ScalarTypeDefinition({
    name: "Reference",
    description: "References another document, used as a foreign key"
  }),
  astBuilder.ScalarTypeDefinition({ name: "JSON" }),
  astBuilder.ObjectTypeDefinition({
    name: "SystemInfo",
    fields: [
      astBuilder.FieldDefinition({
        name: "filename",
        required: true,
        type: astBuilder.TYPES.String
      }),
      astBuilder.FieldDefinition({
        name: "title",
        required: false,
        type: astBuilder.TYPES.String
      }),
      astBuilder.FieldDefinition({
        name: "basename",
        required: true,
        type: astBuilder.TYPES.String
      }),
      astBuilder.FieldDefinition({
        name: "hasReferences",
        required: false,
        type: astBuilder.TYPES.Boolean
      }),
      astBuilder.FieldDefinition({
        name: "breadcrumbs",
        required: true,
        type: astBuilder.TYPES.String,
        list: true,
        args: [
          astBuilder.InputValueDefinition({
            name: "excludeExtension",
            type: astBuilder.TYPES.Boolean
          })
        ]
      }),
      astBuilder.FieldDefinition({
        name: "path",
        required: true,
        type: astBuilder.TYPES.String
      }),
      astBuilder.FieldDefinition({
        name: "relativePath",
        required: true,
        type: astBuilder.TYPES.String
      }),
      astBuilder.FieldDefinition({
        name: "extension",
        required: true,
        type: astBuilder.TYPES.String
      }),
      astBuilder.FieldDefinition({
        name: "template",
        required: true,
        type: astBuilder.TYPES.String
      }),
      astBuilder.FieldDefinition({
        name: "collection",
        required: true,
        type: astBuilder.TYPES.Collection
      })
    ]
  }),
  astBuilder.ObjectTypeDefinition({
    name: astBuilder.TYPES.Folder,
    fields: [
      astBuilder.FieldDefinition({
        name: "name",
        required: true,
        type: astBuilder.TYPES.String
      }),
      astBuilder.FieldDefinition({
        name: "path",
        required: true,
        type: astBuilder.TYPES.String
      })
    ]
  }),
  astBuilder.ObjectTypeDefinition({
    name: "PageInfo",
    fields: [
      astBuilder.FieldDefinition({
        name: "hasPreviousPage",
        required: true,
        type: astBuilder.TYPES.Boolean
      }),
      astBuilder.FieldDefinition({
        name: "hasNextPage",
        required: true,
        type: astBuilder.TYPES.Boolean
      }),
      astBuilder.FieldDefinition({
        name: "startCursor",
        required: true,
        type: astBuilder.TYPES.String
      }),
      astBuilder.FieldDefinition({
        name: "endCursor",
        required: true,
        type: astBuilder.TYPES.String
      })
    ]
  })
];
var staticDefinitions = [...scalarDefinitions, interfaceDefinitions];

// src/auth/utils.ts
import crypto from "crypto";
import scmp from "scmp";
var DEFAULT_SALT_LENGTH = 32;
var DEFAULT_KEY_LENGTH = 512;
var DEFAULT_ITERATIONS = 25e3;
var DEFAULT_DIGEST = "sha256";
var generatePasswordHash = async ({
  password,
  opts: {
    saltLength = DEFAULT_SALT_LENGTH,
    keyLength = DEFAULT_KEY_LENGTH,
    iterations = DEFAULT_ITERATIONS,
    digest = DEFAULT_DIGEST
  } = {
    saltLength: DEFAULT_SALT_LENGTH,
    keyLength: DEFAULT_KEY_LENGTH,
    iterations: DEFAULT_ITERATIONS,
    digest: DEFAULT_DIGEST
  }
}) => {
  if (!password) {
    throw new Error("Password is required");
  }
  if (password.length < 3) {
    throw new Error("Password must be at least 3 characters");
  }
  const salt = (await new Promise((resolve2, reject) => {
    crypto.randomBytes(saltLength, (err, saltBuffer) => {
      if (err) {
        reject(err);
      }
      resolve2(saltBuffer);
    });
  })).toString("hex");
  const hash = (await new Promise((resolve2, reject) => {
    crypto.pbkdf2(
      password,
      salt,
      iterations,
      keyLength,
      digest,
      (err, hashBuffer) => {
        if (err) {
          reject(err);
        }
        resolve2(hashBuffer);
      }
    );
  })).toString("hex");
  return `${salt}${hash}`;
};
var checkPasswordHash = async ({
  saltedHash,
  password,
  opts: {
    saltLength = DEFAULT_SALT_LENGTH,
    keyLength = DEFAULT_KEY_LENGTH,
    iterations = DEFAULT_ITERATIONS,
    digest = DEFAULT_DIGEST
  } = {
    saltLength: DEFAULT_SALT_LENGTH,
    keyLength: DEFAULT_KEY_LENGTH,
    iterations: DEFAULT_ITERATIONS,
    digest: DEFAULT_DIGEST
  }
}) => {
  const salt = saltedHash.slice(0, saltLength * 2);
  const hash = saltedHash.slice(saltLength * 2);
  try {
    await new Promise((resolve2, reject) => {
      crypto.pbkdf2(
        password,
        salt,
        iterations,
        keyLength,
        digest,
        (err, hashBuffer) => {
          if (err) {
            reject(null);
          }
          if (scmp(hashBuffer, Buffer.from(hash, "hex"))) {
            resolve2();
          }
          reject(null);
        }
      );
    });
  } catch (e) {
    return false;
  }
  return true;
};
var mapUserFields = (collectable, prefix = []) => {
  const results = [];
  const passwordFields = collectable.fields?.filter((field) => field.type === "password") || [];
  if (passwordFields.length > 1) {
    throw new Error("Only one password field is allowed");
  }
  const idFields = collectable.fields?.filter((field) => field.uid) || [];
  if (idFields.length > 1) {
    throw new Error("Only one uid field is allowed");
  }
  if (passwordFields.length || idFields.length) {
    results.push({
      path: prefix,
      collectable,
      idFieldName: idFields[0]?.name,
      passwordFieldName: passwordFields[0]?.name
    });
  }
  collectable.fields?.forEach((field) => {
    if (field.type === "object" && field.fields) {
      results.push(...mapUserFields(field, [...prefix, field.name]));
    }
  });
  return results;
};

// src/builder/index.ts
var createBuilder = async ({
  tinaSchema
}) => {
  return new Builder({ tinaSchema });
};
var Builder = class {
  constructor(config) {
    this.config = config;
    this.addToLookupMap = (lookup) => {
      this.lookupMap[lookup.type] = lookup;
    };
    /**
     * ```graphql
     * # ex.
     * {
     *   getCollection(collection: $collection) {
     *     name
     *     documents {...}
     *   }
     * }
     * ```
     *
     * @param collections
     */
    this.buildCollectionDefinition = async (collections) => {
      const name = "collection";
      const typeName = "Collection";
      const args = [
        astBuilder.InputValueDefinition({
          name: "collection",
          type: astBuilder.TYPES.String
        })
      ];
      const documentsType = await this._buildMultiCollectionDocumentListDefinition({
        fieldName: "documents",
        namespace: ["document"],
        nodeType: astBuilder.TYPES.MultiCollectionDocument,
        collections,
        connectionNamespace: ["document"],
        includeFolderFilter: true
      });
      const type = astBuilder.ObjectTypeDefinition({
        name: typeName,
        fields: [
          astBuilder.FieldDefinition({
            name: "name",
            required: true,
            type: astBuilder.TYPES.String
          }),
          astBuilder.FieldDefinition({
            name: "slug",
            required: true,
            type: astBuilder.TYPES.String
          }),
          astBuilder.FieldDefinition({
            name: "label",
            required: false,
            type: astBuilder.TYPES.String
          }),
          astBuilder.FieldDefinition({
            name: "path",
            required: true,
            type: astBuilder.TYPES.String
          }),
          astBuilder.FieldDefinition({
            name: "format",
            required: false,
            type: astBuilder.TYPES.String
          }),
          astBuilder.FieldDefinition({
            name: "matches",
            required: false,
            type: astBuilder.TYPES.String
          }),
          astBuilder.FieldDefinition({
            name: "templates",
            list: true,
            type: "JSON"
          }),
          astBuilder.FieldDefinition({
            name: "fields",
            list: true,
            type: "JSON"
          }),
          documentsType
        ]
      });
      return astBuilder.FieldDefinition({
        type,
        name,
        args,
        required: true
      });
    };
    /**
     * ```graphql
     * # ex.
     * {
     *   getCollections {
     *     name
     *     documents {...}
     *   }
     * }
     * ```
     *
     * @param collections
     */
    this.buildMultiCollectionDefinition = async (collections) => {
      const name = "collections";
      const typeName = "Collection";
      return astBuilder.FieldDefinition({
        type: typeName,
        name,
        list: true,
        required: true
      });
    };
    /**
     * ```graphql
     * # ex.
     * {
     *   node(id: $id) {
     *     id
     *     data {...}
     *   }
     * }
     * ```
     */
    this.multiNodeDocument = async () => {
      const name = "node";
      const args = [
        astBuilder.InputValueDefinition({
          name: "id",
          type: astBuilder.TYPES.String
        })
      ];
      this.addToLookupMap({
        type: astBuilder.TYPES.Node,
        resolveType: "nodeDocument"
      });
      return astBuilder.FieldDefinition({
        name,
        args,
        list: false,
        type: astBuilder.TYPES.Node,
        required: true
      });
    };
    /**
     * ```graphql
     * # ex.
     * {
     *   getDocument(collection: $collection, relativePath: $relativePath) {
     *     id
     *     data {...}
     *   }
     * }
     * ```
     *
     * @param collections
     */
    this.multiCollectionDocument = async (collections) => {
      const name = "document";
      const args = [
        astBuilder.InputValueDefinition({
          name: "collection",
          type: astBuilder.TYPES.String
        }),
        astBuilder.InputValueDefinition({
          name: "relativePath",
          type: astBuilder.TYPES.String
        })
      ];
      const type = await this._buildMultiCollectionDocumentDefinition({
        fieldName: astBuilder.TYPES.MultiCollectionDocument,
        collections,
        includeFolderType: true
      });
      return astBuilder.FieldDefinition({
        name,
        args,
        list: false,
        type,
        required: true
      });
    };
    /**
     * ```graphql
     * # ex.
     * {
     *   addPendingDocument(collection: $collection, relativePath: $relativePath, params: $params) {
     *     id
     *     data {...}
     *   }
     * }
     * ```
     *
     * @param collections
     */
    this.addMultiCollectionDocumentMutation = async () => {
      return astBuilder.FieldDefinition({
        name: "addPendingDocument",
        args: [
          astBuilder.InputValueDefinition({
            name: "collection",
            required: true,
            type: astBuilder.TYPES.String
          }),
          astBuilder.InputValueDefinition({
            name: "relativePath",
            required: true,
            type: astBuilder.TYPES.String
          }),
          astBuilder.InputValueDefinition({
            name: "template",
            required: false,
            type: astBuilder.TYPES.String
          })
        ],
        required: true,
        type: astBuilder.TYPES.MultiCollectionDocument
      });
    };
    /**
     * ```graphql
     * # ex.
     * {
     *   createDocument(relativePath: $relativePath, params: $params) {
     *     id
     *     data {...}
     *   }
     * }
     * ```
     *
     * @param collections
     */
    this.buildCreateCollectionDocumentMutation = async (collections) => {
      return astBuilder.FieldDefinition({
        name: "createDocument",
        args: [
          astBuilder.InputValueDefinition({
            name: "collection",
            required: false,
            type: astBuilder.TYPES.String
          }),
          astBuilder.InputValueDefinition({
            name: "relativePath",
            required: true,
            type: astBuilder.TYPES.String
          }),
          astBuilder.InputValueDefinition({
            name: "params",
            required: true,
            type: await this._buildReferenceMutation({
              namespace: ["document"],
              collections: collections.map((collection) => collection.name)
            })
          })
        ],
        required: true,
        type: astBuilder.TYPES.MultiCollectionDocument
      });
    };
    /**
     * ```graphql
     * # ex.
     * {
     *   updateDocument(relativePath: $relativePath, params: $params) {
     *     id
     *     data {...}
     *   }
     * }
     * ```
     *
     * @param collections
     */
    this.buildUpdateCollectionDocumentMutation = async (collections) => {
      return astBuilder.FieldDefinition({
        name: "updateDocument",
        args: [
          astBuilder.InputValueDefinition({
            name: "collection",
            required: false,
            type: astBuilder.TYPES.String
          }),
          astBuilder.InputValueDefinition({
            name: "relativePath",
            required: true,
            type: astBuilder.TYPES.String
          }),
          astBuilder.InputValueDefinition({
            name: "params",
            required: true,
            type: await this._buildUpdateDocumentMutationParams({
              namespace: ["document"],
              collections: collections.map((collection) => collection.name)
            })
          })
        ],
        required: true,
        type: astBuilder.TYPES.MultiCollectionDocument
      });
    };
    /**
     * ```graphql
     * # ex.
     * {
     *   deleteDocument(relativePath: $relativePath, params: $params) {
     *     id
     *     data {...}
     *   }
     * }
     * ```
     *
     * @param collections
     */
    this.buildDeleteCollectionDocumentMutation = async (collections) => {
      return astBuilder.FieldDefinition({
        name: "deleteDocument",
        args: [
          astBuilder.InputValueDefinition({
            name: "collection",
            required: false,
            type: astBuilder.TYPES.String
          }),
          astBuilder.InputValueDefinition({
            name: "relativePath",
            required: true,
            type: astBuilder.TYPES.String
          })
        ],
        required: true,
        type: astBuilder.TYPES.MultiCollectionDocument
      });
    };
    /**
     * ```graphql
     * # ex.
     * {
     *   createFolder(folderName: $folderName, params: $params) {
     *     id
     *     data {...}
     *   }
     * }
     * ```
     *
     * @param collections
     */
    this.buildCreateCollectionFolderMutation = async () => {
      return astBuilder.FieldDefinition({
        name: "createFolder",
        args: [
          astBuilder.InputValueDefinition({
            name: "collection",
            required: false,
            type: astBuilder.TYPES.String
          }),
          astBuilder.InputValueDefinition({
            name: "relativePath",
            required: true,
            type: astBuilder.TYPES.String
          })
        ],
        required: true,
        type: astBuilder.TYPES.MultiCollectionDocument
      });
    };
    /**
     * ```graphql
     * # ex.
     * {
     *   getPostDocument(relativePath: $relativePath) {
     *     id
     *     data {...}
     *   }
     * }
     * ```
     *
     * @param collection
     */
    this.collectionDocument = async (collection) => {
      const name = NAMER.queryName([collection.name]);
      const type = await this._buildCollectionDocumentType(collection);
      const args = [
        astBuilder.InputValueDefinition({
          name: "relativePath",
          type: astBuilder.TYPES.String
        })
      ];
      this.addToLookupMap({
        type: type.name.value,
        resolveType: "collectionDocument",
        collection: collection.name,
        [NAMER.createName([collection.name])]: "create",
        [NAMER.updateName([collection.name])]: "update"
      });
      return astBuilder.FieldDefinition({
        type,
        name,
        args,
        required: true
      });
    };
    this.authenticationCollectionDocument = async (collection) => {
      const name = "authenticate";
      const type = await this._buildAuthDocumentType(collection);
      const args = [
        astBuilder.InputValueDefinition({
          name: "sub",
          type: astBuilder.TYPES.String,
          required: true
        }),
        astBuilder.InputValueDefinition({
          name: "password",
          type: astBuilder.TYPES.String,
          required: true
        })
      ];
      return astBuilder.FieldDefinition({ type, name, args, required: false });
    };
    this.updatePasswordMutation = async (collection) => {
      return astBuilder.FieldDefinition({
        type: astBuilder.TYPES.Boolean,
        name: "updatePassword",
        required: true,
        args: [
          astBuilder.InputValueDefinition({
            name: "password",
            required: true,
            type: astBuilder.TYPES.String
          })
        ]
      });
    };
    this.authorizationCollectionDocument = async (collection) => {
      const name = "authorize";
      const type = await this._buildAuthDocumentType(collection);
      const args = [];
      return astBuilder.FieldDefinition({ type, name, args, required: false });
    };
    /**
     * Turns a collection into a fragment that gets updated on build. This fragment does not resolve references
     * ```graphql
     * # ex.
     * fragment AuthorsParts on Authors {
     *   name
     *   avatar
     *   ...
     * }
     * ```
     *
     * @public
     * @param collection a TinaCloud collection
     */
    this.collectionFragment = async (collection) => {
      const name = NAMER.dataTypeName(collection.namespace);
      const fragmentName = NAMER.fragmentName(collection.namespace);
      const selections = await this._getCollectionFragmentSelections(
        collection,
        0
      );
      return astBuilder.FragmentDefinition({
        name,
        fragmentName,
        selections: filterSelections(selections)
      });
    };
    /**
     * Given a collection this function returns its selections set. For example for Post this would return
     *
     * "
     * body
     * title
     * ... on Author {
     *   name
     *   heroImg
     * }
     *
     * But in the AST format
     *
     * */
    this._getCollectionFragmentSelections = async (collection, depth) => {
      const selections = [];
      selections.push({
        name: { kind: "Name", value: "__typename" },
        kind: "Field"
      });
      if (collection.fields?.length > 0) {
        await sequential(collection.fields, async (x) => {
          const field = await this._buildFieldNodeForFragments(x, depth);
          selections.push(field);
        });
      } else {
        await sequential(collection.templates, async (tem) => {
          if (typeof tem === "object") {
            selections.push(await this.buildTemplateFragments(tem, depth));
          }
        });
      }
      return selections;
    };
    this._buildFieldNodeForFragments = async (field, depth) => {
      switch (field.type) {
        case "string":
        case "image":
        case "datetime":
        case "number":
        case "boolean":
        case "rich-text":
          return astBuilder.FieldNodeDefinition(field);
        case "password":
          const passwordValue = await this._buildFieldNodeForFragments(
            {
              name: "value",
              namespace: [...field.namespace, "value"],
              type: "string",
              required: true
            },
            depth
          );
          const passwordChangeRequired = await this._buildFieldNodeForFragments(
            {
              name: "passwordChangeRequired",
              namespace: [...field.namespace, "passwordChangeRequired"],
              type: "boolean",
              required: false
            },
            depth
          );
          return astBuilder.FieldWithSelectionSetDefinition({
            name: field.name,
            selections: filterSelections([passwordValue, passwordChangeRequired])
          });
        case "object":
          if (field.fields?.length > 0) {
            const selections2 = [];
            await sequential(field.fields, async (item) => {
              const field2 = await this._buildFieldNodeForFragments(item, depth);
              selections2.push(field2);
            });
            return astBuilder.FieldWithSelectionSetDefinition({
              name: field.name,
              selections: [
                { kind: "Field", name: { kind: "Name", value: "__typename" } },
                ...filterSelections(selections2)
              ]
            });
          } else if (field.templates?.length > 0) {
            const selections2 = [];
            await sequential(field.templates, async (tem) => {
              if (typeof tem === "object") {
                selections2.push(await this.buildTemplateFragments(tem, depth));
              }
            });
            return astBuilder.FieldWithSelectionSetDefinition({
              name: field.name,
              selections: [
                { kind: "Field", name: { kind: "Name", value: "__typename" } },
                ...filterSelections(selections2)
              ]
            });
          }
        // TODO: Should we throw here?
        case "reference":
          if (depth >= this.maxDepth) return false;
          if (!("collections" in field)) {
            return false;
          }
          const selections = [];
          await sequential(field.collections, async (col) => {
            const collection = this.tinaSchema.getCollection(col);
            selections.push({
              kind: "InlineFragment",
              typeCondition: {
                kind: "NamedType",
                name: {
                  kind: "Name",
                  value: NAMER.documentTypeName(collection.namespace)
                }
              },
              directives: [],
              selectionSet: {
                kind: "SelectionSet",
                selections: filterSelections(
                  await this._getCollectionFragmentSelections(
                    collection,
                    depth + 1
                  )
                )
              }
            });
          });
          return astBuilder.FieldWithSelectionSetDefinition({
            name: field.name,
            selections: [
              ...selections,
              // This is ... on Document { id }
              {
                kind: "InlineFragment",
                typeCondition: {
                  kind: "NamedType",
                  name: {
                    kind: "Name",
                    value: "Document"
                  }
                },
                directives: [],
                selectionSet: {
                  kind: "SelectionSet",
                  selections: [
                    SysFieldDefinition,
                    {
                      kind: "Field",
                      name: {
                        kind: "Name",
                        value: "id"
                      },
                      arguments: [],
                      directives: []
                    }
                  ]
                }
              }
            ]
          });
      }
    };
    /**
     * ```graphql
     * # ex.
     * mutation {
     *   updatePostDocument(relativePath: $relativePath, params: $params) {
     *     id
     *     data {...}
     *   }
     * }
     * ```
     *
     * @param collection
     */
    this.updateCollectionDocumentMutation = async (collection) => {
      return astBuilder.FieldDefinition({
        type: await this._buildCollectionDocumentType(collection),
        name: NAMER.updateName([collection.name]),
        required: true,
        args: [
          astBuilder.InputValueDefinition({
            name: "relativePath",
            required: true,
            type: astBuilder.TYPES.String
          }),
          astBuilder.InputValueDefinition({
            name: "params",
            required: true,
            type: await this._updateCollectionDocumentMutationType(collection)
          })
        ]
      });
    };
    /**
     * ```graphql
     * # ex.
     * mutation {
     *   createPostDocument(relativePath: $relativePath, params: $params) {
     *     id
     *     data {...}
     *   }
     * }
     * ```
     *
     * @param collection
     */
    this.createCollectionDocumentMutation = async (collection) => {
      return astBuilder.FieldDefinition({
        type: await this._buildCollectionDocumentType(collection),
        name: NAMER.createName([collection.name]),
        required: true,
        args: [
          astBuilder.InputValueDefinition({
            name: "relativePath",
            required: true,
            type: astBuilder.TYPES.String
          }),
          astBuilder.InputValueDefinition({
            name: "params",
            required: true,
            type: await this._updateCollectionDocumentMutationType(collection)
          })
        ]
      });
    };
    /**
     * ```graphql
     * # ex.
     * {
     *   getPostList(first: 10) {
     *     edges {
     *       node {
     *         id
     *       }
     *     }
     *   }
     * }
     * ```
     *
     * @param collection
     */
    this.collectionDocumentList = async (collection) => {
      const connectionName = NAMER.referenceConnectionType(collection.namespace);
      this.addToLookupMap({
        type: connectionName,
        resolveType: "collectionDocumentList",
        collection: collection.name
      });
      return this._connectionFieldBuilder({
        fieldName: NAMER.generateQueryListName(collection.namespace),
        connectionName,
        nodeType: NAMER.documentTypeName(collection.namespace),
        namespace: collection.namespace,
        collection
      });
    };
    /**
     * GraphQL type definitions which remain unchanged regardless
     * of the supplied Tina schema. Ex. "node" interface
     */
    this.buildStaticDefinitions = () => staticDefinitions;
    this._buildCollectionDocumentType = async (collection, suffix = "", extraFields = [], extraInterfaces = []) => {
      const documentTypeName = NAMER.documentTypeName(collection.namespace);
      const templateInfo = this.tinaSchema.getTemplatesForCollectable(collection);
      if (templateInfo.type === "union") {
        return this._buildObjectOrUnionData(
          {
            ...templateInfo
          },
          [
            astBuilder.FieldDefinition({
              name: "id",
              required: true,
              type: astBuilder.TYPES.ID
            }),
            astBuilder.FieldDefinition({
              name: "_sys",
              required: true,
              type: astBuilder.TYPES.SystemInfo
            }),
            ...extraFields,
            astBuilder.FieldDefinition({
              name: "_values",
              required: true,
              type: "JSON"
            })
          ],
          [
            astBuilder.NamedType({ name: astBuilder.TYPES.Node }),
            astBuilder.NamedType({ name: astBuilder.TYPES.Document }),
            ...extraInterfaces
          ],
          collection
        );
      }
      const fields = templateInfo.template.fields;
      const templateFields = await sequential(fields, async (field) => {
        return this._buildDataField(field);
      });
      return astBuilder.ObjectTypeDefinition({
        name: documentTypeName + suffix,
        interfaces: [
          astBuilder.NamedType({ name: astBuilder.TYPES.Node }),
          astBuilder.NamedType({ name: astBuilder.TYPES.Document }),
          ...extraInterfaces
        ],
        fields: [
          ...templateFields,
          astBuilder.FieldDefinition({
            name: "id",
            required: true,
            type: astBuilder.TYPES.ID
          }),
          astBuilder.FieldDefinition({
            name: "_sys",
            required: true,
            type: astBuilder.TYPES.SystemInfo
          }),
          ...extraFields,
          astBuilder.FieldDefinition({
            name: "_values",
            required: true,
            type: "JSON"
          })
        ]
      });
    };
    this._buildAuthDocumentType = async (collection, suffix = "", extraFields = [], extraInterfaces = []) => {
      const usersFields = mapUserFields(collection, []);
      if (!usersFields.length) {
        throw new Error("Auth collection must have a user field");
      }
      if (usersFields.length > 1) {
        throw new Error("Auth collection cannot have more than one user field");
      }
      const usersField = usersFields[0].collectable;
      const documentTypeName = NAMER.documentTypeName(usersField.namespace);
      const templateInfo = this.tinaSchema.getTemplatesForCollectable(usersField);
      if (templateInfo.type === "union") {
        throw new Error("Auth collection user field cannot be a union");
      }
      const fields = templateInfo.template.fields;
      const templateFields = await sequential(fields, async (field) => {
        return this._buildDataField(field);
      });
      return astBuilder.ObjectTypeDefinition({
        name: documentTypeName + suffix,
        interfaces: [
          astBuilder.NamedType({ name: astBuilder.TYPES.Node }),
          astBuilder.NamedType({ name: astBuilder.TYPES.Document }),
          ...extraInterfaces
        ],
        fields: [...templateFields]
      });
    };
    this._filterCollectionDocumentType = async (collection) => {
      const t = this.tinaSchema.getTemplatesForCollectable(collection);
      if (t.type === "union") {
        return astBuilder.InputObjectTypeDefinition({
          name: NAMER.dataFilterTypeName(t.namespace),
          fields: await sequential(t.templates, async (template) => {
            return astBuilder.InputValueDefinition({
              name: template.namespace[template.namespace.length - 1],
              type: await this._buildTemplateFilter(template)
            });
          })
        });
      }
      return this._buildTemplateFilter(t.template);
    };
    this._buildTemplateFilter = async (template) => {
      const fields = [];
      await sequential(template.fields, async (field) => {
        const f = await this._buildFieldFilter(field);
        if (f) {
          fields.push(f);
        }
        return true;
      });
      return astBuilder.InputObjectTypeDefinition({
        name: NAMER.dataFilterTypeName(template.namespace),
        fields
      });
    };
    this._updateCollectionDocumentMutationType = async (collection) => {
      const t = this.tinaSchema.getTemplatesForCollectable(collection);
      if (t.type === "union") {
        return astBuilder.InputObjectTypeDefinition({
          name: NAMER.dataMutationTypeName(t.namespace),
          fields: await sequential(t.templates, async (template) => {
            return astBuilder.InputValueDefinition({
              name: template.namespace[template.namespace.length - 1],
              type: await this._buildTemplateMutation(template)
            });
          })
        });
      }
      return this._buildTemplateMutation(t.template);
    };
    this._buildTemplateMutation = async (template) => {
      return astBuilder.InputObjectTypeDefinition({
        name: NAMER.dataMutationTypeName(template.namespace),
        fields: await sequential(template.fields, (field) => {
          return this._buildFieldMutation(field);
        })
      });
    };
    this._buildMultiCollectionDocumentDefinition = async ({
      fieldName,
      collections,
      includeFolderType
    }) => {
      const types = [];
      collections.forEach((collection) => {
        if (collection.fields) {
          const typeName = NAMER.documentTypeName(collection.namespace);
          types.push(typeName);
        }
        if (collection.templates) {
          collection.templates.forEach((template) => {
            const typeName = NAMER.documentTypeName(template.namespace);
            types.push(typeName);
          });
        }
      });
      if (includeFolderType) {
        types.push(astBuilder.TYPES.Folder);
      }
      const type = astBuilder.UnionTypeDefinition({
        name: fieldName,
        types
      });
      this.addToLookupMap({
        type: type.name.value,
        resolveType: "multiCollectionDocument",
        createDocument: "create",
        updateDocument: "update"
      });
      return type;
    };
    this._buildMultiCollectionDocumentListDefinition = async ({
      fieldName,
      namespace,
      nodeType,
      collections,
      connectionNamespace,
      includeFolderFilter
    }) => {
      const connectionName = NAMER.referenceConnectionType(namespace);
      this.addToLookupMap({
        type: connectionName,
        resolveType: "multiCollectionDocumentList",
        collections: collections.map((collection) => collection.name)
      });
      return this._connectionFieldBuilder({
        fieldName,
        namespace: connectionNamespace,
        connectionName,
        nodeType,
        collections,
        includeFolderFilter
      });
    };
    this._buildFieldFilter = async (field) => {
      switch (field.type) {
        case "boolean":
          return astBuilder.InputValueDefinition({
            name: field.name,
            type: astBuilder.InputObjectTypeDefinition({
              name: NAMER.dataFilterTypeName([field.type]),
              fields: [
                astBuilder.InputValueDefinition({
                  name: "eq",
                  type: astBuilder.TYPES.Boolean
                }),
                astBuilder.InputValueDefinition({
                  name: "exists",
                  type: astBuilder.TYPES.Boolean
                })
              ]
            })
          });
        case "number":
          return astBuilder.InputValueDefinition({
            name: field.name,
            type: astBuilder.InputObjectTypeDefinition({
              name: NAMER.dataFilterTypeName([field.type]),
              fields: [
                astBuilder.InputValueDefinition({
                  name: "lt",
                  type: astBuilder.TYPES.Number
                }),
                astBuilder.InputValueDefinition({
                  name: "lte",
                  type: astBuilder.TYPES.Number
                }),
                astBuilder.InputValueDefinition({
                  name: "gte",
                  type: astBuilder.TYPES.Number
                }),
                astBuilder.InputValueDefinition({
                  name: "gt",
                  type: astBuilder.TYPES.Number
                }),
                astBuilder.InputValueDefinition({
                  name: "eq",
                  type: astBuilder.TYPES.Number
                }),
                astBuilder.InputValueDefinition({
                  name: "exists",
                  type: astBuilder.TYPES.Boolean
                }),
                astBuilder.InputValueDefinition({
                  name: "in",
                  type: astBuilder.TYPES.Number,
                  list: true
                })
              ]
            })
          });
        case "datetime":
          return astBuilder.InputValueDefinition({
            name: field.name,
            type: astBuilder.InputObjectTypeDefinition({
              name: NAMER.dataFilterTypeName([field.type]),
              fields: [
                astBuilder.InputValueDefinition({
                  name: "after",
                  type: astBuilder.TYPES.String
                }),
                astBuilder.InputValueDefinition({
                  name: "before",
                  type: astBuilder.TYPES.String
                }),
                astBuilder.InputValueDefinition({
                  name: "eq",
                  type: astBuilder.TYPES.String
                }),
                astBuilder.InputValueDefinition({
                  name: "exists",
                  type: astBuilder.TYPES.Boolean
                }),
                astBuilder.InputValueDefinition({
                  name: "in",
                  type: astBuilder.TYPES.String,
                  list: true
                })
              ]
            })
          });
        case "image":
        case "string":
          return astBuilder.InputValueDefinition({
            name: field.name,
            type: astBuilder.InputObjectTypeDefinition({
              name: NAMER.dataFilterTypeName([field.type]),
              fields: [
                astBuilder.InputValueDefinition({
                  name: "startsWith",
                  type: astBuilder.TYPES.String
                }),
                astBuilder.InputValueDefinition({
                  name: "eq",
                  type: astBuilder.TYPES.String
                }),
                astBuilder.InputValueDefinition({
                  name: "exists",
                  type: astBuilder.TYPES.Boolean
                }),
                astBuilder.InputValueDefinition({
                  name: "in",
                  type: astBuilder.TYPES.String,
                  list: true
                })
              ]
            })
          });
        case "object":
          return astBuilder.InputValueDefinition({
            name: field.name,
            type: await this._filterCollectionDocumentType(field)
          });
        case "rich-text":
          if (!field.templates || field.templates.length === 0) {
            return astBuilder.InputValueDefinition({
              name: field.name,
              type: astBuilder.InputObjectTypeDefinition({
                name: NAMER.dataFilterTypeName(["richText"]),
                fields: [
                  astBuilder.InputValueDefinition({
                    name: "startsWith",
                    type: astBuilder.TYPES.String
                  }),
                  astBuilder.InputValueDefinition({
                    name: "eq",
                    type: astBuilder.TYPES.String
                  }),
                  astBuilder.InputValueDefinition({
                    name: "exists",
                    type: astBuilder.TYPES.Boolean
                  })
                ]
              })
            });
          }
          return astBuilder.InputValueDefinition({
            name: field.name,
            type: await this._filterCollectionDocumentType(field)
          });
        case "reference":
          const filter = await this._connectionFilterBuilder({
            fieldName: field.name,
            namespace: field.namespace,
            collections: this.tinaSchema.getCollectionsByName(field.collections)
          });
          return astBuilder.InputValueDefinition({
            name: field.name,
            type: astBuilder.InputObjectTypeDefinition({
              name: NAMER.dataFilterTypeName(field.namespace),
              fields: [filter]
            })
          });
      }
    };
    this._buildFieldMutation = async (field) => {
      switch (field.type) {
        case "boolean":
          return astBuilder.InputValueDefinition({
            name: field.name,
            list: field.list,
            type: astBuilder.TYPES.Boolean
          });
        case "number":
          return astBuilder.InputValueDefinition({
            name: field.name,
            list: field.list,
            type: astBuilder.TYPES.Number
          });
        case "datetime":
        case "image":
        case "string":
          return astBuilder.InputValueDefinition({
            name: field.name,
            list: field.list,
            type: astBuilder.TYPES.String
          });
        case "password":
          return this._buildPasswordMutation(field);
        case "object":
          return astBuilder.InputValueDefinition({
            name: field.name,
            list: field.list,
            type: await this._updateCollectionDocumentMutationType(field)
          });
        case "rich-text":
          return astBuilder.InputValueDefinition({
            name: field.name,
            list: field.list,
            type: astBuilder.TYPES.JSON
          });
        case "reference":
          return astBuilder.InputValueDefinition({
            name: field.name,
            list: field.list,
            type: astBuilder.TYPES.String
          });
      }
    };
    this._buildReferenceMutation = async (field) => {
      return astBuilder.InputObjectTypeDefinition({
        name: NAMER.dataMutationTypeName(field.namespace),
        fields: await sequential(
          this.tinaSchema.getCollectionsByName(field.collections),
          async (collection) => {
            return astBuilder.InputValueDefinition({
              name: collection.name,
              type: NAMER.dataMutationTypeName([collection.name])
            });
          }
        )
      });
    };
    this._buildPasswordMutation = async (field) => {
      return astBuilder.InputValueDefinition({
        name: field.name,
        list: field.list,
        type: astBuilder.InputObjectTypeDefinition({
          name: NAMER.dataMutationTypeName(field.namespace),
          fields: [
            astBuilder.InputValueDefinition({
              name: "value",
              type: astBuilder.TYPES.String,
              required: false
            }),
            astBuilder.InputValueDefinition({
              name: "passwordChangeRequired",
              type: astBuilder.TYPES.Boolean,
              required: true
            })
          ]
        })
      });
    };
    this._buildUpdateDocumentMutationParams = async (field) => {
      const fields = await sequential(
        this.tinaSchema.getCollectionsByName(field.collections),
        async (collection) => {
          return astBuilder.InputValueDefinition({
            name: collection.name,
            type: NAMER.dataMutationTypeName([collection.name])
          });
        }
      );
      fields.push(
        astBuilder.InputValueDefinition({
          name: "relativePath",
          type: astBuilder.TYPES.String
        })
      );
      return astBuilder.InputObjectTypeDefinition({
        name: NAMER.dataMutationUpdateTypeName(field.namespace),
        fields
      });
    };
    this._buildObjectOrUnionData = async (collectableTemplate, extraFields = [], extraInterfaces = [], collection) => {
      if (collectableTemplate.type === "union") {
        const name = NAMER.dataTypeName(collectableTemplate.namespace);
        const typeMap = {};
        const types = await sequential(
          collectableTemplate.templates,
          async (template) => {
            const type = await this._buildTemplateData(
              template,
              extraFields,
              extraInterfaces
            );
            typeMap[template.namespace[template.namespace.length - 1]] = type.name.value;
            return type;
          }
        );
        this.addToLookupMap({
          type: name,
          resolveType: "unionData",
          collection: collection?.name,
          typeMap
        });
        return astBuilder.UnionTypeDefinition({ name, types });
      }
      return this._buildTemplateData(collectableTemplate.template);
    };
    this._connectionFilterBuilder = async ({
      fieldName,
      namespace,
      collection,
      collections
    }) => {
      let filter;
      if (collections) {
        filter = astBuilder.InputValueDefinition({
          name: "filter",
          type: astBuilder.InputObjectTypeDefinition({
            name: NAMER.dataFilterTypeName(namespace),
            fields: await sequential(collections, async (collection2) => {
              return astBuilder.InputValueDefinition({
                // @ts-ignore
                name: collection2.name,
                type: NAMER.dataFilterTypeName(collection2.namespace)
              });
            })
          })
        });
      } else if (collection) {
        filter = astBuilder.InputValueDefinition({
          name: "filter",
          type: await this._filterCollectionDocumentType(collection)
        });
      } else {
        throw new Error(
          `Must provide either collection or collections to filter field builder`
        );
      }
      return filter;
    };
    this._connectionFieldBuilder = async ({
      fieldName,
      namespace,
      connectionName,
      nodeType,
      collection,
      collections,
      includeFolderFilter
    }) => {
      const extra = [
        await this._connectionFilterBuilder({
          fieldName,
          namespace,
          collection,
          collections
        })
      ];
      if (includeFolderFilter) {
        extra.push(
          astBuilder.InputValueDefinition({
            name: "folder",
            type: astBuilder.TYPES.String
          })
        );
      }
      return astBuilder.FieldDefinition({
        name: fieldName,
        required: true,
        args: [...listArgs, ...extra],
        type: astBuilder.ObjectTypeDefinition({
          name: connectionName,
          interfaces: [
            astBuilder.NamedType({ name: astBuilder.TYPES.Connection })
          ],
          fields: [
            astBuilder.FieldDefinition({
              name: "pageInfo",
              required: true,
              type: astBuilder.TYPES.PageInfo
            }),
            astBuilder.FieldDefinition({
              name: "totalCount",
              required: true,
              type: astBuilder.TYPES.Number
            }),
            astBuilder.FieldDefinition({
              name: "edges",
              list: true,
              type: astBuilder.ObjectTypeDefinition({
                name: NAMER.referenceConnectionEdgesTypeName(namespace),
                fields: [
                  astBuilder.FieldDefinition({
                    name: "cursor",
                    required: true,
                    type: astBuilder.TYPES.String
                  }),
                  astBuilder.FieldDefinition({ name: "node", type: nodeType })
                ]
              })
            })
          ]
        })
      });
    };
    this._buildDataField = async (field) => {
      const listWarningMsg = `
WARNING: The user interface for ${field.type} does not support \`list: true\`
Visit https://tina.io/docs/errors/ui-not-supported/ for more information

`;
      switch (field.type) {
        case "boolean":
        case "datetime":
        case "number":
          if (field.list) {
            console.warn(listWarningMsg);
          }
        case "image":
        case "string":
          return astBuilder.FieldDefinition({
            name: field.name,
            list: field.list,
            required: field.required,
            type: astBuilder.TYPES.Scalar(field.type)
          });
        case "password":
          return astBuilder.FieldDefinition({
            name: field.name,
            list: field.list,
            required: field.required,
            type: astBuilder.ObjectTypeDefinition({
              name: NAMER.dataTypeName(field.namespace),
              fields: [
                await this._buildDataField({
                  name: "value",
                  namespace: [...field.namespace, "value"],
                  type: "string",
                  required: true
                }),
                await this._buildDataField({
                  name: "passwordChangeRequired",
                  namespace: [...field.namespace, "passwordChangeRequired"],
                  type: "boolean",
                  required: false
                })
              ]
            })
          });
        case "object":
          return astBuilder.FieldDefinition({
            name: field.name,
            list: field.list,
            required: field.required,
            type: await this._buildObjectOrUnionData(
              this.tinaSchema.getTemplatesForCollectable(field)
            )
          });
        case "rich-text":
          return astBuilder.FieldDefinition({
            name: field.name,
            list: field.list,
            required: field.required,
            type: astBuilder.TYPES.JSON
          });
        case "reference":
          const name = NAMER.documentTypeName(field.namespace);
          if (field.list) {
            console.warn(listWarningMsg);
            return this._buildMultiCollectionDocumentListDefinition({
              fieldName: field.name,
              namespace: field.namespace,
              nodeType: astBuilder.UnionTypeDefinition({
                name,
                types: field.collections.map(
                  (collectionName) => NAMER.documentTypeName([collectionName])
                )
              }),
              collections: this.tinaSchema.getCollectionsByName(
                field.collections
              ),
              connectionNamespace: field.namespace
            });
          } else {
            const type = await this._buildMultiCollectionDocumentDefinition({
              fieldName: name,
              collections: this.tinaSchema.getCollectionsByName(
                field.collections
              )
            });
            return astBuilder.FieldDefinition({
              name: field.name,
              required: field.required,
              list: false,
              type
            });
          }
      }
    };
    this._buildTemplateData = async ({ namespace, fields }, extraFields = [], extraInterfaces = []) => {
      return astBuilder.ObjectTypeDefinition({
        name: NAMER.dataTypeName(namespace),
        interfaces: extraInterfaces || [],
        fields: [
          ...await sequential(fields, async (field) => {
            return this._buildDataField(field);
          }),
          ...extraFields
        ]
      });
    };
    this.maxDepth = // @ts-ignore
    config?.tinaSchema.schema?.config?.client?.referenceDepth ?? 2;
    this.tinaSchema = config.tinaSchema;
    this.lookupMap = {};
  }
  async buildTemplateFragments(template, depth) {
    const selections = [];
    await sequential(template.fields || [], async (item) => {
      const field = await this._buildFieldNodeForFragments(item, depth);
      selections.push(field);
    });
    const filteredSelections = filterSelections(selections);
    if (!filteredSelections.length) return false;
    return astBuilder.InlineFragmentDefinition({
      selections: filteredSelections,
      name: NAMER.dataTypeName(template.namespace)
    });
  }
};
var listArgs = [
  astBuilder.InputValueDefinition({
    name: "before",
    type: astBuilder.TYPES.String
  }),
  astBuilder.InputValueDefinition({
    name: "after",
    type: astBuilder.TYPES.String
  }),
  astBuilder.InputValueDefinition({
    name: "first",
    type: astBuilder.TYPES.Number
  }),
  astBuilder.InputValueDefinition({
    name: "last",
    type: astBuilder.TYPES.Number
  }),
  astBuilder.InputValueDefinition({
    name: "sort",
    type: astBuilder.TYPES.String
  })
];
var filterSelections = (arr) => {
  return arr.filter(Boolean);
};

// src/schema/createSchema.ts
import { TinaSchema } from "@tinacms/schema-tools";

// src/schema/validate.ts
import { addNamespaceToSchema } from "@tinacms/schema-tools";
import deepClone from "lodash.clonedeep";
import * as yup2 from "yup";
import {
  validateTinaCloudSchemaConfig
} from "@tinacms/schema-tools";
var FIELD_TYPES = [
  "string",
  "number",
  "boolean",
  "datetime",
  "image",
  "reference",
  "object",
  "rich-text",
  "password"
];
var validateSchema = async (schema) => {
  const schema2 = addNamespaceToSchema(
    deepClone(schema)
  );
  const collections = await sequential(
    schema2.collections,
    async (collection) => validateCollection(collection)
  );
  validationCollectionsPathAndMatch(collections);
  if (schema2.config) {
    const config = validateTinaCloudSchemaConfig(schema2.config);
    return {
      collections,
      config
    };
  }
  return {
    collections
  };
};
var validationCollectionsPathAndMatch = (collections) => {
  const paths = collections.map((x) => x.path);
  if (paths.length === new Set(paths).size) {
    return;
  }
  const noMatchCollections = collections.filter((x) => {
    return typeof x?.match === "undefined";
  }).map((x) => `${x.path}${x.format || "md"}`);
  if (noMatchCollections.length !== new Set(noMatchCollections).size) {
    throw new Error(
      // TODO: add a link to the docs
      "Two collections without match can not have the same `path`. Please make the `path` unique or add a matches property to the collection."
    );
  }
  const hasMatchAndPath = collections.filter((x) => {
    return typeof x.path !== "undefined" && typeof x.match !== "undefined";
  }).map(
    (x) => `${x.path}|${x?.match?.exclude || ""}|${x?.match?.include || ""}|${x.format || "md"}`
  );
  if (hasMatchAndPath.length !== new Set(hasMatchAndPath).size) {
    throw new Error(
      "Can not have two or more collections with the same path and match. Please update either the path or the match to be unique."
    );
  }
  const groupbyPath = collections.reduce((r, a) => {
    const key = `${a.path}|${a.format || "md"}`;
    r[key] = r[key] || [];
    r[key].push(a);
    return r;
  }, /* @__PURE__ */ Object.create(null));
  Object.keys(groupbyPath).forEach((key) => {
    const collectionsArr = groupbyPath[key];
    if (collectionsArr.length === 1) {
      return;
    }
    if (collectionsArr.some((x) => typeof x.match === "undefined")) {
      throw new Error(
        "Can not have two or more collections with the same path and format if one doesn't have a match property"
      );
    }
    const matches = collectionsArr.map(
      (x) => typeof x?.match === "object" ? JSON.stringify(x.match) : ""
    );
    if (matches.length === new Set(matches).size) {
      return;
    }
    throw new Error(
      "Can not have two or more collections with the same path format and match. Please update either the path or the match to be unique."
    );
  });
};
var validateCollection = async (collection) => {
  let templates = [];
  let fields = [];
  const messageName = collection.namespace.join(".");
  const collectionSchema = yup2.object({
    name: yup2.string().matches(/^[a-zA-Z0-9_]*$/, {
      message: (obj) => `Collection's "name" must match ${obj.regex} at ${messageName}`
    }).required(),
    path: yup2.string().test("is-required", "path is a required field", (value) => {
      if (value === "") {
        return true;
      }
      return yup2.string().required().isValidSync(value);
    }).transform((value) => {
      return value.replace(/^\/|\/$/g, "");
    })
  });
  await collectionSchema.validate(collection);
  const validCollection = await collectionSchema.cast(
    collection
  );
  if (validCollection.templates) {
    templates = await sequential(
      validCollection.templates,
      async (template) => {
        const fields2 = await sequential(template.fields, async (field) => {
          return validateField(field);
        });
        return {
          ...validCollection,
          ...fields2
        };
      }
    );
  }
  if (validCollection.fields) {
    if (typeof validCollection.fields === "string") {
      throw new Error("Global templates are not yet supported");
    }
    fields = await sequential(validCollection.fields, async (field) => {
      return validateField(field);
    });
    return {
      ...validCollection,
      fields
    };
  }
  return collection;
};
var validateField = async (field) => {
  const messageName = field.namespace.join(".");
  const schema = yup2.object({
    name: yup2.string().matches(/^[a-zA-Z0-9_]*$/, {
      message: (obj) => `Field's 'name' must match ${obj.regex} at ${messageName}`
    }).required(),
    type: yup2.string().oneOf(
      FIELD_TYPES,
      (obj) => `'type' must be one of: ${obj.values}, but got '${obj.value}' at ${messageName}`
    )
  });
  await schema.validate(field);
  const validField = await schema.cast(field);
  return validField;
};

// package.json
var package_default = {
  name: "@tinacms/graphql",
  version: "1.5.18",
  main: "dist/index.js",
  module: "dist/index.mjs",
  typings: "dist/index.d.ts",
  files: [
    "package.json",
    "dist"
  ],
  exports: {
    import: "./dist/index.mjs",
    require: "./dist/index.js"
  },
  license: "SEE LICENSE IN LICENSE",
  buildConfig: {
    entryPoints: [
      {
        name: "src/index.ts",
        target: "node",
        bundle: []
      }
    ]
  },
  scripts: {
    types: "pnpm tsc",
    build: "tinacms-scripts build",
    docs: "pnpm typedoc",
    test: "vitest run",
    "test-watch": "vitest"
  },
  dependencies: {
    "@iarna/toml": "^2.2.5",
    "@tinacms/mdx": "workspace:*",
    "@tinacms/schema-tools": "workspace:*",
    "abstract-level": "^1.0.4",
    "date-fns": "^2.30.0",
    "fast-glob": "^3.3.3",
    "fs-extra": "^11.3.0",
    "glob-parent": "^6.0.2",
    graphql: "15.8.0",
    "gray-matter": "^4.0.3",
    "isomorphic-git": "^1.29.0",
    "js-sha1": "^0.6.0",
    "js-yaml": "^3.14.1",
    "jsonpath-plus": "10.1.0",
    "lodash.clonedeep": "^4.5.0",
    "lodash.set": "^4.3.2",
    "lodash.uniqby": "^4.7.0",
    "many-level": "^2.0.0",
    micromatch: "4.0.8",
    "normalize-path": "^3.0.0",
    "readable-stream": "^4.7.0",
    scmp: "^2.1.0",
    yup: "^0.32.11"
  },
  publishConfig: {
    registry: "https://registry.npmjs.org"
  },
  repository: {
    url: "https://github.com/tinacms/tinacms.git",
    directory: "packages/tina-graphql"
  },
  devDependencies: {
    "@tinacms/schema-tools": "workspace:*",
    "@tinacms/scripts": "workspace:*",
    "@types/cors": "^2.8.17",
    "@types/estree": "^0.0.50",
    "@types/express": "^4.17.21",
    "@types/fs-extra": "^9.0.13",
    "@types/js-yaml": "^3.12.10",
    "@types/lodash.camelcase": "^4.3.9",
    "@types/lodash.upperfirst": "^4.3.9",
    "@types/lru-cache": "^5.1.1",
    "@types/mdast": "^3.0.15",
    "@types/micromatch": "^4.0.9",
    "@types/node": "^22.13.1",
    "@types/normalize-path": "^3.0.2",
    "@types/ws": "^7.4.7",
    "@types/yup": "^0.29.14",
    "jest-file-snapshot": "^0.5.0",
    "memory-level": "^1.0.0",
    typescript: "^5.7.3",
    vite: "^4.5.9",
    vitest: "^0.32.4",
    zod: "^3.24.2"
  }
};

// src/schema/createSchema.ts
var createSchema = async ({
  schema,
  flags = []
}) => {
  const validSchema = await validateSchema(schema);
  const [major, minor, patch] = package_default.version.split(".");
  const meta = {};
  if (flags && flags.length > 0) {
    meta["flags"] = flags;
  }
  return new TinaSchema({
    version: {
      fullVersion: package_default.version,
      major,
      minor,
      patch
    },
    meta,
    ...validSchema
  });
};

// src/build.ts
var buildDotTinaFiles = async ({
  config,
  flags = [],
  buildSDK = true
}) => {
  if (flags.indexOf("experimentalData") === -1) {
    flags.push("experimentalData");
  }
  const { schema } = config;
  const tinaSchema = await createSchema({
    schema: { ...schema, config },
    flags
  });
  const builder = await createBuilder({
    tinaSchema
  });
  const graphQLSchema = await _buildSchema(builder, tinaSchema);
  let fragDoc = "";
  let queryDoc = "";
  if (buildSDK) {
    fragDoc = await _buildFragments(builder, tinaSchema);
    queryDoc = await _buildQueries(builder, tinaSchema);
  }
  return {
    graphQLSchema,
    tinaSchema,
    lookup: builder.lookupMap,
    fragDoc,
    queryDoc
  };
};
var _buildFragments = async (builder, tinaSchema) => {
  const fragmentDefinitionsFields = [];
  const collections = tinaSchema.getCollections();
  await sequential(collections, async (collection) => {
    const frag = await builder.collectionFragment(
      collection
    );
    fragmentDefinitionsFields.push(frag);
  });
  const fragDoc = {
    kind: "Document",
    definitions: uniqBy2(
      // @ts-ignore
      extractInlineTypes(fragmentDefinitionsFields),
      (node) => node.name.value
    )
  };
  return print(fragDoc);
};
var _buildQueries = async (builder, tinaSchema) => {
  const operationsDefinitions = [];
  const collections = tinaSchema.getCollections();
  await sequential(collections, async (collection) => {
    const queryName = NAMER.queryName(collection.namespace);
    const queryListName = NAMER.generateQueryListName(collection.namespace);
    const queryFilterTypeName = NAMER.dataFilterTypeName(collection.namespace);
    const fragName = NAMER.fragmentName(collection.namespace);
    operationsDefinitions.push(
      astBuilder.QueryOperationDefinition({ fragName, queryName })
    );
    operationsDefinitions.push(
      astBuilder.ListQueryOperationDefinition({
        fragName,
        queryName: queryListName,
        filterType: queryFilterTypeName,
        // look for flag to see if the data layer is enabled
        dataLayer: Boolean(
          tinaSchema.config?.meta?.flags?.find((x) => x === "experimentalData")
        )
      })
    );
  });
  const queryDoc = {
    kind: "Document",
    definitions: uniqBy2(
      // @ts-ignore
      extractInlineTypes(operationsDefinitions),
      (node) => node.name.value
    )
  };
  return print(queryDoc);
};
var _buildSchema = async (builder, tinaSchema) => {
  const definitions = [];
  definitions.push(builder.buildStaticDefinitions());
  const queryTypeDefinitionFields = [];
  const mutationTypeDefinitionFields = [];
  const collections = tinaSchema.getCollections();
  queryTypeDefinitionFields.push(
    astBuilder.FieldDefinition({
      name: "getOptimizedQuery",
      args: [
        astBuilder.InputValueDefinition({
          name: "queryString",
          type: astBuilder.TYPES.String,
          required: true
        })
      ],
      type: astBuilder.TYPES.String
    })
  );
  queryTypeDefinitionFields.push(
    await builder.buildCollectionDefinition(collections)
  );
  queryTypeDefinitionFields.push(
    await builder.buildMultiCollectionDefinition(collections)
  );
  queryTypeDefinitionFields.push(await builder.multiNodeDocument());
  queryTypeDefinitionFields.push(
    await builder.multiCollectionDocument(collections)
  );
  mutationTypeDefinitionFields.push(
    await builder.addMultiCollectionDocumentMutation()
  );
  mutationTypeDefinitionFields.push(
    await builder.buildUpdateCollectionDocumentMutation(collections)
  );
  mutationTypeDefinitionFields.push(
    await builder.buildDeleteCollectionDocumentMutation(collections)
  );
  mutationTypeDefinitionFields.push(
    await builder.buildCreateCollectionDocumentMutation(collections)
  );
  mutationTypeDefinitionFields.push(
    await builder.buildCreateCollectionFolderMutation()
  );
  await sequential(collections, async (collection) => {
    queryTypeDefinitionFields.push(
      await builder.collectionDocument(collection)
    );
    if (collection.isAuthCollection) {
      queryTypeDefinitionFields.push(
        await builder.authenticationCollectionDocument(collection)
      );
      queryTypeDefinitionFields.push(
        await builder.authorizationCollectionDocument(collection)
      );
      mutationTypeDefinitionFields.push(
        await builder.updatePasswordMutation(collection)
      );
    }
    mutationTypeDefinitionFields.push(
      await builder.updateCollectionDocumentMutation(collection)
    );
    mutationTypeDefinitionFields.push(
      await builder.createCollectionDocumentMutation(collection)
    );
    queryTypeDefinitionFields.push(
      await builder.collectionDocumentList(collection)
    );
  });
  definitions.push(
    astBuilder.ObjectTypeDefinition({
      name: "Query",
      fields: queryTypeDefinitionFields
    })
  );
  definitions.push(
    astBuilder.ObjectTypeDefinition({
      name: "Mutation",
      fields: mutationTypeDefinitionFields
    })
  );
  return {
    kind: "Document",
    definitions: uniqBy2(
      // @ts-ignore
      extractInlineTypes(definitions),
      (node) => node.name.value
    )
  };
};

// src/resolve.ts
import { graphql, buildASTSchema, getNamedType, GraphQLError as GraphQLError4 } from "graphql";

// src/resolver/index.ts
import path3 from "path";
import isValid from "date-fns/isValid/index.js";

// src/mdx/index.ts
import { parseMDX, stringifyMDX } from "@tinacms/mdx";

// src/resolver/index.ts
import { JSONPath as JSONPath2 } from "jsonpath-plus";

// src/resolver/error.ts
var TinaGraphQLError = class extends Error {
  constructor(message, extensions) {
    super(message);
    if (!this.name) {
      Object.defineProperty(this, "name", { value: "TinaGraphQLError" });
    }
    this.extensions = { ...extensions };
  }
};
var TinaFetchError = class extends Error {
  constructor(message, args) {
    super(message);
    this.name = "TinaFetchError";
    this.collection = args.collection;
    this.stack = args.stack;
    this.file = args.file;
    this.originalError = args.originalError;
  }
};
var TinaQueryError = class extends TinaFetchError {
  constructor(args) {
    super(
      `Error querying file ${args.file} from collection ${args.collection}. ${auditMessage(args.includeAuditMessage)}`,
      args
    );
  }
};
var TinaParseDocumentError = class extends TinaFetchError {
  constructor(args) {
    super(
      `Error parsing file ${args.file} from collection ${args.collection}. ${auditMessage(args.includeAuditMessage)}`,
      args
    );
  }
  toString() {
    return super.toString() + "\n OriginalError: \n" + this.originalError.toString();
  }
};
var auditMessage = (includeAuditMessage = true) => includeAuditMessage ? `Please run "tinacms audit" or add the --verbose option  for more info` : "";
var handleFetchErrorError = (e, verbose) => {
  if (e instanceof Error) {
    if (e instanceof TinaFetchError) {
      if (verbose) {
        console.log(e.toString());
        console.log(e);
        console.log(e.stack);
      }
    }
  } else {
    console.error(e);
  }
  throw e;
};

// src/resolver/filter-utils.ts
var resolveReferences = async (filter, fields, resolver) => {
  for (const fieldKey of Object.keys(filter)) {
    const fieldDefinition = fields.find(
      (f) => f.name === fieldKey
    );
    if (fieldDefinition) {
      if (fieldDefinition.type === "reference") {
        const { edges, values } = await resolver(filter, fieldDefinition);
        if (edges.length === 1) {
          filter[fieldKey] = {
            eq: values[0]
          };
        } else if (edges.length > 1) {
          filter[fieldKey] = {
            in: values
          };
        } else {
          filter[fieldKey] = {
            eq: "___null___"
          };
        }
      } else if (fieldDefinition.type === "object") {
        if (fieldDefinition.templates) {
          for (const templateName of Object.keys(filter[fieldKey])) {
            const template = fieldDefinition.templates.find(
              (template2) => !(typeof template2 === "string") && template2.name === templateName
            );
            if (template) {
              await resolveReferences(
                filter[fieldKey][templateName],
                template.fields,
                resolver
              );
            } else {
              throw new Error(`Template ${templateName} not found`);
            }
          }
        } else {
          await resolveReferences(
            filter[fieldKey],
            fieldDefinition.fields,
            resolver
          );
        }
      }
    } else {
      throw new Error(`Unable to find field ${fieldKey}`);
    }
  }
};
var collectConditionsForChildFields = (filterNode, fields, pathExpression, collectCondition) => {
  for (const childFieldName of Object.keys(filterNode)) {
    const childField = fields.find((field) => field.name === childFieldName);
    if (!childField) {
      throw new Error(`Unable to find type for field ${childFieldName}`);
    }
    collectConditionsForField(
      childFieldName,
      childField,
      filterNode[childFieldName],
      pathExpression,
      collectCondition
    );
  }
};
var collectConditionsForObjectField = (fieldName, field, filterNode, pathExpression, collectCondition) => {
  if (field.list && field.templates) {
    for (const [filterKey, childFilterNode] of Object.entries(filterNode)) {
      const template = field.templates.find(
        (template2) => !(typeof template2 === "string") && template2.name === filterKey
      );
      const jsonPath = `${fieldName}[?(@._template=="${filterKey}")]`;
      const filterPath = pathExpression ? `${pathExpression}.${jsonPath}` : jsonPath;
      collectConditionsForChildFields(
        childFilterNode,
        template.fields,
        filterPath,
        collectCondition
      );
    }
  } else {
    const jsonPath = `${fieldName}${field.list ? "[*]" : ""}`;
    const filterPath = pathExpression ? `${pathExpression}.${jsonPath}` : `${jsonPath}`;
    collectConditionsForChildFields(
      filterNode,
      field.fields,
      filterPath,
      collectCondition
    );
  }
};
var collectConditionsForField = (fieldName, field, filterNode, pathExpression, collectCondition) => {
  if (field.type === "object") {
    collectConditionsForObjectField(
      fieldName,
      field,
      filterNode,
      pathExpression,
      collectCondition
    );
  } else {
    collectCondition({
      filterPath: pathExpression ? `${pathExpression}.${fieldName}` : fieldName,
      filterExpression: {
        _type: field.type,
        _list: !!field.list,
        ...filterNode
      }
    });
  }
};

// src/resolver/media-utils.ts
var resolveMediaCloudToRelative = (value, config = { useRelativeMedia: true }, schema) => {
  if (config && value) {
    if (config.useRelativeMedia === true) {
      return value;
    }
    if (hasTinaMediaConfig(schema) === true) {
      const assetsURL = `https://${config.assetsHost}/${config.clientId}`;
      if (typeof value === "string" && value.includes(assetsURL)) {
        const cleanMediaRoot = cleanUpSlashes(
          schema.config.media.tina.mediaRoot
        );
        const strippedURL = value.replace(assetsURL, "");
        return `${cleanMediaRoot}${strippedURL}`;
      }
      if (Array.isArray(value)) {
        return value.map((v) => {
          if (!v || typeof v !== "string") return v;
          const cleanMediaRoot = cleanUpSlashes(
            schema.config.media.tina.mediaRoot
          );
          const strippedURL = v.replace(assetsURL, "");
          return `${cleanMediaRoot}${strippedURL}`;
        });
      }
      return value;
    }
    return value;
  } else {
    return value;
  }
};
var resolveMediaRelativeToCloud = (value, config = { useRelativeMedia: true }, schema) => {
  if (config && value) {
    if (config.useRelativeMedia === true) {
      return value;
    }
    if (hasTinaMediaConfig(schema) === true) {
      const cleanMediaRoot = cleanUpSlashes(schema.config.media.tina.mediaRoot);
      if (typeof value === "string") {
        const strippedValue = value.replace(cleanMediaRoot, "");
        return `https://${config.assetsHost}/${config.clientId}${strippedValue}`;
      }
      if (Array.isArray(value)) {
        return value.map((v) => {
          if (!v || typeof v !== "string") return v;
          const strippedValue = v.replace(cleanMediaRoot, "");
          return `https://${config.assetsHost}/${config.clientId}${strippedValue}`;
        });
      }
    }
    return value;
  } else {
    return value;
  }
};
var cleanUpSlashes = (path7) => {
  if (path7) {
    return `/${path7.replace(/^\/+|\/+$/gm, "")}`;
  }
  return "";
};
var hasTinaMediaConfig = (schema) => {
  if (!schema.config?.media?.tina) return false;
  if (typeof schema.config?.media?.tina?.publicFolder !== "string" && typeof schema.config?.media?.tina?.mediaRoot !== "string")
    return false;
  return true;
};

// src/resolver/index.ts
import { GraphQLError as GraphQLError2 } from "graphql";

// src/database/datalayer.ts
import { JSONPath } from "jsonpath-plus";
import sha from "js-sha1";

// src/database/level.ts
var ARRAY_ITEM_VALUE_SEPARATOR = ",";
var INDEX_KEY_FIELD_SEPARATOR = "";
var CONTENT_ROOT_PREFIX = "~";
var SUBLEVEL_OPTIONS = {
  separator: INDEX_KEY_FIELD_SEPARATOR,
  valueEncoding: "json"
};
var LevelProxyHandler = {
  get: function(target, property) {
    if (!target[property]) {
      throw new Error(`The property, ${property.toString()}, doesn't exist`);
    }
    if (typeof target[property] !== "function") {
      throw new Error(
        `The property, ${property.toString()}, is not a function`
      );
    }
    if (property === "get") {
      return async (...args) => {
        let result;
        try {
          result = await target[property].apply(target, args);
        } catch (e) {
          if (e.code !== "LEVEL_NOT_FOUND") {
            throw e;
          }
        }
        return result;
      };
    } else if (property === "sublevel") {
      return (...args) => {
        return new Proxy(
          // eslint-disable-next-line prefer-spread
          target[property].apply(target, args),
          LevelProxyHandler
        );
      };
    } else {
      return (...args) => target[property].apply(target, args);
    }
  }
};
var LevelProxy = class {
  constructor(level) {
    return new Proxy(level, LevelProxyHandler);
  }
};

// src/database/datalayer.ts
import path2 from "path";

// src/database/util.ts
import toml from "@iarna/toml";
import yaml from "js-yaml";
import matter from "gray-matter";
import {
  normalizePath
} from "@tinacms/schema-tools";
import micromatch from "micromatch";
import path from "path";

// src/database/alias-utils.ts
var replaceBlockAliases = (template, item) => {
  const output = { ...item };
  const templateKey = template.templateKey || "_template";
  const templateName = output[templateKey];
  const matchingTemplate = template.templates.find(
    (t) => t.nameOverride == templateName || t.name == templateName
  );
  if (!matchingTemplate) {
    throw new Error(
      `Block template "${templateName}" is not defined for field "${template.name}"`
    );
  }
  output._template = matchingTemplate.name;
  if (templateKey != "_template") {
    delete output[templateKey];
  }
  return output;
};
var replaceNameOverrides = (template, obj) => {
  if (template.list) {
    return obj.map((item) => {
      if (isBlockField(template)) {
        item = replaceBlockAliases(template, item);
      }
      return _replaceNameOverrides(
        getTemplateForData(template, item).fields,
        item
      );
    });
  } else {
    return _replaceNameOverrides(getTemplateForData(template, obj).fields, obj);
  }
};
function isBlockField(field) {
  return field && field.type === "object" && field.templates?.length > 0;
}
var _replaceNameOverrides = (fields, obj) => {
  const output = {};
  Object.keys(obj).forEach((key) => {
    const field = fields.find(
      (fieldWithMatchingAlias) => (fieldWithMatchingAlias?.nameOverride || fieldWithMatchingAlias?.name) === key
    );
    output[field?.name || key] = field?.type == "object" ? replaceNameOverrides(field, obj[key]) : obj[key];
  });
  return output;
};
var getTemplateForData = (field, data) => {
  if (field.templates?.length) {
    const templateKey = "_template";
    if (data[templateKey]) {
      const result = field.templates.find(
        (template) => template.nameOverride === data[templateKey] || template.name === data[templateKey]
      );
      if (result) {
        return result;
      }
      throw new Error(
        `Template "${data[templateKey]}" is not defined for field "${field.name}"`
      );
    }
    throw new Error(
      `Missing required key "${templateKey}" on field "${field.name}"`
    );
  } else {
    return field;
  }
};
var applyBlockAliases = (template, item) => {
  const output = { ...item };
  const templateKey = template.templateKey || "_template";
  const templateName = output._template;
  const matchingTemplate = template.templates.find(
    (t) => t.nameOverride == templateName || t.name == templateName
  );
  if (!matchingTemplate) {
    throw new Error(
      `Block template "${templateName}" is not defined for field "${template.name}"`
    );
  }
  output[templateKey] = matchingTemplate.nameOverride || matchingTemplate.name;
  if (templateKey != "_template") {
    delete output._template;
  }
  return output;
};
var applyNameOverrides = (template, obj) => {
  if (template.list) {
    return obj.map((item) => {
      let result = _applyNameOverrides(
        getTemplateForData(template, item).fields,
        item
      );
      if (isBlockField(template)) {
        result = applyBlockAliases(template, result);
      }
      return result;
    });
  } else {
    return _applyNameOverrides(getTemplateForData(template, obj).fields, obj);
  }
};
var _applyNameOverrides = (fields, obj) => {
  const output = {};
  Object.keys(obj).forEach((key) => {
    const field = fields.find((field2) => field2.name === key);
    const outputKey = field?.nameOverride || key;
    output[outputKey] = field?.type === "object" ? applyNameOverrides(field, obj[key]) : obj[key];
  });
  return output;
};

// src/database/util.ts
var matterEngines = {
  toml: {
    parse: (val) => toml.parse(val),
    stringify: (val) => toml.stringify(val)
  }
};
var stringifyFile = (content, format, keepTemplateKey, markdownParseConfig) => {
  const {
    _relativePath,
    _keepTemplateKey,
    _id,
    _template,
    _collection,
    $_body,
    ...rest
  } = content;
  const extra = {};
  if (keepTemplateKey) {
    extra["_template"] = _template;
  }
  const strippedContent = { ...rest, ...extra };
  switch (format) {
    case ".markdown":
    case ".mdx":
    case ".md":
      const ok = matter.stringify(
        typeof $_body === "undefined" ? "" : `
${$_body}`,
        strippedContent,
        {
          language: markdownParseConfig?.frontmatterFormat ?? "yaml",
          engines: matterEngines,
          delimiters: markdownParseConfig?.frontmatterDelimiters ?? "---"
        }
      );
      return ok;
    case ".json":
      return JSON.stringify(strippedContent, null, 2);
    case ".yaml":
    case ".yml":
      return yaml.safeDump(strippedContent);
    case ".toml":
      return toml.stringify(strippedContent);
    default:
      throw new Error(`Must specify a valid format, got ${format}`);
  }
};
var parseFile = (content, format, yupSchema, markdownParseConfig) => {
  try {
    switch (format) {
      case ".markdown":
      case ".mdx":
      case ".md":
        const contentJSON = matter(content || "", {
          language: markdownParseConfig?.frontmatterFormat ?? "yaml",
          delimiters: markdownParseConfig?.frontmatterDelimiters ?? "---",
          engines: matterEngines
        });
        const markdownData = {
          ...contentJSON.data,
          $_body: contentJSON.content
        };
        assertShape(markdownData, yupSchema);
        return markdownData;
      case ".json":
        if (!content) {
          return {};
        }
        return JSON.parse(content);
      case ".toml":
        if (!content) {
          return {};
        }
        return toml.parse(content);
      case ".yaml":
      case ".yml":
        if (!content) {
          return {};
        }
        return yaml.safeLoad(content);
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
  throw new Error(`Must specify a valid format, got ${format}`);
};
var scanAllContent = async (tinaSchema, bridge, callback) => {
  const warnings = [];
  const filesSeen = /* @__PURE__ */ new Map();
  const duplicateFiles = /* @__PURE__ */ new Set();
  await sequential(tinaSchema.getCollections(), async (collection) => {
    const normalPath = normalizePath(collection.path);
    const format = collection.format || "md";
    const documentPaths = await bridge.glob(normalPath, format);
    const matches = tinaSchema.getMatches({ collection });
    const filteredPaths = matches.length > 0 ? micromatch(documentPaths, matches) : documentPaths;
    filteredPaths.forEach((path7) => {
      if (filesSeen.has(path7)) {
        filesSeen.get(path7).push(collection.name);
        duplicateFiles.add(path7);
      } else {
        filesSeen.set(path7, [collection.name]);
      }
    });
    duplicateFiles.forEach((path7) => {
      warnings.push(
        `"${path7}" Found in multiple collections: ${filesSeen.get(path7).map((collection2) => `"${collection2}"`).join(
          ", "
        )}. This can cause unexpected behavior. We recommend updating the \`match\` property of those collections so that each file is in only one collection.
This will be an error in the future. See https://tina.io/docs/errors/file-in-mutpliple-collections/
`
      );
    });
    await callback(collection, filteredPaths);
  });
  return warnings;
};
var scanContentByPaths = async (tinaSchema, documentPaths, callback) => {
  const { pathsByCollection, nonCollectionPaths, collections } = await partitionPathsByCollection(tinaSchema, documentPaths);
  for (const collection of Object.keys(pathsByCollection)) {
    await callback(collections[collection], pathsByCollection[collection]);
  }
  if (nonCollectionPaths.length) {
    await callback(void 0, nonCollectionPaths);
  }
};
var partitionPathsByCollection = async (tinaSchema, documentPaths) => {
  const pathsByCollection = {};
  const nonCollectionPaths = [];
  const collections = {};
  for (const documentPath of documentPaths) {
    const collection = await tinaSchema.getCollectionByFullPath(documentPath);
    if (collection) {
      if (!pathsByCollection[collection.name]) {
        pathsByCollection[collection.name] = [];
      }
      collections[collection.name] = collection;
      pathsByCollection[collection.name].push(documentPath);
    } else {
      nonCollectionPaths.push(documentPath);
    }
  }
  return { pathsByCollection, nonCollectionPaths, collections };
};
var transformDocument = (filepath, contentObject, tinaSchema) => {
  const extension = path.extname(filepath);
  const templateName = hasOwnProperty(contentObject, "_template") && typeof contentObject._template === "string" ? contentObject._template : void 0;
  const { collection, template } = hasOwnProperty(contentObject, "__collection") ? {
    collection: tinaSchema.getCollection(
      contentObject["__collection"]
    ),
    template: void 0
  } : tinaSchema.getCollectionAndTemplateByFullPath(filepath, templateName);
  const field = template?.fields.find((field2) => {
    if (field2.type === "string" || field2.type === "rich-text") {
      if (field2.isBody) {
        return true;
      }
    }
    return false;
  });
  let data = contentObject;
  if ((extension === ".md" || extension === ".mdx") && field) {
    if (hasOwnProperty(contentObject, "$_body")) {
      const { $_body, ...rest } = contentObject;
      data = rest;
      data[field.name] = $_body;
    }
  }
  return {
    ...data,
    _collection: collection.name,
    _keepTemplateKey: !!collection.templates,
    _template: template?.namespace ? lastItem(template?.namespace) : void 0,
    _relativePath: filepath.replace(collection.path, "").replace(/^\/|\/$/g, ""),
    _id: filepath
  };
};
function hasOwnProperty(obj, prop) {
  return obj.hasOwnProperty(prop);
}
var getTemplateForFile = (templateInfo, data) => {
  if (templateInfo?.type === "object") {
    return templateInfo.template;
  }
  if (templateInfo?.type === "union") {
    if (hasOwnProperty(data, "_template")) {
      const template = templateInfo.templates.find(
        (t) => lastItem(t.namespace) === data._template
      );
      if (!template) {
        throw new Error(
          `Unable to find template "${data._template}". Possible templates are: ${templateInfo.templates.map((template2) => `"${template2.name}"`).join(", ")}.`
        );
      }
      return template;
    } else {
      return void 0;
    }
  }
  throw new Error(`Unable to determine template`);
};
var loadAndParseWithAliases = async (bridge, filepath, collection, templateInfo) => {
  const dataString = await bridge.get(normalizePath(filepath));
  const data = parseFile(
    dataString,
    path.extname(filepath),
    (yup3) => yup3.object({}),
    {
      frontmatterDelimiters: collection?.frontmatterDelimiters,
      frontmatterFormat: collection?.frontmatterFormat
    }
  );
  const template = getTemplateForFile(templateInfo, data);
  if (!template) {
    console.warn(
      `Document: ${filepath} has an ambiguous template, skipping from indexing. See https://tina.io/docs/errors/ambiguous-template/ for more info.`
    );
    return;
  }
  return templateInfo ? replaceNameOverrides(template, data) : data;
};

// src/database/datalayer.ts
var DEFAULT_COLLECTION_SORT_KEY = "__filepath__";
var REFS_COLLECTIONS_SORT_KEY = "__refs__";
var REFS_REFERENCE_FIELD = "__tina_ref__";
var REFS_PATH_FIELD = "__tina_ref_path__";
var DEFAULT_NUMERIC_LPAD = 4;
var applyPadding = (input, pad) => {
  if (pad) {
    if (Array.isArray(input)) {
      return input.map(
        (val) => String(val).padStart(pad.maxLength, pad.fillString)
      );
    } else {
      return String(input).padStart(pad.maxLength, pad.fillString);
    }
  }
  return input;
};
var getFilterOperator = (expression, operand) => {
  return (expression[operand] || expression[operand] === 0) && operand;
};
var inferOperatorFromFilter = (filterOperator) => {
  switch (filterOperator) {
    case "after":
      return "gt" /* GT */;
    case "before":
      return "lt" /* LT */;
    case "eq":
      return "eq" /* EQ */;
    case "startsWith":
      return "startsWith" /* STARTS_WITH */;
    case "lt":
      return "lt" /* LT */;
    case "lte":
      return "lte" /* LTE */;
    case "gt":
      return "gt" /* GT */;
    case "gte":
      return "gte" /* GTE */;
    case "in":
      return "in" /* IN */;
    default:
      throw new Error(`unsupported filter condition: '${filterOperator}'`);
  }
};
var makeKeyForField = (definition, data, stringEscaper2, maxStringLength = 100) => {
  const valueParts = [];
  for (const field of definition.fields) {
    if (field.name in data && data[field.name] !== void 0 && data[field.name] !== null) {
      const rawValue = data[field.name];
      let resolvedValue;
      if (field.type === "datetime") {
        resolvedValue = String(new Date(rawValue).getTime());
      } else {
        if (field.type === "string") {
          const escapedString = stringEscaper2(rawValue);
          if (Array.isArray(escapedString)) {
            resolvedValue = escapedString.sort().join(ARRAY_ITEM_VALUE_SEPARATOR);
          } else {
            resolvedValue = escapedString;
          }
        } else {
          resolvedValue = String(rawValue);
        }
      }
      valueParts.push(
        applyPadding(resolvedValue.substring(0, maxStringLength), field.pad)
      );
    } else {
      return null;
    }
  }
  return valueParts.join(INDEX_KEY_FIELD_SEPARATOR);
};
var coerceFilterChainOperands = (filterChain, escapeString = stringEscaper) => {
  const result = [];
  if (filterChain.length) {
    for (const filter of filterChain) {
      const dataType = filter.type;
      if (dataType === "datetime") {
        if (filter.leftOperand !== void 0) {
          result.push({
            ...filter,
            rightOperand: new Date(filter.rightOperand).getTime(),
            leftOperand: new Date(
              filter.leftOperand
            ).getTime()
          });
        } else {
          if (Array.isArray(filter.rightOperand)) {
            result.push({
              ...filter,
              rightOperand: filter.rightOperand.map(
                (operand) => new Date(operand).getTime()
              )
            });
          } else {
            result.push({
              ...filter,
              rightOperand: new Date(filter.rightOperand).getTime()
            });
          }
        }
      } else if (dataType === "string") {
        if (filter.leftOperand !== void 0) {
          result.push({
            ...filter,
            rightOperand: applyPadding(
              escapeString(filter.rightOperand),
              filter.pad
            ),
            leftOperand: applyPadding(
              escapeString(
                filter.leftOperand
              ),
              filter.pad
            )
          });
        } else {
          result.push({
            ...filter,
            rightOperand: applyPadding(
              escapeString(filter.rightOperand),
              filter.pad
            )
          });
        }
      } else {
        result.push({ ...filter });
      }
    }
  }
  return result;
};
function operatorMatchesBinaryFilter(operator, operands, filter) {
  let matches = false;
  switch (operator) {
    case "eq" /* EQ */:
      if (operands.findIndex((operand) => operand === filter.rightOperand) >= 0) {
        matches = true;
      }
      break;
    case "gt" /* GT */:
      for (const operand of operands) {
        if (operand > filter.rightOperand) {
          matches = true;
          break;
        }
      }
      break;
    case "lt" /* LT */:
      for (const operand of operands) {
        if (operand < filter.rightOperand) {
          matches = true;
          break;
        }
      }
      break;
    case "gte" /* GTE */:
      for (const operand of operands) {
        if (operand >= filter.rightOperand) {
          matches = true;
          break;
        }
      }
      break;
    case "lte" /* LTE */:
      for (const operand of operands) {
        if (operand <= filter.rightOperand) {
          matches = true;
          break;
        }
      }
      break;
    case "in" /* IN */:
      for (const operand of operands) {
        if (filter.rightOperand.indexOf(operand) >= 0) {
          matches = true;
          break;
        }
      }
      break;
    case "startsWith" /* STARTS_WITH */:
      for (const operand of operands) {
        if (operand.startsWith(filter.rightOperand)) {
          matches = true;
          break;
        }
      }
      break;
    default:
      throw new Error(`unexpected operator ${operator}`);
  }
  return matches;
}
function operatorMatchesTernaryFilter(operands, rightOperator, rightOperand, leftOperator, leftOperand) {
  let matches = false;
  for (const operand of operands) {
    let rightMatches = false;
    let leftMatches = false;
    if (rightOperator === "lte" /* LTE */ && operand <= rightOperand) {
      rightMatches = true;
    } else if (rightOperator === "lt" /* LT */ && operand < rightOperand) {
      rightMatches = true;
    }
    if (leftOperator === "gte" /* GTE */ && operand >= leftOperand) {
      leftMatches = true;
    } else if (leftOperator === "gt" /* GT */ && operand > leftOperand) {
      leftMatches = true;
    }
    if (rightMatches && leftMatches) {
      matches = true;
      break;
    }
  }
  return matches;
}
var makeFilter = ({
  filterChain
}) => {
  return (values) => {
    for (const filter of filterChain) {
      const dataType = filter.type;
      const isList = filter.list;
      const resolvedValues = JSONPath({
        path: filter.pathExpression,
        json: values
      });
      if (!resolvedValues || !resolvedValues.length) {
        return false;
      }
      let operands;
      if (dataType === "string" || dataType === "reference") {
        operands = resolvedValues;
      } else if (dataType === "number") {
        operands = resolvedValues.map((resolvedValue) => {
          if (isList) {
            return resolvedValue.map((listValue) => Number(listValue));
          }
          return Number(resolvedValue);
        });
      } else if (dataType === "datetime") {
        operands = resolvedValues.map((resolvedValue) => {
          if (isList) {
            return resolvedValue.map((listValue) => {
              const coerced2 = new Date(listValue).getTime();
              return isNaN(coerced2) ? Number(listValue) : coerced2;
            });
          }
          const coerced = new Date(resolvedValue).getTime();
          return isNaN(coerced) ? Number(resolvedValue) : coerced;
        });
      } else if (dataType === "boolean") {
        operands = resolvedValues.map((resolvedValue) => {
          if (isList) {
            return resolvedValue.map((listValue) => {
              return typeof listValue === "boolean" && listValue || listValue === "true" || listValue === "1";
            });
          }
          return typeof resolvedValue === "boolean" && resolvedValue || resolvedValue === "true" || resolvedValue === "1";
        });
      } else {
        throw new Error(`Unexpected datatype ${dataType}`);
      }
      const { operator } = filter;
      let matches = false;
      if (operator) {
        if (isList) {
          for (const operand of operands) {
            if (operatorMatchesBinaryFilter(operator, operand, filter)) {
              matches = true;
              break;
            }
          }
        } else {
          if (operatorMatchesBinaryFilter(operator, operands, filter)) {
            matches = true;
          }
        }
      } else {
        const { rightOperator, leftOperator, rightOperand, leftOperand } = filter;
        if (isList) {
          for (const operand of operands) {
            if (operatorMatchesTernaryFilter(
              operand,
              rightOperator,
              rightOperand,
              leftOperator,
              leftOperand
            )) {
              matches = true;
              break;
            }
          }
        } else {
          if (operatorMatchesTernaryFilter(
            operands,
            rightOperator,
            rightOperand,
            leftOperator,
            leftOperand
          )) {
            matches = true;
          }
        }
      }
      if (!matches) {
        return false;
      }
    }
    return true;
  };
};
var makeFilterChain = ({
  conditions
}) => {
  const filterChain = [];
  if (!conditions) {
    return filterChain;
  }
  for (const condition of conditions) {
    const { filterPath, filterExpression } = condition;
    const { _type, _list, ...keys } = filterExpression;
    const [key1, key2, ...extraKeys] = Object.keys(keys);
    if (extraKeys.length) {
      throw new Error(
        `Unexpected keys: [${extraKeys.join(",")}] in filter expression`
      );
    }
    if (key1 && !key2) {
      filterChain.push({
        list: _list,
        pathExpression: filterPath,
        rightOperand: filterExpression[key1],
        operator: inferOperatorFromFilter(key1),
        type: _type,
        pad: _type === "number" ? { fillString: "0", maxLength: DEFAULT_NUMERIC_LPAD } : void 0
      });
    } else if (key1 && key2) {
      const leftFilterOperator = getFilterOperator(filterExpression, "gt") || getFilterOperator(filterExpression, "gte") || getFilterOperator(filterExpression, "after") || void 0;
      const rightFilterOperator = getFilterOperator(filterExpression, "lt") || getFilterOperator(filterExpression, "lte") || getFilterOperator(filterExpression, "before") || void 0;
      let leftOperand;
      let rightOperand;
      if (rightFilterOperator && leftFilterOperator) {
        if (key1 === leftFilterOperator) {
          leftOperand = filterExpression[key1];
          rightOperand = filterExpression[key2];
        } else {
          rightOperand = filterExpression[key1];
          leftOperand = filterExpression[key2];
        }
        filterChain.push({
          list: _list,
          pathExpression: filterPath,
          rightOperand,
          leftOperand,
          leftOperator: inferOperatorFromFilter(leftFilterOperator),
          rightOperator: inferOperatorFromFilter(rightFilterOperator),
          type: _type,
          pad: _type === "number" ? { fillString: "0", maxLength: DEFAULT_NUMERIC_LPAD } : void 0
        });
      } else {
        throw new Error(
          `Filter on field '${filterPath}' has invalid combination of conditions: '${key1}, ${key2}'`
        );
      }
    }
  }
  return filterChain;
};
var makeFilterSuffixes = (filterChain, index) => {
  if (filterChain && filterChain.length) {
    const indexFields = index.fields.map((field) => field.name);
    const orderedFilterChain = [];
    for (const filter of filterChain) {
      const idx = indexFields.indexOf(filter.pathExpression);
      if (idx === -1) {
        return;
      }
      if (filter.operator && filter.operator === "in" /* IN */) {
        return;
      }
      orderedFilterChain[idx] = filter;
    }
    const baseFragments = [];
    let rightSuffix;
    let leftSuffix;
    let ternaryFilter = false;
    if (orderedFilterChain[filterChain.length - 1] && !orderedFilterChain[filterChain.length - 1].operator) {
      ternaryFilter = true;
    }
    for (let i = 0; i < orderedFilterChain.length; i++) {
      const filter = orderedFilterChain[i];
      if (!filter) {
        return;
      }
      if (Number(i) < indexFields.length - 1) {
        if (!filter.operator) {
          return;
        }
        const binaryFilter = filter;
        if (binaryFilter.operator !== "eq" /* EQ */) {
          return;
        }
        baseFragments.push(
          applyPadding(
            orderedFilterChain[i].rightOperand,
            orderedFilterChain[i].pad
          )
        );
      } else {
        if (ternaryFilter) {
          leftSuffix = applyPadding(
            orderedFilterChain[i].leftOperand,
            orderedFilterChain[i].pad
          );
          rightSuffix = applyPadding(
            orderedFilterChain[i].rightOperand,
            orderedFilterChain[i].pad
          );
        } else {
          const op = orderedFilterChain[i].operator;
          const operand = applyPadding(
            orderedFilterChain[i].rightOperand,
            orderedFilterChain[i].pad
          );
          if (op === "lt" /* LT */ || op === "lte" /* LTE */) {
            rightSuffix = operand;
          } else if (op === "gt" /* GT */ || op === "gte" /* GTE */) {
            leftSuffix = operand;
          } else {
            rightSuffix = operand;
            leftSuffix = operand;
          }
        }
      }
    }
    return {
      left: leftSuffix && [...baseFragments, leftSuffix].join(INDEX_KEY_FIELD_SEPARATOR) || void 0,
      right: rightSuffix && [...baseFragments, rightSuffix].join(INDEX_KEY_FIELD_SEPARATOR) || void 0
    };
  } else {
    return {};
  }
};
var FOLDER_ROOT = "~";
var stripCollectionFromPath = (collectionPath, path7) => {
  const collectionPathParts = collectionPath.split("/");
  const pathParts = path7.split("/");
  const strippedPathParts = pathParts.slice(collectionPathParts.length);
  return strippedPathParts.join("/");
};
var FolderTreeBuilder = class {
  constructor() {
    this._tree = {
      [FOLDER_ROOT]: /* @__PURE__ */ new Set()
    };
  }
  get tree() {
    return this._tree;
  }
  update(documentPath, collectionPath) {
    let folderPath = path2.dirname(normalizePath(documentPath));
    if (folderPath === ".") {
      folderPath = "";
    }
    if (collectionPath) {
      folderPath = stripCollectionFromPath(collectionPath, folderPath);
    }
    const parent = [FOLDER_ROOT];
    folderPath.split("/").filter((part) => part.length).forEach((part) => {
      const current2 = parent.join("/");
      if (!this._tree[current2]) {
        this._tree[current2] = /* @__PURE__ */ new Set();
      }
      this._tree[current2].add(normalizePath(path2.join(current2, part)));
      parent.push(part);
    });
    const current = parent.join("/");
    if (!this._tree[current]) {
      this._tree[current] = /* @__PURE__ */ new Set();
    }
    return current === FOLDER_ROOT ? FOLDER_ROOT : sha.hex(current);
  }
};
var makeFolderOpsForCollection = (folderTree, collection, indexDefinitions, opType, level, escapeStr = stringEscaper) => {
  const result = [];
  const data = {};
  const indexedValues = {};
  for (const [sort, indexDefinition] of Object.entries(indexDefinitions)) {
    for (const field of indexDefinition.fields) {
      data[field.name] = "";
    }
    indexedValues[sort] = makeKeyForField(indexDefinition, data, escapeStr);
  }
  const baseCharacter = "a".charCodeAt(0);
  for (const [folderName, folder] of Object.entries(folderTree)) {
    const parentFolderKey = folderName === FOLDER_ROOT ? FOLDER_ROOT : sha.hex(folderName);
    const folderCollectionSublevel = level.sublevel(
      `${collection.name}_${parentFolderKey}`,
      SUBLEVEL_OPTIONS
    );
    let folderSortingIdx = 0;
    for (const path7 of Array.from(folder).sort()) {
      for (const [sort] of Object.entries(indexDefinitions)) {
        const indexSublevel = folderCollectionSublevel.sublevel(
          sort,
          SUBLEVEL_OPTIONS
        );
        const subFolderKey = sha.hex(path7);
        if (sort === DEFAULT_COLLECTION_SORT_KEY) {
          result.push({
            type: opType,
            key: `${collection.path}/${subFolderKey}.${collection.format}`,
            // replace the root with the collection path
            sublevel: indexSublevel,
            value: {}
          });
        } else {
          const indexValue = `${String.fromCharCode(
            baseCharacter + folderSortingIdx
          )}${indexedValues[sort].substring(1)}`;
          result.push({
            type: opType,
            key: `${indexValue}${INDEX_KEY_FIELD_SEPARATOR}${collection.path}/${subFolderKey}.${collection.format}`,
            sublevel: indexSublevel,
            value: {}
          });
        }
      }
      folderSortingIdx++;
    }
    if (folderName !== FOLDER_ROOT) {
      result.push({
        type: "put",
        key: `${collection.path}/${parentFolderKey}.${collection.format}`,
        value: {
          __collection: collection.name,
          __folderBasename: path2.basename(folderName),
          __folderPath: folderName
        },
        sublevel: level.sublevel(
          CONTENT_ROOT_PREFIX,
          SUBLEVEL_OPTIONS
        )
      });
    }
  }
  return result;
};
var makeIndexOpsForDocument = (filepath, collection, indexDefinitions, data, opType, level, escapeStr = stringEscaper) => {
  const result = [];
  if (collection) {
    const collectionSublevel = level.sublevel(collection, SUBLEVEL_OPTIONS);
    for (const [sort, definition] of Object.entries(indexDefinitions)) {
      const indexedValue = makeKeyForField(definition, data, escapeStr);
      const indexSublevel = collectionSublevel.sublevel(sort, SUBLEVEL_OPTIONS);
      if (sort === DEFAULT_COLLECTION_SORT_KEY) {
        result.push({
          type: opType,
          key: filepath,
          sublevel: indexSublevel,
          value: opType === "put" ? {} : void 0
        });
      } else {
        if (indexedValue) {
          result.push({
            type: opType,
            key: `${indexedValue}${INDEX_KEY_FIELD_SEPARATOR}${filepath}`,
            sublevel: indexSublevel,
            value: opType === "put" ? {} : void 0
          });
        }
      }
    }
  }
  return result;
};
var makeRefOpsForDocument = (filepath, collection, references, data, opType, level) => {
  const result = [];
  if (collection) {
    for (const [c, referencePaths] of Object.entries(references || {})) {
      if (!referencePaths.length) {
        continue;
      }
      const collectionSublevel = level.sublevel(c, SUBLEVEL_OPTIONS);
      const refSublevel = collectionSublevel.sublevel(
        REFS_COLLECTIONS_SORT_KEY,
        SUBLEVEL_OPTIONS
      );
      const references2 = {};
      for (const path7 of referencePaths) {
        const ref = JSONPath({ path: path7, json: data });
        if (!ref) {
          continue;
        }
        if (Array.isArray(ref)) {
          for (const r of ref) {
            if (!r) {
              continue;
            }
            if (references2[r]) {
              references2[r].push(path7);
            } else {
              references2[r] = [path7];
            }
          }
        } else {
          if (references2[ref]) {
            references2[ref].push(path7);
          } else {
            references2[ref] = [path7];
          }
        }
      }
      for (const ref of Object.keys(references2)) {
        for (const path7 of references2[ref]) {
          result.push({
            type: opType,
            key: `${ref}${INDEX_KEY_FIELD_SEPARATOR}${path7}${INDEX_KEY_FIELD_SEPARATOR}${filepath}`,
            sublevel: refSublevel,
            value: opType === "put" ? {} : void 0
          });
        }
      }
    }
  }
  return result;
};
var makeStringEscaper = (regex, replacement) => {
  return (input) => {
    if (Array.isArray(input)) {
      return input.map(
        (val) => val.replace(regex, replacement)
      );
    } else {
      if (typeof input === "string") {
        return input.replace(regex, replacement);
      } else {
        return input;
      }
    }
  };
};
var stringEscaper = makeStringEscaper(
  new RegExp(INDEX_KEY_FIELD_SEPARATOR, "gm"),
  encodeURIComponent(INDEX_KEY_FIELD_SEPARATOR)
);

// src/resolver/index.ts
var createResolver = (args) => {
  return new Resolver(args);
};
var resolveFieldData = async ({ namespace, ...field }, rawData, accumulator, tinaSchema, config, isAudit) => {
  if (!rawData) {
    return void 0;
  }
  assertShape(rawData, (yup3) => yup3.object());
  const value = rawData[field.name];
  switch (field.type) {
    case "datetime":
      if (value instanceof Date) {
        accumulator[field.name] = value.toISOString();
      } else {
        accumulator[field.name] = value;
      }
      break;
    case "string":
    case "boolean":
    case "number":
      accumulator[field.name] = value;
      break;
    case "reference":
      if (value) {
        accumulator[field.name] = value;
      }
      break;
    case "password":
      accumulator[field.name] = {
        value: void 0,
        // never resolve the password hash
        passwordChangeRequired: value["passwordChangeRequired"] ?? false
      };
      break;
    case "image":
      accumulator[field.name] = resolveMediaRelativeToCloud(
        value,
        config,
        tinaSchema.schema
      );
      break;
    case "rich-text":
      const tree = parseMDX(
        value,
        field,
        (value2) => resolveMediaRelativeToCloud(value2, config, tinaSchema.schema)
      );
      if (tree?.children[0]?.type === "invalid_markdown") {
        if (isAudit) {
          const invalidNode = tree?.children[0];
          throw new GraphQLError2(
            `${invalidNode?.message}${invalidNode.position ? ` at line ${invalidNode.position.start.line}, column ${invalidNode.position.start.column}` : ""}`
          );
        }
      }
      accumulator[field.name] = tree;
      break;
    case "object":
      if (field.list) {
        if (!value) {
          return;
        }
        assertShape(
          value,
          (yup3) => yup3.array().of(yup3.object().required())
        );
        accumulator[field.name] = await sequential(value, async (item) => {
          const template = tinaSchema.getTemplateForData({
            data: item,
            collection: {
              namespace,
              ...field
            }
          });
          const payload = {};
          await sequential(template.fields, async (field2) => {
            await resolveFieldData(
              field2,
              item,
              payload,
              tinaSchema,
              config,
              isAudit
            );
          });
          const isUnion = !!field.templates;
          return isUnion ? {
            _template: lastItem(template.namespace),
            ...payload
          } : payload;
        });
      } else {
        if (!value) {
          return;
        }
        const template = tinaSchema.getTemplateForData({
          data: value,
          collection: {
            namespace,
            ...field
          }
        });
        const payload = {};
        await sequential(template.fields, async (field2) => {
          await resolveFieldData(
            field2,
            value,
            payload,
            tinaSchema,
            config,
            isAudit
          );
        });
        const isUnion = !!field.templates;
        accumulator[field.name] = isUnion ? {
          _template: lastItem(template.namespace),
          ...payload
        } : payload;
      }
      break;
    default:
      return field;
  }
  return accumulator;
};
var transformDocumentIntoPayload = async (fullPath, rawData, tinaSchema, config, isAudit, hasReferences) => {
  const collection = tinaSchema.getCollection(rawData._collection);
  try {
    const template = tinaSchema.getTemplateForData({
      data: rawData,
      collection
    });
    const {
      base: basename,
      ext: extension,
      name: filename
    } = path3.parse(fullPath);
    const relativePath = fullPath.replace(/\\/g, "/").replace(collection.path, "").replace(/^\/|\/$/g, "");
    const breadcrumbs = relativePath.replace(extension, "").split("/");
    const data = {
      _collection: rawData._collection,
      _template: rawData._template
    };
    try {
      await sequential(template.fields, async (field) => {
        return resolveFieldData(
          field,
          rawData,
          data,
          tinaSchema,
          config,
          isAudit
        );
      });
    } catch (e) {
      throw new TinaParseDocumentError({
        originalError: e,
        collection: collection.name,
        includeAuditMessage: !isAudit,
        file: relativePath,
        stack: e.stack
      });
    }
    const titleField = template.fields.find((x) => {
      if (x.type === "string" && x?.isTitle) {
        return true;
      }
    });
    const titleFieldName = titleField?.name;
    const title = data[titleFieldName || " "] || null;
    return {
      __typename: collection.fields ? NAMER.documentTypeName(collection.namespace) : NAMER.documentTypeName(template.namespace),
      id: fullPath,
      ...data,
      _sys: {
        title: title || "",
        basename,
        filename,
        extension,
        hasReferences,
        path: fullPath,
        relativePath,
        breadcrumbs,
        collection,
        template: lastItem(template.namespace)
      },
      _values: data,
      _rawData: rawData
    };
  } catch (e) {
    if (e instanceof TinaGraphQLError) {
      throw new TinaGraphQLError(e.message, {
        requestedDocument: fullPath,
        ...e.extensions
      });
    }
    throw e;
  }
};
var updateObjectWithJsonPath = (obj, path7, oldValue, newValue) => {
  let updated = false;
  if (!path7.includes(".") && !path7.includes("[")) {
    if (path7 in obj && obj[path7] === oldValue) {
      obj[path7] = newValue;
      updated = true;
    }
    return { object: obj, updated };
  }
  const parentPath = path7.replace(/\.[^.\[\]]+$/, "");
  const keyToUpdate = path7.match(/[^.\[\]]+$/)[0];
  const parents = JSONPath2({
    path: parentPath,
    json: obj,
    resultType: "value"
  });
  if (parents.length > 0) {
    parents.forEach((parent) => {
      if (parent && typeof parent === "object" && keyToUpdate in parent) {
        if (parent[keyToUpdate] === oldValue) {
          parent[keyToUpdate] = newValue;
          updated = true;
        }
      }
    });
  }
  return { object: obj, updated };
};
var Resolver = class {
  constructor(init) {
    this.init = init;
    this.resolveCollection = async (args, collectionName, hasDocuments) => {
      const collection = this.tinaSchema.getCollection(collectionName);
      const extraFields = {};
      return {
        // return the collection and hasDocuments to resolve documents at a lower level
        documents: { collection, hasDocuments },
        ...collection,
        ...extraFields
      };
    };
    this.getRaw = async (fullPath) => {
      if (typeof fullPath !== "string") {
        throw new Error(
          `fullPath must be of type string for getDocument request`
        );
      }
      return this.database.get(fullPath);
    };
    this.getDocumentOrDirectory = async (fullPath) => {
      if (typeof fullPath !== "string") {
        throw new Error(
          `fullPath must be of type string for getDocumentOrDirectory request`
        );
      }
      const rawData = await this.getRaw(fullPath);
      if (rawData["__folderBasename"]) {
        return {
          __typename: "Folder",
          name: rawData["__folderBasename"],
          path: rawData["__folderPath"]
        };
      } else {
        return transformDocumentIntoPayload(
          fullPath,
          rawData,
          this.tinaSchema,
          this.config,
          this.isAudit
        );
      }
    };
    this.getDocument = async (fullPath, opts = {}) => {
      if (typeof fullPath !== "string") {
        throw new Error(
          `fullPath must be of type string for getDocument request`
        );
      }
      const rawData = await this.getRaw(fullPath);
      const hasReferences = opts?.checkReferences ? await this.hasReferences(fullPath, opts.collection) : void 0;
      return transformDocumentIntoPayload(
        fullPath,
        rawData,
        this.tinaSchema,
        this.config,
        this.isAudit,
        hasReferences
      );
    };
    this.deleteDocument = async (fullPath) => {
      if (typeof fullPath !== "string") {
        throw new Error(
          `fullPath must be of type string for getDocument request`
        );
      }
      await this.database.delete(fullPath);
    };
    this.buildObjectMutations = async (fieldValue, field, existingData) => {
      if (field.fields) {
        const objectTemplate = field;
        if (Array.isArray(fieldValue)) {
          const idField = objectTemplate.fields.find((field2) => field2.uid);
          if (idField) {
            const ids = fieldValue.map((d) => d[idField.name]);
            const duplicateIds = ids.filter(
              (id, index) => ids.indexOf(id) !== index
            );
            if (duplicateIds.length > 0) {
              throw new Error(
                `Duplicate ids found in array for field marked as identifier: ${idField.name}`
              );
            }
          }
          return Promise.all(
            fieldValue.map(
              async (item) => {
                return this.buildFieldMutations(
                  item,
                  objectTemplate,
                  idField && existingData && existingData?.find(
                    (d) => d[idField.name] === item[idField.name]
                  )
                );
              }
            )
          );
        } else {
          return this.buildFieldMutations(
            // @ts-ignore FIXME Argument of type 'string | object' is not assignable to parameter of type '{ [fieldName: string]: string | object | (string | object)[]; }'
            fieldValue,
            //@ts-ignore
            objectTemplate,
            existingData
          );
        }
      }
      if (field.templates) {
        if (Array.isArray(fieldValue)) {
          return Promise.all(
            fieldValue.map(async (item) => {
              if (typeof item === "string") {
                throw new Error(
                  //@ts-ignore
                  `Expected object for template value for field ${field.name}`
                );
              }
              const templates = field.templates.map((templateOrTemplateName) => {
                return templateOrTemplateName;
              });
              const [templateName] = Object.entries(item)[0];
              const template = templates.find(
                //@ts-ignore
                (template2) => template2.name === templateName
              );
              if (!template) {
                throw new Error(`Expected to find template ${templateName}`);
              }
              return {
                // @ts-ignore FIXME Argument of type 'unknown' is not assignable to parameter of type '{ [fieldName: string]: string | { [key: string]: unknown; } | (string | { [key: string]: unknown; })[]; }'
                ...await this.buildFieldMutations(
                  item[template.name],
                  template
                ),
                //@ts-ignore
                _template: template.name
              };
            })
          );
        } else {
          if (typeof fieldValue === "string") {
            throw new Error(
              //@ts-ignore
              `Expected object for template value for field ${field.name}`
            );
          }
          const templates = field.templates.map((templateOrTemplateName) => {
            return templateOrTemplateName;
          });
          const [templateName] = Object.entries(fieldValue)[0];
          const template = templates.find(
            //@ts-ignore
            (template2) => template2.name === templateName
          );
          if (!template) {
            throw new Error(`Expected to find template ${templateName}`);
          }
          return {
            // @ts-ignore FIXME Argument of type 'unknown' is not assignable to parameter of type '{ [fieldName: string]: string | { [key: string]: unknown; } | (string | { [key: string]: unknown; })[]; }'
            ...await this.buildFieldMutations(
              fieldValue[template.name],
              template
            ),
            //@ts-ignore
            _template: template.name
          };
        }
      }
    };
    this.createResolveDocument = async ({
      collection,
      realPath,
      args,
      isAddPendingDocument
    }) => {
      if (isAddPendingDocument === true) {
        const templateInfo = this.tinaSchema.getTemplatesForCollectable(collection);
        switch (templateInfo.type) {
          case "object":
            await this.database.addPendingDocument(realPath, {});
            break;
          case "union":
            const templateString = args.template;
            const template = templateInfo.templates.find(
              (template2) => lastItem(template2.namespace) === templateString
            );
            if (!args.template) {
              throw new Error(
                `Must specify a template when creating content for a collection with multiple templates. Possible templates are: ${templateInfo.templates.map((t) => lastItem(t.namespace)).join(" ")}`
              );
            }
            if (!template) {
              throw new Error(
                `Expected to find template named ${templateString} in collection "${collection.name}" but none was found. Possible templates are: ${templateInfo.templates.map((t) => lastItem(t.namespace)).join(" ")}`
              );
            }
            await this.database.addPendingDocument(realPath, {
              _template: lastItem(template.namespace)
            });
        }
        return this.getDocument(realPath);
      }
      const params = await this.buildObjectMutations(
        // @ts-ignore
        args.params[collection.name],
        collection
      );
      await this.database.put(realPath, params, collection.name);
      return this.getDocument(realPath);
    };
    this.updateResolveDocument = async ({
      collection,
      realPath,
      args,
      isAddPendingDocument,
      isCollectionSpecific
    }) => {
      const doc = await this.getDocument(realPath);
      const oldDoc = this.resolveLegacyValues(doc?._rawData || {}, collection);
      if (isAddPendingDocument === true) {
        const templateInfo = this.tinaSchema.getTemplatesForCollectable(collection);
        const params2 = this.buildParams(args);
        switch (templateInfo.type) {
          case "object":
            if (params2) {
              const values = await this.buildFieldMutations(
                params2,
                templateInfo.template,
                doc?._rawData
              );
              await this.database.put(
                realPath,
                { ...oldDoc, ...values },
                collection.name
              );
            }
            break;
          case "union":
            await sequential(templateInfo.templates, async (template) => {
              const templateParams = params2[lastItem(template.namespace)];
              if (templateParams) {
                if (typeof templateParams === "string") {
                  throw new Error(
                    `Expected to find an object for template params, but got string`
                  );
                }
                const values = {
                  ...oldDoc,
                  ...await this.buildFieldMutations(
                    // @ts-ignore FIXME: failing on unknown, which we don't need to know because it's recursive
                    templateParams,
                    template,
                    doc?._rawData
                  ),
                  _template: lastItem(template.namespace)
                };
                await this.database.put(realPath, values, collection.name);
              }
            });
        }
        return this.getDocument(realPath);
      }
      const params = await this.buildObjectMutations(
        //@ts-ignore
        isCollectionSpecific ? args.params : args.params[collection.name],
        collection,
        doc?._rawData
      );
      await this.database.put(
        realPath,
        { ...oldDoc, ...params },
        collection.name
      );
      return this.getDocument(realPath);
    };
    /**
     * Returns top-level fields which are not defined in the collection, so their
     * values are not eliminated from Tina when new values are saved
     */
    this.resolveLegacyValues = (oldDoc, collection) => {
      const legacyValues = {};
      Object.entries(oldDoc).forEach(([key, value]) => {
        const reservedKeys = [
          "$_body",
          "_collection",
          "_keepTemplateKey",
          "_template",
          "_relativePath",
          "_id"
        ];
        if (reservedKeys.includes(key)) {
          return;
        }
        if (oldDoc._template && collection.templates) {
          const template = collection.templates?.find(
            ({ name }) => name === oldDoc._template
          );
          if (template) {
            if (!template.fields.find(({ name }) => name === key)) {
              legacyValues[key] = value;
            }
          }
        }
        if (oldDoc._collection && collection.fields) {
          if (!collection.fields.find(({ name }) => name === key)) {
            legacyValues[key] = value;
          }
        }
      });
      return legacyValues;
    };
    this.resolveDocument = async ({
      args,
      collection: collectionName,
      isMutation,
      isCreation,
      isDeletion,
      isFolderCreation,
      isAddPendingDocument,
      isCollectionSpecific,
      isUpdateName
    }) => {
      let collectionLookup = collectionName || void 0;
      if (!collectionLookup && isCollectionSpecific === false) {
        collectionLookup = Object.keys(args.params)[0];
      }
      const collectionNames = this.tinaSchema.getCollections().map((item) => item.name);
      assertShape(
        collectionLookup,
        (yup3) => {
          return yup3.mixed().oneOf(collectionNames);
        },
        `"collection" must be one of: [${collectionNames.join(
          ", "
        )}] but got ${collectionLookup}`
      );
      assertShape(
        args,
        (yup3) => yup3.object({ relativePath: yup3.string().required() })
      );
      const collection = await this.tinaSchema.getCollection(collectionLookup);
      let realPath = path3.join(collection?.path, args.relativePath);
      if (isFolderCreation) {
        realPath = `${realPath}/.gitkeep.${collection.format || "md"}`;
      }
      const alreadyExists = await this.database.documentExists(realPath);
      if (isMutation) {
        if (isCreation) {
          if (alreadyExists === true) {
            throw new Error(`Unable to add document, ${realPath} already exists`);
          }
          return this.createResolveDocument({
            collection,
            realPath,
            args,
            isAddPendingDocument
          });
        } else if (isFolderCreation) {
          if (alreadyExists === true) {
            throw new Error(`Unable to add folder, ${realPath} already exists`);
          }
          await this.database.put(
            realPath,
            { _is_tina_folder_placeholder: true },
            collection.name
          );
          return this.getDocument(realPath);
        }
        if (!alreadyExists) {
          if (isDeletion) {
            throw new Error(
              `Unable to delete document, ${realPath} does not exist`
            );
          }
          if (isUpdateName) {
            throw new Error(
              `Unable to update document, ${realPath} does not exist`
            );
          }
        }
        if (isDeletion) {
          const doc = await this.getDocument(realPath);
          await this.deleteDocument(realPath);
          if (await this.hasReferences(realPath, collection)) {
            const collRefs = await this.findReferences(realPath, collection);
            for (const [collection2, docsWithRefs] of Object.entries(collRefs)) {
              for (const [pathToDocWithRef, referencePaths] of Object.entries(
                docsWithRefs
              )) {
                let refDoc = await this.getRaw(pathToDocWithRef);
                let hasUpdate = false;
                for (const path7 of referencePaths) {
                  const { object: object2, updated } = updateObjectWithJsonPath(
                    refDoc,
                    path7,
                    realPath,
                    null
                  );
                  refDoc = object2;
                  hasUpdate = updated || hasUpdate;
                }
                if (hasUpdate) {
                  const collectionWithRef = this.tinaSchema.getCollectionByFullPath(pathToDocWithRef);
                  if (!collectionWithRef) {
                    throw new Error(
                      `Unable to find collection for ${pathToDocWithRef}`
                    );
                  }
                  await this.database.put(
                    pathToDocWithRef,
                    refDoc,
                    collectionWithRef.name
                  );
                }
              }
            }
          }
          return doc;
        }
        if (isUpdateName) {
          assertShape(
            args,
            (yup3) => yup3.object({ params: yup3.object().required() })
          );
          assertShape(
            args?.params,
            (yup3) => yup3.object({ relativePath: yup3.string().required() })
          );
          const doc = await this.getDocument(realPath);
          const newRealPath = path3.join(
            collection?.path,
            args.params.relativePath
          );
          if (newRealPath === realPath) {
            return doc;
          }
          await this.database.put(newRealPath, doc._rawData, collection.name);
          await this.deleteDocument(realPath);
          const collRefs = await this.findReferences(realPath, collection);
          for (const [collection2, docsWithRefs] of Object.entries(collRefs)) {
            for (const [pathToDocWithRef, referencePaths] of Object.entries(
              docsWithRefs
            )) {
              let docWithRef = await this.getRaw(pathToDocWithRef);
              let hasUpdate = false;
              for (const path7 of referencePaths) {
                const { object: object2, updated } = updateObjectWithJsonPath(
                  docWithRef,
                  path7,
                  realPath,
                  newRealPath
                );
                docWithRef = object2;
                hasUpdate = updated || hasUpdate;
              }
              if (hasUpdate) {
                const collectionWithRef = this.tinaSchema.getCollectionByFullPath(pathToDocWithRef);
                if (!collectionWithRef) {
                  throw new Error(
                    `Unable to find collection for ${pathToDocWithRef}`
                  );
                }
                await this.database.put(
                  pathToDocWithRef,
                  docWithRef,
                  collectionWithRef.name
                );
              }
            }
          }
          return this.getDocument(newRealPath);
        }
        if (alreadyExists === false) {
          throw new Error(
            `Unable to update document, ${realPath} does not exist`
          );
        }
        return this.updateResolveDocument({
          collection,
          realPath,
          args,
          isAddPendingDocument,
          isCollectionSpecific
        });
      } else {
        return this.getDocument(realPath, {
          collection,
          checkReferences: true
        });
      }
    };
    this.resolveCollectionConnections = async ({ ids }) => {
      return {
        totalCount: ids.length,
        edges: await sequential(ids, async (filepath) => {
          const document = await this.getDocument(filepath);
          return {
            node: document
          };
        })
      };
    };
    this.referenceResolver = async (filter, fieldDefinition) => {
      const referencedCollection = this.tinaSchema.getCollection(
        fieldDefinition.collections[0]
      );
      if (!referencedCollection) {
        throw new Error(
          `Unable to find collection for ${fieldDefinition.collections[0]} querying ${fieldDefinition.name}`
        );
      }
      const sortKeys = Object.keys(
        filter[fieldDefinition.name][referencedCollection.name]
      );
      const resolvedCollectionConnection = await this.resolveCollectionConnection(
        {
          args: {
            sort: sortKeys.length === 1 ? sortKeys[0] : void 0,
            filter: {
              ...filter[fieldDefinition.name][referencedCollection.name]
            },
            first: -1
          },
          collection: referencedCollection,
          hydrator: (path7) => path7
          // just return the path
        }
      );
      const { edges } = resolvedCollectionConnection;
      const values = edges.map((edge) => edge.node);
      return { edges, values };
    };
    this.resolveCollectionConnection = async ({
      args,
      collection,
      hydrator
    }) => {
      let conditions;
      if (args.filter) {
        if (collection.fields) {
          conditions = await this.resolveFilterConditions(
            args.filter,
            collection.fields,
            collection.name
          );
        } else if (collection.templates) {
          for (const templateName of Object.keys(args.filter)) {
            const template = collection.templates.find(
              (template2) => template2.name === templateName
            );
            if (template) {
              conditions = await this.resolveFilterConditions(
                args.filter[templateName],
                template.fields,
                `${collection.name}.${templateName}`
              );
            } else {
              throw new Error(
                `Error template not found: ${templateName} in collection ${collection.name}`
              );
            }
          }
        }
      }
      const queryOptions = {
        filterChain: makeFilterChain({
          conditions: conditions || []
        }),
        collection: collection.name,
        sort: args.sort,
        first: args.first,
        last: args.last,
        before: args.before,
        after: args.after,
        folder: args.folder
      };
      const result = await this.database.query(
        queryOptions,
        hydrator ? hydrator : this.getDocumentOrDirectory
      );
      const edges = result.edges;
      const pageInfo = result.pageInfo;
      return {
        totalCount: edges.length,
        edges,
        pageInfo: pageInfo || {
          hasPreviousPage: false,
          hasNextPage: false,
          startCursor: "",
          endCursor: ""
        }
      };
    };
    /**
     * Checks if a document has references to it
     * @param id  The id of the document to check for references
     * @param c The collection to check for references
     * @returns true if the document has references, false otherwise
     */
    this.hasReferences = async (id, c) => {
      let count = 0;
      await this.database.query(
        {
          collection: c.name,
          filterChain: makeFilterChain({
            conditions: [
              {
                filterPath: REFS_REFERENCE_FIELD,
                filterExpression: {
                  _type: "string",
                  _list: false,
                  eq: id
                }
              }
            ]
          }),
          sort: REFS_COLLECTIONS_SORT_KEY
        },
        (refId) => {
          count++;
          return refId;
        }
      );
      if (count) {
        return true;
      }
      return false;
    };
    /**
     * Finds references to a document
     * @param id the id of the document to find references to
     * @param c the collection to find references in
     * @returns a map of references to the document
     */
    this.findReferences = async (id, c) => {
      const references = {};
      await this.database.query(
        {
          collection: c.name,
          filterChain: makeFilterChain({
            conditions: [
              {
                filterPath: REFS_REFERENCE_FIELD,
                filterExpression: {
                  _type: "string",
                  _list: false,
                  eq: id
                }
              }
            ]
          }),
          sort: REFS_COLLECTIONS_SORT_KEY
        },
        (refId, rawItem) => {
          if (!references[c.name]) {
            references[c.name] = {};
          }
          if (!references[c.name][refId]) {
            references[c.name][refId] = [];
          }
          const referencePath = rawItem?.[REFS_PATH_FIELD];
          if (referencePath) {
            references[c.name][refId].push(referencePath);
          }
          return refId;
        }
      );
      return references;
    };
    this.buildFieldMutations = async (fieldParams, template, existingData) => {
      const accum = {};
      for (const passwordField of template.fields.filter(
        (f) => f.type === "password"
      )) {
        if (!fieldParams[passwordField.name]["value"]) {
          fieldParams[passwordField.name] = {
            ...fieldParams[passwordField.name],
            value: ""
          };
        }
      }
      for (const [fieldName, fieldValue] of Object.entries(fieldParams)) {
        if (Array.isArray(fieldValue)) {
          if (fieldValue.length === 0) {
            accum[fieldName] = [];
            continue;
          }
        }
        const field = template.fields.find((field2) => field2.name === fieldName);
        if (!field) {
          throw new Error(`Expected to find field by name ${fieldName}`);
        }
        switch (field.type) {
          case "datetime":
            accum[fieldName] = resolveDateInput(fieldValue, field);
            break;
          case "string":
          case "boolean":
          case "number":
            accum[fieldName] = fieldValue;
            break;
          case "image":
            accum[fieldName] = resolveMediaCloudToRelative(
              fieldValue,
              this.config,
              this.tinaSchema.schema
            );
            break;
          case "object":
            accum[fieldName] = await this.buildObjectMutations(
              fieldValue,
              field,
              existingData?.[fieldName]
            );
            break;
          case "password":
            if (typeof fieldValue !== "object") {
              throw new Error(
                `Expected to find object for password field ${fieldName}. Found ${typeof accum[fieldName]}`
              );
            }
            if (fieldValue["value"]) {
              accum[fieldName] = {
                ...fieldValue,
                value: await generatePasswordHash({
                  password: fieldValue["value"]
                })
              };
            } else {
              accum[fieldName] = {
                ...fieldValue,
                value: existingData?.[fieldName]?.["value"]
              };
            }
            break;
          case "rich-text":
            accum[fieldName] = stringifyMDX(
              fieldValue,
              field,
              (fieldValue2) => resolveMediaCloudToRelative(
                fieldValue2,
                this.config,
                this.tinaSchema.schema
              )
            );
            break;
          case "reference":
            accum[fieldName] = fieldValue;
            break;
          default:
            throw new Error(`No mutation builder for field type ${field.type}`);
        }
      }
      return accum;
    };
    /**
     * A mutation looks nearly identical between updateDocument:
     * ```graphql
     * updateDocument(collection: $collection,relativePath: $path, params: {
     *   post: {
     *     title: "Hello, World"
     *   }
     * })`
     * ```
     * and `updatePostDocument`:
     * ```graphql
     * updatePostDocument(relativePath: $path, params: {
     *   title: "Hello, World"
     * })
     * ```
     * The problem here is that we don't know whether the payload came from `updateDocument`
     * or `updatePostDocument` (we could, but for now it's easier not to pipe those details through),
     * But we do know that when given a `args.collection` value, we can assume that
     * this was a `updateDocument` request, and thus - should grab the data
     * from the corresponding field name in the key
     */
    this.buildParams = (args) => {
      try {
        assertShape(
          args,
          (yup3) => yup3.object({
            collection: yup3.string().required(),
            params: yup3.object().required()
          })
        );
        return args.params[args.collection];
      } catch (e) {
      }
      assertShape(
        args,
        (yup3) => yup3.object({
          params: yup3.object().required()
        })
      );
      return args.params;
    };
    this.config = init.config;
    this.database = init.database;
    this.tinaSchema = init.tinaSchema;
    this.isAudit = init.isAudit;
  }
  async resolveFilterConditions(filter, fields, collectionName) {
    const conditions = [];
    const conditionCollector = (condition) => {
      if (!condition.filterPath) {
        throw new Error("Error parsing filter - unable to generate filterPath");
      }
      if (!condition.filterExpression) {
        throw new Error(
          `Error parsing filter - missing expression for ${condition.filterPath}`
        );
      }
      conditions.push(condition);
    };
    await resolveReferences(filter, fields, this.referenceResolver);
    for (const fieldName of Object.keys(filter)) {
      const field = fields.find(
        (field2) => field2.name === fieldName
      );
      if (!field) {
        throw new Error(
          `${fieldName} not found in collection ${collectionName}`
        );
      }
      collectConditionsForField(
        fieldName,
        field,
        filter[fieldName],
        "",
        conditionCollector
      );
    }
    return conditions;
  }
};
var resolveDateInput = (value) => {
  const date = new Date(value);
  if (!isValid(date)) {
    throw "Invalid Date";
  }
  return date;
};

// src/resolve.ts
import set from "lodash.set";

// src/error.ts
import { GraphQLError as GraphQLError3 } from "graphql";
var NotFoundError = class extends GraphQLError3 {
  constructor(message, nodes, source, positions, path7, originalError, extensions) {
    super(message, nodes, source, positions, path7, originalError, extensions);
    this.name = "NotFoundError";
  }
};

// src/resolve.ts
var resolve = async ({
  config,
  query,
  variables,
  database,
  silenceErrors,
  verbose,
  isAudit,
  ctxUser
}) => {
  try {
    const verboseValue = verbose ?? true;
    const graphQLSchemaAst = await database.getGraphQLSchema();
    if (!graphQLSchemaAst) {
      throw new GraphQLError4("GraphQL schema not found");
    }
    const graphQLSchema = buildASTSchema(graphQLSchemaAst);
    const tinaConfig = await database.getTinaSchema();
    const tinaSchema = await createSchema({
      // TODO: please update all the types to import from @tinacms/schema-tools
      // @ts-ignore
      schema: tinaConfig,
      // @ts-ignore
      flags: tinaConfig?.meta?.flags
    });
    const resolver = createResolver({
      config,
      database,
      tinaSchema,
      isAudit: isAudit || false
    });
    const res = await graphql({
      schema: graphQLSchema,
      source: query,
      variableValues: variables,
      contextValue: {
        database
      },
      typeResolver: async (source, _args, info) => {
        if (source.__typename) return source.__typename;
        const namedType = getNamedType(info.returnType).toString();
        const lookup = await database.getLookup(namedType);
        if (lookup.resolveType === "unionData") {
          return lookup.typeMap[source._template];
        }
        throw new Error(`Unable to find lookup key for ${namedType}`);
      },
      fieldResolver: async (source = {}, _args = {}, _context, info) => {
        try {
          const args = JSON.parse(JSON.stringify(_args));
          const returnType = getNamedType(info.returnType).toString();
          const lookup = await database.getLookup(returnType);
          const isMutation = info.parentType.toString() === "Mutation";
          const value = source[info.fieldName];
          if (returnType === "Collection") {
            if (value) {
              return value;
            }
            if (info.fieldName === "collections") {
              const collectionNode2 = info.fieldNodes.find(
                (x) => x.name.value === "collections"
              );
              const hasDocuments2 = collectionNode2.selectionSet.selections.find(
                (x) => {
                  return x?.name?.value === "documents";
                }
              );
              return tinaSchema.getCollections().map((collection) => {
                return resolver.resolveCollection(
                  args,
                  collection.name,
                  Boolean(hasDocuments2)
                );
              });
            }
            const collectionNode = info.fieldNodes.find(
              (x) => x.name.value === "collection"
            );
            const hasDocuments = collectionNode.selectionSet.selections.find(
              (x) => {
                return x?.name?.value === "documents";
              }
            );
            return resolver.resolveCollection(
              args,
              args.collection,
              Boolean(hasDocuments)
            );
          }
          if (info.fieldName === "getOptimizedQuery") {
            try {
              return args.queryString;
            } catch (e) {
              throw new Error(
                `Invalid query provided, Error message: ${e.message}`
              );
            }
          }
          if (info.fieldName === "authenticate" || info.fieldName === "authorize") {
            const sub = args.sub || ctxUser?.sub;
            const collection = tinaSchema.getCollections().find((c) => c.isAuthCollection);
            if (!collection) {
              throw new Error("Auth collection not found");
            }
            const userFields = mapUserFields(collection, ["_rawData"]);
            if (!userFields.length) {
              throw new Error(
                `No user field found in collection ${collection.name}`
              );
            }
            if (userFields.length > 1) {
              throw new Error(
                `Multiple user fields found in collection ${collection.name}`
              );
            }
            const userField = userFields[0];
            const realPath = `${collection.path}/index.json`;
            const userDoc = await resolver.getDocument(realPath);
            const users = get(userDoc, userField.path);
            if (!users) {
              throw new Error("No users found");
            }
            const { idFieldName, passwordFieldName } = userField;
            if (!idFieldName) {
              throw new Error("No uid field found on user field");
            }
            const user = users.find((u) => u[idFieldName] === sub);
            if (!user) {
              return null;
            }
            if (info.fieldName === "authenticate") {
              const saltedHash = get(user, [passwordFieldName || "", "value"]);
              if (!saltedHash) {
                throw new Error("No password field found on user field");
              }
              const matches = await checkPasswordHash({
                saltedHash,
                password: args.password
              });
              if (matches) {
                return user;
              }
              return null;
            }
            return user;
          }
          if (info.fieldName === "updatePassword") {
            if (!ctxUser?.sub) {
              throw new Error("Not authorized");
            }
            if (!args.password) {
              throw new Error("No password provided");
            }
            const collection = tinaSchema.getCollections().find((c) => c.isAuthCollection);
            if (!collection) {
              throw new Error("Auth collection not found");
            }
            const userFields = mapUserFields(collection, ["_rawData"]);
            if (!userFields.length) {
              throw new Error(
                `No user field found in collection ${collection.name}`
              );
            }
            if (userFields.length > 1) {
              throw new Error(
                `Multiple user fields found in collection ${collection.name}`
              );
            }
            const userField = userFields[0];
            const realPath = `${collection.path}/index.json`;
            const userDoc = await resolver.getDocument(realPath);
            const users = get(userDoc, userField.path);
            if (!users) {
              throw new Error("No users found");
            }
            const { idFieldName, passwordFieldName } = userField;
            const user = users.find((u) => u[idFieldName] === ctxUser.sub);
            if (!user) {
              throw new Error("Not authorized");
            }
            user[passwordFieldName] = {
              value: args.password,
              passwordChangeRequired: false
            };
            const params = {};
            set(
              params,
              userField.path.slice(1),
              // remove _rawData from users path
              users.map((u) => {
                if (user[idFieldName] === u[idFieldName]) {
                  return user;
                }
                return {
                  // don't overwrite other users' passwords
                  ...u,
                  [passwordFieldName]: {
                    ...u[passwordFieldName],
                    value: ""
                  }
                };
              })
            );
            await resolver.updateResolveDocument({
              collection,
              args: { params },
              realPath,
              isCollectionSpecific: true,
              isAddPendingDocument: false
            });
            return true;
          }
          if (!lookup) {
            return value;
          }
          const isCreation = lookup[info.fieldName] === "create";
          switch (lookup.resolveType) {
            /**
             * `node(id: $id)`
             */
            case "nodeDocument":
              assertShape(
                args,
                (yup3) => yup3.object({ id: yup3.string().required() })
              );
              return resolver.getDocument(args.id);
            case "multiCollectionDocument":
              if (typeof value === "string" && value !== "") {
                return resolver.getDocument(value);
              }
              if (args?.collection && info.fieldName === "addPendingDocument") {
                return resolver.resolveDocument({
                  args: { ...args, params: {} },
                  collection: args.collection,
                  isMutation,
                  isCreation: true,
                  isAddPendingDocument: true
                });
              }
              if ([
                NAMER.documentQueryName(),
                "createDocument",
                "updateDocument",
                "deleteDocument",
                "createFolder"
              ].includes(info.fieldName)) {
                const result = await resolver.resolveDocument({
                  args,
                  collection: args.collection,
                  isMutation,
                  isCreation,
                  // Right now this is the only case for deletion
                  isDeletion: info.fieldName === "deleteDocument",
                  isFolderCreation: info.fieldName === "createFolder",
                  isUpdateName: Boolean(args?.params?.relativePath),
                  isAddPendingDocument: false,
                  isCollectionSpecific: false
                });
                return result;
              }
              return value;
            /**
             * eg `getMovieDocument.data.actors`
             */
            case "multiCollectionDocumentList":
              if (Array.isArray(value)) {
                return {
                  totalCount: value.length,
                  edges: value.map((document) => {
                    return { node: document };
                  })
                };
              }
              if (info.fieldName === "documents" && value?.collection && value?.hasDocuments) {
                let filter = args.filter;
                if (
                  // 1. Make sure that the filter exists
                  typeof args?.filter !== "undefined" && args?.filter !== null && // 2. Make sure that the collection name exists
                  // @ts-ignore
                  typeof value?.collection?.name === "string" && // 3. Make sure that the collection name is in the filter and is not undefined
                  // @ts-ignore
                  Object.keys(args.filter).includes(value?.collection?.name) && // @ts-ignore
                  typeof args.filter[value?.collection?.name] !== "undefined"
                ) {
                  filter = args.filter[value.collection.name];
                }
                return resolver.resolveCollectionConnection({
                  args: {
                    ...args,
                    filter
                  },
                  // @ts-ignore
                  collection: value.collection
                });
              }
              throw new Error(
                `Expected an array for result of ${info.fieldName} at ${info.path}`
              );
            /**
             * Collections-specific getter
             * eg. `getPostDocument`/`createPostDocument`/`updatePostDocument`
             *
             * if coming from a query result
             * the field will be `node`
             */
            case "collectionDocument": {
              if (value) {
                return value;
              }
              const result = value || await resolver.resolveDocument({
                args,
                collection: lookup.collection,
                isMutation,
                isCreation,
                isAddPendingDocument: false,
                isCollectionSpecific: true
              });
              return result;
            }
            /**
             * Collections-specific list getter
             * eg. `getPageList`
             */
            case "collectionDocumentList":
              return resolver.resolveCollectionConnection({
                args,
                collection: tinaSchema.getCollection(lookup.collection)
              });
            /**
             * A polymorphic data set, it can be from a document's data
             * of any nested object which can be one of many shapes
             *
             * ```graphql
             * getPostDocument(relativePath: $relativePath) {
             *   data {...} <- this part
             * }
             * ```
             * ```graphql
             * getBlockDocument(relativePath: $relativePath) {
             *   data {
             *     blocks {...} <- or this part
             *   }
             * }
             * ```
             */
            case "unionData":
              if (!value) {
                if (args.relativePath) {
                  const result = await resolver.resolveDocument({
                    args,
                    collection: lookup.collection,
                    isMutation,
                    isCreation,
                    isAddPendingDocument: false,
                    isCollectionSpecific: true
                  });
                  return result;
                }
              }
              return value;
            default:
              console.error(lookup);
              throw new Error("Unexpected resolve type");
          }
        } catch (e) {
          handleFetchErrorError(e, verboseValue);
        }
      }
    });
    if (res.errors) {
      if (!silenceErrors) {
        res.errors.map((e) => {
          if (e instanceof NotFoundError) {
          } else {
            console.error(e.toString());
            if (verboseValue) {
              console.error("More error context below");
              console.error(e.message);
              console.error(e);
            }
          }
        });
      }
    }
    return res;
  } catch (e) {
    if (!silenceErrors) {
      console.error(e);
    }
    if (e instanceof GraphQLError4) {
      return {
        errors: [e]
      };
    }
    throw e;
  }
};

// src/level/tinaLevel.ts
import { ManyLevelGuest } from "many-level";
import { pipeline } from "readable-stream";
import { connect } from "net";
var TinaLevelClient = class extends ManyLevelGuest {
  constructor(port) {
    super();
    this._connected = false;
    this.port = port || 9e3;
  }
  openConnection() {
    if (this._connected) return;
    const socket = connect(this.port);
    pipeline(socket, this.createRpcStream(), socket, () => {
      this._connected = false;
    });
    this._connected = true;
  }
};

// src/database/index.ts
import path4 from "node:path";
import { GraphQLError as GraphQLError5 } from "graphql";
import micromatch2 from "micromatch";
import sha2 from "js-sha1";
import set2 from "lodash.set";
var createLocalDatabase = (config) => {
  const level = new TinaLevelClient(config?.port);
  level.openConnection();
  const fsBridge = new FilesystemBridge(config?.rootPath || process.cwd());
  return new Database({
    bridge: fsBridge,
    ...config || {},
    level
  });
};
var createDatabase = (config) => {
  if (config.onPut && config.onDelete) {
    console.warn(
      "onPut and onDelete are deprecated. Please use gitProvider.onPut and gitProvider.onDelete instead."
    );
  }
  if (config.level) {
    console.warn("level is deprecated. Please use databaseAdapter instead.");
  }
  if (config.onPut && config.onDelete && config.level && !config.databaseAdapter && !config.gitProvider) {
    return new Database({
      ...config,
      level: config.level
    });
  }
  if (!config.gitProvider) {
    throw new Error(
      "createDatabase requires a gitProvider. Please provide a gitProvider."
    );
  }
  if (!config.databaseAdapter) {
    throw new Error(
      "createDatabase requires a databaseAdapter. Please provide a databaseAdapter."
    );
  }
  return new Database({
    ...config,
    bridge: config.bridge,
    level: config.databaseAdapter,
    onPut: config.gitProvider.onPut.bind(config.gitProvider),
    onDelete: config.gitProvider.onDelete.bind(config.gitProvider),
    namespace: config.namespace || "tinacms"
  });
};
var createDatabaseInternal = (config) => {
  return new Database({
    ...config,
    bridge: config.bridge,
    level: config.level
  });
};
var SYSTEM_FILES = ["_schema", "_graphql", "_lookup"];
var defaultStatusCallback = () => Promise.resolve();
var defaultOnPut = () => Promise.resolve();
var defaultOnDelete = () => Promise.resolve();
var Database = class {
  constructor(config) {
    this.config = config;
    this.collectionForPath = async (filepath) => {
      const tinaSchema = await this.getSchema(this.contentLevel);
      try {
        return tinaSchema.getCollectionByFullPath(filepath);
      } catch (e) {
      }
    };
    this.getGeneratedFolder = () => path4.join(this.tinaDirectory, "__generated__");
    this.getMetadata = async (key) => {
      await this.initLevel();
      let metadataLevel = this.rootLevel.sublevel("_metadata", SUBLEVEL_OPTIONS);
      if (this.contentNamespace) {
        metadataLevel = metadataLevel.sublevel(
          this.contentNamespace,
          SUBLEVEL_OPTIONS
        );
      }
      const metadata = await metadataLevel.get(`metadata_${key}`);
      return metadata?.value;
    };
    this.setMetadata = async (key, value) => {
      await this.initLevel();
      let metadataLevel = this.rootLevel.sublevel("_metadata", SUBLEVEL_OPTIONS);
      if (this.contentNamespace) {
        metadataLevel = metadataLevel.sublevel(
          this.contentNamespace,
          SUBLEVEL_OPTIONS
        );
      }
      return metadataLevel.put(`metadata_${key}`, { value });
    };
    this.get = async (filepath) => {
      await this.initLevel();
      if (SYSTEM_FILES.includes(filepath)) {
        throw new Error(`Unexpected get for config file ${filepath}`);
      } else {
        let collection;
        let level = this.contentLevel;
        if (this.appLevel) {
          collection = await this.collectionForPath(filepath);
          if (collection?.isDetached) {
            level = this.appLevel.sublevel(collection.name, SUBLEVEL_OPTIONS);
          }
        }
        const contentObject = await level.sublevel(
          CONTENT_ROOT_PREFIX,
          SUBLEVEL_OPTIONS
        ).get(normalizePath(filepath));
        if (!contentObject) {
          throw new NotFoundError(`Unable to find record ${filepath}`);
        }
        return transformDocument(
          filepath,
          contentObject,
          await this.getSchema(this.contentLevel)
        );
      }
    };
    this.addPendingDocument = async (filepath, data) => {
      await this.initLevel();
      const dataFields = await this.formatBodyOnPayload(filepath, data);
      const collection = await this.collectionForPath(filepath);
      if (!collection) {
        throw new GraphQLError5(`Unable to find collection for ${filepath}`);
      }
      const stringifiedFile = await this.stringifyFile(
        filepath,
        dataFields,
        collection
      );
      const indexDefinitions = await this.getIndexDefinitions(this.contentLevel);
      const collectionIndexDefinitions = indexDefinitions?.[collection.name];
      const collectionReferences = (await this.getCollectionReferences())?.[collection.name];
      const normalizedPath = normalizePath(filepath);
      if (!collection?.isDetached) {
        if (this.bridge) {
          await this.bridge.put(normalizedPath, stringifiedFile);
        }
        try {
          await this.onPut(normalizedPath, stringifiedFile);
        } catch (e) {
          throw new GraphQLError5(
            `Error running onPut hook for ${filepath}: ${e}`,
            null,
            null,
            null,
            null,
            e
          );
        }
      }
      let level = this.contentLevel;
      if (collection?.isDetached) {
        level = this.appLevel.sublevel(collection.name, SUBLEVEL_OPTIONS);
      }
      const folderTreeBuilder = new FolderTreeBuilder();
      const folderKey = folderTreeBuilder.update(filepath, collection.path || "");
      let putOps = [];
      let delOps = [];
      if (!isGitKeep(normalizedPath, collection)) {
        putOps = [
          ...makeRefOpsForDocument(
            normalizedPath,
            collection?.name,
            collectionReferences,
            dataFields,
            "put",
            level
          ),
          ...makeIndexOpsForDocument(
            normalizedPath,
            collection?.name,
            collectionIndexDefinitions,
            dataFields,
            "put",
            level
          ),
          // folder indices
          ...makeIndexOpsForDocument(
            normalizedPath,
            `${collection?.name}_${folderKey}`,
            collectionIndexDefinitions,
            dataFields,
            "put",
            level
          )
        ];
        const existingItem = await level.sublevel(
          CONTENT_ROOT_PREFIX,
          SUBLEVEL_OPTIONS
        ).get(normalizedPath);
        delOps = existingItem ? [
          ...makeRefOpsForDocument(
            normalizedPath,
            collection?.name,
            collectionReferences,
            existingItem,
            "del",
            level
          ),
          ...makeIndexOpsForDocument(
            normalizedPath,
            collection?.name,
            collectionIndexDefinitions,
            existingItem,
            "del",
            level
          ),
          // folder indices
          ...makeIndexOpsForDocument(
            normalizedPath,
            `${collection?.name}_${folderKey}`,
            collectionIndexDefinitions,
            existingItem,
            "del",
            level
          )
        ] : [];
      }
      const ops = [
        ...delOps,
        ...putOps,
        {
          type: "put",
          key: normalizedPath,
          value: dataFields,
          sublevel: level.sublevel(
            CONTENT_ROOT_PREFIX,
            SUBLEVEL_OPTIONS
          )
        }
      ];
      await level.batch(ops);
    };
    this.put = async (filepath, data, collectionName) => {
      await this.initLevel();
      try {
        if (SYSTEM_FILES.includes(filepath)) {
          throw new Error(`Unexpected put for config file ${filepath}`);
        } else {
          let collectionIndexDefinitions;
          if (collectionName) {
            const indexDefinitions = await this.getIndexDefinitions(
              this.contentLevel
            );
            collectionIndexDefinitions = indexDefinitions?.[collectionName];
          }
          const collectionReferences = (await this.getCollectionReferences())?.[collectionName];
          const normalizedPath = normalizePath(filepath);
          const dataFields = await this.formatBodyOnPayload(filepath, data);
          const collection = await this.collectionForPath(filepath);
          if (!collection) {
            throw new GraphQLError5(`Unable to find collection for ${filepath}.`);
          }
          if (collection.match?.exclude || collection.match?.include) {
            const matches = this.tinaSchema.getMatches({ collection });
            const match = micromatch2.isMatch(filepath, matches);
            if (!match) {
              throw new GraphQLError5(
                `File ${filepath} does not match collection ${collection.name} glob ${matches.join(
                  ","
                )}. Please change the filename or update matches for ${collection.name} in your config file.`
              );
            }
          }
          const stringifiedFile = filepath.endsWith(
            `.gitkeep.${collection.format || "md"}`
          ) ? "" : await this.stringifyFile(filepath, dataFields, collection);
          if (!collection?.isDetached) {
            if (this.bridge) {
              await this.bridge.put(normalizedPath, stringifiedFile);
            }
            try {
              await this.onPut(normalizedPath, stringifiedFile);
            } catch (e) {
              throw new GraphQLError5(
                `Error running onPut hook for ${filepath}: ${e}`,
                null,
                null,
                null,
                null,
                e
              );
            }
          }
          const folderTreeBuilder = new FolderTreeBuilder();
          const folderKey = folderTreeBuilder.update(
            filepath,
            collection.path || ""
          );
          const level = collection?.isDetached ? this.appLevel.sublevel(collection?.name, SUBLEVEL_OPTIONS) : this.contentLevel;
          let putOps = [];
          let delOps = [];
          if (!isGitKeep(normalizedPath, collection)) {
            putOps = [
              ...makeRefOpsForDocument(
                normalizedPath,
                collectionName,
                collectionReferences,
                dataFields,
                "put",
                level
              ),
              ...makeIndexOpsForDocument(
                normalizedPath,
                collectionName,
                collectionIndexDefinitions,
                dataFields,
                "put",
                level
              ),
              // folder indices
              ...makeIndexOpsForDocument(
                normalizedPath,
                `${collection?.name}_${folderKey}`,
                collectionIndexDefinitions,
                dataFields,
                "put",
                level
              )
            ];
            const existingItem = await level.sublevel(
              CONTENT_ROOT_PREFIX,
              SUBLEVEL_OPTIONS
            ).get(normalizedPath);
            delOps = existingItem ? [
              ...makeRefOpsForDocument(
                normalizedPath,
                collectionName,
                collectionReferences,
                existingItem,
                "del",
                level
              ),
              ...makeIndexOpsForDocument(
                normalizedPath,
                collectionName,
                collectionIndexDefinitions,
                existingItem,
                "del",
                level
              ),
              // folder indices
              ...makeIndexOpsForDocument(
                normalizedPath,
                `${collection?.name}_${folderKey}`,
                collectionIndexDefinitions,
                existingItem,
                "del",
                level
              )
            ] : [];
          }
          const ops = [
            ...delOps,
            ...putOps,
            {
              type: "put",
              key: normalizedPath,
              value: dataFields,
              sublevel: level.sublevel(
                CONTENT_ROOT_PREFIX,
                SUBLEVEL_OPTIONS
              )
            }
          ];
          await level.batch(ops);
        }
        return true;
      } catch (error) {
        if (error instanceof GraphQLError5) {
          throw error;
        }
        throw new TinaFetchError(`Error in PUT for ${filepath}`, {
          originalError: error,
          file: filepath,
          collection: collectionName,
          stack: error.stack
        });
      }
    };
    this.formatBodyOnPayload = async (filepath, data) => {
      const collection = await this.collectionForPath(filepath);
      if (!collection) {
        throw new Error(`Unable to find collection for path ${filepath}`);
      }
      const { template } = await this.getTemplateDetailsForFile(collection, data);
      const bodyField = template.fields.find((field) => {
        if (field.type === "string" || field.type === "rich-text") {
          if (field.isBody) {
            return true;
          }
        }
        return false;
      });
      let payload = {};
      if (["md", "mdx"].includes(collection.format) && bodyField) {
        Object.entries(data).forEach(([key, value]) => {
          if (key !== bodyField.name) {
            payload[key] = value;
          }
        });
        payload["$_body"] = data[bodyField.name];
      } else {
        payload = data;
      }
      return payload;
    };
    this.stringifyFile = async (filepath, payload, collection) => {
      const templateDetails = await this.getTemplateDetailsForFile(
        collection,
        payload
      );
      const writeTemplateKey = templateDetails.info.type === "union";
      const aliasedData = applyNameOverrides(templateDetails.template, payload);
      const extension = path4.extname(filepath);
      return stringifyFile(
        aliasedData,
        extension,
        writeTemplateKey,
        //templateInfo.type === 'union',
        {
          frontmatterFormat: collection?.frontmatterFormat,
          frontmatterDelimiters: collection?.frontmatterDelimiters
        }
      );
    };
    this.flush = async (filepath) => {
      const data = await this.get(filepath);
      const dataFields = await this.formatBodyOnPayload(filepath, data);
      const collection = await this.collectionForPath(filepath);
      if (!collection) {
        throw new Error(`Unable to find collection for path ${filepath}`);
      }
      return this.stringifyFile(filepath, dataFields, collection);
    };
    this.getLookup = async (returnType) => {
      await this.initLevel();
      const lookupPath = normalizePath(
        path4.join(this.getGeneratedFolder(), `_lookup.json`)
      );
      if (!this._lookup) {
        this._lookup = await this.contentLevel.sublevel(
          CONTENT_ROOT_PREFIX,
          SUBLEVEL_OPTIONS
        ).get(lookupPath);
      }
      return returnType ? this._lookup[returnType] : this._lookup;
    };
    this.getGraphQLSchema = async () => {
      await this.initLevel();
      const graphqlPath = normalizePath(
        path4.join(this.getGeneratedFolder(), `_graphql.json`)
      );
      return await this.contentLevel.sublevel(
        CONTENT_ROOT_PREFIX,
        SUBLEVEL_OPTIONS
      ).get(graphqlPath);
    };
    //TODO - is there a reason why the database fetches some config with "bridge.get", and some with "store.get"?
    this.getGraphQLSchemaFromBridge = async () => {
      if (!this.bridge) {
        throw new Error(`No bridge configured`);
      }
      const graphqlPath = normalizePath(
        path4.join(this.getGeneratedFolder(), `_graphql.json`)
      );
      const _graphql = await this.bridge.get(graphqlPath);
      return JSON.parse(_graphql);
    };
    this.getTinaSchema = async (level) => {
      await this.initLevel();
      const schemaPath = normalizePath(
        path4.join(this.getGeneratedFolder(), `_schema.json`)
      );
      return await (level || this.contentLevel).sublevel(
        CONTENT_ROOT_PREFIX,
        SUBLEVEL_OPTIONS
      ).get(schemaPath);
    };
    this.getSchema = async (level, existingSchema) => {
      if (this.tinaSchema) {
        return this.tinaSchema;
      }
      await this.initLevel();
      const schema = existingSchema || await this.getTinaSchema(level || this.contentLevel);
      if (!schema) {
        throw new Error(
          `Unable to get schema from level db: ${normalizePath(
            path4.join(this.getGeneratedFolder(), `_schema.json`)
          )}`
        );
      }
      this.tinaSchema = await createSchema({ schema });
      return this.tinaSchema;
    };
    this.getCollectionReferences = async (level) => {
      if (this.collectionReferences) {
        return this.collectionReferences;
      }
      const result = {};
      const schema = await this.getSchema(level || this.contentLevel);
      const collections = schema.getCollections();
      for (const collection of collections) {
        const collectionReferences = this.tinaSchema.findReferencesFromCollection(
          collection.name
        );
        result[collection.name] = collectionReferences;
      }
      this.collectionReferences = result;
      return result;
    };
    this.getIndexDefinitions = async (level) => {
      if (!this.collectionIndexDefinitions) {
        await new Promise(async (resolve2, reject) => {
          await this.initLevel();
          try {
            const schema = await this.getSchema(level || this.contentLevel);
            const collections = schema.getCollections();
            for (const collection of collections) {
              const indexDefinitions = {
                [DEFAULT_COLLECTION_SORT_KEY]: { fields: [] },
                // provide a default sort key which is the file sort
                // pseudo-index for the collection's references
                [REFS_COLLECTIONS_SORT_KEY]: {
                  fields: [
                    {
                      name: REFS_REFERENCE_FIELD,
                      type: "string",
                      list: false
                    },
                    {
                      name: REFS_PATH_FIELD,
                      type: "string",
                      list: false
                    }
                  ]
                }
              };
              let fields = [];
              if (collection.templates) {
                const templateFieldMap = {};
                const conflictedFields = /* @__PURE__ */ new Set();
                for (const template of collection.templates) {
                  for (const field of template.fields) {
                    if (!templateFieldMap[field.name]) {
                      templateFieldMap[field.name] = field;
                    } else {
                      if (templateFieldMap[field.name].type !== field.type) {
                        console.warn(
                          `Field ${field.name} has conflicting types in templates - skipping index`
                        );
                        conflictedFields.add(field.name);
                      }
                    }
                  }
                }
                for (const conflictedField in conflictedFields) {
                  delete templateFieldMap[conflictedField];
                }
                for (const field of Object.values(templateFieldMap)) {
                  fields.push(field);
                }
              } else if (collection.fields) {
                fields = collection.fields;
              }
              if (fields) {
                for (const field of fields) {
                  if (field.indexed !== void 0 && field.indexed === false || field.type === "object") {
                    continue;
                  }
                  indexDefinitions[field.name] = {
                    fields: [
                      {
                        name: field.name,
                        type: field.type,
                        list: !!field.list,
                        pad: field.type === "number" ? { fillString: "0", maxLength: DEFAULT_NUMERIC_LPAD } : void 0
                      }
                    ]
                  };
                }
              }
              if (collection.indexes) {
                for (const index of collection.indexes) {
                  indexDefinitions[index.name] = {
                    fields: index.fields.map((indexField) => {
                      const field = collection.fields.find(
                        (field2) => indexField.name === field2.name
                      );
                      return {
                        name: indexField.name,
                        type: field?.type,
                        list: !!field?.list
                      };
                    })
                  };
                }
              }
              this.collectionIndexDefinitions = this.collectionIndexDefinitions || {};
              this.collectionIndexDefinitions[collection.name] = indexDefinitions;
            }
            resolve2();
          } catch (err) {
            reject(err);
          }
        });
      }
      return this.collectionIndexDefinitions;
    };
    this.documentExists = async (fullpath) => {
      try {
        await this.get(fullpath);
      } catch (e) {
        return false;
      }
      return true;
    };
    this.query = async (queryOptions, hydrator) => {
      await this.initLevel();
      const {
        first,
        after,
        last,
        before,
        sort = DEFAULT_COLLECTION_SORT_KEY,
        filterChain: rawFilterChain,
        folder
      } = queryOptions;
      let limit = 50;
      if (first) {
        limit = first;
      } else if (last) {
        limit = last;
      }
      const query = { reverse: !!last };
      if (after) {
        query.gt = atob(after);
      } else if (before) {
        query.lt = atob(before);
      }
      const tinaSchema = await this.getSchema(this.contentLevel);
      const collection = tinaSchema.getCollection(queryOptions.collection);
      const allIndexDefinitions = await this.getIndexDefinitions(
        this.contentLevel
      );
      const indexDefinitions = allIndexDefinitions?.[collection.name];
      if (!indexDefinitions) {
        throw new Error(`No indexDefinitions for collection ${collection.name}`);
      }
      const filterChain = coerceFilterChainOperands(rawFilterChain);
      const indexDefinition = sort && indexDefinitions?.[sort];
      const filterSuffixes = indexDefinition && makeFilterSuffixes(filterChain, indexDefinition);
      const level = collection?.isDetached ? this.appLevel.sublevel(collection?.name, SUBLEVEL_OPTIONS) : this.contentLevel;
      const rootLevel = level.sublevel(
        CONTENT_ROOT_PREFIX,
        SUBLEVEL_OPTIONS
      );
      const sublevel = indexDefinition ? level.sublevel(
        `${collection.name}${folder ? `_${folder === FOLDER_ROOT ? folder : sha2.hex(folder)}` : ""}`,
        SUBLEVEL_OPTIONS
      ).sublevel(sort, SUBLEVEL_OPTIONS) : rootLevel;
      if (!query.gt && !query.gte) {
        query.gte = filterSuffixes?.left ? filterSuffixes.left : "";
      }
      if (!query.lt && !query.lte) {
        query.lte = filterSuffixes?.right ? `${filterSuffixes.right}\uFFFF` : "\uFFFF";
      }
      let edges = [];
      let startKey = "";
      let endKey = "";
      let hasPreviousPage = false;
      let hasNextPage = false;
      const fieldsPattern = indexDefinition?.fields?.length ? `${indexDefinition.fields.map((p) => `(?<${p.name}>.+)${INDEX_KEY_FIELD_SEPARATOR}`).join("")}` : "";
      const valuesRegex = indexDefinition ? new RegExp(`^${fieldsPattern}(?<_filepath_>.+)`) : new RegExp(`^(?<_filepath_>.+)`);
      const itemFilter = makeFilter({ filterChain });
      const iterator = sublevel.iterator(query);
      for await (const [key, value] of iterator) {
        const matcher = valuesRegex.exec(key);
        if (!matcher || indexDefinition && matcher.length !== indexDefinition.fields.length + 2) {
          continue;
        }
        const filepath = matcher.groups["_filepath_"];
        let itemRecord;
        if (filterSuffixes) {
          itemRecord = matcher.groups;
          for (const field of indexDefinition.fields) {
            if (itemRecord[field.name]) {
              if (field.list) {
                itemRecord[field.name] = itemRecord[field.name].split(
                  ARRAY_ITEM_VALUE_SEPARATOR
                );
              }
            }
          }
        } else {
          if (indexDefinition) {
            itemRecord = await rootLevel.get(filepath);
          } else {
            itemRecord = value;
          }
        }
        if (!itemFilter(itemRecord)) {
          continue;
        }
        if (limit !== -1 && edges.length >= limit) {
          if (query.reverse) {
            hasPreviousPage = true;
          } else {
            hasNextPage = true;
          }
          break;
        }
        startKey = startKey || key || "";
        endKey = key || "";
        edges = [...edges, { cursor: key, path: filepath, value: itemRecord }];
      }
      return {
        edges: await sequential(
          edges,
          async ({
            cursor,
            path: path7,
            value
          }) => {
            try {
              const node = await hydrator(path7, value);
              return {
                node,
                cursor: btoa(cursor)
              };
            } catch (error) {
              console.log(error);
              if (error instanceof Error && (!path7.includes(".tina/__generated__/_graphql.json") || !path7.includes("tina/__generated__/_graphql.json"))) {
                throw new TinaQueryError({
                  originalError: error,
                  file: path7,
                  collection: collection.name,
                  stack: error.stack
                });
              }
              throw error;
            }
          }
        ),
        pageInfo: {
          hasPreviousPage,
          hasNextPage,
          startCursor: btoa(startKey),
          endCursor: btoa(endKey)
        }
      };
    };
    this.indexContent = async ({
      graphQLSchema,
      tinaSchema,
      lookup: lookupFromLockFile
    }) => {
      if (!this.bridge) {
        throw new Error("No bridge configured");
      }
      await this.initLevel();
      let nextLevel;
      return await this.indexStatusCallbackWrapper(
        async () => {
          let lookup;
          try {
            lookup = lookupFromLockFile || JSON.parse(
              await this.bridge.get(
                normalizePath(
                  path4.join(this.getGeneratedFolder(), "_lookup.json")
                )
              )
            );
          } catch (error) {
            console.error("Error: Unable to find generated lookup file");
            if (this.tinaDirectory === "tina") {
              console.error(
                'If you are using the .tina folder. Please set {tinaDirectory: ".tina"} in your createDatabase options or migrate to the new tina folder: https://tina.io/blog/tina-config-rearrangements/'
              );
            }
            throw error;
          }
          let nextVersion;
          if (!this.config.version) {
            await this.contentLevel.clear();
            nextLevel = this.contentLevel;
          } else {
            const version = await this.getDatabaseVersion();
            nextVersion = version ? `${parseInt(version) + 1}` : "0";
            nextLevel = this.rootLevel.sublevel(nextVersion, SUBLEVEL_OPTIONS);
          }
          const contentRootLevel = nextLevel.sublevel(CONTENT_ROOT_PREFIX, SUBLEVEL_OPTIONS);
          await contentRootLevel.put(
            normalizePath(path4.join(this.getGeneratedFolder(), "_graphql.json")),
            graphQLSchema
          );
          await contentRootLevel.put(
            normalizePath(path4.join(this.getGeneratedFolder(), "_schema.json")),
            tinaSchema.schema
          );
          await contentRootLevel.put(
            normalizePath(path4.join(this.getGeneratedFolder(), "_lookup.json")),
            lookup
          );
          const result = await this._indexAllContent(
            nextLevel,
            tinaSchema.schema
          );
          if (this.config.version) {
            await this.updateDatabaseVersion(nextVersion);
          }
          return result;
        },
        async () => {
          if (this.config.version) {
            if (this.contentLevel) {
              await this.contentLevel.clear();
            }
            this.contentLevel = nextLevel;
          }
        }
      );
    };
    this.deleteContentByPaths = async (documentPaths) => {
      await this.initLevel();
      const operations = [];
      const enqueueOps = async (ops) => {
        operations.push(...ops);
        while (operations.length >= 25) {
          await this.contentLevel.batch(operations.splice(0, 25));
        }
      };
      const tinaSchema = await this.getSchema(this.contentLevel);
      await this.indexStatusCallbackWrapper(async () => {
        const { pathsByCollection, nonCollectionPaths, collections } = await partitionPathsByCollection(tinaSchema, documentPaths);
        for (const collection of Object.keys(pathsByCollection)) {
          await _deleteIndexContent(
            this,
            pathsByCollection[collection],
            enqueueOps,
            collections[collection]
          );
        }
        if (nonCollectionPaths.length) {
          await _deleteIndexContent(this, nonCollectionPaths, enqueueOps, null);
        }
      });
      while (operations.length) {
        await this.contentLevel.batch(operations.splice(0, 25));
      }
    };
    this.indexContentByPaths = async (documentPaths) => {
      await this.initLevel();
      const operations = [];
      const enqueueOps = async (ops) => {
        operations.push(...ops);
        while (operations.length >= 25) {
          await this.contentLevel.batch(operations.splice(0, 25));
        }
      };
      const tinaSchema = await this.getSchema(this.contentLevel);
      await this.indexStatusCallbackWrapper(async () => {
        await scanContentByPaths(
          tinaSchema,
          documentPaths,
          async (collection, documentPaths2) => {
            if (collection && !collection.isDetached) {
              await _indexContent({
                database: this,
                level: this.contentLevel,
                documentPaths: documentPaths2,
                enqueueOps,
                collection,
                isPartialReindex: true
              });
            }
          }
        );
      });
      while (operations.length) {
        await this.contentLevel.batch(operations.splice(0, 25));
      }
    };
    this.delete = async (filepath) => {
      await this.initLevel();
      const collection = await this.collectionForPath(filepath);
      if (!collection) {
        throw new Error(`No collection found for path: ${filepath}`);
      }
      const indexDefinitions = await this.getIndexDefinitions(this.contentLevel);
      const collectionReferences = (await this.getCollectionReferences())?.[collection.name];
      const collectionIndexDefinitions = indexDefinitions?.[collection.name];
      let level = this.contentLevel;
      if (collection?.isDetached) {
        level = this.appLevel.sublevel(collection?.name, SUBLEVEL_OPTIONS);
      }
      const normalizedPath = normalizePath(filepath);
      const rootSublevel = level.sublevel(
        CONTENT_ROOT_PREFIX,
        SUBLEVEL_OPTIONS
      );
      const item = await rootSublevel.get(normalizedPath);
      if (item) {
        const folderTreeBuilder = new FolderTreeBuilder();
        const folderKey = folderTreeBuilder.update(
          filepath,
          collection.path || ""
        );
        await this.contentLevel.batch([
          ...makeRefOpsForDocument(
            normalizedPath,
            collection.name,
            collectionReferences,
            item,
            "del",
            level
          ),
          ...makeIndexOpsForDocument(
            normalizedPath,
            collection.name,
            collectionIndexDefinitions,
            item,
            "del",
            level
          ),
          // folder indices
          ...makeIndexOpsForDocument(
            normalizedPath,
            `${collection.name}_${folderKey}`,
            collectionIndexDefinitions,
            item,
            "del",
            level
          ),
          {
            type: "del",
            key: normalizedPath,
            sublevel: rootSublevel
          }
        ]);
      }
      if (!collection?.isDetached) {
        if (this.bridge) {
          await this.bridge.delete(normalizedPath);
        }
        try {
          await this.onDelete(normalizedPath);
        } catch (e) {
          throw new GraphQLError5(
            `Error running onDelete hook for ${filepath}: ${e}`,
            null,
            null,
            null,
            null,
            e
          );
        }
      }
    };
    this._indexAllContent = async (level, schema) => {
      const tinaSchema = await this.getSchema(level, schema);
      const operations = [];
      const enqueueOps = async (ops) => {
        operations.push(...ops);
        while (operations.length >= 25) {
          const batchOps = operations.splice(0, 25);
          await level.batch(batchOps);
        }
      };
      const warnings = await scanAllContent(
        tinaSchema,
        this.bridge,
        async (collection, contentPaths) => {
          const userFields = mapUserFields(collection, []);
          if (collection.isDetached) {
            const level2 = this.appLevel.sublevel(
              collection.name,
              SUBLEVEL_OPTIONS
            );
            const doc = await level2.keys({ limit: 1 }).next();
            if (!doc) {
              await _indexContent({
                database: this,
                level: level2,
                documentPaths: contentPaths,
                enqueueOps,
                collection,
                passwordFields: userFields.map((field) => [
                  ...field.path,
                  field.passwordFieldName
                ])
              });
            }
          } else {
            await _indexContent({
              database: this,
              level,
              documentPaths: contentPaths,
              enqueueOps,
              collection
            });
          }
        }
      );
      while (operations.length) {
        await level.batch(operations.splice(0, 25));
      }
      return { warnings };
    };
    this.tinaDirectory = config.tinaDirectory || "tina";
    this.bridge = config.bridge;
    this.rootLevel = config.level && new LevelProxy(config.level);
    this.indexStatusCallback = config.indexStatusCallback || defaultStatusCallback;
    this.onPut = config.onPut || defaultOnPut;
    this.onDelete = config.onDelete || defaultOnDelete;
    this.contentNamespace = config.namespace;
  }
  async updateDatabaseVersion(version) {
    let metadataLevel = this.rootLevel.sublevel("_metadata", SUBLEVEL_OPTIONS);
    if (this.contentNamespace) {
      metadataLevel = metadataLevel.sublevel(
        this.contentNamespace,
        SUBLEVEL_OPTIONS
      );
    }
    await metadataLevel.put("metadata", { version });
  }
  async getDatabaseVersion() {
    let metadataLevel = this.rootLevel.sublevel("_metadata", SUBLEVEL_OPTIONS);
    if (this.contentNamespace) {
      metadataLevel = metadataLevel.sublevel(
        this.contentNamespace,
        SUBLEVEL_OPTIONS
      );
    }
    const metadata = await metadataLevel.get("metadata");
    return metadata?.version;
  }
  async initLevel() {
    if (this.contentLevel) {
      return;
    }
    this.appLevel = this.rootLevel.sublevel("_appData", SUBLEVEL_OPTIONS);
    if (!this.config.version) {
      this.contentLevel = this.contentNamespace ? this.rootLevel.sublevel("_content", SUBLEVEL_OPTIONS).sublevel(this.contentNamespace, SUBLEVEL_OPTIONS) : this.rootLevel.sublevel("_content", SUBLEVEL_OPTIONS);
    } else {
      let version = await this.getDatabaseVersion();
      if (!version) {
        version = "";
        try {
          await this.updateDatabaseVersion(version);
        } catch (e) {
        }
      }
      this.contentLevel = this.contentNamespace ? this.rootLevel.sublevel("_content").sublevel(this.contentNamespace, SUBLEVEL_OPTIONS).sublevel(version, SUBLEVEL_OPTIONS) : this.rootLevel.sublevel(version, SUBLEVEL_OPTIONS);
    }
    if (!this.contentLevel) {
      throw new GraphQLError5("Error initializing LevelDB instance");
    }
  }
  async getTemplateDetailsForFile(collection, data) {
    const tinaSchema = await this.getSchema();
    const templateInfo = await tinaSchema.getTemplatesForCollectable(collection);
    let template;
    if (templateInfo.type === "object") {
      template = templateInfo.template;
    }
    if (templateInfo.type === "union") {
      if (hasOwnProperty(data, "_template")) {
        template = templateInfo.templates.find(
          (t) => lastItem(t.namespace) === data._template
        );
      } else {
        throw new Error(
          `Expected _template to be provided for document in an ambiguous collection`
        );
      }
    }
    if (!template) {
      throw new Error(`Unable to determine template`);
    }
    return {
      template,
      info: templateInfo
    };
  }
  /**
   * Clears the internal cache of the tinaSchema and the lookup file. This allows the state to be reset
   */
  clearCache() {
    this.tinaSchema = null;
    this._lookup = null;
    this.collectionIndexDefinitions = null;
  }
  async indexStatusCallbackWrapper(fn, post) {
    await this.indexStatusCallback({ status: "inprogress" });
    try {
      const result = await fn();
      await this.indexStatusCallback({ status: "complete" });
      if (post) {
        await post();
      }
      return result;
    } catch (error) {
      await this.indexStatusCallback({ status: "failed", error });
      throw error;
    }
  }
};
var hashPasswordVisitor = async (node, path7) => {
  const passwordValuePath = [...path7, "value"];
  const plaintextPassword = get(node, passwordValuePath);
  if (plaintextPassword) {
    set2(
      node,
      passwordValuePath,
      await generatePasswordHash({ password: plaintextPassword })
    );
  }
};
var visitNodes = async (node, path7, callback) => {
  const [currentLevel, ...remainingLevels] = path7;
  if (!remainingLevels?.length) {
    return callback(node, path7);
  }
  if (Array.isArray(node[currentLevel])) {
    for (const item of node[currentLevel]) {
      await visitNodes(item, remainingLevels, callback);
    }
  } else {
    await visitNodes(node[currentLevel], remainingLevels, callback);
  }
};
var hashPasswordValues = async (data, passwordFields) => Promise.all(
  passwordFields.map(
    async (passwordField) => visitNodes(data, passwordField, hashPasswordVisitor)
  )
);
var isGitKeep = (filepath, collection) => filepath.endsWith(`.gitkeep.${collection?.format || "md"}`);
var _indexContent = async ({
  database,
  level,
  documentPaths,
  enqueueOps,
  collection,
  passwordFields,
  isPartialReindex
}) => {
  let collectionIndexDefinitions;
  let collectionPath;
  if (collection) {
    const indexDefinitions = await database.getIndexDefinitions(level);
    collectionIndexDefinitions = indexDefinitions?.[collection.name];
    if (!collectionIndexDefinitions) {
      throw new Error(`No indexDefinitions for collection ${collection.name}`);
    }
    collectionPath = collection.path;
  }
  const collectionReferences = (await database.getCollectionReferences())?.[collection?.name];
  const tinaSchema = await database.getSchema();
  let templateInfo = null;
  if (collection) {
    templateInfo = tinaSchema.getTemplatesForCollectable(collection);
  }
  const folderTreeBuilder = new FolderTreeBuilder();
  await sequential(documentPaths, async (filepath) => {
    try {
      const aliasedData = await loadAndParseWithAliases(
        database.bridge,
        filepath,
        collection,
        templateInfo
      );
      if (!aliasedData) {
        return;
      }
      if (passwordFields?.length) {
        await hashPasswordValues(aliasedData, passwordFields);
      }
      const normalizedPath = normalizePath(filepath);
      const rootSublevel = level.sublevel(
        CONTENT_ROOT_PREFIX,
        SUBLEVEL_OPTIONS
      );
      const folderKey = folderTreeBuilder.update(
        normalizedPath,
        collectionPath || ""
      );
      if (isPartialReindex) {
        const item = await rootSublevel.get(normalizedPath);
        if (item) {
          await database.contentLevel.batch([
            ...makeRefOpsForDocument(
              normalizedPath,
              collection?.name,
              collectionReferences,
              item,
              "del",
              level
            ),
            ...makeIndexOpsForDocument(
              normalizedPath,
              collection.name,
              collectionIndexDefinitions,
              item,
              "del",
              level
            ),
            // folder indices
            ...makeIndexOpsForDocument(
              normalizedPath,
              `${collection.name}_${folderKey}`,
              collectionIndexDefinitions,
              item,
              "del",
              level
            ),
            {
              type: "del",
              key: normalizedPath,
              sublevel: rootSublevel
            }
          ]);
        }
      }
      if (!isGitKeep(filepath, collection)) {
        await enqueueOps([
          ...makeRefOpsForDocument(
            normalizedPath,
            collection?.name,
            collectionReferences,
            aliasedData,
            "put",
            level
          ),
          ...makeIndexOpsForDocument(
            normalizedPath,
            collection?.name,
            collectionIndexDefinitions,
            aliasedData,
            "put",
            level
          ),
          // folder indexes
          ...makeIndexOpsForDocument(
            normalizedPath,
            `${collection?.name}_${folderKey}`,
            collectionIndexDefinitions,
            aliasedData,
            "put",
            level
          ),
          {
            type: "put",
            key: normalizedPath,
            value: aliasedData,
            sublevel: level.sublevel(
              CONTENT_ROOT_PREFIX,
              SUBLEVEL_OPTIONS
            )
          }
        ]);
      }
    } catch (error) {
      throw new TinaFetchError(`Unable to seed ${filepath}`, {
        originalError: error,
        file: filepath,
        collection: collection?.name,
        stack: error.stack
      });
    }
  });
  if (collection) {
    await enqueueOps(
      makeFolderOpsForCollection(
        folderTreeBuilder.tree,
        collection,
        collectionIndexDefinitions,
        "put",
        level
      )
    );
  }
};
var _deleteIndexContent = async (database, documentPaths, enqueueOps, collection) => {
  if (!documentPaths.length) {
    return;
  }
  let collectionIndexDefinitions;
  if (collection) {
    const indexDefinitions = await database.getIndexDefinitions(
      database.contentLevel
    );
    collectionIndexDefinitions = indexDefinitions?.[collection.name];
    if (!collectionIndexDefinitions) {
      throw new Error(`No indexDefinitions for collection ${collection.name}`);
    }
  }
  const collectionReferences = (await database.getCollectionReferences())?.[collection?.name];
  const tinaSchema = await database.getSchema();
  let templateInfo = null;
  if (collection) {
    templateInfo = tinaSchema.getTemplatesForCollectable(collection);
  }
  const rootLevel = database.contentLevel.sublevel(
    CONTENT_ROOT_PREFIX,
    SUBLEVEL_OPTIONS
  );
  const folderTreeBuilder = new FolderTreeBuilder();
  await sequential(documentPaths, async (filepath) => {
    const itemKey = normalizePath(filepath);
    const item = await rootLevel.get(itemKey);
    if (item) {
      const folderKey = folderTreeBuilder.update(
        itemKey,
        collection?.path || ""
      );
      const aliasedData = templateInfo ? replaceNameOverrides(
        getTemplateForFile(templateInfo, item),
        item
      ) : item;
      await enqueueOps([
        ...makeRefOpsForDocument(
          itemKey,
          collection?.name,
          collectionReferences,
          aliasedData,
          "del",
          database.contentLevel
        ),
        ...makeIndexOpsForDocument(
          itemKey,
          collection.name,
          collectionIndexDefinitions,
          aliasedData,
          "del",
          database.contentLevel
        ),
        // folder indexes
        ...makeIndexOpsForDocument(
          itemKey,
          `${collection?.name}_${folderKey}`,
          collectionIndexDefinitions,
          aliasedData,
          "del",
          database.contentLevel
        ),
        { type: "del", key: itemKey, sublevel: rootLevel }
      ]);
    }
  });
  if (collectionIndexDefinitions) {
    await enqueueOps(
      makeFolderOpsForCollection(
        folderTreeBuilder.tree,
        collection,
        collectionIndexDefinitions,
        "del",
        database.contentLevel
      )
    );
  }
};

// src/git/index.ts
import git from "isomorphic-git";
import fs from "fs-extra";
import path5 from "path";
import micromatch3 from "micromatch";
var findGitRoot = async (dir) => {
  if (await fs.pathExists(path5.join(dir, ".git"))) {
    return dir;
  }
  const parentDir = path5.dirname(dir);
  if (parentDir === dir) {
    throw new Error("Could not find .git directory");
  }
  return findGitRoot(parentDir);
};
var getSha = async ({
  fs: fs4,
  dir
}) => {
  dir = await findGitRoot(dir);
  return git.resolveRef({
    fs: fs4,
    dir,
    ref: "HEAD"
  });
};
var getChangedFiles = async ({
  fs: fs4,
  dir,
  from,
  to,
  pathFilter
}) => {
  const results = {
    added: [],
    modified: [],
    deleted: []
  };
  const rootDir = await findGitRoot(dir);
  let pathPrefix = "";
  if (rootDir !== dir) {
    pathPrefix = normalizePath(dir.substring(rootDir.length + 1));
  }
  await git.walk({
    fs: fs4,
    dir: rootDir,
    trees: [git.TREE({ ref: from }), git.TREE({ ref: to })],
    map: async function(filename, [A, B]) {
      const relativePath = normalizePath(filename).substring(pathPrefix.length);
      let matches = false;
      for (const [key, matcher] of Object.entries(pathFilter)) {
        if (relativePath.startsWith(key)) {
          if (!matcher.matches) {
            matches = true;
          } else {
            if (micromatch3.isMatch(relativePath, matcher.matches)) {
              matches = true;
              break;
            }
          }
        }
      }
      if (await B?.type() === "tree") {
        return;
      }
      if (matches) {
        const oidA = await A?.oid();
        const oidB = await B?.oid();
        if (oidA !== oidB) {
          if (oidA === void 0) {
            results.added.push(relativePath);
          } else if (oidB === void 0) {
            results.deleted.push(relativePath);
          } else {
            results.modified.push(relativePath);
          }
        }
      }
    }
  });
  return results;
};
var shaExists = async ({
  fs: fs4,
  dir,
  sha: sha3
}) => git.readCommit({ fs: fs4, dir, oid: sha3 }).then(() => true).catch(() => false);

// src/database/bridge/filesystem.ts
import fs2 from "fs-extra";
import fg from "fast-glob";
import path6 from "path";
import normalize from "normalize-path";
var FilesystemBridge = class {
  constructor(rootPath, outputPath) {
    this.rootPath = path6.resolve(rootPath);
    this.outputPath = outputPath ? path6.resolve(outputPath) : this.rootPath;
  }
  async glob(pattern, extension) {
    const basePath = path6.join(this.outputPath, ...pattern.split("/"));
    const items = await fg(
      path6.join(basePath, "**", `/*.${extension}`).replace(/\\/g, "/"),
      {
        dot: true,
        ignore: ["**/node_modules/**"]
      }
    );
    const posixRootPath = normalize(this.outputPath);
    return items.map(
      (item) => item.substring(posixRootPath.length).replace(/^\/|\/$/g, "")
    );
  }
  async delete(filepath) {
    await fs2.remove(path6.join(this.outputPath, filepath));
  }
  async get(filepath) {
    return (await fs2.readFile(path6.join(this.outputPath, filepath))).toString();
  }
  async put(filepath, data, basePathOverride) {
    const basePath = basePathOverride || this.outputPath;
    await fs2.outputFile(path6.join(basePath, filepath), data);
  }
};
var AuditFileSystemBridge = class extends FilesystemBridge {
  async put(filepath, data) {
    if ([
      ".tina/__generated__/_lookup.json",
      ".tina/__generated__/_schema.json",
      ".tina/__generated__/_graphql.json",
      "tina/__generated__/_lookup.json",
      "tina/__generated__/_schema.json",
      "tina/__generated__/_graphql.json"
    ].includes(filepath)) {
      return super.put(filepath, data);
    }
    return;
  }
};

// src/database/bridge/isomorphic.ts
import git2 from "isomorphic-git";
import fs3 from "fs-extra";
import globParent from "glob-parent";
import normalize2 from "normalize-path";
import { GraphQLError as GraphQLError6 } from "graphql";
import { dirname } from "path";
var flat = typeof Array.prototype.flat === "undefined" ? (entries) => entries.reduce((acc, x) => acc.concat(x), []) : (entries) => entries.flat();
var toUint8Array = (buf) => {
  const ab = new ArrayBuffer(buf.length);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i];
  }
  return view;
};
var IsomorphicBridge = class {
  constructor(rootPath, {
    gitRoot,
    author,
    committer,
    fsModule = fs3,
    commitMessage = "Update from GraphQL client",
    ref,
    onPut,
    onDelete
  }) {
    this.cache = {};
    this.rootPath = rootPath;
    this.gitRoot = gitRoot;
    this.relativePath = rootPath.slice(this.gitRoot.length).replace(/\\/g, "/");
    if (this.relativePath.startsWith("/")) {
      this.relativePath = this.relativePath.slice(1);
    }
    this.fsModule = fsModule;
    this.author = author;
    this.committer = committer || author;
    this.isomorphicConfig = {
      dir: normalize2(this.gitRoot),
      fs: this.fsModule
    };
    this.ref = ref;
    this.commitMessage = commitMessage;
    this.onPut = onPut || (() => {
    });
    this.onDelete = onDelete || (() => {
    });
  }
  getAuthor() {
    return {
      ...this.author,
      timestamp: Math.round((/* @__PURE__ */ new Date()).getTime() / 1e3),
      timezoneOffset: 0
    };
  }
  getCommitter() {
    return {
      ...this.committer,
      timestamp: Math.round((/* @__PURE__ */ new Date()).getTime() / 1e3),
      timezoneOffset: 0
    };
  }
  /**
   * Recursively populate paths matching `pattern` for the given `entry`
   *
   * @param pattern - pattern to filter paths by
   * @param entry - TreeEntry to start building list from
   * @param path - base path
   * @param results
   * @private
   */
  async listEntries({
    pattern,
    entry,
    path: path7,
    results
  }) {
    const treeResult = await git2.readTree({
      ...this.isomorphicConfig,
      oid: entry.oid,
      cache: this.cache
    });
    const children = [];
    for (const childEntry of treeResult.tree) {
      const childPath = path7 ? `${path7}/${childEntry.path}` : childEntry.path;
      if (childEntry.type === "tree") {
        children.push(childEntry);
      } else {
        if (childPath.startsWith(pattern)) {
          results.push(childPath);
        }
      }
    }
    for (const childEntry of children) {
      const childPath = path7 ? `${path7}/${childEntry.path}` : childEntry.path;
      await this.listEntries({
        pattern,
        entry: childEntry,
        path: childPath,
        results
      });
    }
  }
  /**
   * For the specified path, returns an object with an array containing the parts of the path (pathParts)
   * and an array containing the WalkerEntry objects for the path parts (pathEntries). Any null elements in the
   * pathEntries are placeholders for non-existent entries.
   *
   * @param path - path being resolved
   * @param ref - ref to resolve path entries for
   * @private
   */
  async resolvePathEntries(path7, ref) {
    let pathParts = path7.split("/");
    const result = await git2.walk({
      ...this.isomorphicConfig,
      map: async (filepath, [head]) => {
        if (head._fullpath === ".") {
          return head;
        }
        if (path7.startsWith(filepath)) {
          if (dirname(path7) === dirname(filepath)) {
            if (path7 === filepath) {
              return head;
            }
          } else {
            return head;
          }
        }
      },
      cache: this.cache,
      trees: [git2.TREE({ ref })]
    });
    const pathEntries = flat(result);
    if (pathParts.indexOf(".") === -1) {
      pathParts = [".", ...pathParts];
    }
    while (pathParts.length > pathEntries.length) {
      pathEntries.push(null);
    }
    return { pathParts, pathEntries };
  }
  /**
   * Updates tree entry and associated parent tree entries
   *
   * @param existingOid - the existing OID
   * @param updatedOid - the updated OID
   * @param path - the path of the entry being updated
   * @param type - the type of the entry being updated (blob or tree)
   * @param pathEntries - parent path entries
   * @param pathParts - parent path parts
   * @private
   */
  async updateTreeHierarchy(existingOid, updatedOid, path7, type, pathEntries, pathParts) {
    const lastIdx = pathEntries.length - 1;
    const parentEntry = pathEntries[lastIdx];
    const parentPath = pathParts[lastIdx];
    let parentOid;
    let tree;
    const mode = type === "blob" ? "100644" : "040000";
    if (parentEntry) {
      parentOid = await parentEntry.oid();
      const treeResult = await git2.readTree({
        ...this.isomorphicConfig,
        oid: parentOid,
        cache: this.cache
      });
      tree = existingOid ? treeResult.tree.map((entry) => {
        if (entry.path === path7) {
          entry.oid = updatedOid;
        }
        return entry;
      }) : [
        ...treeResult.tree,
        {
          oid: updatedOid,
          type,
          path: path7,
          mode
        }
      ];
    } else {
      tree = [
        {
          oid: updatedOid,
          type,
          path: path7,
          mode
        }
      ];
    }
    const updatedParentOid = await git2.writeTree({
      ...this.isomorphicConfig,
      tree
    });
    if (lastIdx === 0) {
      return updatedParentOid;
    } else {
      return await this.updateTreeHierarchy(
        parentOid,
        updatedParentOid,
        parentPath,
        "tree",
        pathEntries.slice(0, lastIdx),
        pathParts.slice(0, lastIdx)
      );
    }
  }
  /**
   * Creates a commit for the specified tree and updates the specified ref to point to the commit
   *
   * @param treeSha - sha of the new tree
   * @param ref - the ref that should be updated
   * @private
   */
  async commitTree(treeSha, ref) {
    const commitSha = await git2.writeCommit({
      ...this.isomorphicConfig,
      commit: {
        tree: treeSha,
        parent: [
          await git2.resolveRef({
            ...this.isomorphicConfig,
            ref
          })
        ],
        message: this.commitMessage,
        // TODO these should be configurable
        author: this.getAuthor(),
        committer: this.getCommitter()
      }
    });
    await git2.writeRef({
      ...this.isomorphicConfig,
      ref,
      value: commitSha,
      force: true
    });
  }
  async getRef() {
    if (this.ref) {
      return this.ref;
    }
    const ref = await git2.currentBranch({
      ...this.isomorphicConfig,
      fullname: true
    });
    if (!ref) {
      throw new GraphQLError6(
        `Unable to determine current branch from HEAD`,
        null,
        null,
        null,
        null,
        null,
        {}
      );
    }
    this.ref = ref;
    return ref;
  }
  async glob(pattern, extension) {
    const ref = await this.getRef();
    const parent = globParent(this.qualifyPath(pattern));
    const { pathParts, pathEntries } = await this.resolvePathEntries(
      parent,
      ref
    );
    const leafEntry = pathEntries[pathEntries.length - 1];
    const entryPath = pathParts[pathParts.length - 1];
    const parentEntry = pathEntries[pathEntries.length - 2];
    let treeEntry;
    let parentPath;
    if (parentEntry) {
      const treeResult = await git2.readTree({
        ...this.isomorphicConfig,
        oid: await parentEntry.oid(),
        cache: this.cache
      });
      treeEntry = treeResult.tree.find((entry) => entry.path === entryPath);
      parentPath = pathParts.slice(1, pathParts.length).join("/");
    } else {
      treeEntry = {
        type: "tree",
        oid: await leafEntry.oid()
      };
      parentPath = "";
    }
    const results = [];
    await this.listEntries({
      pattern: this.qualifyPath(pattern),
      entry: treeEntry,
      path: parentPath,
      results
    });
    return results.map((path7) => this.unqualifyPath(path7)).filter((path7) => path7.endsWith(extension));
  }
  async delete(filepath) {
    const ref = await this.getRef();
    const { pathParts, pathEntries } = await this.resolvePathEntries(
      this.qualifyPath(filepath),
      ref
    );
    let oidToRemove;
    let ptr = pathEntries.length - 1;
    while (ptr >= 1) {
      const leafEntry = pathEntries[ptr];
      const nodePath = pathParts[ptr];
      if (leafEntry) {
        oidToRemove = oidToRemove || await leafEntry.oid();
        const parentEntry = pathEntries[ptr - 1];
        const existingOid = await parentEntry.oid();
        const treeResult = await git2.readTree({
          ...this.isomorphicConfig,
          oid: existingOid,
          cache: this.cache
        });
        const updatedTree = treeResult.tree.filter(
          (value) => value.path !== nodePath
        );
        if (updatedTree.length === 0) {
          ptr -= 1;
          continue;
        }
        const updatedTreeOid = await git2.writeTree({
          ...this.isomorphicConfig,
          tree: updatedTree
        });
        const updatedRootTreeOid = await this.updateTreeHierarchy(
          existingOid,
          updatedTreeOid,
          pathParts[ptr - 1],
          "tree",
          pathEntries.slice(0, ptr - 1),
          pathParts.slice(0, ptr - 1)
        );
        await this.commitTree(updatedRootTreeOid, ref);
        break;
      } else {
        throw new GraphQLError6(
          `Unable to resolve path: ${filepath}`,
          null,
          null,
          null,
          null,
          null,
          { status: 404 }
        );
      }
    }
    if (oidToRemove) {
      await git2.updateIndex({
        ...this.isomorphicConfig,
        filepath: this.qualifyPath(filepath),
        force: true,
        remove: true,
        oid: oidToRemove,
        cache: this.cache
      });
    }
    await this.onDelete(filepath);
  }
  qualifyPath(filepath) {
    return this.relativePath ? `${this.relativePath}/${filepath}` : filepath;
  }
  unqualifyPath(filepath) {
    return this.relativePath ? filepath.slice(this.relativePath.length + 1) : filepath;
  }
  async get(filepath) {
    const ref = await this.getRef();
    const oid = await git2.resolveRef({
      ...this.isomorphicConfig,
      ref
    });
    const { blob } = await git2.readBlob({
      ...this.isomorphicConfig,
      oid,
      filepath: this.qualifyPath(filepath),
      cache: this.cache
    });
    return Buffer.from(blob).toString("utf8");
  }
  async put(filepath, data) {
    const ref = await this.getRef();
    const { pathParts, pathEntries } = await this.resolvePathEntries(
      this.qualifyPath(filepath),
      ref
    );
    const blobUpdate = toUint8Array(Buffer.from(data));
    let existingOid;
    const leafEntry = pathEntries[pathEntries.length - 1];
    const nodePath = pathParts[pathParts.length - 1];
    if (leafEntry) {
      existingOid = await leafEntry.oid();
      const hash = await git2.hashBlob({ object: blobUpdate });
      if (hash.oid === existingOid) {
        await this.onPut(filepath, data);
        return;
      }
    }
    const updatedOid = await git2.writeBlob({
      ...this.isomorphicConfig,
      blob: blobUpdate
    });
    const updatedRootSha = await this.updateTreeHierarchy(
      existingOid,
      updatedOid,
      nodePath,
      "blob",
      pathEntries.slice(0, pathEntries.length - 1),
      pathParts.slice(0, pathParts.length - 1)
    );
    await this.commitTree(updatedRootSha, ref);
    await git2.updateIndex({
      ...this.isomorphicConfig,
      filepath: this.qualifyPath(filepath),
      add: true,
      oid: updatedOid,
      cache: this.cache
    });
    await this.onPut(filepath, data);
  }
};

// src/index.ts
var buildSchema = async (config, flags) => {
  return buildDotTinaFiles({
    config,
    flags
  });
};
export {
  AuditFileSystemBridge,
  Database,
  FilesystemBridge,
  IsomorphicBridge,
  TinaFetchError,
  TinaGraphQLError,
  TinaLevelClient,
  TinaParseDocumentError,
  TinaQueryError,
  assertShape,
  buildDotTinaFiles,
  buildSchema,
  checkPasswordHash,
  createDatabase,
  createDatabaseInternal,
  createLocalDatabase,
  createSchema,
  generatePasswordHash,
  getChangedFiles,
  getSha,
  handleFetchErrorError,
  loadAndParseWithAliases,
  mapUserFields,
  parseFile,
  resolve,
  scanAllContent,
  scanContentByPaths,
  sequential,
  shaExists,
  stringifyFile,
  transformDocument,
  transformDocumentIntoPayload
};
//! Replaces _.get()
//! Replaces _.flattenDeep()
