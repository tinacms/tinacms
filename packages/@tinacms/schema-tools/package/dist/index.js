(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("micromatch"), require("yup"), require("url-pattern"), require("zod")) : typeof define === "function" && define.amd ? define(["exports", "micromatch", "yup", "url-pattern", "zod"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global["@tinacms/schema-tools"] = {}, global.NOOP, global.NOOP, global.NOOP, global.NOOP));
})(this, function(exports2, micromatch, yup, UrlPattern, z) {
  "use strict";
  function _interopDefaultLegacy(e) {
    return e && typeof e === "object" && "default" in e ? e : { "default": e };
  }
  function _interopNamespace(e) {
    if (e && e.__esModule)
      return e;
    var n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
    if (e) {
      Object.keys(e).forEach(function(k) {
        if (k !== "default") {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function() {
              return e[k];
            }
          });
        }
      });
    }
    n["default"] = e;
    return Object.freeze(n);
  }
  var micromatch__default = /* @__PURE__ */ _interopDefaultLegacy(micromatch);
  var yup__namespace = /* @__PURE__ */ _interopNamespace(yup);
  var UrlPattern__default = /* @__PURE__ */ _interopDefaultLegacy(UrlPattern);
  var z__default = /* @__PURE__ */ _interopDefaultLegacy(z);
  function addNamespaceToSchema(maybeNode, namespace = []) {
    if (typeof maybeNode === "string") {
      return maybeNode;
    }
    if (typeof maybeNode === "boolean") {
      return maybeNode;
    }
    if (typeof maybeNode === "function") {
      return maybeNode;
    }
    const newNode = { ...maybeNode };
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
  function assertShape(value, yupSchema, errorMessage) {
    const shape = yupSchema(yup__namespace);
    try {
      shape.validateSync(value);
    } catch (e) {
      const message = errorMessage || `Failed to assertShape - ${e.message}`;
      throw new Error(message);
    }
  }
  const lastItem = (arr) => {
    if (typeof arr === "undefined") {
      throw new Error("Can not call lastItem when arr is undefined");
    }
    return arr[arr.length - 1];
  };
  const capitalize = (s) => {
    if (typeof s !== "string")
      return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
  const generateNamespacedFieldName = (names, suffix = "") => {
    return (suffix ? [...names, suffix] : names).map(capitalize).join("");
  };
  const NAMER = {
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
    updateName: (namespace) => {
      return "update" + generateNamespacedFieldName(namespace, "Document");
    },
    createName: (namespace) => {
      return "create" + generateNamespacedFieldName(namespace, "Document");
    },
    queryName: (namespace) => {
      return "get" + generateNamespacedFieldName(namespace, "Document");
    },
    generateQueryListName: (namespace) => {
      return "get" + generateNamespacedFieldName(namespace, "List");
    },
    fragmentName: (namespace) => {
      return generateNamespacedFieldName(namespace, "") + "Parts";
    },
    collectionTypeName: (namespace) => {
      return generateNamespacedFieldName(namespace, "Collection");
    },
    documentTypeName: (namespace) => {
      return generateNamespacedFieldName(namespace, "Document");
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
  function findDuplicates(array = []) {
    const duplicates = [
      ...new Set(array.filter((item, index) => array.indexOf(item) !== index))
    ].map((x) => `"${x}"`);
    if (duplicates.length) {
      return duplicates.join(", ");
    } else
      return void 0;
  }
  const TINA_HOST = "content.tinajs.io";
  const parseURL = (url) => {
    if (url.startsWith("/")) {
      return {
        branch: null,
        isLocalClient: false,
        clientId: null,
        host: null
      };
    }
    if (url.includes("localhost")) {
      return {
        branch: null,
        isLocalClient: true,
        clientId: null,
        host: "localhost"
      };
    }
    const params = new URL(url);
    const isTinaCloud = params.host.includes("tinajs.dev") || params.host.includes("tina.io") || params.host.includes("tinajs.io");
    if (!isTinaCloud) {
      return {
        branch: null,
        isLocalClient: true,
        clientId: null,
        host: params.host
      };
    }
    const pattern = new UrlPattern__default["default"]("/:v/content/:clientId/github/*", {
      escapeChar: " ",
      segmentValueCharset: "a-zA-Z0-9-_~ %."
    });
    const result = pattern.match(params.pathname);
    const branch = result == null ? void 0 : result._;
    const clientId = result == null ? void 0 : result.clientId;
    if (!branch || !clientId) {
      throw new Error(`Invalid URL format provided. Expected: https://content.tinajs.io/<Version>/content/<ClientID>/github/<Branch> but but received ${url}`);
    }
    return {
      host: params.host,
      branch,
      clientId,
      isLocalClient: false
    };
  };
  const normalizePath = (filepath) => filepath.replace(/\\/g, "/");
  class TinaSchema {
    constructor(config) {
      this.config = config;
      this.getIsTitleFieldName = (collection) => {
        var _a;
        const col = this.getCollection(collection);
        const field = (_a = col == null ? void 0 : col.fields) == null ? void 0 : _a.find((x) => x.type === "string" && x.isTitle);
        return field == null ? void 0 : field.name;
      };
      this.getCollectionsByName = (collectionNames) => {
        return this.schema.collections.filter((collection) => collectionNames.includes(collection.name));
      };
      this.getCollection = (collectionName) => {
        const collection = this.schema.collections.find((collection2) => collection2.name === collectionName);
        if (!collection) {
          throw new Error(`Expected to find collection named ${collectionName}`);
        }
        const extraFields = {};
        const templateInfo = this.getTemplatesForCollectable(collection);
        switch (templateInfo.type) {
          case "object":
            extraFields["fields"] = templateInfo.template.fields;
            break;
          case "union":
            extraFields["templates"] = templateInfo.templates;
            break;
        }
        return {
          slug: collection.name,
          ...extraFields,
          ...collection,
          format: collection.format || "md"
        };
      };
      this.getCollections = () => {
        return this.schema.collections.map((collection) => this.getCollection(collection.name)) || [];
      };
      this.getCollectionByFullPath = (filepath) => {
        const fileExtension = filepath.split(".").pop();
        const possibleCollections = this.getCollections().filter((collection) => {
          var _a, _b;
          if (fileExtension !== (collection.format || "md")) {
            return false;
          }
          if (((_a = collection == null ? void 0 : collection.match) == null ? void 0 : _a.include) || ((_b = collection == null ? void 0 : collection.match) == null ? void 0 : _b.exclude)) {
            const matches = this.getMatches({ collection });
            const match = micromatch__default["default"]([filepath], matches).length > 0;
            if (!match) {
              return false;
            }
          }
          const path = collection.path ? collection.path.replace(/\/?$/, "/") : "";
          return filepath.replace(/\\/g, "/").startsWith(path);
        });
        if (possibleCollections.length === 0) {
          throw new Error(`Unable to find collection for file at ${filepath}`);
        }
        if (possibleCollections.length === 1) {
          return possibleCollections[0];
        }
        if (possibleCollections.length > 1) {
          const longestMatch = possibleCollections.reduce((acc, collection) => {
            if (collection.path.length > acc.path.length) {
              return collection;
            }
            return acc;
          });
          return longestMatch;
        }
      };
      this.getCollectionAndTemplateByFullPath = (filepath, templateName) => {
        let template;
        const collection = this.getCollectionByFullPath(filepath);
        const templates = this.getTemplatesForCollectable(collection);
        if (templates.type === "union") {
          if (templateName) {
            template = templates.templates.find((template2) => lastItem(template2.namespace) === templateName);
            if (!template) {
              throw new Error(`Unable to determine template for item at ${filepath}`);
            }
          } else {
            throw new Error(`Unable to determine template for item at ${filepath}, no template name provided for collection with multiple templates`);
          }
        }
        if (templates.type === "object") {
          template = templates.template;
        }
        if (!template) {
          throw new Error(`Something went wrong while trying to determine template for ${filepath}`);
        }
        return { collection, template };
      };
      this.getTemplateForData = ({
        data,
        collection
      }) => {
        const templateInfo = this.getTemplatesForCollectable(collection);
        switch (templateInfo.type) {
          case "object":
            return templateInfo.template;
          case "union":
            assertShape(data, (yup2) => yup2.object({ _template: yup2.string().required() }));
            const template = templateInfo.templates.find((template2) => template2.namespace[template2.namespace.length - 1] === data._template);
            if (!template) {
              throw new Error(`Expected to find template named '${data._template}' for collection '${lastItem(collection.namespace)}'`);
            }
            return template;
        }
      };
      this.transformPayload = (collectionName, payload) => {
        const collection = this.getCollection(collectionName);
        if (collection.templates) {
          const template = collection.templates.find((template2) => {
            if (typeof template2 === "string") {
              throw new Error("Global templates not supported");
            }
            return payload["_template"] === template2.name;
          });
          if (!template) {
            console.error(payload);
            throw new Error(`Unable to find template for payload`);
          }
          if (typeof template === "string") {
            throw new Error("Global templates not supported");
          }
          return {
            [collectionName]: {
              [template.name]: this.transformCollectablePayload(payload, template)
            }
          };
        } else {
          return {
            [collectionName]: this.transformCollectablePayload(payload, collection)
          };
        }
      };
      this.transformCollectablePayload = (payload, collection) => {
        const accumulator = {};
        Object.entries(payload).forEach(([key, value]) => {
          if (typeof collection.fields === "string") {
            throw new Error("Global templates not supported");
          }
          const field = collection.fields.find((field2) => {
            if (typeof field2 === "string") {
              throw new Error("Global templates not supported");
            }
            return field2.name === key;
          });
          if (field) {
            accumulator[key] = this.transformField(field, value);
          }
        });
        return accumulator;
      };
      this.transformField = (field, value) => {
        if (field.type === "object")
          if (field.templates) {
            if (field.list) {
              assertShape(value, (yup2) => yup2.array(yup2.object({ _template: yup2.string().required() })));
              return value.map((item) => {
                const { _template, ...rest } = item;
                const template = field.templates.find((template2) => {
                  if (typeof template2 === "string") {
                    return false;
                  }
                  return template2.name === _template;
                });
                if (typeof template === "string") {
                  throw new Error("Global templates not supported");
                }
                return {
                  [_template]: this.transformCollectablePayload(rest, template)
                };
              });
            } else {
              assertShape(value, (yup2) => yup2.object({ _template: yup2.string().required() }));
              const { _template, ...rest } = value;
              return { [_template]: this.transformCollectablePayload(rest, field) };
            }
          } else {
            if (field.list) {
              assertShape(value, (yup2) => yup2.array(yup2.object()));
              return value.map((item) => {
                return this.transformCollectablePayload(item, field);
              });
            } else {
              assertShape(value, (yup2) => yup2.object());
              return this.transformCollectablePayload(value, field);
            }
          }
        else {
          return value;
        }
      };
      this.isMarkdownCollection = (collectionName) => {
        const collection = this.getCollection(collectionName);
        const format = collection.format;
        if (!format) {
          return true;
        }
        if (["markdown", "md"].includes(format)) {
          return true;
        }
        return false;
      };
      this.getTemplatesForCollectable = (collection) => {
        let extraFields = [];
        if (collection == null ? void 0 : collection.fields) {
          const template = collection;
          if (typeof template.fields === "string" || typeof template.fields === "undefined") {
            throw new Error("Exptected template to have fields but none were found");
          }
          return {
            namespace: collection.namespace,
            type: "object",
            template: {
              ...template,
              fields: [...template.fields, ...extraFields]
            }
          };
        } else {
          if (collection == null ? void 0 : collection.templates) {
            return {
              namespace: collection.namespace,
              type: "union",
              templates: collection.templates.map((templateOrTemplateString) => {
                const template = templateOrTemplateString;
                return {
                  ...template,
                  fields: [...template.fields, ...extraFields]
                };
              })
            };
          } else {
            throw new Error(`Expected either fields or templates array to be defined on collection ${collection.namespace.join("_")}`);
          }
        }
      };
      this.walkFields = (cb) => {
        const walk = (collectionOrObject, collection, path) => {
          if (collectionOrObject.templates) {
            collectionOrObject.templates.forEach((template) => {
              template.fields.forEach((field) => {
                cb({ field, collection, path: [...path, template.name] });
              });
            });
          }
          if (collectionOrObject.fields) {
            collectionOrObject.fields.forEach((field) => {
              cb({ field, collection, path: [...path, field.name] });
              if (field.type === "rich-text" || field.type === "object") {
                walk(field, collection, [...path, field.name]);
              }
            });
          }
        };
        const collections = this.getCollections();
        collections.forEach((collection) => walk(collection, collection, []));
      };
      this.schema = config;
      this.walkFields(({ field, collection, path }) => {
        var _a;
        if (field.type === "rich-text") {
          if (field.parser) {
            return;
          }
          if (collection.format === "mdx") {
            field.parser = { type: "mdx" };
          } else {
            (_a = field.templates) == null ? void 0 : _a.forEach((template) => {
              if (!template.match) {
                console.warn(`WARNING: Found rich-text template at ${collection.name}.${path.join(".")} with no matches property.
Visit https://tina.io/docs/reference/types/rich-text/#custom-shortcode-syntax to learn more
                `);
              }
            });
            field.parser = { type: "markdown" };
          }
        }
      });
    }
    getMatches({
      collection: collectionOrString
    }) {
      var _a, _b;
      const collection = typeof collectionOrString === "string" ? this.getCollection(collectionOrString) : collectionOrString;
      const normalPath = normalizePath(collection.path);
      const pathSuffix = normalPath ? "/" : "";
      const format = collection.format || "md";
      const matches = [];
      if ((_a = collection == null ? void 0 : collection.match) == null ? void 0 : _a.include) {
        const match = `${normalPath}${pathSuffix}${collection.match.include}.${format}`;
        matches.push(match);
      }
      if ((_b = collection == null ? void 0 : collection.match) == null ? void 0 : _b.exclude) {
        const exclude = `!(${normalPath}${pathSuffix}${collection.match.exclude}.${format})`;
        matches.push(exclude);
      }
      return matches;
    }
    matchFiles({
      collection,
      files
    }) {
      const matches = this.getMatches({ collection });
      const matchedFiles = micromatch__default["default"](files, matches);
      return matchedFiles;
    }
  }
  const resolveField = (field, schema) => {
    var _a;
    const extraFields = field.ui || {};
    switch (field.type) {
      case "number":
        return {
          component: "number",
          ...field,
          ...extraFields
        };
      case "datetime":
        return {
          component: "date",
          ...field,
          ...extraFields
        };
      case "boolean":
        return {
          component: "toggle",
          ...field,
          ...extraFields
        };
      case "image":
        if (field.list) {
          return {
            component: "list",
            field: {
              component: "image"
            },
            ...field,
            ...extraFields
          };
        }
        return {
          component: "image",
          clearable: true,
          ...field,
          ...extraFields
        };
      case "string":
        if (field.options) {
          if (field.list) {
            return {
              component: "checkbox-group",
              ...field,
              ...extraFields,
              options: field.options
            };
          }
          if (field.options[0] && typeof field.options[0] === "object" && field.options[0].icon) {
            return {
              component: "button-toggle",
              ...field,
              ...extraFields,
              options: field.options
            };
          }
          return {
            component: "select",
            ...field,
            ...extraFields,
            options: field.ui && field.ui.component !== "select" ? field.options : [{ label: `Choose an option`, value: "" }, ...field.options]
          };
        }
        if (field.list) {
          return {
            component: "list",
            field: {
              component: "text"
            },
            ...field,
            ...extraFields
          };
        }
        return {
          component: "text",
          ...field,
          ...extraFields
        };
      case "object":
        const templateInfo = schema.getTemplatesForCollectable(field);
        if (templateInfo.type === "object") {
          return {
            ...field,
            component: field.list ? "group-list" : "group",
            fields: templateInfo.template.fields.map((field2) => resolveField(field2, schema)),
            ...extraFields
          };
        } else if (templateInfo.type === "union") {
          const templates2 = {};
          const typeMap2 = {};
          templateInfo.templates.forEach((template) => {
            const extraFields2 = template.ui || {};
            const templateName = lastItem(template.namespace);
            typeMap2[templateName] = NAMER.dataTypeName(template.namespace);
            templates2[lastItem(template.namespace)] = {
              label: template.label || templateName,
              key: templateName,
              namespace: [...field.namespace, templateName],
              fields: template.fields.map((field2) => resolveField(field2, schema)),
              ...extraFields2
            };
            return true;
          });
          return {
            ...field,
            typeMap: typeMap2,
            namespace: field.namespace,
            component: field.list ? "blocks" : "not-implemented",
            templates: templates2,
            ...extraFields
          };
        } else {
          throw new Error(`Unknown object for resolveField function`);
        }
      case "rich-text":
        const templates = {};
        (_a = field.templates) == null ? void 0 : _a.forEach((template) => {
          if (typeof template === "string") {
            throw new Error(`Global templates not yet supported for rich-text`);
          } else {
            const extraFields2 = template.ui || {};
            const templateName = lastItem(template.namespace);
            NAMER.dataTypeName(template.namespace);
            templates[lastItem(template.namespace)] = {
              label: template.label || templateName,
              key: templateName,
              inline: template.inline,
              name: templateName,
              match: template.match,
              fields: template.fields.map((field2) => resolveField(field2, schema)),
              ...extraFields2
            };
            return true;
          }
        });
        return {
          ...field,
          templates: Object.values(templates),
          component: "rich-text",
          ...extraFields
        };
      case "reference":
        return {
          ...field,
          component: "reference",
          ...extraFields
        };
      default:
        throw new Error(`Unknown field type ${field.type}`);
    }
  };
  const resolveForm = ({
    collection,
    basename,
    template,
    schema
  }) => {
    return {
      id: basename,
      label: collection.label,
      name: basename,
      fields: template.fields.map((field) => {
        return resolveField(field, schema);
      })
    };
  };
  const parseZodError = ({ zodError }) => {
    var _a, _b, _c, _d;
    const errors = zodError.flatten((issue) => {
      const moreInfo = [];
      if (issue.code === "invalid_union") {
        issue.unionErrors.map((unionError) => {
          moreInfo.push(parseZodError({ zodError: unionError }));
        });
      }
      const errorMessage = `Error ${issue == null ? void 0 : issue.message} at path ${issue.path.join(".")}`;
      const errorMessages = [errorMessage, ...moreInfo];
      return {
        errors: errorMessages
      };
    });
    const formErrors = errors.formErrors.flatMap((x) => x.errors);
    const parsedErrors = [
      ...((_b = (_a = errors.fieldErrors) == null ? void 0 : _a.collections) == null ? void 0 : _b.flatMap((x) => x.errors)) || [],
      ...((_d = (_c = errors.fieldErrors) == null ? void 0 : _c.config) == null ? void 0 : _d.flatMap((x) => x.errors)) || [],
      ...formErrors
    ];
    return parsedErrors;
  };
  const name = z.z.string({
    required_error: "Name is required but not provided",
    invalid_type_error: "Name must be a string"
  }).superRefine((val, ctx) => {
    if (val.match(/^[a-zA-Z0-9_]*$/) === null) {
      ctx.addIssue({
        code: "custom",
        message: `name, "${val}" must be alphanumeric and can only contain underscores. (No spaces, dashes, special characters, etc.)
If you only want to display this value in the CMS UI, you can use the label property to customize it.

If you need to use this value in your content you can use the \`nameOverride\` property to customize the value. For example:
\`\`\`
{
  "name": ${val.replace(/[^a-zA-Z0-9]/g, "_")},
  "nameOverride": ${val},
  // ...
}
\`\`\``
      });
    }
  });
  const TypeName = [
    "string",
    "boolean",
    "number",
    "datetime",
    "image",
    "object",
    "reference",
    "rich-text"
  ];
  const typeTypeError = `type must be one of ${TypeName.join(", ")}`;
  const typeRequiredError = `type is required and must be one of ${TypeName.join(", ")}`;
  const Option = z.z.union([
    z.z.string(),
    z.z.object({ label: z.z.string(), value: z.z.string() }),
    z.z.object({ icon: z.z.any(), value: z.z.string() })
  ], {
    errorMap: () => {
      return {
        message: "Invalid option array. Must be a string[] or {label: string, value: string}[] or {icon: React.ComponentType<any>, value: string}[]"
      };
    }
  });
  const TinaField = z.z.object({
    name,
    label: z.z.string().or(z.z.boolean()).optional(),
    description: z.z.string().optional(),
    required: z.z.boolean().optional()
  });
  const FieldWithList = TinaField.extend({ list: z.z.boolean().optional() });
  const TinaScalerBase = FieldWithList.extend({
    options: z.z.array(Option).optional()
  });
  const StringField = TinaScalerBase.extend({
    type: z.z.literal("string", {
      invalid_type_error: typeTypeError,
      required_error: typeRequiredError
    }),
    isTitle: z.z.boolean().optional()
  });
  const BooleanField = TinaScalerBase.extend({
    type: z.z.literal("boolean", {
      invalid_type_error: typeTypeError,
      required_error: typeRequiredError
    })
  });
  const NumberField = TinaScalerBase.extend({
    type: z.z.literal("number", {
      invalid_type_error: typeTypeError,
      required_error: typeRequiredError
    })
  });
  const ImageField = TinaScalerBase.extend({
    type: z.z.literal("image", {
      invalid_type_error: typeTypeError,
      required_error: typeRequiredError
    })
  });
  const DateTimeField = TinaScalerBase.extend({
    type: z.z.literal("datetime", {
      invalid_type_error: typeTypeError,
      required_error: typeRequiredError
    }),
    dateFormat: z.z.string().optional(),
    timeFormat: z.z.string().optional()
  });
  const ReferenceField = FieldWithList.extend({
    type: z.z.literal("reference", {
      invalid_type_error: typeTypeError,
      required_error: typeRequiredError
    })
  });
  const TinaFieldZod = z.z.lazy(() => {
    const TemplateTemp = z.z.object({
      label: z.z.string().optional(),
      name,
      fields: z.z.array(TinaFieldZod),
      match: z.z.object({
        start: z.z.string(),
        end: z.z.string(),
        name: z.z.string().optional()
      }).optional()
    }).superRefine((val, ctx) => {
      const dups = findDuplicates(val == null ? void 0 : val.fields.map((x) => x.name));
      if (dups) {
        ctx.addIssue({
          code: z.z.ZodIssueCode.custom,
          message: `Fields must have a unique name, duplicate field names: ${dups}`
        });
      }
    });
    const ObjectField = FieldWithList.extend({
      type: z.z.literal("object", {
        invalid_type_error: typeTypeError,
        required_error: typeRequiredError
      }),
      fields: z.z.array(TinaFieldZod).min(1).optional().superRefine((val, ctx) => {
        const dups = findDuplicates(val == null ? void 0 : val.map((x) => x.name));
        if (dups) {
          ctx.addIssue({
            code: z.z.ZodIssueCode.custom,
            message: `Fields must have a unique name, duplicate field names: ${dups}`
          });
        }
      }),
      templates: z.z.array(TemplateTemp).min(1).optional().superRefine((val, ctx) => {
        const dups = findDuplicates(val == null ? void 0 : val.map((x) => x.name));
        if (dups) {
          ctx.addIssue({
            code: z.z.ZodIssueCode.custom,
            message: `Templates must have a unique name, duplicate template names: ${dups}`
          });
        }
      })
    });
    const RichTextField = FieldWithList.extend({
      type: z.z.literal("rich-text", {
        invalid_type_error: typeTypeError,
        required_error: typeRequiredError
      }),
      templates: z.z.array(TemplateTemp).optional().superRefine((val, ctx) => {
        const dups = findDuplicates(val == null ? void 0 : val.map((x) => x.name));
        if (dups) {
          ctx.addIssue({
            code: z.z.ZodIssueCode.custom,
            message: `Templates must have a unique name, duplicate template names: ${dups}`
          });
        }
      })
    });
    return z.z.discriminatedUnion("type", [
      StringField,
      BooleanField,
      NumberField,
      ImageField,
      DateTimeField,
      ReferenceField,
      ObjectField,
      RichTextField
    ], {
      errorMap: (issue, ctx) => {
        var _a;
        if (issue.code === "invalid_union_discriminator") {
          return {
            message: `Invalid \`type\` property. In the schema is 'type: ${(_a = ctx.data) == null ? void 0 : _a.type}' and expected one of ${TypeName.join(", ")}`
          };
        }
        return {
          message: issue.message
        };
      }
    }).superRefine((val, ctx) => {
      if (val.type === "string") {
        if (val.isTitle) {
          if (val.list) {
            ctx.addIssue({
              code: z.z.ZodIssueCode.custom,
              message: `Can not have \`list: true\` when using \`isTitle\`. Error in value 
${JSON.stringify(val, null, 2)}
`
            });
          }
          if (!val.required) {
            ctx.addIssue({
              code: z.z.ZodIssueCode.custom,
              message: `Must have { required: true } when using \`isTitle\` Error in value 
${JSON.stringify(val, null, 2)}
`
            });
          }
        }
      }
      if (val.type === "object") {
        const message = "Must provide one of templates or fields in your collection";
        let isValid = Boolean(val == null ? void 0 : val.templates) || Boolean(val == null ? void 0 : val.fields);
        if (!isValid) {
          ctx.addIssue({
            code: z.z.ZodIssueCode.custom,
            message
          });
          return false;
        } else {
          isValid = !((val == null ? void 0 : val.templates) && (val == null ? void 0 : val.fields));
          if (!isValid) {
            ctx.addIssue({
              code: z.z.ZodIssueCode.custom,
              message
            });
          }
          return isValid;
        }
      }
      return true;
    });
  });
  const tinaConfigKey = z__default["default"].object({
    publicFolder: z__default["default"].string(),
    mediaRoot: z__default["default"].string()
  }).strict().optional();
  const tinaConfigZod = z__default["default"].object({
    client: z__default["default"].object({ referenceDepth: z__default["default"].number().optional() }).optional(),
    media: z__default["default"].object({
      tina: tinaConfigKey,
      loadCustomStore: z__default["default"].function().optional()
    }).optional()
  });
  const validateTinaCloudSchemaConfig = (config) => {
    const newConfig = tinaConfigZod.parse(config);
    return newConfig;
  };
  const FORMATS = [
    "json",
    "md",
    "markdown",
    "mdx",
    "toml",
    "yaml",
    "yml"
  ];
  const Template = z.z.object({
    label: z.z.string({
      invalid_type_error: "label must be a string",
      required_error: "label was not provided but is required"
    }),
    name,
    fields: z.z.array(TinaFieldZod)
  }).superRefine((val, ctx) => {
    var _a;
    const dups = findDuplicates((_a = val.fields) == null ? void 0 : _a.map((x) => x.name));
    if (dups) {
      ctx.addIssue({
        code: z.z.ZodIssueCode.custom,
        message: `Fields must have a unique name, duplicate field names: ${dups}`
      });
    }
  });
  const CollectionBaseSchema = z.z.object({
    label: z.z.string().optional(),
    name: name.superRefine((val, ctx) => {
      if (val === "relativePath") {
        ctx.addIssue({
          code: z.z.ZodIssueCode.custom,
          message: `name cannot be 'relativePath'. 'relativePath' is a reserved field name.`
        });
      }
    }),
    path: z.z.string().transform((val) => val.replace(/^\/|\/$/g, "")).superRefine((val, ctx) => {
      if (val === ".") {
        ctx.addIssue({
          code: z.z.ZodIssueCode.custom,
          message: `path cannot be '.'. Please use '/' or '' instead. `
        });
      }
    }),
    format: z.z.enum(FORMATS).optional()
  });
  const TinaCloudCollection = CollectionBaseSchema.extend({
    fields: z.z.array(TinaFieldZod).min(1).optional().superRefine((val, ctx) => {
      const dups = findDuplicates(val == null ? void 0 : val.map((x) => x.name));
      if (dups) {
        ctx.addIssue({
          code: z.z.ZodIssueCode.custom,
          message: `Fields must have a unique name, duplicate field names: ${dups}`
        });
      }
    }).refine((val) => {
      const arr = (val == null ? void 0 : val.filter((x) => x.type === "string" && x.isTitle)) || [];
      return arr.length < 2;
    }, {
      message: "Fields can only have one use of `isTitle`"
    }),
    templates: z.z.array(Template).min(1).optional().superRefine((val, ctx) => {
      const dups = findDuplicates(val == null ? void 0 : val.map((x) => x.name));
      if (dups) {
        ctx.addIssue({
          code: z.z.ZodIssueCode.custom,
          message: `Templates must have a unique name, duplicate template names: ${dups}`
        });
      }
    })
  }).refine((val) => {
    let isValid = Boolean(val == null ? void 0 : val.templates) || Boolean(val == null ? void 0 : val.fields);
    if (!isValid) {
      return false;
    } else {
      isValid = !((val == null ? void 0 : val.templates) && (val == null ? void 0 : val.fields));
      return isValid;
    }
  }, { message: "Must provide one of templates or fields in your collection" });
  const TinaCloudSchemaZod = z.z.object({
    collections: z.z.array(TinaCloudCollection),
    config: tinaConfigZod.optional()
  }).superRefine((val, ctx) => {
    var _a, _b;
    const dups = findDuplicates((_a = val.collections) == null ? void 0 : _a.map((x) => x.name));
    if (dups) {
      ctx.addIssue({
        code: z.z.ZodIssueCode.custom,
        message: `${dups} are duplicate names in your collections. Collection names must be unique.`,
        fatal: true
      });
    }
    const media = (_b = val == null ? void 0 : val.config) == null ? void 0 : _b.media;
    if (media && media.tina && media.loadCustomStore) {
      ctx.addIssue({
        code: z.z.ZodIssueCode.custom,
        message: "can not have both loadCustomStore and tina. Must use one or the other",
        fatal: true,
        path: ["config", "media"]
      });
    }
  });
  class TinaSchemaValidationError extends Error {
    constructor(message) {
      super(message);
      this.name = "TinaSchemaValidationError";
    }
  }
  const validateSchema = ({ schema }) => {
    try {
      TinaCloudSchemaZod.parse(schema);
    } catch (e) {
      if (e instanceof z.ZodError) {
        const errors = parseZodError({ zodError: e });
        throw new TinaSchemaValidationError(errors.join(", \n"));
      } else {
        throw new Error(e);
      }
    }
  };
  exports2.NAMER = NAMER;
  exports2.TINA_HOST = TINA_HOST;
  exports2.TinaSchema = TinaSchema;
  exports2.TinaSchemaValidationError = TinaSchemaValidationError;
  exports2.addNamespaceToSchema = addNamespaceToSchema;
  exports2.normalizePath = normalizePath;
  exports2.parseURL = parseURL;
  exports2.resolveField = resolveField;
  exports2.resolveForm = resolveForm;
  exports2.validateSchema = validateSchema;
  exports2.validateTinaCloudSchemaConfig = validateTinaCloudSchemaConfig;
  Object.defineProperties(exports2, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
});
