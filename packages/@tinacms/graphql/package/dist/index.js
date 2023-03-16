var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  AuditFileSystemBridge: () => AuditFileSystemBridge,
  FilesystemBridge: () => FilesystemBridge,
  IsomorphicBridge: () => IsomorphicBridge,
  TinaFetchError: () => TinaFetchError,
  TinaGraphQLError: () => TinaGraphQLError,
  TinaLevelClient: () => TinaLevelClient,
  TinaParseDocumentError: () => TinaParseDocumentError,
  TinaQueryError: () => TinaQueryError,
  assertShape: () => assertShape,
  buildDotTinaFiles: () => buildDotTinaFiles,
  buildSchema: () => buildSchema,
  createDatabase: () => createDatabase,
  createSchema: () => createSchema,
  getASTSchema: () => getASTSchema,
  handleFetchErrorError: () => handleFetchErrorError,
  parseFile: () => parseFile,
  resolve: () => resolve,
  sequential: () => sequential,
  stringifyFile: () => stringifyFile
});
module.exports = __toCommonJS(src_exports);
var import_graphql7 = require("graphql");

// src/build.ts
var import_lodash3 = __toESM(require("lodash"));
var import_graphql2 = require("graphql");

// src/ast-builder/index.ts
var import_lodash = __toESM(require("lodash"));

// src/util.ts
var yup = __toESM(require("yup"));
var import_graphql = require("graphql");
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
    throw new import_graphql.GraphQLError(message, null, null, null, null, null, {
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

// src/ast-builder/index.ts
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
        datetime: "String",
        image: "String",
        text: "String"
      };
      return scalars[type];
    },
    MultiCollectionDocument: "DocumentNode",
    CollectionDocumentUnion: "DocumentUnion",
    Folder: "Folder",
    String: "String",
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
    const definitions = import_lodash.default.uniqBy(
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
  if (typeof s !== "string")
    return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};
var extractInlineTypes = (item) => {
  if (Array.isArray(item)) {
    const accumulator = item.map((i) => {
      return extractInlineTypes(i);
    });
    return import_lodash.default.flattenDeep(accumulator);
  } else {
    const accumulator = [item];
    for (const node of walk(item)) {
      if (node.kind === "UnionTypeDefinition") {
        node.types = import_lodash.default.uniqBy(node.types, (type) => type.name.value);
      }
      if (node.kind === "NamedType") {
        if (typeof node.name.value !== "string") {
          accumulator.push(node.name.value);
          node.name.value = node.name.value.name.value;
        }
      }
    }
    return accumulator;
  }
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
function addNamespaceToSchema(maybeNode, namespace = []) {
  if (typeof maybeNode === "string") {
    return maybeNode;
  }
  if (typeof maybeNode === "boolean") {
    return maybeNode;
  }
  const newNode = maybeNode;
  const keys = Object.keys(maybeNode);
  Object.values(maybeNode).map((m, index) => {
    const key = keys[index];
    if (Array.isArray(m)) {
      newNode[key] = m.map((element) => {
        if (!element) {
          return;
        }
        if (!element.hasOwnProperty("name")) {
          return element;
        }
        const value = element.name || element.value;
        return addNamespaceToSchema(element, [...namespace, value]);
      });
    } else {
      if (!m) {
        return;
      }
      if (!m.hasOwnProperty("name")) {
        newNode[key] = m;
      } else {
        newNode[key] = addNamespaceToSchema(m, [...namespace, m.name]);
      }
    }
  });
  return { ...newNode, namespace };
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

// src/builder/index.ts
var createBuilder = async ({
  database,
  tinaSchema
}) => {
  return new Builder({ database, tinaSchema });
};
var Builder = class {
  constructor(config) {
    this.config = config;
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
    this.multiNodeDocument = async () => {
      const name = "node";
      const args = [
        astBuilder.InputValueDefinition({
          name: "id",
          type: astBuilder.TYPES.String
        })
      ];
      await this.database.addToLookupMap({
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
    this.collectionDocument = async (collection) => {
      const name = NAMER.queryName([collection.name]);
      const type = await this._buildCollectionDocumentType(collection);
      const args = [
        astBuilder.InputValueDefinition({
          name: "relativePath",
          type: astBuilder.TYPES.String
        })
      ];
      await this.database.addToLookupMap({
        type: type.name.value,
        resolveType: "collectionDocument",
        collection: collection.name,
        [NAMER.createName([collection.name])]: "create",
        [NAMER.updateName([collection.name])]: "update"
      });
      return astBuilder.FieldDefinition({ type, name, args, required: true });
    };
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
    this._getCollectionFragmentSelections = async (collection, depth) => {
      var _a;
      const selections = [];
      if (((_a = collection.fields) == null ? void 0 : _a.length) > 0) {
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
      var _a, _b;
      switch (field.type) {
        case "string":
        case "image":
        case "datetime":
        case "number":
        case "boolean":
        case "rich-text":
          return astBuilder.FieldNodeDefinition(field);
        case "object":
          if (((_a = field.fields) == null ? void 0 : _a.length) > 0) {
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
          } else if (((_b = field.templates) == null ? void 0 : _b.length) > 0) {
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
        case "reference":
          if (depth >= this.maxDepth)
            return false;
          if (!("collections" in field)) {
            return false;
          }
          const selections = [];
          await sequential(field.collections, async (col) => {
            let collection = this.tinaSchema.getCollection(col);
            if (collection.fields && field.collectionFields && field.collectionFields[col]) {
              const fieldsToSelect = field.collectionFields[col];
              collection = {
                ...collection,
                templates: void 0,
                fields: collection.fields.filter(
                  ({ name }) => fieldsToSelect.includes(name)
                )
              };
            }
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
    this.collectionDocumentList = async (collection) => {
      const connectionName = NAMER.referenceConnectionType(collection.namespace);
      await this.database.addToLookupMap({
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
      await this.database.addToLookupMap({
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
      await this.database.addToLookupMap({
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
            collections: await this.tinaSchema.getCollectionsByName(
              field.collections
            )
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
        await this.database.addToLookupMap({
          type: name,
          resolveType: "unionData",
          collection: collection == null ? void 0 : collection.name,
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
    var _a, _b, _c, _d;
    this.maxDepth = (_d = (_c = (_b = (_a = config == null ? void 0 : config.tinaSchema.schema) == null ? void 0 : _a.config) == null ? void 0 : _b.client) == null ? void 0 : _c.referenceDepth) != null ? _d : 2;
    this.tinaSchema = config.tinaSchema;
    this.database = config.database;
  }
  async buildTemplateFragments(template, depth) {
    const selections = [];
    await sequential(template.fields || [], async (item) => {
      const field = await this._buildFieldNodeForFragments(item, depth);
      selections.push(field);
    });
    const filteredSelections = filterSelections(selections);
    if (!filteredSelections.length)
      return false;
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
var import_schema_tools2 = require("@tinacms/schema-tools");

// src/schema/validate.ts
var import_lodash2 = __toESM(require("lodash"));
var yup2 = __toESM(require("yup"));
var import_schema_tools = require("@tinacms/schema-tools");
var FIELD_TYPES = [
  "string",
  "number",
  "boolean",
  "datetime",
  "image",
  "reference",
  "object",
  "rich-text"
];
var validateSchema = async (schema) => {
  const schema2 = addNamespaceToSchema(
    import_lodash2.default.cloneDeep(schema)
  );
  const collections = await sequential(
    schema2.collections,
    async (collection) => validateCollection(collection)
  );
  validationCollectionsPathAndMatch(collections);
  if (schema2.config) {
    const config = (0, import_schema_tools.validateTinaCloudSchemaConfig)(schema2.config);
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
    return typeof (x == null ? void 0 : x.match) === "undefined";
  }).map((x) => `${x.path}${x.format || "md"}`);
  if (noMatchCollections.length !== new Set(noMatchCollections).size) {
    throw new Error(
      "Two collections without match can not have the same `path`. Please make the `path` unique or add a matches property to the collection."
    );
  }
  const hasMatchAndPath = collections.filter((x) => {
    return typeof x.path !== "undefined" && typeof x.match !== "undefined";
  }).map(
    (x) => {
      var _a, _b;
      return `${x.path}|${((_a = x == null ? void 0 : x.match) == null ? void 0 : _a.exclude) || ""}|${((_b = x == null ? void 0 : x.match) == null ? void 0 : _b.include) || ""}|${x.format || "md"}`;
    }
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
      (x) => typeof (x == null ? void 0 : x.match) === "object" ? JSON.stringify(x.match) : ""
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
      throw new Error(`Global templates are not yet supported`);
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
  version: "1.4.9",
  main: "dist/index.js",
  module: "dist/index.es.js",
  typings: "dist/index.d.ts",
  files: [
    "package.json",
    "dist"
  ],
  exports: {
    import: "./dist/index.es.js",
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
    docs: "yarn typedoc",
    serve: "yarn nodemon dist/server.js",
    test: "jest",
    "test-watch": "jest --watch"
  },
  dependencies: {
    "@graphql-tools/relay-operation-optimizer": "^6.4.1",
    "@iarna/toml": "^2.2.5",
    "@tinacms/mdx": "workspace:*",
    "@tinacms/schema-tools": "workspace:*",
    "abstract-level": "^1.0.3",
    "body-parser": "^1.19.0",
    cors: "^2.8.5",
    dataloader: "^2.0.0",
    "date-fns": "^2.21.1",
    "encoding-down": "^7.1.0",
    esbuild: "^0.15.5",
    "esbuild-jest": "^0.5.0",
    "estree-walker": "^3.0.0",
    "fast-glob": "^3.2.5",
    flat: "^5.0.2",
    "fs-extra": "^9.0.1",
    "glob-parent": "^6.0.2",
    graphql: "15.8.0",
    "graphql-type-json": "^0.3.2",
    "gray-matter": "^4.0.2",
    "isomorphic-git": "^1.21.0",
    "js-sha1": "^0.6.0",
    "js-yaml": "^3.14.1",
    "jsonpath-plus": "^6.0.1",
    leveldown: "^6.1.0",
    lodash: "^4.17.20",
    "many-level": "^2.0.0",
    mdast: "^3.0.0",
    "mdast-util-from-markdown": "^1.0.0",
    "mdast-util-mdx": "^1.1.0",
    "mdast-util-mdx-expression": "^1.1.0",
    "mdast-util-to-markdown": "^1.2.1",
    "micromark-extension-mdxjs": "^1.0.0",
    micromatch: "4.0.5",
    "normalize-path": "^3.0.0",
    prettier: "^2.2.1",
    "readable-stream": "^4.3.0",
    "rehype-format": "^3.1.0",
    "rehype-stringify": "^8.0.0",
    remark: "^13.0.0",
    "remark-frontmatter": "^3.0.0",
    "remark-mdx": "next",
    "remark-parse": "^10.0.0",
    "remark-rehype": "^8.0.0",
    "remark-slate": "^1.8.0",
    "remark-stringify": "^8.1.1",
    unified: "^10.1.0",
    "unist-util-remove-position": "^3.0.0",
    "unist-util-visit": "^4.0.0",
    vfile: "^4.2.0",
    ws: "^7.3.1",
    yup: "^0.32.9"
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
    "@types/cors": "^2.8.7",
    "@types/estree": "^0.0.50",
    "@types/express": "^4.17.8",
    "@types/fs-extra": "^9.0.2",
    "@types/jest": "^26.0.4",
    "@types/js-yaml": "^3.12.5",
    "@types/lodash": "^4.14.161",
    "@types/lodash.camelcase": "^4.3.6",
    "@types/lodash.upperfirst": "^4.3.6",
    "@types/lru-cache": "^5.1.0",
    "@types/mdast": "^3.0.10",
    "@types/micromatch": "^4.0.2",
    "@types/node": "^14.17.34",
    "@types/normalize-path": "^3.0.0",
    "@types/ws": "^7.2.6",
    "@types/yup": "^0.29.7",
    jest: "27.0.6",
    "jest-diff": "27.0.6",
    "jest-file-snapshot": "^0.5.0",
    "jest-matcher-utils": "27.0.6",
    "memory-level": "^1.0.0",
    nodemon: "2.0.19",
    typescript: "4.3.5"
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
  return new import_schema_tools2.TinaSchema({
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
  database,
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
    database,
    tinaSchema
  });
  let graphQLSchema;
  if (database.bridge.supportsBuilding()) {
    graphQLSchema = await _buildSchema(builder, tinaSchema);
    await database.putConfigFiles({ graphQLSchema, tinaSchema });
  } else {
    graphQLSchema = JSON.parse(
      await database.bridge.get(".tina/__generated__/_graphql.json")
    );
  }
  let fragDoc = "";
  let queryDoc = "";
  if (buildSDK) {
    fragDoc = await _buildFragments(
      builder,
      tinaSchema,
      database.bridge.rootPath
    );
    queryDoc = await _buildQueries(
      builder,
      tinaSchema,
      database.bridge.rootPath
    );
  }
  return { graphQLSchema, tinaSchema, fragDoc, queryDoc };
};
var _buildFragments = async (builder, tinaSchema, rootPath) => {
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
    definitions: import_lodash3.default.uniqBy(
      extractInlineTypes(fragmentDefinitionsFields),
      (node) => node.name.value
    )
  };
  return (0, import_graphql2.print)(fragDoc);
};
var _buildQueries = async (builder, tinaSchema, rootPath) => {
  const operationsDefinitions = [];
  const collections = tinaSchema.getCollections();
  await sequential(collections, async (collection) => {
    var _a, _b, _c;
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
        dataLayer: Boolean(
          (_c = (_b = (_a = tinaSchema.config) == null ? void 0 : _a.meta) == null ? void 0 : _b.flags) == null ? void 0 : _c.find((x) => x === "experimentalData")
        )
      })
    );
  });
  const queryDoc = {
    kind: "Document",
    definitions: import_lodash3.default.uniqBy(
      extractInlineTypes(operationsDefinitions),
      (node) => node.name.value
    )
  };
  return (0, import_graphql2.print)(queryDoc);
};
var _buildSchema = async (builder, tinaSchema) => {
  const definitions = [];
  definitions.push(await builder.buildStaticDefinitions());
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
  await sequential(collections, async (collection) => {
    queryTypeDefinitionFields.push(await builder.collectionDocument(collection));
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
  const doc = {
    kind: "Document",
    definitions: import_lodash3.default.uniqBy(
      extractInlineTypes(definitions),
      (node) => node.name.value
    )
  };
  return doc;
};

// src/resolve.ts
var import_graphql4 = require("graphql");

// src/resolver/index.ts
var import_path2 = __toESM(require("path"));
var import_isValid = __toESM(require("date-fns/isValid"));

// src/mdx/index.ts
var import_mdx = require("@tinacms/mdx");

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
          if (!v || typeof v !== "string")
            return v;
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
          if (!v || typeof v !== "string")
            return v;
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
var cleanUpSlashes = (path5) => {
  if (path5) {
    return `/${path5.replace(/^\/+|\/+$/gm, "")}`;
  }
  return "";
};
var hasTinaMediaConfig = (schema) => {
  var _a, _b, _c, _d, _e, _f;
  if (((_c = (_b = (_a = schema.config) == null ? void 0 : _a.media) == null ? void 0 : _b.tina) == null ? void 0 : _c.publicFolder) && ((_f = (_e = (_d = schema.config) == null ? void 0 : _d.media) == null ? void 0 : _e.tina) == null ? void 0 : _f.mediaRoot)) {
    return true;
  }
  return false;
};

// src/resolver/index.ts
var import_graphql3 = require("graphql");

// src/database/datalayer.ts
var import_jsonpath_plus = require("jsonpath-plus");
var import_js_sha1 = __toESM(require("js-sha1"));

// src/database/level.ts
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
      throw new Error(`The property, ${property.toString()}, is not a function`);
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
var import_path = __toESM(require("path"));
var DEFAULT_COLLECTION_SORT_KEY = "__filepath__";
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
      const resolvedValue = String(
        field.type === "datetime" ? new Date(rawValue).getTime() : field.type === "string" ? stringEscaper2(rawValue) : rawValue
      ).substring(0, maxStringLength);
      valueParts.push(applyPadding(resolvedValue, field.pad));
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
var makeFilter = ({
  filterChain
}) => {
  return (values) => {
    for (const filter of filterChain) {
      const dataType = filter.type;
      const resolvedValues = (0, import_jsonpath_plus.JSONPath)({
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
        operands = resolvedValues.map((resolvedValue) => Number(resolvedValue));
      } else if (dataType === "datetime") {
        operands = resolvedValues.map((resolvedValue) => {
          const coerced = new Date(resolvedValue).getTime();
          return isNaN(coerced) ? Number(resolvedValue) : coerced;
        });
      } else if (dataType === "boolean") {
        operands = resolvedValues.map(
          (resolvedValue) => typeof resolvedValue === "boolean" && resolvedValue || resolvedValue === "true" || resolvedValue === "1"
        );
      } else {
        throw new Error(`Unexpected datatype ${dataType}`);
      }
      const { operator } = filter;
      let matches = false;
      if (operator) {
        switch (operator) {
          case "eq" /* EQ */:
            if (operands.findIndex(
              (operand) => operand === filter.rightOperand
            ) >= 0) {
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
      } else {
        const { rightOperator, leftOperator, rightOperand, leftOperand } = filter;
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
    const { _type, ...keys } = filterExpression;
    const [key1, key2, ...extraKeys] = Object.keys(keys);
    if (extraKeys.length) {
      throw new Error(
        `Unexpected keys: [${extraKeys.join(",")}] in filter expression`
      );
    }
    if (key1 && !key2) {
      filterChain.push({
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
var stripCollectionFromPath = (collectionPath, path5) => {
  const collectionPathParts = collectionPath.split("/");
  const pathParts = path5.split("/");
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
    let folderPath = import_path.default.dirname(documentPath);
    if (collectionPath) {
      folderPath = stripCollectionFromPath(collectionPath, folderPath);
    }
    const parent = [FOLDER_ROOT];
    folderPath.split("/").filter((part) => part.length).forEach((part) => {
      const current2 = parent.join("/");
      if (!this._tree[current2]) {
        this._tree[current2] = /* @__PURE__ */ new Set();
      }
      this._tree[current2].add(import_path.default.join(current2, part));
      parent.push(part);
    });
    const current = parent.join("/");
    if (!this._tree[current]) {
      this._tree[current] = /* @__PURE__ */ new Set();
    }
    return current === FOLDER_ROOT ? FOLDER_ROOT : import_js_sha1.default.hex(current);
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
    const parentFolderKey = folderName === FOLDER_ROOT ? FOLDER_ROOT : import_js_sha1.default.hex(folderName);
    const folderCollectionSublevel = level.sublevel(
      `${collection.name}_${parentFolderKey}`,
      SUBLEVEL_OPTIONS
    );
    let folderSortingIdx = 0;
    for (const path5 of Array.from(folder).sort()) {
      for (const [sort] of Object.entries(indexDefinitions)) {
        const indexSublevel = folderCollectionSublevel.sublevel(
          sort,
          SUBLEVEL_OPTIONS
        );
        const subFolderKey = import_js_sha1.default.hex(path5);
        if (sort === DEFAULT_COLLECTION_SORT_KEY) {
          result.push({
            type: opType,
            key: `${collection.path}/${subFolderKey}.${collection.format}`,
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
          __folderBasename: import_path.default.basename(folderName),
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
var Resolver = class {
  constructor(init) {
    this.init = init;
    this.resolveCollection = async (args, collectionName, hasDocuments) => {
      const collection = this.tinaSchema.getCollection(collectionName);
      const extraFields = {};
      return {
        documents: { collection, hasDocuments },
        ...collection,
        ...extraFields
      };
    };
    this.getRaw = async (fullPath) => {
      if (typeof fullPath !== "string") {
        throw new Error(`fullPath must be of type string for getDocument request`);
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
        return this.transformDocumentIntoPayload(fullPath, rawData);
      }
    };
    this.getDocument = async (fullPath) => {
      if (typeof fullPath !== "string") {
        throw new Error(`fullPath must be of type string for getDocument request`);
      }
      const rawData = await this.getRaw(fullPath);
      return this.transformDocumentIntoPayload(fullPath, rawData);
    };
    this.transformDocumentIntoPayload = async (fullPath, rawData) => {
      const collection = this.tinaSchema.getCollection(rawData._collection);
      try {
        const template = await this.tinaSchema.getTemplateForData({
          data: rawData,
          collection
        });
        const {
          base: basename,
          ext: extension,
          name: filename
        } = import_path2.default.parse(fullPath);
        const relativePath = fullPath.replace(/\\/g, "/").replace(collection.path, "").replace(/^\/|\/$/g, "");
        const breadcrumbs = relativePath.replace(extension, "").split("/");
        const data = {
          _collection: rawData._collection,
          _template: rawData._template
        };
        try {
          await sequential(template.fields, async (field) => {
            return this.resolveFieldData(field, rawData, data);
          });
        } catch (e) {
          throw new TinaParseDocumentError({
            originalError: e,
            collection: collection.name,
            includeAuditMessage: !this.isAudit,
            file: relativePath,
            stack: e.stack
          });
        }
        const titleField = template.fields.find((x) => {
          if (x.type === "string" && (x == null ? void 0 : x.isTitle)) {
            return true;
          }
        });
        const titleFieldName = titleField == null ? void 0 : titleField.name;
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
    this.deleteDocument = async (fullPath) => {
      if (typeof fullPath !== "string") {
        throw new Error(`fullPath must be of type string for getDocument request`);
      }
      await this.database.delete(fullPath);
    };
    this.buildObjectMutations = (fieldValue, field) => {
      if (field.fields) {
        const objectTemplate = field;
        if (Array.isArray(fieldValue)) {
          return fieldValue.map(
            (item) => this.buildFieldMutations(item, objectTemplate)
          );
        } else {
          return this.buildFieldMutations(
            fieldValue,
            objectTemplate
          );
        }
      }
      if (field.templates) {
        if (Array.isArray(fieldValue)) {
          return fieldValue.map((item) => {
            if (typeof item === "string") {
              throw new Error(
                `Expected object for template value for field ${field.name}`
              );
            }
            const templates = field.templates.map((templateOrTemplateName) => {
              return templateOrTemplateName;
            });
            const [templateName] = Object.entries(item)[0];
            const template = templates.find(
              (template2) => template2.name === templateName
            );
            if (!template) {
              throw new Error(`Expected to find template ${templateName}`);
            }
            return {
              ...this.buildFieldMutations(item[template.name], template),
              _template: template.name
            };
          });
        } else {
          if (typeof fieldValue === "string") {
            throw new Error(
              `Expected object for template value for field ${field.name}`
            );
          }
          const templates = field.templates.map((templateOrTemplateName) => {
            return templateOrTemplateName;
          });
          const [templateName] = Object.entries(fieldValue)[0];
          const template = templates.find(
            (template2) => template2.name === templateName
          );
          if (!template) {
            throw new Error(`Expected to find template ${templateName}`);
          }
          return {
            ...this.buildFieldMutations(fieldValue[template.name], template),
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
      const params = this.buildObjectMutations(
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
      const oldDoc = (doc == null ? void 0 : doc._rawData) || {};
      if (isAddPendingDocument === true) {
        const templateInfo = this.tinaSchema.getTemplatesForCollectable(collection);
        const params2 = this.buildParams(args);
        switch (templateInfo.type) {
          case "object":
            if (params2) {
              const values = this.buildFieldMutations(
                params2,
                templateInfo.template
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
                  ...this.buildFieldMutations(templateParams, template),
                  _template: lastItem(template.namespace)
                };
                await this.database.put(realPath, values, collection.name);
              }
            });
        }
        return this.getDocument(realPath);
      }
      const params = this.buildObjectMutations(
        isCollectionSpecific ? args.params : args.params[collection.name],
        collection
      );
      await this.database.put(realPath, { ...oldDoc, ...params }, collection.name);
      return this.getDocument(realPath);
    };
    this.resolveDocument = async ({
      args,
      collection: collectionName,
      isMutation,
      isCreation,
      isDeletion,
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
      const realPath = import_path2.default.join(collection == null ? void 0 : collection.path, args.relativePath);
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
          return doc;
        }
        if (isUpdateName) {
          assertShape(
            args,
            (yup3) => yup3.object({ params: yup3.object().required() })
          );
          assertShape(
            args == null ? void 0 : args.params,
            (yup3) => yup3.object({ relativePath: yup3.string().required() })
          );
          const doc = await this.getDocument(realPath);
          const newRealPath = import_path2.default.join(
            collection == null ? void 0 : collection.path,
            args.params.relativePath
          );
          await this.database.put(newRealPath, doc._rawData, collection.name);
          await this.deleteDocument(realPath);
          return this.getDocument(newRealPath);
        }
        if (alreadyExists === false) {
          throw new Error(`Unable to update document, ${realPath} does not exist`);
        }
        return this.updateResolveDocument({
          collection,
          realPath,
          args,
          isAddPendingDocument,
          isCollectionSpecific
        });
      } else {
        return this.getDocument(realPath);
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
          hydrator: (path5) => path5
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
    this.buildFieldMutations = (fieldParams, template) => {
      const accum = {};
      Object.entries(fieldParams).forEach(([fieldName, fieldValue]) => {
        if (Array.isArray(fieldValue)) {
          if (fieldValue.length === 0) {
            accum[fieldName] = [];
            return;
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
            accum[fieldName] = this.buildObjectMutations(fieldValue, field);
            break;
          case "rich-text":
            accum[fieldName] = (0, import_mdx.stringifyMDX)(
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
      });
      return accum;
    };
    this.resolveFieldData = async ({ namespace, ...field }, rawData, accumulator) => {
      var _a;
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
        case "reference":
          accumulator[field.name] = value;
          break;
        case "image":
          accumulator[field.name] = resolveMediaRelativeToCloud(
            value,
            this.config,
            this.tinaSchema.schema
          );
          break;
        case "rich-text":
          const tree = (0, import_mdx.parseMDX)(
            value,
            field,
            (value2) => resolveMediaRelativeToCloud(
              value2,
              this.config,
              this.tinaSchema.schema
            )
          );
          if (((_a = tree == null ? void 0 : tree.children[0]) == null ? void 0 : _a.type) === "invalid_markdown") {
            if (this.isAudit) {
              const invalidNode = tree == null ? void 0 : tree.children[0];
              throw new import_graphql3.GraphQLError(
                `${invalidNode == null ? void 0 : invalidNode.message}${invalidNode.position ? ` at line ${invalidNode.position.start.line}, column ${invalidNode.position.start.column}` : ""}`
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
              const template = await this.tinaSchema.getTemplateForData({
                data: item,
                collection: {
                  namespace,
                  ...field
                }
              });
              const payload = {};
              await sequential(template.fields, async (field2) => {
                await this.resolveFieldData(field2, item, payload);
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
            const template = await this.tinaSchema.getTemplateForData({
              data: value,
              collection: {
                namespace,
                ...field
              }
            });
            const payload = {};
            await sequential(template.fields, async (field2) => {
              await this.resolveFieldData(field2, value, payload);
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
  if (!(0, import_isValid.default)(date)) {
    throw "Invalid Date";
  }
  return date;
};

// src/resolve.ts
var import_relay_operation_optimizer = require("@graphql-tools/relay-operation-optimizer");
var resolve = async ({
  config,
  query,
  variables,
  database,
  silenceErrors,
  verbose,
  isAudit
}) => {
  var _a;
  try {
    const verboseValue = verbose != null ? verbose : true;
    const graphQLSchemaAst = await database.getGraphQLSchema();
    const graphQLSchema = (0, import_graphql4.buildASTSchema)(graphQLSchemaAst);
    const tinaConfig = await database.getTinaSchema();
    const tinaSchema = await createSchema({
      schema: tinaConfig,
      flags: (_a = tinaConfig == null ? void 0 : tinaConfig.meta) == null ? void 0 : _a.flags
    });
    const resolver = await createResolver({
      config,
      database,
      tinaSchema,
      isAudit: isAudit || false
    });
    const res = await (0, import_graphql4.graphql)({
      schema: graphQLSchema,
      source: query,
      variableValues: variables,
      contextValue: {
        database
      },
      typeResolver: async (source, _args, info) => {
        if (source.__typename)
          return source.__typename;
        const namedType = (0, import_graphql4.getNamedType)(info.returnType).toString();
        const lookup = await database.getLookup(namedType);
        if (lookup.resolveType === "unionData") {
          return lookup.typeMap[source._template];
        } else {
          throw new Error(`Unable to find lookup key for ${namedType}`);
        }
      },
      fieldResolver: async (source = {}, _args = {}, _context, info) => {
        var _a2, _b, _c, _d;
        try {
          const args = JSON.parse(JSON.stringify(_args));
          const returnType = (0, import_graphql4.getNamedType)(info.returnType).toString();
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
                  var _a3;
                  return ((_a3 = x == null ? void 0 : x.name) == null ? void 0 : _a3.value) === "documents";
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
                var _a3;
                return ((_a3 = x == null ? void 0 : x.name) == null ? void 0 : _a3.value) === "documents";
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
              const [optimizedQuery] = (0, import_relay_operation_optimizer.optimizeDocuments)(
                info.schema,
                [(0, import_graphql4.parse)(args.queryString)],
                {
                  assumeValid: true,
                  includeFragments: false,
                  noLocation: true
                }
              );
              return (0, import_graphql4.print)(optimizedQuery);
            } catch (e) {
              throw new Error(
                `Invalid query provided, Error message: ${e.message}`
              );
            }
          }
          if (!lookup) {
            return value;
          }
          const isCreation = lookup[info.fieldName] === "create";
          switch (lookup.resolveType) {
            case "nodeDocument":
              assertShape(
                args,
                (yup3) => yup3.object({ id: yup3.string().required() })
              );
              return resolver.getDocument(args.id);
            case "multiCollectionDocument":
              if (typeof value === "string") {
                return resolver.getDocument(value);
              }
              if (args && args.collection && info.fieldName === "addPendingDocument") {
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
                "deleteDocument"
              ].includes(info.fieldName)) {
                const result2 = await resolver.resolveDocument({
                  args,
                  collection: args.collection,
                  isMutation,
                  isCreation,
                  isDeletion: info.fieldName === "deleteDocument",
                  isUpdateName: Boolean((_a2 = args == null ? void 0 : args.params) == null ? void 0 : _a2.relativePath),
                  isAddPendingDocument: false,
                  isCollectionSpecific: false
                });
                return result2;
              }
              return value;
            case "multiCollectionDocumentList":
              if (Array.isArray(value)) {
                return {
                  totalCount: value.length,
                  edges: value.map((document) => {
                    return { node: document };
                  })
                };
              } else if (info.fieldName === "documents" && (value == null ? void 0 : value.collection) && (value == null ? void 0 : value.hasDocuments)) {
                let filter = args.filter;
                if (typeof (args == null ? void 0 : args.filter) !== "undefined" && (args == null ? void 0 : args.filter) !== null && typeof ((_b = value == null ? void 0 : value.collection) == null ? void 0 : _b.name) === "string" && Object.keys(args.filter).includes((_c = value == null ? void 0 : value.collection) == null ? void 0 : _c.name) && typeof args.filter[(_d = value == null ? void 0 : value.collection) == null ? void 0 : _d.name] !== "undefined") {
                  filter = args.filter[value.collection.name];
                }
                return resolver.resolveCollectionConnection({
                  args: {
                    ...args,
                    filter
                  },
                  collection: value.collection
                });
              } else {
                throw new Error(
                  `Expected an array for result of ${info.fieldName} at ${info.path}`
                );
              }
            case "collectionDocument":
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
            case "collectionDocumentList":
              return resolver.resolveCollectionConnection({
                args,
                collection: tinaSchema.getCollection(lookup.collection)
              });
            case "unionData":
              if (!value) {
                if (args.relativePath) {
                  const result2 = await resolver.resolveDocument({
                    args,
                    collection: lookup.collection,
                    isMutation,
                    isCreation,
                    isAddPendingDocument: false,
                    isCollectionSpecific: true
                  });
                  return result2;
                }
              }
              return value;
            default:
              console.error(lookup);
              throw new Error(`Unexpected resolve type`);
          }
        } catch (e) {
          handleFetchErrorError(e, verboseValue);
        }
      }
    });
    if (res.errors) {
      if (!silenceErrors) {
        res.errors.map((e) => {
          console.error(e.toString());
          if (verboseValue) {
            console.error("More error context below");
            console.error(e.message);
            console.error(e);
          }
        });
      }
    }
    return res;
  } catch (e) {
    if (!silenceErrors) {
      console.error(e);
    }
    if (e instanceof import_graphql4.GraphQLError) {
      return {
        errors: [e]
      };
    } else {
      throw e;
    }
  }
};

// src/database/index.ts
var import_path3 = __toESM(require("path"));
var import_graphql5 = require("graphql");
var import_micromatch = __toESM(require("micromatch"));

// src/database/util.ts
var import_toml = __toESM(require("@iarna/toml"));
var import_js_yaml = __toESM(require("js-yaml"));
var import_gray_matter = __toESM(require("gray-matter"));
var import_schema_tools3 = require("@tinacms/schema-tools");
var matterEngines = {
  toml: {
    parse: (val) => import_toml.default.parse(val),
    stringify: (val) => import_toml.default.stringify(val)
  }
};
var stringifyFile = (content, format, keepTemplateKey, markdownParseConfig) => {
  var _a, _b;
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
      const ok = import_gray_matter.default.stringify(
        typeof $_body === "undefined" ? "" : `
${$_body}`,
        strippedContent,
        {
          language: (_a = markdownParseConfig == null ? void 0 : markdownParseConfig.frontmatterFormat) != null ? _a : "yaml",
          engines: matterEngines,
          delimiters: (_b = markdownParseConfig == null ? void 0 : markdownParseConfig.frontmatterDelimiters) != null ? _b : "---"
        }
      );
      return ok;
    case ".json":
      return JSON.stringify(strippedContent, null, 2);
    case ".yaml":
    case ".yml":
      return import_js_yaml.default.safeDump(strippedContent);
    case ".toml":
      return import_toml.default.stringify(strippedContent);
    default:
      throw new Error(`Must specify a valid format, got ${format}`);
  }
};
var parseFile = (content, format, yupSchema, markdownParseConfig) => {
  var _a, _b;
  switch (format) {
    case ".markdown":
    case ".mdx":
    case ".md":
      const contentJSON = (0, import_gray_matter.default)(content || "", {
        language: (_a = markdownParseConfig == null ? void 0 : markdownParseConfig.frontmatterFormat) != null ? _a : "yaml",
        delimiters: (_b = markdownParseConfig == null ? void 0 : markdownParseConfig.frontmatterDelimiters) != null ? _b : "---",
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
      return import_toml.default.parse(content);
    case ".yaml":
    case ".yml":
      if (!content) {
        return {};
      }
      return import_js_yaml.default.safeLoad(content);
    default:
      throw new Error(`Must specify a valid format, got ${format}`);
  }
};

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
  var _a;
  return field && field.type === "object" && ((_a = field.templates) == null ? void 0 : _a.length) > 0;
}
var _replaceNameOverrides = (fields, obj) => {
  const output = {};
  Object.keys(obj).forEach((key) => {
    const field = fields.find(
      (fieldWithMatchingAlias) => ((fieldWithMatchingAlias == null ? void 0 : fieldWithMatchingAlias.nameOverride) || (fieldWithMatchingAlias == null ? void 0 : fieldWithMatchingAlias.name)) === key
    );
    output[(field == null ? void 0 : field.name) || key] = (field == null ? void 0 : field.type) == "object" ? replaceNameOverrides(field, obj[key]) : obj[key];
  });
  return output;
};
var getTemplateForData = (field, data) => {
  var _a;
  if ((_a = field.templates) == null ? void 0 : _a.length) {
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
    const outputKey = (field == null ? void 0 : field.nameOverride) || key;
    output[outputKey] = (field == null ? void 0 : field.type) === "object" ? applyNameOverrides(field, obj[key]) : obj[key];
  });
  return output;
};

// src/database/index.ts
var import_js_sha12 = __toESM(require("js-sha1"));
var createDatabase = (config) => {
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
      const tinaSchema = await this.getSchema(this.level);
      return tinaSchema.getCollectionByFullPath(filepath);
    };
    this.getGeneratedFolder = () => import_path3.default.join(this.tinaDirectory, "__generated__");
    this.get = async (filepath) => {
      await this.initLevel();
      if (SYSTEM_FILES.includes(filepath)) {
        throw new Error(`Unexpected get for config file ${filepath}`);
      } else {
        const tinaSchema = await this.getSchema(this.level);
        const extension = import_path3.default.extname(filepath);
        const contentObject = await this.level.sublevel(
          CONTENT_ROOT_PREFIX,
          SUBLEVEL_OPTIONS
        ).get((0, import_schema_tools3.normalizePath)(filepath));
        if (!contentObject) {
          throw new import_graphql5.GraphQLError(`Unable to find record ${filepath}`);
        }
        const templateName = hasOwnProperty(contentObject, "_template") && typeof contentObject._template === "string" ? contentObject._template : void 0;
        const { collection, template } = hasOwnProperty(
          contentObject,
          "__collection"
        ) ? {
          collection: tinaSchema.getCollection(
            contentObject["__collection"]
          ),
          template: void 0
        } : tinaSchema.getCollectionAndTemplateByFullPath(filepath, templateName);
        const field = template == null ? void 0 : template.fields.find((field2) => {
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
          _template: (template == null ? void 0 : template.namespace) ? lastItem(template == null ? void 0 : template.namespace) : void 0,
          _relativePath: filepath.replace(collection.path, "").replace(/^\/|\/$/g, ""),
          _id: filepath
        };
      }
    };
    this.addPendingDocument = async (filepath, data) => {
      await this.initLevel();
      const dataFields = await this.formatBodyOnPayload(filepath, data);
      const collection = await this.collectionForPath(filepath);
      const stringifiedFile = await this.stringifyFile(
        filepath,
        dataFields,
        collection
      );
      let collectionIndexDefinitions;
      if (collection) {
        const indexDefinitions = await this.getIndexDefinitions(this.level);
        collectionIndexDefinitions = indexDefinitions == null ? void 0 : indexDefinitions[collection.name];
      }
      const normalizedPath = (0, import_schema_tools3.normalizePath)(filepath);
      if (this.bridge) {
        await this.bridge.put(normalizedPath, stringifiedFile);
      }
      await this.onPut(normalizedPath, stringifiedFile);
      const folderTreeBuilder = new FolderTreeBuilder();
      const folderKey = folderTreeBuilder.update(filepath, collection.path || "");
      const putOps = [
        ...makeIndexOpsForDocument(
          normalizedPath,
          collection == null ? void 0 : collection.name,
          collectionIndexDefinitions,
          dataFields,
          "put",
          this.level
        ),
        ...makeIndexOpsForDocument(
          normalizedPath,
          `${collection == null ? void 0 : collection.name}_${folderKey}`,
          collectionIndexDefinitions,
          dataFields,
          "put",
          this.level
        )
      ];
      const existingItem = await this.level.sublevel(
        CONTENT_ROOT_PREFIX,
        SUBLEVEL_OPTIONS
      ).get(normalizedPath);
      const delOps = existingItem ? [
        ...makeIndexOpsForDocument(
          normalizedPath,
          collection == null ? void 0 : collection.name,
          collectionIndexDefinitions,
          existingItem,
          "del",
          this.level
        ),
        ...makeIndexOpsForDocument(
          normalizedPath,
          `${collection == null ? void 0 : collection.name}_${folderKey}`,
          collectionIndexDefinitions,
          existingItem,
          "del",
          this.level
        )
      ] : [];
      const ops = [
        ...delOps,
        ...putOps,
        {
          type: "put",
          key: normalizedPath,
          value: dataFields,
          sublevel: this.level.sublevel(
            CONTENT_ROOT_PREFIX,
            SUBLEVEL_OPTIONS
          )
        }
      ];
      await this.level.batch(ops);
    };
    this.put = async (filepath, data, collectionName) => {
      var _a, _b;
      await this.initLevel();
      try {
        if (SYSTEM_FILES.includes(filepath)) {
          throw new Error(`Unexpected put for config file ${filepath}`);
        } else {
          let collectionIndexDefinitions;
          if (collectionName) {
            const indexDefinitions = await this.getIndexDefinitions(this.level);
            collectionIndexDefinitions = indexDefinitions == null ? void 0 : indexDefinitions[collectionName];
          }
          const normalizedPath = (0, import_schema_tools3.normalizePath)(filepath);
          const dataFields = await this.formatBodyOnPayload(filepath, data);
          const collection = await this.collectionForPath(filepath);
          if (((_a = collection.match) == null ? void 0 : _a.exclude) || ((_b = collection.match) == null ? void 0 : _b.include)) {
            const matches = this.tinaSchema.getMatches({ collection });
            const match = import_micromatch.default.isMatch(filepath, matches);
            if (!match) {
              throw new import_graphql5.GraphQLError(
                `File ${filepath} does not match collection ${collection.name} glob ${matches.join(
                  ","
                )}. Please change the filename or update matches for ${collection.name} in your config file.`
              );
            }
          }
          const stringifiedFile = await this.stringifyFile(
            filepath,
            dataFields,
            collection
          );
          if (this.bridge) {
            await this.bridge.put(normalizedPath, stringifiedFile);
          }
          await this.onPut(normalizedPath, stringifiedFile);
          const folderTreeBuilder = new FolderTreeBuilder();
          const folderKey = folderTreeBuilder.update(
            filepath,
            collection.path || ""
          );
          const putOps = [
            ...makeIndexOpsForDocument(
              normalizedPath,
              collectionName,
              collectionIndexDefinitions,
              dataFields,
              "put",
              this.level
            ),
            ...makeIndexOpsForDocument(
              normalizedPath,
              `${collection == null ? void 0 : collection.name}_${folderKey}`,
              collectionIndexDefinitions,
              dataFields,
              "put",
              this.level
            )
          ];
          const existingItem = await this.level.sublevel(
            CONTENT_ROOT_PREFIX,
            SUBLEVEL_OPTIONS
          ).get(normalizedPath);
          const delOps = existingItem ? [
            ...makeIndexOpsForDocument(
              normalizedPath,
              collectionName,
              collectionIndexDefinitions,
              existingItem,
              "del",
              this.level
            ),
            ...makeIndexOpsForDocument(
              normalizedPath,
              `${collection == null ? void 0 : collection.name}_${folderKey}`,
              collectionIndexDefinitions,
              existingItem,
              "del",
              this.level
            )
          ] : [];
          const ops = [
            ...delOps,
            ...putOps,
            {
              type: "put",
              key: normalizedPath,
              value: dataFields,
              sublevel: this.level.sublevel(
                CONTENT_ROOT_PREFIX,
                SUBLEVEL_OPTIONS
              )
            }
          ];
          await this.level.batch(ops);
        }
        return true;
      } catch (error) {
        throw new TinaFetchError(`Error in PUT for ${filepath}`, {
          originalError: error,
          file: filepath,
          collection: collectionName,
          stack: error.stack
        });
      }
    };
    this.formatBodyOnPayload = async (filepath, data) => {
      const tinaSchema = await this.getSchema(this.level);
      const collection = tinaSchema.getCollectionByFullPath(filepath);
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
      const extension = import_path3.default.extname(filepath);
      const stringifiedFile = stringifyFile(
        aliasedData,
        extension,
        writeTemplateKey,
        {
          frontmatterFormat: collection == null ? void 0 : collection.frontmatterFormat,
          frontmatterDelimiters: collection == null ? void 0 : collection.frontmatterDelimiters
        }
      );
      return stringifiedFile;
    };
    this.flush = async (filepath) => {
      const data = await this.get(filepath);
      const dataFields = await this.formatBodyOnPayload(filepath, data);
      const collection = await this.collectionForPath(filepath);
      const stringifiedFile = await this.stringifyFile(
        filepath,
        dataFields,
        collection
      );
      return stringifiedFile;
    };
    this.getLookup = async (returnType) => {
      await this.initLevel();
      const lookupPath = (0, import_schema_tools3.normalizePath)(
        import_path3.default.join(this.getGeneratedFolder(), `_lookup.json`)
      );
      if (!this._lookup) {
        const _lookup = await this.level.sublevel(
          CONTENT_ROOT_PREFIX,
          SUBLEVEL_OPTIONS
        ).get(lookupPath);
        this._lookup = _lookup;
      }
      return this._lookup[returnType];
    };
    this.getGraphQLSchema = async () => {
      await this.initLevel();
      const graphqlPath = (0, import_schema_tools3.normalizePath)(
        import_path3.default.join(this.getGeneratedFolder(), `_graphql.json`)
      );
      return await this.level.sublevel(
        CONTENT_ROOT_PREFIX,
        SUBLEVEL_OPTIONS
      ).get(graphqlPath);
    };
    this.getGraphQLSchemaFromBridge = async () => {
      if (!this.bridge) {
        throw new Error(`No bridge configured`);
      }
      const graphqlPath = (0, import_schema_tools3.normalizePath)(
        import_path3.default.join(this.getGeneratedFolder(), `_graphql.json`)
      );
      const _graphql = await this.bridge.get(graphqlPath);
      return JSON.parse(_graphql);
    };
    this.getTinaSchema = async (level) => {
      await this.initLevel();
      const schemaPath = (0, import_schema_tools3.normalizePath)(
        import_path3.default.join(this.getGeneratedFolder(), `_schema.json`)
      );
      return await (level || this.level).sublevel(
        CONTENT_ROOT_PREFIX,
        SUBLEVEL_OPTIONS
      ).get(schemaPath);
    };
    this.getSchema = async (level, existingSchema) => {
      if (this.tinaSchema) {
        return this.tinaSchema;
      }
      await this.initLevel();
      const schema = existingSchema || await this.getTinaSchema(level || this.level);
      if (!schema) {
        throw new Error(
          `Unable to get schema from level db: ${(0, import_schema_tools3.normalizePath)(
            import_path3.default.join(this.getGeneratedFolder(), `_schema.json`)
          )}`
        );
      }
      this.tinaSchema = await createSchema({ schema });
      return this.tinaSchema;
    };
    this.getIndexDefinitions = async (level) => {
      if (!this.collectionIndexDefinitions) {
        await new Promise(async (resolve2, reject) => {
          await this.initLevel();
          try {
            const schema = await this.getSchema(level || this.level);
            const collections = schema.getCollections();
            for (const collection of collections) {
              const indexDefinitions = {
                [DEFAULT_COLLECTION_SORT_KEY]: { fields: [] }
              };
              if (collection.fields) {
                for (const field of collection.fields) {
                  if (field.indexed !== void 0 && field.indexed === false || field.type === "object") {
                    continue;
                  }
                  indexDefinitions[field.name] = {
                    fields: [
                      {
                        name: field.name,
                        type: field.type,
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
                      var _a;
                      return {
                        name: indexField.name,
                        type: (_a = collection.fields.find(
                          (field) => indexField.name === field.name
                        )) == null ? void 0 : _a.type
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
      var _a;
      await this.initLevel();
      const {
        first,
        after,
        last,
        before,
        sort = DEFAULT_COLLECTION_SORT_KEY,
        collection,
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
      const allIndexDefinitions = await this.getIndexDefinitions(this.level);
      const indexDefinitions = allIndexDefinitions == null ? void 0 : allIndexDefinitions[queryOptions.collection];
      if (!indexDefinitions) {
        throw new Error(
          `No indexDefinitions for collection ${queryOptions.collection}`
        );
      }
      const filterChain = coerceFilterChainOperands(rawFilterChain);
      const indexDefinition = sort && (indexDefinitions == null ? void 0 : indexDefinitions[sort]);
      const filterSuffixes = indexDefinition && makeFilterSuffixes(filterChain, indexDefinition);
      const rootLevel = this.level.sublevel(
        CONTENT_ROOT_PREFIX,
        SUBLEVEL_OPTIONS
      );
      const sublevel = indexDefinition ? this.level.sublevel(
        `${collection}${folder ? `_${folder === FOLDER_ROOT ? folder : import_js_sha12.default.hex(folder)}` : ""}`,
        SUBLEVEL_OPTIONS
      ).sublevel(sort, SUBLEVEL_OPTIONS) : rootLevel;
      if (!query.gt && !query.gte) {
        query.gte = (filterSuffixes == null ? void 0 : filterSuffixes.left) ? filterSuffixes.left : "";
      }
      if (!query.lt && !query.lte) {
        query.lte = (filterSuffixes == null ? void 0 : filterSuffixes.right) ? `${filterSuffixes.right}\uFFFF` : "\uFFFF";
      }
      let edges = [];
      let startKey = "";
      let endKey = "";
      let hasPreviousPage = false;
      let hasNextPage = false;
      const fieldsPattern = ((_a = indexDefinition == null ? void 0 : indexDefinition.fields) == null ? void 0 : _a.length) ? `${indexDefinition.fields.map((p) => `(?<${p.name}>.+)${INDEX_KEY_FIELD_SEPARATOR}`).join("")}` : "";
      const valuesRegex = indexDefinition ? new RegExp(`^${fieldsPattern}(?<_filepath_>.+)`) : new RegExp(`^(?<_filepath_>.+)`);
      const itemFilter = makeFilter({ filterChain });
      const iterator = sublevel.iterator(query);
      for await (const [key, value] of iterator) {
        const matcher = valuesRegex.exec(key);
        if (!matcher || indexDefinition && matcher.length !== indexDefinition.fields.length + 2) {
          continue;
        }
        const filepath = matcher.groups["_filepath_"];
        if (!itemFilter(
          filterSuffixes ? matcher.groups : indexDefinition ? await rootLevel.get(filepath) : value
        )) {
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
        edges = [...edges, { cursor: key, path: filepath }];
      }
      return {
        edges: await sequential(edges, async (edge) => {
          try {
            const node = await hydrator(edge.path);
            return {
              node,
              cursor: btoa(edge.cursor)
            };
          } catch (error) {
            console.log(error);
            if (error instanceof Error && (!edge.path.includes(".tina/__generated__/_graphql.json") || !edge.path.includes("tina/__generated__/_graphql.json"))) {
              throw new TinaQueryError({
                originalError: error,
                file: edge.path,
                collection,
                stack: error.stack
              });
            } else {
              throw error;
            }
          }
        }),
        pageInfo: {
          hasPreviousPage,
          hasNextPage,
          startCursor: btoa(startKey),
          endCursor: btoa(endKey)
        }
      };
    };
    this.putConfigFiles = async ({
      graphQLSchema,
      tinaSchema
    }) => {
      if (this.bridge && this.bridge.supportsBuilding()) {
        await this.bridge.putConfig(
          (0, import_schema_tools3.normalizePath)(import_path3.default.join(this.getGeneratedFolder(), `_graphql.json`)),
          JSON.stringify(graphQLSchema)
        );
        await this.bridge.putConfig(
          (0, import_schema_tools3.normalizePath)(import_path3.default.join(this.getGeneratedFolder(), `_schema.json`)),
          JSON.stringify(tinaSchema.schema)
        );
      }
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
          const lookup = lookupFromLockFile || JSON.parse(
            await this.bridge.get(
              (0, import_schema_tools3.normalizePath)(
                import_path3.default.join(this.getGeneratedFolder(), "_lookup.json")
              )
            )
          );
          let nextVersion;
          if (!this.config.version) {
            await this.level.clear();
            nextLevel = this.level;
          } else {
            const version = await this.getDatabaseVersion();
            nextVersion = version ? `${parseInt(version) + 1}` : "0";
            nextLevel = this.rootLevel.sublevel(nextVersion, SUBLEVEL_OPTIONS);
          }
          const contentRootLevel = nextLevel.sublevel(CONTENT_ROOT_PREFIX, SUBLEVEL_OPTIONS);
          await contentRootLevel.put(
            (0, import_schema_tools3.normalizePath)(import_path3.default.join(this.getGeneratedFolder(), "_graphql.json")),
            graphQLSchema
          );
          await contentRootLevel.put(
            (0, import_schema_tools3.normalizePath)(import_path3.default.join(this.getGeneratedFolder(), "_schema.json")),
            tinaSchema.schema
          );
          await contentRootLevel.put(
            (0, import_schema_tools3.normalizePath)(import_path3.default.join(this.getGeneratedFolder(), "_lookup.json")),
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
            if (this.level) {
              await this.level.clear();
            }
            this.level = nextLevel;
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
          await this.level.batch(operations.splice(0, 25));
        }
      };
      await this.indexStatusCallbackWrapper(async () => {
        const { pathsByCollection, nonCollectionPaths, collections } = await this.partitionPathsByCollection(documentPaths);
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
        await this.level.batch(operations.splice(0, 25));
      }
    };
    this.indexContentByPaths = async (documentPaths) => {
      await this.initLevel();
      const operations = [];
      const enqueueOps = async (ops) => {
        operations.push(...ops);
        while (operations.length >= 25) {
          await this.level.batch(operations.splice(0, 25));
        }
      };
      await this.indexStatusCallbackWrapper(async () => {
        const { pathsByCollection, nonCollectionPaths, collections } = await this.partitionPathsByCollection(documentPaths);
        for (const collection of Object.keys(pathsByCollection)) {
          await _indexContent(
            this,
            this.level,
            pathsByCollection[collection],
            enqueueOps,
            collections[collection]
          );
        }
        await _indexContent(this, this.level, nonCollectionPaths, enqueueOps);
      });
      while (operations.length) {
        await this.level.batch(operations.splice(0, 25));
      }
    };
    this.delete = async (filepath) => {
      await this.initLevel();
      const collection = await this.collectionForPath(filepath);
      let collectionIndexDefinitions;
      if (collection) {
        const indexDefinitions = await this.getIndexDefinitions(this.level);
        collectionIndexDefinitions = indexDefinitions == null ? void 0 : indexDefinitions[collection.name];
      }
      this.level.sublevel(
        CONTENT_ROOT_PREFIX,
        SUBLEVEL_OPTIONS
      );
      const itemKey = (0, import_schema_tools3.normalizePath)(filepath);
      const rootSublevel = this.level.sublevel(
        CONTENT_ROOT_PREFIX,
        SUBLEVEL_OPTIONS
      );
      const item = await rootSublevel.get(itemKey);
      if (item) {
        const folderTreeBuilder = new FolderTreeBuilder();
        const folderKey = folderTreeBuilder.update(
          filepath,
          collection.path || ""
        );
        await this.level.batch([
          ...makeIndexOpsForDocument(
            filepath,
            collection.name,
            collectionIndexDefinitions,
            item,
            "del",
            this.level
          ),
          ...makeIndexOpsForDocument(
            filepath,
            `${collection.name}_${folderKey}`,
            collectionIndexDefinitions,
            item,
            "del",
            this.level
          ),
          {
            type: "del",
            key: itemKey,
            sublevel: rootSublevel
          }
        ]);
      }
      if (this.bridge) {
        await this.bridge.delete((0, import_schema_tools3.normalizePath)(filepath));
      }
      await this.onDelete((0, import_schema_tools3.normalizePath)(filepath));
    };
    this._indexAllContent = async (level, schema) => {
      const warnings = [];
      const tinaSchema = await this.getSchema(level, schema);
      const operations = [];
      const enqueueOps = async (ops) => {
        operations.push(...ops);
        while (operations.length >= 25) {
          const batchOps = operations.splice(0, 25);
          await level.batch(batchOps);
        }
      };
      const filesSeen = /* @__PURE__ */ new Map();
      const duplicateFiles = /* @__PURE__ */ new Set();
      await sequential(tinaSchema.getCollections(), async (collection) => {
        const normalPath = (0, import_schema_tools3.normalizePath)(collection.path);
        const format = collection.format || "md";
        const documentPaths = await this.bridge.glob(normalPath, format);
        const matches = this.tinaSchema.getMatches({ collection });
        const filteredPaths = matches.length > 0 ? (0, import_micromatch.default)(documentPaths, matches) : documentPaths;
        filteredPaths.forEach((path5) => {
          if (filesSeen.has(path5)) {
            filesSeen.get(path5).push(collection.name);
            duplicateFiles.add(path5);
          } else {
            filesSeen.set(path5, [collection.name]);
          }
        });
        duplicateFiles.forEach((path5) => {
          warnings.push(
            `"${path5}" Found in multiple collections: ${filesSeen.get(path5).map((collection2) => `"${collection2}"`).join(
              ", "
            )}. This can cause unexpected behavior. We recommend updating the \`match\` property of those collections so that each file is in only one collection.
This will be an error in the future. See https://tina.io/docs/errors/file-in-mutpliple-collections/
`
          );
        });
        await _indexContent(this, level, filteredPaths, enqueueOps, collection);
      });
      while (operations.length) {
        await level.batch(operations.splice(0, 25));
      }
      return { warnings };
    };
    this.addToLookupMap = async (lookup) => {
      if (!this.bridge) {
        throw new Error("No bridge configured");
      }
      const lookupPath = import_path3.default.join(this.getGeneratedFolder(), `_lookup.json`);
      let lookupMap;
      try {
        lookupMap = JSON.parse(await this.bridge.get((0, import_schema_tools3.normalizePath)(lookupPath)));
      } catch (e) {
        lookupMap = {};
      }
      const updatedLookup = {
        ...lookupMap,
        [lookup.type]: lookup
      };
      await this.bridge.putConfig(
        (0, import_schema_tools3.normalizePath)(lookupPath),
        JSON.stringify(updatedLookup)
      );
    };
    this.tinaDirectory = config.tinaDirectory || ".tina";
    this.bridge = config.bridge;
    this.rootLevel = config.level && new LevelProxy(config.level);
    this.indexStatusCallback = config.indexStatusCallback || defaultStatusCallback;
    this.onPut = config.onPut || defaultOnPut;
    this.onDelete = config.onDelete || defaultOnDelete;
  }
  async partitionPathsByCollection(documentPaths) {
    const pathsByCollection = {};
    const nonCollectionPaths = [];
    const collections = {};
    for (const documentPath of documentPaths) {
      const collection = await this.collectionForPath(documentPath);
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
  }
  async updateDatabaseVersion(version) {
    const metadataLevel = this.rootLevel.sublevel("_metadata", SUBLEVEL_OPTIONS);
    await metadataLevel.put("metadata", { version });
  }
  async getDatabaseVersion() {
    const metadataLevel = this.rootLevel.sublevel("_metadata", SUBLEVEL_OPTIONS);
    const metadata = await metadataLevel.get("metadata");
    return metadata == null ? void 0 : metadata.version;
  }
  async initLevel() {
    if (this.level) {
      return;
    }
    if (!this.config.version) {
      this.level = this.rootLevel;
    } else {
      let version = await this.getDatabaseVersion();
      if (!version) {
        version = "";
        await this.updateDatabaseVersion(version);
      }
      this.level = this.rootLevel.sublevel(version, SUBLEVEL_OPTIONS);
    }
    if (!this.level) {
      throw new import_graphql5.GraphQLError("Error initializing LevelDB instance");
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
  clearCache() {
    this.tinaSchema = null;
    this._lookup = null;
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
function hasOwnProperty(obj, prop) {
  return obj.hasOwnProperty(prop);
}
var _indexContent = async (database, level, documentPaths, enqueueOps, collection) => {
  let collectionIndexDefinitions;
  let collectionPath;
  if (collection) {
    const indexDefinitions = await database.getIndexDefinitions(level);
    collectionIndexDefinitions = indexDefinitions == null ? void 0 : indexDefinitions[collection.name];
    if (!collectionIndexDefinitions) {
      throw new Error(`No indexDefinitions for collection ${collection.name}`);
    }
    collectionPath = collection.path;
  }
  const tinaSchema = await database.getSchema();
  let templateInfo = null;
  if (collection) {
    templateInfo = await tinaSchema.getTemplatesForCollectable(collection);
  }
  const folderTreeBuilder = new FolderTreeBuilder();
  await sequential(documentPaths, async (filepath) => {
    try {
      const dataString = await database.bridge.get((0, import_schema_tools3.normalizePath)(filepath));
      const data = parseFile(
        dataString,
        import_path3.default.extname(filepath),
        (yup3) => yup3.object({}),
        {
          frontmatterDelimiters: collection == null ? void 0 : collection.frontmatterDelimiters,
          frontmatterFormat: collection == null ? void 0 : collection.frontmatterFormat
        }
      );
      const template = getTemplateForFile(templateInfo, data);
      if (!template) {
        console.warn(
          `Document: ${filepath} has an ambiguous template, skipping from indexing`
        );
        return;
      }
      const normalizedPath = (0, import_schema_tools3.normalizePath)(filepath);
      const folderKey = folderTreeBuilder.update(
        normalizedPath,
        collectionPath || ""
      );
      const aliasedData = templateInfo ? replaceNameOverrides(template, data) : data;
      await enqueueOps([
        ...makeIndexOpsForDocument(
          normalizedPath,
          collection == null ? void 0 : collection.name,
          collectionIndexDefinitions,
          aliasedData,
          "put",
          level
        ),
        ...makeIndexOpsForDocument(
          normalizedPath,
          `${collection == null ? void 0 : collection.name}_${folderKey}`,
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
    } catch (error) {
      throw new TinaFetchError(`Unable to seed ${filepath}`, {
        originalError: error,
        file: filepath,
        collection: collection.name,
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
    const indexDefinitions = await database.getIndexDefinitions(database.level);
    collectionIndexDefinitions = indexDefinitions == null ? void 0 : indexDefinitions[collection.name];
    if (!collectionIndexDefinitions) {
      throw new Error(`No indexDefinitions for collection ${collection.name}`);
    }
  }
  const tinaSchema = await database.getSchema();
  let templateInfo = null;
  if (collection) {
    templateInfo = await tinaSchema.getTemplatesForCollectable(collection);
  }
  const rootLevel = database.level.sublevel(
    CONTENT_ROOT_PREFIX,
    SUBLEVEL_OPTIONS
  );
  const folderTreeBuilder = new FolderTreeBuilder();
  await sequential(documentPaths, async (filepath) => {
    const itemKey = (0, import_schema_tools3.normalizePath)(filepath);
    const item = await rootLevel.get(itemKey);
    if (item) {
      const folderKey = folderTreeBuilder.update(
        itemKey,
        (collection == null ? void 0 : collection.path) || ""
      );
      const aliasedData = templateInfo ? replaceNameOverrides(
        getTemplateForFile(templateInfo, item),
        item
      ) : item;
      await enqueueOps([
        ...makeIndexOpsForDocument(
          itemKey,
          collection.name,
          collectionIndexDefinitions,
          aliasedData,
          "del",
          database.level
        ),
        ...makeIndexOpsForDocument(
          itemKey,
          `${collection == null ? void 0 : collection.name}_${folderKey}`,
          collectionIndexDefinitions,
          aliasedData,
          "del",
          database.level
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
        database.level
      )
    );
  }
};
var getTemplateForFile = (templateInfo, data) => {
  if (templateInfo.type === "object") {
    return templateInfo.template;
  }
  if (templateInfo.type === "union") {
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

// src/level/tinaLevel.ts
var import_many_level = require("many-level");
var import_readable_stream = require("readable-stream");
var import_net = require("net");
var TinaLevelClient = class extends import_many_level.ManyLevelGuest {
  constructor(port) {
    super();
    this._connected = false;
    this.port = port || 9e3;
  }
  openConnection() {
    if (this._connected)
      return;
    const socket = (0, import_net.connect)(this.port);
    (0, import_readable_stream.pipeline)(socket, this.createRpcStream(), socket, () => {
      this._connected = false;
    });
    this._connected = true;
  }
};

// src/database/bridge/filesystem.ts
var import_fs_extra = __toESM(require("fs-extra"));
var import_fast_glob = __toESM(require("fast-glob"));
var import_path4 = __toESM(require("path"));
var import_normalize_path = __toESM(require("normalize-path"));
var FilesystemBridge = class {
  constructor(rootPath, outputPath) {
    this.rootPath = rootPath || "";
    this.outputPath = outputPath || rootPath;
  }
  async glob(pattern, extension) {
    const basePath = import_path4.default.join(this.outputPath, ...pattern.split("/"));
    const items = await (0, import_fast_glob.default)(
      import_path4.default.join(basePath, "**", `/*${extension}`).replace(/\\/g, "/"),
      {
        dot: true
      }
    );
    const posixRootPath = (0, import_normalize_path.default)(this.outputPath);
    return items.map((item) => {
      return item.replace(posixRootPath, "").replace(/^\/|\/$/g, "");
    });
  }
  supportsBuilding() {
    return true;
  }
  async delete(filepath) {
    await import_fs_extra.default.remove(import_path4.default.join(this.outputPath, filepath));
  }
  async get(filepath) {
    return import_fs_extra.default.readFileSync(import_path4.default.join(this.outputPath, filepath)).toString();
  }
  async putConfig(filepath, data) {
    if (this.rootPath !== this.outputPath) {
      await this.put(filepath, data);
      await this.put(filepath, data, this.rootPath);
    } else {
      await this.put(filepath, data);
    }
  }
  async put(filepath, data, basePathOverride) {
    const basePath = basePathOverride || this.outputPath;
    await import_fs_extra.default.outputFileSync(import_path4.default.join(basePath, filepath), data);
  }
};
var AuditFileSystemBridge = class extends FilesystemBridge {
  async put(filepath, data) {
    if ([
      ".tina/__generated__/_lookup.json",
      ".tina/__generated__/_schema.json",
      ".tina/__generated__/_graphql.json"
    ].includes(filepath)) {
      return super.put(filepath, data);
    }
    return;
  }
};

// src/database/bridge/isomorphic.ts
var import_isomorphic_git = __toESM(require("isomorphic-git"));
var import_fs_extra2 = __toESM(require("fs-extra"));
var import_glob_parent = __toESM(require("glob-parent"));
var import_normalize_path2 = __toESM(require("normalize-path"));
var import_graphql6 = require("graphql");
var import_path5 = require("path");
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
    fsModule = import_fs_extra2.default,
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
      dir: (0, import_normalize_path2.default)(this.gitRoot),
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
      timestamp: Math.round(new Date().getTime() / 1e3),
      timezoneOffset: 0
    };
  }
  getCommitter() {
    return {
      ...this.committer,
      timestamp: Math.round(new Date().getTime() / 1e3),
      timezoneOffset: 0
    };
  }
  async listEntries({
    pattern,
    entry,
    path: path5,
    results
  }) {
    const treeResult = await import_isomorphic_git.default.readTree({
      ...this.isomorphicConfig,
      oid: entry.oid,
      cache: this.cache
    });
    const children = [];
    for (const childEntry of treeResult.tree) {
      const childPath = path5 ? `${path5}/${childEntry.path}` : childEntry.path;
      if (childEntry.type === "tree") {
        children.push(childEntry);
      } else {
        if (childPath.startsWith(pattern)) {
          results.push(childPath);
        }
      }
    }
    for (const childEntry of children) {
      const childPath = path5 ? `${path5}/${childEntry.path}` : childEntry.path;
      await this.listEntries({
        pattern,
        entry: childEntry,
        path: childPath,
        results
      });
    }
  }
  async resolvePathEntries(path5, ref) {
    let pathParts = path5.split("/");
    const result = await import_isomorphic_git.default.walk({
      ...this.isomorphicConfig,
      map: async (filepath, [head]) => {
        if (head._fullpath === ".") {
          return head;
        }
        if (path5.startsWith(filepath)) {
          if ((0, import_path5.dirname)(path5) === (0, import_path5.dirname)(filepath)) {
            if (path5 === filepath) {
              return head;
            }
          } else {
            return head;
          }
        }
      },
      cache: this.cache,
      trees: [import_isomorphic_git.default.TREE({ ref })]
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
  async updateTreeHierarchy(existingOid, updatedOid, path5, type, pathEntries, pathParts) {
    const lastIdx = pathEntries.length - 1;
    const parentEntry = pathEntries[lastIdx];
    const parentPath = pathParts[lastIdx];
    let parentOid;
    let tree;
    const mode = type === "blob" ? "100644" : "040000";
    if (parentEntry) {
      parentOid = await parentEntry.oid();
      const treeResult = await import_isomorphic_git.default.readTree({
        ...this.isomorphicConfig,
        oid: parentOid,
        cache: this.cache
      });
      tree = existingOid ? treeResult.tree.map((entry) => {
        if (entry.path === path5) {
          entry.oid = updatedOid;
        }
        return entry;
      }) : [
        ...treeResult.tree,
        {
          oid: updatedOid,
          type,
          path: path5,
          mode
        }
      ];
    } else {
      tree = [
        {
          oid: updatedOid,
          type,
          path: path5,
          mode
        }
      ];
    }
    const updatedParentOid = await import_isomorphic_git.default.writeTree({
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
  async commitTree(treeSha, ref) {
    const commitSha = await import_isomorphic_git.default.writeCommit({
      ...this.isomorphicConfig,
      commit: {
        tree: treeSha,
        parent: [
          await import_isomorphic_git.default.resolveRef({
            ...this.isomorphicConfig,
            ref
          })
        ],
        message: this.commitMessage,
        author: this.getAuthor(),
        committer: this.getCommitter()
      }
    });
    await import_isomorphic_git.default.writeRef({
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
    const ref = await import_isomorphic_git.default.currentBranch({
      ...this.isomorphicConfig,
      fullname: true
    });
    if (!ref) {
      throw new import_graphql6.GraphQLError(
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
    const parent = (0, import_glob_parent.default)(this.qualifyPath(pattern));
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
      const treeResult = await import_isomorphic_git.default.readTree({
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
    return results.map((path5) => this.unqualifyPath(path5)).filter((path5) => path5.endsWith(extension));
  }
  supportsBuilding() {
    return true;
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
        const treeResult = await import_isomorphic_git.default.readTree({
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
        const updatedTreeOid = await import_isomorphic_git.default.writeTree({
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
        throw new import_graphql6.GraphQLError(
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
      await import_isomorphic_git.default.updateIndex({
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
    const oid = await import_isomorphic_git.default.resolveRef({
      ...this.isomorphicConfig,
      ref
    });
    const { blob } = await import_isomorphic_git.default.readBlob({
      ...this.isomorphicConfig,
      oid,
      filepath: this.qualifyPath(filepath),
      cache: this.cache
    });
    return Buffer.from(blob).toString("utf8");
  }
  async putConfig(filepath, data) {
    await this.put(filepath, data);
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
      const hash = await import_isomorphic_git.default.hashBlob({ object: blobUpdate });
      if (hash.oid === existingOid) {
        await this.onPut(filepath, data);
        return;
      }
    }
    const updatedOid = await import_isomorphic_git.default.writeBlob({
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
    await import_isomorphic_git.default.updateIndex({
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
var buildSchema = async (database, config, flags) => {
  return buildDotTinaFiles({
    database,
    config,
    flags
  });
};
var getASTSchema = async (database) => {
  const gqlAst = await database.getGraphQLSchemaFromBridge();
  return (0, import_graphql7.buildASTSchema)(gqlAst);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AuditFileSystemBridge,
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
  createDatabase,
  createSchema,
  getASTSchema,
  handleFetchErrorError,
  parseFile,
  resolve,
  sequential,
  stringifyFile
});
