var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
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
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var import_clipanion8 = require("clipanion");

// package.json
var version = "1.9.8";

// src/next/commands/dev-command/index.ts
var import_path5 = __toESM(require("path"));
var import_graphql10 = require("@tinacms/graphql");
var import_search = require("@tinacms/search");
var import_async_lock = __toESM(require("async-lock"));
var import_chokidar = __toESM(require("chokidar"));
var import_clipanion2 = require("clipanion");
var import_fs_extra6 = __toESM(require("fs-extra"));

// src/logger/index.ts
var import_chalk = __toESM(require("chalk"));

// src/logger/is-unicode-supported.ts
function isUnicodeSupported() {
  if (process.platform !== "win32") {
    return process.env.TERM !== "linux";
  }
  return Boolean(process.env.CI) || Boolean(process.env.WT_SESSION) || // Windows Terminal
  Boolean(process.env.TERMINUS_SUBLIME) || // Terminus (<0.2.27)
  process.env.ConEmuTask === "{cmd::Cmder}" || // ConEmu and cmder
  process.env.TERM_PROGRAM === "Terminus-Sublime" || process.env.TERM_PROGRAM === "vscode" || process.env.TERM === "xterm-256color" || process.env.TERM === "alacritty" || process.env.TERMINAL_EMULATOR === "JetBrains-JediTerm";
}

// src/logger/index.ts
var import_log4js = __toESM(require("log4js"));
var logger = import_log4js.default.getLogger();
import_log4js.default.configure({
  appenders: {
    out: { type: "stdout", layout: { type: "messagePassThrough" } }
  },
  categories: { default: { appenders: ["out"], level: "info" } }
});
logger.level = "info";
function ansiRegex() {
  const pattern = [
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))"
  ].join("|");
  return new RegExp(pattern, "g");
}
var bar = "\u2502";
var strip = (str) => str.replace(ansiRegex(), "");
var note = (message = "", title = "") => {
  const lines = `
${message}
`.split("\n");
  const len = lines.reduce((sum, ln) => {
    ln = strip(ln);
    return ln.length > sum ? ln.length : sum;
  }, 0) + 2;
  const msg = lines.map(
    (ln) => `${import_chalk.default.gray(bar)}  ${import_chalk.default.white(ln)}${" ".repeat(
      len - strip(ln).length
    )}${import_chalk.default.gray(bar)}`
  ).join("\n");
  const underscoreLen = len - title.length - 1 > 0 ? len - title.length - 1 : 0;
  process.stdout.write(
    `${import_chalk.default.gray(bar)}
${import_chalk.default.green("\u25CB")}  ${import_chalk.default.reset(
      title
    )} ${import_chalk.default.gray("\u2500".repeat(underscoreLen) + "\u256E")}
${msg}
${import_chalk.default.gray(
      "\u251C" + "\u2500".repeat(len + 2) + "\u256F"
    )}
`
  );
};
var summary = (content) => {
  const outString = [];
  let longestKey = 0;
  content.items.forEach((item) => {
    item.subItems.forEach((subItem) => {
      if (subItem.key.length > longestKey) {
        longestKey = subItem.key.length;
      }
    });
  });
  content.items.forEach((item) => {
    outString.push(`${item.emoji} ${import_chalk.default.cyan(item.heading)}`);
    item.subItems.forEach((subItem) => {
      const spaces = longestKey - subItem.key.length + 4;
      outString.push(
        `   ${subItem.key}:${[...Array(spaces)].join(" ")}${import_chalk.default.cyan(
          subItem.value
        )}`
      );
    });
    outString.push(``);
  });
  if (process.env.CI) {
    logger.info(JSON.stringify(content, null, 2));
  } else {
    note(outString.join("\n"), content.heading);
  }
};
var unicode = isUnicodeSupported();
var s = (c, fallback) => unicode ? c : fallback;
var S_STEP_ACTIVE = s("\u25C6", "*");
var S_STEP_CANCEL = s("\u25A0", "x");
var S_STEP_ERROR = s("\u25B2", "x");
var S_STEP_SUBMIT = s("\u25C7", "o");
var S_BAR_START = s("\u250C", "T");
var S_BAR = s("\u2502", "|");
var S_BAR_END = s("\u2514", "\u2014");
var S_RADIO_ACTIVE = s("\u25CF", ">");
var S_RADIO_INACTIVE = s("\u25CB", " ");
var S_CHECKBOX_ACTIVE = s("\u25FB", "[\u2022]");
var S_CHECKBOX_SELECTED = s("\u25FC", "[+]");
var S_CHECKBOX_INACTIVE = s("\u25FB", "[ ]");
var S_PASSWORD_MASK = s("\u25AA", "\u2022");
var S_BAR_H = s("\u2500", "-");
var S_CORNER_TOP_RIGHT = s("\u256E", "+");
var S_CONNECT_LEFT = s("\u251C", "+");
var S_CORNER_BOTTOM_RIGHT = s("\u256F", "+");
var S_INFO = s("\u25CF", "\u2022");
var S_SUCCESS = s("\u25C6", "*");
var S_WARN = s("\u25B2", "!");
var S_ERROR = s("\u25A0", "x");

// src/utils/spinner.ts
var import_cli_spinner = require("cli-spinner");
async function localSpin({
  waitFor,
  text
}) {
  const spinner = new import_cli_spinner.Spinner({
    text: `${text} %s`,
    stream: process.stderr,
    onTick: function(msg) {
      this.clearLine(this.stream);
      this.stream.write(msg);
    }
  });
  spinner.setSpinnerString("\u280B\u2819\u2839\u2838\u283C\u2834\u2826\u2827\u2807\u280F");
  spinner.start();
  const res = await waitFor();
  spinner.stop();
  console.log("");
  return res;
}
function spin({
  waitFor,
  text
}) {
  if (process.env.CI) {
    console.log(text);
    return waitFor();
  } else {
    return localSpin({
      text,
      waitFor
    });
  }
}

// src/utils/theme.ts
var import_chalk2 = __toESM(require("chalk"));
var successText = import_chalk2.default.bold.green;
var focusText = import_chalk2.default.bold;
var dangerText = import_chalk2.default.bold.red;
var neutralText = import_chalk2.default.bold.cyan;
var linkText = import_chalk2.default.bold.cyan;
var labelText = import_chalk2.default.bold;
var cmdText = import_chalk2.default.inverse;
var indentedCmd = (str) => {
  return `  \u2503 ` + str;
};
var indentText = (str) => {
  return String(str).split("\n").map((line) => `   ${line}`).join("\n");
};
var logText = import_chalk2.default.italic.gray;
var warnText = import_chalk2.default.yellowBright.bgBlack;
var titleText = import_chalk2.default.bgHex("d2f1f8").hex("ec4816");
var CONFIRMATION_TEXT = import_chalk2.default.dim("enter to confirm");

// src/next/codegen/index.ts
var import_fs_extra = __toESM(require("fs-extra"));
var import_path = __toESM(require("path"));
var import_graphql5 = require("graphql");

// src/next/codegen/codegen/index.ts
var import_graphql4 = require("graphql");

// src/next/codegen/codegen/plugin.ts
var AddGeneratedClientFunc = (apiURL) => {
  return (_schema, _documents, _config, _info) => {
    return `
// TinaSDK generated code
import { createClient, TinaClient } from "tinacms/dist/client";

const generateRequester = (
  client: TinaClient,
) => {
  const requester: (
    doc: any,
    vars?: any,
    options?: {
      branch?: string,
      /**
       * Aside from \`method\` and \`body\`, all fetch options are passed
       * through to underlying fetch request
       */
      fetchOptions?: Omit<Parameters<typeof fetch>[1], 'body' | 'method'>,
    },
    client
  ) => Promise<any> = async (doc, vars, options) => {
    let url = client.apiUrl
    if (options?.branch) {
      const index = client.apiUrl.lastIndexOf('/')
      url = client.apiUrl.substring(0, index + 1) + options.branch
    }
    const data = await client.request({
      query: doc,
      variables: vars,
      url,
    }, options)

    return { data: data?.data, errors: data?.errors, query: doc, variables: vars || {} }
  }

  return requester
}

/**
 * @experimental this class can be used but may change in the future
 **/
export const ExperimentalGetTinaClient = () =>
  getSdk(
    generateRequester(
      createClient({
        url: "${apiURL}",
        queries,
      })
    )
  )

export const queries = (
  client: TinaClient,
) => {
  const requester = generateRequester(client)
  return getSdk(requester)
}
`;
  };
};
var AddGeneratedClient = (apiURL) => ({
  plugin: AddGeneratedClientFunc(apiURL)
});

// src/next/codegen/codegen/index.ts
var import_graphql_file_loader = require("@graphql-tools/graphql-file-loader");
var import_core = require("@graphql-codegen/core");
var import_load = require("@graphql-tools/load");
var import_typescript_operations = require("@graphql-codegen/typescript-operations");
var import_typescript = require("@graphql-codegen/typescript");

// src/next/codegen/codegen/sdkPlugin/index.ts
var import_graphql2 = require("graphql");
var import_graphql3 = require("graphql");

// src/next/codegen/codegen/sdkPlugin/visitor.ts
var import_visitor_plugin_common = require("@graphql-codegen/visitor-plugin-common");
var import_auto_bind = __toESM(require("auto-bind"));
var import_graphql = require("graphql");
var GenericSdkVisitor = class extends import_visitor_plugin_common.ClientSideBaseVisitor {
  constructor(schema, fragments, rawConfig) {
    super(schema, fragments, rawConfig, {
      usingObservableFrom: rawConfig.usingObservableFrom
    });
    this._operationsToInclude = [];
    (0, import_auto_bind.default)(this);
    if (this.config.usingObservableFrom) {
      this._additionalImports.push(this.config.usingObservableFrom);
    }
    if (this.config.documentMode !== import_visitor_plugin_common.DocumentMode.string) {
    }
  }
  buildOperation(node, documentVariableName, operationType, operationResultType, operationVariablesTypes) {
    if (node.name == null) {
      throw new Error(
        "Plugin 'generic-sdk' cannot generate SDK for unnamed operation.\n\n" + (0, import_graphql.print)(node)
      );
    } else {
      this._operationsToInclude.push({
        node,
        documentVariableName,
        operationType,
        // This is the only line that is different
        operationResultType: `{data: ${operationResultType}, errors?: { message: string, locations: { line: number, column: number }[], path: string[] }[], variables: ${operationVariablesTypes}, query: string}`,
        operationVariablesTypes
      });
    }
    return null;
  }
  get sdkContent() {
    const usingObservable = !!this.config.usingObservableFrom;
    const allPossibleActions = this._operationsToInclude.map((o) => {
      const optionalVariables = !o.node.variableDefinitions || o.node.variableDefinitions.length === 0 || o.node.variableDefinitions.every(
        (v) => v.type.kind !== import_graphql.Kind.NON_NULL_TYPE || v.defaultValue
      );
      const returnType = usingObservable && o.operationType === "Subscription" ? "Observable" : "Promise";
      return `${o.node.name.value}(variables${optionalVariables ? "?" : ""}: ${o.operationVariablesTypes}, options?: C): ${returnType}<${o.operationResultType}> {
    return requester<${o.operationResultType}, ${o.operationVariablesTypes}>(${o.documentVariableName}, variables, options);
  }`;
    }).map((s2) => (0, import_visitor_plugin_common.indentMultiline)(s2, 2));
    return `export type Requester<C= {}> = <R, V>(doc: ${this.config.documentMode === import_visitor_plugin_common.DocumentMode.string ? "string" : "DocumentNode"}, vars?: V, options?: C) => ${usingObservable ? "Promise<R> & Observable<R>" : "Promise<R>"}
  export function getSdk<C>(requester: Requester<C>) {
    return {
  ${allPossibleActions.join(",\n")}
    };
  }
  export type Sdk = ReturnType<typeof getSdk>;`;
  }
};

// src/next/codegen/codegen/sdkPlugin/index.ts
var plugin = (schema, documents, config2) => {
  const allAst = (0, import_graphql3.concatAST)(
    documents.reduce((prev, v) => {
      return [...prev, v.document];
    }, [])
  );
  const allFragments = [
    ...allAst.definitions.filter(
      (d) => d.kind === import_graphql3.Kind.FRAGMENT_DEFINITION
    ).map((fragmentDef) => ({
      node: fragmentDef,
      name: fragmentDef.name.value,
      onType: fragmentDef.typeCondition.name.value,
      isExternal: false
    })),
    ...config2.externalFragments || []
  ];
  const visitor = new GenericSdkVisitor(schema, allFragments, config2);
  const visitorResult = (0, import_graphql2.visit)(allAst, { leave: visitor });
  return {
    // We will take care of imports
    // prepend: visitor.getImports(),
    content: [
      visitor.fragments,
      ...visitorResult.definitions.filter((t) => typeof t === "string"),
      visitor.sdkContent
    ].join("\n")
  };
};

// src/next/codegen/codegen/index.ts
var generateTypes = async (schema, queryPathGlob = process.cwd(), fragDocPath = process.cwd(), apiURL) => {
  let docs = [];
  let fragDocs = [];
  docs = await loadGraphQLDocuments(queryPathGlob);
  fragDocs = await loadGraphQLDocuments(fragDocPath);
  const res = await (0, import_core.codegen)({
    // Filename is not used. This is because the typescript plugin returns a string instead of writing to a file.
    filename: process.cwd(),
    schema: (0, import_graphql4.parse)((0, import_graphql4.printSchema)(schema)),
    documents: [...docs, ...fragDocs],
    config: {},
    plugins: [
      { typescript: {} },
      { typescriptOperations: {} },
      {
        typescriptSdk: {}
      },
      { AddGeneratedClient: {} }
    ],
    pluginMap: {
      typescript: {
        plugin: import_typescript.plugin
      },
      typescriptOperations: {
        plugin: import_typescript_operations.plugin
      },
      typescriptSdk: {
        plugin
      },
      AddGeneratedClient: AddGeneratedClient(apiURL)
    }
  });
  return res;
};
var loadGraphQLDocuments = async (globPath) => {
  let result = [];
  try {
    result = await (0, import_load.loadDocuments)(globPath, {
      loaders: [new import_graphql_file_loader.GraphQLFileLoader()]
    });
  } catch (e) {
    if (
      // https://www.graphql-tools.com/docs/documents-loading#no-files-found
      (e.message || "").includes(
        "Unable to find any GraphQL type definitions for the following pointers:"
      )
    ) {
    } else {
      throw e;
    }
  }
  return result;
};

// src/next/codegen/index.ts
var import_esbuild = require("esbuild");
var import_graphql6 = require("@tinacms/graphql");
var import_normalize_path = __toESM(require("normalize-path"));
var TINA_HOST = "content.tinajs.io";
var Codegen = class {
  constructor({
    configManager,
    port,
    queryDoc,
    fragDoc,
    isLocal,
    graphqlSchemaDoc,
    tinaSchema,
    lookup,
    noClientBuildCache
  }) {
    this.isLocal = isLocal;
    this.graphqlSchemaDoc = graphqlSchemaDoc;
    this.configManager = configManager;
    this.port = port;
    this.schema = (0, import_graphql5.buildASTSchema)(graphqlSchemaDoc);
    this.tinaSchema = tinaSchema;
    this.queryDoc = queryDoc;
    this.fragDoc = fragDoc;
    this.lookup = lookup;
    this.noClientBuildCache = noClientBuildCache;
  }
  async writeConfigFile(fileName, data) {
    const filePath = import_path.default.join(
      this.configManager.generatedFolderPath,
      fileName
    );
    await import_fs_extra.default.ensureFile(filePath);
    await import_fs_extra.default.outputFile(filePath, data);
    if (this.configManager.hasSeparateContentRoot()) {
      const filePath2 = import_path.default.join(
        this.configManager.generatedFolderPathContentRepo,
        fileName
      );
      await import_fs_extra.default.ensureFile(filePath2);
      await import_fs_extra.default.outputFile(filePath2, data);
    }
  }
  async removeGeneratedFilesIfExists() {
    await unlinkIfExists(this.configManager.generatedClientJSFilePath);
    await unlinkIfExists(this.configManager.generatedTypesDFilePath);
    await unlinkIfExists(this.configManager.generatedTypesJSFilePath);
    await unlinkIfExists(this.configManager.generatedTypesTSFilePath);
    await unlinkIfExists(this.configManager.generatedClientTSFilePath);
    await unlinkIfExists(this.configManager.generatedQueriesFilePath);
    await unlinkIfExists(this.configManager.generatedFragmentsFilePath);
  }
  async execute() {
    await this.writeConfigFile(
      "_graphql.json",
      JSON.stringify(this.graphqlSchemaDoc)
    );
    const { search, ...rest } = this.tinaSchema.schema.config;
    this.tinaSchema.schema.config = rest;
    await this.writeConfigFile(
      "_schema.json",
      JSON.stringify(this.tinaSchema.schema)
    );
    await this.writeConfigFile("_lookup.json", JSON.stringify(this.lookup));
    const { apiURL, localUrl, tinaCloudUrl } = this._createApiUrl();
    this.apiURL = apiURL;
    this.localUrl = localUrl;
    this.productionUrl = tinaCloudUrl;
    if (this.configManager.shouldSkipSDK()) {
      await this.removeGeneratedFilesIfExists();
      return apiURL;
    }
    await import_fs_extra.default.outputFile(
      this.configManager.generatedQueriesFilePath,
      this.queryDoc
    );
    await import_fs_extra.default.outputFile(
      this.configManager.generatedFragmentsFilePath,
      this.fragDoc
    );
    await maybeWarnFragmentSize(this.configManager.generatedFragmentsFilePath);
    const { clientString } = await this.genClient();
    const databaseClientString = this.configManager.hasSelfHostedConfig() ? await this.genDatabaseClient() : "";
    const { codeString, schemaString } = await this.genTypes();
    await import_fs_extra.default.outputFile(
      this.configManager.generatedGraphQLGQLPath,
      schemaString
    );
    if (this.configManager.isUsingTs()) {
      await import_fs_extra.default.outputFile(
        this.configManager.generatedTypesTSFilePath,
        codeString
      );
      await import_fs_extra.default.outputFile(
        this.configManager.generatedClientTSFilePath,
        clientString
      );
      if (this.configManager.hasSelfHostedConfig()) {
        await import_fs_extra.default.outputFile(
          this.configManager.generatedDatabaseClientTSFilePath,
          databaseClientString
        );
      }
      await unlinkIfExists(this.configManager.generatedClientJSFilePath);
      await unlinkIfExists(this.configManager.generatedTypesDFilePath);
      await unlinkIfExists(this.configManager.generatedTypesJSFilePath);
    } else {
      await import_fs_extra.default.outputFile(
        this.configManager.generatedTypesDFilePath,
        codeString
      );
      const jsTypes = await (0, import_esbuild.transform)(codeString, { loader: "ts" });
      await import_fs_extra.default.outputFile(
        this.configManager.generatedTypesJSFilePath,
        jsTypes.code
      );
      await import_fs_extra.default.outputFile(
        this.configManager.generatedClientDFilePath,
        clientString
      );
      const jsClient = await (0, import_esbuild.transform)(clientString, { loader: "ts" });
      await import_fs_extra.default.outputFile(
        this.configManager.generatedClientJSFilePath,
        jsClient.code
      );
      await unlinkIfExists(this.configManager.generatedTypesTSFilePath);
      await unlinkIfExists(this.configManager.generatedClientTSFilePath);
      if (this.configManager.hasSelfHostedConfig()) {
        const jsDatabaseClient = await (0, import_esbuild.transform)(databaseClientString, {
          loader: "ts"
        });
        await import_fs_extra.default.outputFile(
          this.configManager.generatedDatabaseClientJSFilePath,
          jsDatabaseClient.code
        );
        await import_fs_extra.default.outputFile(
          this.configManager.generatedDatabaseClientDFilePath,
          databaseClientString
        );
        await unlinkIfExists(
          this.configManager.generatedDatabaseClientTSFilePath
        );
      }
    }
    return apiURL;
  }
  _createApiUrl() {
    const branch = this.configManager.config?.branch;
    const clientId = this.configManager.config?.clientId;
    const token = this.configManager.config?.token;
    const fullVersion = this.configManager.getTinaGraphQLVersion();
    const version2 = `${fullVersion.major}.${fullVersion.minor}`;
    const baseUrl = this.configManager.config.tinaioConfig?.contentApiUrlOverride || `https://${TINA_HOST}`;
    if ((!branch || !clientId || !token) && !this.port && !this.configManager.config.contentApiUrlOverride) {
      const missing = [];
      if (!branch) missing.push("branch");
      if (!clientId) missing.push("clientId");
      if (!token) missing.push("token");
      throw new Error(
        `Client not configured properly. Missing ${missing.join(
          ", "
        )}. Please visit https://tina.io/docs/tina-cloud/overview for more information`
      );
    }
    let localUrl = `http://localhost:${this.port}/graphql`;
    let tinaCloudUrl = `${baseUrl}/${version2}/content/${clientId}/github/${branch}`;
    let apiURL = this.isLocal ? `http://localhost:${this.port}/graphql` : `${baseUrl}/${version2}/content/${clientId}/github/${branch}`;
    if (this.configManager.config.contentApiUrlOverride) {
      apiURL = this.configManager.config.contentApiUrlOverride;
      localUrl = apiURL;
      tinaCloudUrl = apiURL;
    }
    return { apiURL, localUrl, tinaCloudUrl };
  }
  getApiURL() {
    if (!this.apiURL)
      throw new Error("apiURL not set. Please run execute() first");
    return this.apiURL;
  }
  async genDatabaseClient() {
    const authCollection = this.tinaSchema.getCollections().find((c) => c.isAuthCollection);
    let authFields = [];
    if (authCollection) {
      const usersFields = (0, import_graphql6.mapUserFields)(authCollection, []);
      if (usersFields.length === 0) {
        throw new Error("No user field found");
      }
      if (usersFields.length > 1) {
        throw new Error("Only one user field is allowed");
      }
      authFields = usersFields[0]?.collectable?.fields.map((f) => {
        if (f.type !== "password" && f.type !== "object") {
          if (f.uid) {
            return `id:${f.name}`;
          } else {
            return `${f.name}`;
          }
        } else if (f.type === "password") {
          return `_password: ${f.name} { passwordChangeRequired }`;
        }
      });
    }
    return `// @ts-nocheck
import { resolve } from "@tinacms/datalayer";
import type { TinaClient } from "tinacms/dist/client";

import { queries } from "./types";
import database from "../database";

export async function databaseRequest({ query, variables, user }) {
  const result = await resolve({
    config: {
      useRelativeMedia: true,
    },
    database,
    query,
    variables,
    verbose: true,
    ctxUser: user,
  });

  return result;
}

export async function authenticate({ username, password }) {
    return databaseRequest({
      query: \`query auth($username:String!, $password:String!) {
              authenticate(sub:$username, password:$password) {
               ${authFields.join(" ")}
              }
            }\`,
      variables: { username, password },
    })
}

export async function authorize(user: { sub: string }) {
  return databaseRequest({
    query: \`query authz { authorize { ${authFields.join(" ")}} }\`,
    variables: {},
    user
  })
}

function createDatabaseClient<GenQueries = Record<string, unknown>>({
  queries,
}: {
  queries: (client: {
    request: TinaClient<GenQueries>["request"];
  }) => GenQueries;
}) {
  const request = async ({ query, variables, user }) => {
    const data = await databaseRequest({ query, variables, user });
    return { data: data.data as any, query, variables, errors: data.errors || null };
  };
  const q = queries({
    request,
  });
  return { queries: q, request, authenticate, authorize };
}

export const databaseClient = createDatabaseClient({ queries });

export const client = databaseClient;

export default databaseClient;
`;
  }
  async genClient() {
    const token = this.configManager.config?.token;
    const errorPolicy = this.configManager.config?.client?.errorPolicy;
    const apiURL = this.getApiURL();
    const clientString = `import { createClient } from "tinacms/dist/client";
import { queries } from "./types";
export const client = createClient({ ${this.noClientBuildCache === false ? `cacheDir: '${(0, import_normalize_path.default)(
      this.configManager.generatedCachePath
    )}', ` : ""}url: '${apiURL}', token: '${token}', queries, ${errorPolicy ? `errorPolicy: '${errorPolicy}'` : ""} });
export default client;
  `;
    return { apiURL, clientString };
  }
  async genTypes() {
    const typescriptTypes = await generateTypes(
      this.schema,
      this.configManager.userQueriesAndFragmentsGlob,
      this.configManager.generatedQueriesAndFragmentsGlob,
      this.getApiURL()
    );
    const codeString = `//@ts-nocheck
  // DO NOT MODIFY THIS FILE. This file is automatically generated by Tina
  export function gql(strings: TemplateStringsArray, ...args: string[]): string {
    let str = ''
    strings.forEach((string, i) => {
      str += string + (args[i] || '')
    })
    return str
  }
  ${typescriptTypes}
  `;
    const schemaString = `# DO NOT MODIFY THIS FILE. This file is automatically generated by Tina
${(0, import_graphql5.printSchema)(this.schema)}
schema {
  query: Query
  mutation: Mutation
}
`;
    return { codeString, schemaString };
  }
};
var maybeWarnFragmentSize = async (filepath) => {
  if (
    // is the file bigger than 100kb?
    (await import_fs_extra.default.stat(filepath)).size > // convert to 100 kb to bytes
    100 * 1024
  ) {
    console.warn(
      "Warning: frags.gql is very large (>100kb). Consider setting the reference depth to 1 or 0. See code snippet below."
    );
    console.log(
      `const schema = defineSchema({
          client: {
              referenceDepth: 1,
          },
        // ...
    })`
    );
  }
};
var unlinkIfExists = async (filepath) => {
  if (import_fs_extra.default.existsSync(filepath)) {
    import_fs_extra.default.unlinkSync(filepath);
  }
};

// src/next/config-manager.ts
var import_fs_extra2 = __toESM(require("fs-extra"));
var import_path2 = __toESM(require("path"));
var import_os = __toESM(require("os"));
var esbuild = __toESM(require("esbuild"));
var dotenv = __toESM(require("dotenv"));
var import_normalize_path2 = __toESM(require("normalize-path"));
var import_chalk3 = __toESM(require("chalk"));
var TINA_FOLDER = "tina";
var LEGACY_TINA_FOLDER = ".tina";
var GENERATED_FOLDER = "__generated__";
var GRAPHQL_JSON_FILE = "_graphql.json";
var GRAPHQL_GQL_FILE = "schema.gql";
var SCHEMA_JSON_FILE = "_schema.json";
var LOOKUP_JSON_FILE = "_lookup.json";
var ConfigManager = class {
  constructor({
    rootPath = process.cwd(),
    tinaGraphQLVersion,
    legacyNoSDK
  }) {
    this.rootPath = (0, import_normalize_path2.default)(rootPath);
    this.tinaGraphQLVersionFromCLI = tinaGraphQLVersion;
    this.legacyNoSDK = legacyNoSDK;
  }
  isUsingTs() {
    return [".ts", ".tsx"].includes(import_path2.default.extname(this.tinaConfigFilePath));
  }
  hasSelfHostedConfig() {
    return !!this.selfHostedDatabaseFilePath;
  }
  hasSeparateContentRoot() {
    return this.rootPath !== this.contentRootPath;
  }
  shouldSkipSDK() {
    if (this.legacyNoSDK) {
      return this.legacyNoSDK;
    }
    return this.config.client?.skip || false;
  }
  async processConfig() {
    this.tinaFolderPath = await this.getTinaFolderPath(this.rootPath);
    this.envFilePath = import_path2.default.resolve(
      import_path2.default.join(this.tinaFolderPath, "..", ".env")
    );
    dotenv.config({ path: this.envFilePath });
    this.tinaConfigFilePath = await this.getPathWithExtension(
      import_path2.default.join(this.tinaFolderPath, "config")
    );
    if (!this.tinaConfigFilePath) {
      throw new Error(
        `Unable to find config file in ${this.tinaFolderPath}. Looking for a file named "config.{ts,tsx,js,jsx}"`
      );
    }
    this.selfHostedDatabaseFilePath = await this.getPathWithExtension(
      import_path2.default.join(this.tinaFolderPath, "database")
    );
    this.generatedFolderPath = import_path2.default.join(this.tinaFolderPath, GENERATED_FOLDER);
    this.generatedCachePath = import_path2.default.join(
      this.generatedFolderPath,
      ".cache",
      String((/* @__PURE__ */ new Date()).getTime())
    );
    this.generatedGraphQLGQLPath = import_path2.default.join(
      this.generatedFolderPath,
      GRAPHQL_GQL_FILE
    );
    this.generatedGraphQLJSONPath = import_path2.default.join(
      this.generatedFolderPath,
      GRAPHQL_JSON_FILE
    );
    this.generatedSchemaJSONPath = import_path2.default.join(
      this.generatedFolderPath,
      SCHEMA_JSON_FILE
    );
    this.generatedLookupJSONPath = import_path2.default.join(
      this.generatedFolderPath,
      LOOKUP_JSON_FILE
    );
    this.generatedQueriesFilePath = import_path2.default.join(
      this.generatedFolderPath,
      "queries.gql"
    );
    this.generatedFragmentsFilePath = import_path2.default.join(
      this.generatedFolderPath,
      "frags.gql"
    );
    this.generatedTypesTSFilePath = import_path2.default.join(
      this.generatedFolderPath,
      "types.ts"
    );
    this.generatedTypesJSFilePath = import_path2.default.join(
      this.generatedFolderPath,
      "types.js"
    );
    this.generatedTypesDFilePath = import_path2.default.join(
      this.generatedFolderPath,
      "types.d.ts"
    );
    this.userQueriesAndFragmentsGlob = import_path2.default.join(
      this.tinaFolderPath,
      "queries/**/*.{graphql,gql}"
    );
    this.generatedQueriesAndFragmentsGlob = import_path2.default.join(
      this.generatedFolderPath,
      "*.{graphql,gql}"
    );
    this.generatedClientTSFilePath = import_path2.default.join(
      this.generatedFolderPath,
      "client.ts"
    );
    this.generatedClientJSFilePath = import_path2.default.join(
      this.generatedFolderPath,
      "client.js"
    );
    this.generatedClientDFilePath = import_path2.default.join(
      this.generatedFolderPath,
      "client.d.ts"
    );
    this.generatedDatabaseClientDFilePath = import_path2.default.join(
      this.generatedFolderPath,
      "databaseClient.d.ts"
    );
    this.generatedDatabaseClientTSFilePath = import_path2.default.join(
      this.generatedFolderPath,
      "databaseClient.ts"
    );
    this.generatedDatabaseClientJSFilePath = import_path2.default.join(
      this.generatedFolderPath,
      "databaseClient.js"
    );
    const clientExists = this.isUsingTs() ? await import_fs_extra2.default.pathExists(this.generatedClientTSFilePath) : await import_fs_extra2.default.pathExists(this.generatedClientJSFilePath);
    if (!clientExists) {
      const file = "export default ()=>({})\nexport const client = ()=>({})";
      if (this.isUsingTs()) {
        await import_fs_extra2.default.outputFile(this.generatedClientTSFilePath, file);
      } else {
        await import_fs_extra2.default.outputFile(this.generatedClientJSFilePath, file);
      }
    }
    const { config: config2, prebuildPath, watchList } = await this.loadConfigFile(
      this.generatedFolderPath,
      this.tinaConfigFilePath
    );
    this.watchList = watchList;
    this.config = config2;
    this.prebuildFilePath = prebuildPath;
    this.publicFolderPath = import_path2.default.join(
      this.rootPath,
      this.config.build.publicFolder
    );
    this.outputFolderPath = import_path2.default.join(
      this.publicFolderPath,
      this.config.build.outputFolder
    );
    this.outputHTMLFilePath = import_path2.default.join(this.outputFolderPath, "index.html");
    this.outputGitignorePath = import_path2.default.join(this.outputFolderPath, ".gitignore");
    const fullLocalContentPath = import_path2.default.join(
      this.tinaFolderPath,
      this.config.localContentPath || ""
    );
    if (this.config.localContentPath) {
      const localContentPathExists = await import_fs_extra2.default.pathExists(fullLocalContentPath);
      if (localContentPathExists) {
        logger.info(`Using separate content repo at ${fullLocalContentPath}`);
        this.contentRootPath = fullLocalContentPath;
      } else {
        logger.warn(
          `${import_chalk3.default.yellow("Warning:")} The localContentPath ${import_chalk3.default.cyan(
            fullLocalContentPath
          )} does not exist. Please create it or remove the localContentPath from your config file at ${import_chalk3.default.cyan(
            this.tinaConfigFilePath
          )}`
        );
      }
    }
    if (!this.contentRootPath) {
      this.contentRootPath = this.rootPath;
    }
    this.generatedFolderPathContentRepo = import_path2.default.join(
      await this.getTinaFolderPath(this.contentRootPath),
      GENERATED_FOLDER
    );
    this.spaMainPath = require.resolve("@tinacms/app");
    this.spaRootPath = import_path2.default.join(this.spaMainPath, "..", "..");
  }
  async getTinaFolderPath(rootPath) {
    const tinaFolderPath = import_path2.default.join(rootPath, TINA_FOLDER);
    const tinaFolderExists = await import_fs_extra2.default.pathExists(tinaFolderPath);
    if (tinaFolderExists) {
      this.isUsingLegacyFolder = false;
      return tinaFolderPath;
    }
    const legacyFolderPath = import_path2.default.join(rootPath, LEGACY_TINA_FOLDER);
    const legacyFolderExists = await import_fs_extra2.default.pathExists(legacyFolderPath);
    if (legacyFolderExists) {
      this.isUsingLegacyFolder = true;
      return legacyFolderPath;
    }
    throw new Error(
      `Unable to find Tina folder, if you're working in folder outside of the Tina config be sure to specify --rootPath`
    );
  }
  getTinaGraphQLVersion() {
    if (this.tinaGraphQLVersionFromCLI) {
      const version2 = this.tinaGraphQLVersionFromCLI.split(".");
      return {
        fullVersion: this.tinaGraphQLVersionFromCLI,
        major: version2[0] || "x",
        minor: version2[1] || "x",
        patch: version2[2] || "x"
      };
    }
    const generatedSchema = import_fs_extra2.default.readJSONSync(this.generatedSchemaJSONPath);
    if (!generatedSchema || !(typeof generatedSchema?.version !== "undefined")) {
      throw new Error(
        `Can not find Tina GraphQL version in ${this.generatedSchemaJSONPath}`
      );
    }
    return generatedSchema.version;
  }
  printGeneratedClientFilePath() {
    if (this.isUsingTs()) {
      return this.generatedClientTSFilePath.replace(`${this.rootPath}/`, "");
    }
    return this.generatedClientJSFilePath.replace(`${this.rootPath}/`, "");
  }
  printGeneratedTypesFilePath() {
    return this.generatedTypesTSFilePath.replace(`${this.rootPath}/`, "");
  }
  printoutputHTMLFilePath() {
    return this.outputHTMLFilePath.replace(`${this.publicFolderPath}/`, "");
  }
  printRelativePath(filename) {
    if (filename) {
      return filename.replace(/\\/g, "/").replace(`${this.rootPath}/`, "");
    }
    throw `No path provided to print`;
  }
  printPrebuildFilePath() {
    return this.prebuildFilePath.replace(/\\/g, "/").replace(`${this.rootPath}/${this.tinaFolderPath}/`, "");
  }
  printContentRelativePath(filename) {
    if (filename) {
      return filename.replace(/\\/g, "/").replace(`${this.contentRootPath}/`, "");
    }
    throw `No path provided to print`;
  }
  /**
   * Given a filepath without an extension, find the first match (eg. tsx, ts, jsx, js)
   */
  async getPathWithExtension(filepath) {
    const extensions = ["tsx", "ts", "jsx", "js"];
    let result;
    await Promise.all(
      extensions.map(async (ext) => {
        if (result) {
          return;
        }
        const filepathWithExtension = `${filepath}.${ext}`;
        const exists = import_fs_extra2.default.existsSync(filepathWithExtension);
        if (exists) {
          result = filepathWithExtension;
        }
      })
    );
    return result;
  }
  async loadDatabaseFile() {
    const tmpdir = import_path2.default.join(import_os.default.tmpdir(), Date.now().toString());
    const outfile = import_path2.default.join(tmpdir, "database.build.js");
    await esbuild.build({
      entryPoints: [this.selfHostedDatabaseFilePath],
      bundle: true,
      platform: "node",
      outfile,
      loader: loaders
    });
    const result = require(outfile);
    import_fs_extra2.default.removeSync(outfile);
    return result.default;
  }
  async loadConfigFile(generatedFolderPath, configFilePath) {
    const tmpdir = import_path2.default.join(import_os.default.tmpdir(), Date.now().toString());
    const preBuildConfigPath = import_path2.default.join(
      this.generatedFolderPath,
      "config.prebuild.jsx"
    );
    const outfile = import_path2.default.join(tmpdir, "config.build.jsx");
    const outfile2 = import_path2.default.join(tmpdir, "config.build.js");
    const tempTSConfigFile = import_path2.default.join(tmpdir, "tsconfig.json");
    import_fs_extra2.default.outputFileSync(tempTSConfigFile, "{}");
    const result2 = await esbuild.build({
      entryPoints: [configFilePath],
      bundle: true,
      target: ["es2020"],
      platform: "browser",
      format: "esm",
      logLevel: "silent",
      packages: "external",
      ignoreAnnotations: true,
      outfile: preBuildConfigPath,
      loader: loaders,
      metafile: true
    });
    const flattenedList = [];
    Object.keys(result2.metafile.inputs).forEach((key) => {
      if (key.includes("node_modules") || key.includes("__generated__")) {
        return;
      }
      flattenedList.push(key);
    });
    await esbuild.build({
      entryPoints: [configFilePath],
      bundle: true,
      target: ["es2020"],
      logLevel: "silent",
      platform: "node",
      outfile,
      loader: loaders
    });
    await esbuild.build({
      entryPoints: [outfile],
      bundle: true,
      // Suppress warning about comparison with -0 from client module
      logLevel: "silent",
      platform: "node",
      outfile: outfile2,
      loader: loaders
    });
    let result;
    try {
      result = require(outfile2);
    } catch (e) {
      console.error("Unexpected error loading config");
      console.error(e);
      throw e;
    }
    import_fs_extra2.default.removeSync(outfile);
    import_fs_extra2.default.removeSync(outfile2);
    return {
      config: result.default,
      prebuildPath: preBuildConfigPath,
      watchList: flattenedList
    };
  }
};
var loaders = {
  ".aac": "file",
  ".css": "file",
  ".eot": "file",
  ".flac": "file",
  ".gif": "file",
  ".jpeg": "file",
  ".jpg": "file",
  ".json": "json",
  ".mp3": "file",
  ".mp4": "file",
  ".ogg": "file",
  ".otf": "file",
  ".png": "file",
  ".svg": "file",
  ".ttf": "file",
  ".wav": "file",
  ".webm": "file",
  ".webp": "file",
  ".woff": "file",
  ".woff2": "file",
  ".js": "jsx",
  ".jsx": "jsx",
  ".tsx": "tsx"
};

// src/next/database.ts
var import_graphql7 = require("@tinacms/graphql");
var import_readable_stream = require("readable-stream");
var import_net = require("net");
var import_many_level = require("many-level");
var import_memory_level = require("memory-level");
var createDBServer = (port) => {
  const levelHost = new import_many_level.ManyLevelHost(
    // @ts-ignore
    new import_memory_level.MemoryLevel({
      valueEncoding: "json"
    })
  );
  const dbServer = (0, import_net.createServer)(function(socket) {
    return (0, import_readable_stream.pipeline)(socket, levelHost.createRpcStream(), socket, () => {
    });
  });
  dbServer.once("error", (err) => {
    if (err?.code === "EADDRINUSE") {
      throw new Error(
        `Tina Dev server is already in use. Datalayer server is busy on port ${port}`
      );
    }
  });
  dbServer.listen(port);
};
async function createAndInitializeDatabase(configManager, datalayerPort, bridgeOverride) {
  let database;
  const bridge = bridgeOverride || new import_graphql7.FilesystemBridge(configManager.rootPath, configManager.contentRootPath);
  if (configManager.hasSelfHostedConfig() && configManager.config.contentApiUrlOverride) {
    database = await configManager.loadDatabaseFile();
    database.bridge = bridge;
  } else {
    if (configManager.hasSelfHostedConfig() && !configManager.config.contentApiUrlOverride) {
      logger.warn(
        `Found a database config file at ${configManager.printRelativePath(
          configManager.selfHostedDatabaseFilePath
        )} but there was no "contentApiUrlOverride" set. Falling back to built-in datalayer`
      );
    }
    const level = new import_graphql7.TinaLevelClient(datalayerPort);
    level.openConnection();
    database = (0, import_graphql7.createDatabaseInternal)({
      bridge,
      level,
      tinaDirectory: configManager.isUsingLegacyFolder ? LEGACY_TINA_FOLDER : TINA_FOLDER
    });
  }
  return database;
}

// src/next/commands/baseCommands.ts
var import_clipanion = require("clipanion");
var import_chalk4 = __toESM(require("chalk"));

// src/utils/start-subprocess.ts
var import_child_process = __toESM(require("child_process"));
var startSubprocess2 = async ({ command: command2 }) => {
  if (typeof command2 === "string") {
    const commands = command2.split(" ");
    const firstCommand = commands[0];
    const args = commands.slice(1) || [];
    const ps = import_child_process.default.spawn(firstCommand, args, {
      stdio: "inherit",
      shell: true
    });
    ps.on("error", (code) => {
      logger.error(
        dangerText(
          `An error has occurred in the Next.js child process. Error message below`
        )
      );
      logger.error(`name: ${code.name}
message: ${code.message}

stack: ${code.stack || "No stack was provided"}`);
    });
    ps.on("close", (code) => {
      logger.info(`child process exited with code ${code}`);
      process.exit(code);
    });
    return ps;
  }
};

// src/next/commands/baseCommands.ts
var import_graphql8 = require("@tinacms/graphql");
var import_fs_extra3 = __toESM(require("fs-extra"));
var BaseCommand = class extends import_clipanion.Command {
  constructor() {
    super(...arguments);
    this.experimentalDataLayer = import_clipanion.Option.Boolean("--experimentalData", {
      description: "DEPRECATED - Build the server with additional data querying capabilities"
    });
    this.isomorphicGitBridge = import_clipanion.Option.Boolean("--isomorphicGitBridge", {
      description: "DEPRECATED - Enable Isomorphic Git Bridge Implementation"
    });
    this.port = import_clipanion.Option.String("-p,--port", "4001", {
      description: "Specify a port to run the server on. (default 4001)"
    });
    this.datalayerPort = import_clipanion.Option.String("--datalayer-port", "9000", {
      description: "Specify a port to run the datalayer server on. (default 9000)"
    });
    this.subCommand = import_clipanion.Option.String("-c,--command", {
      description: "The sub-command to run"
    });
    this.rootPath = import_clipanion.Option.String("--rootPath", {
      description: "Specify the root directory to run the CLI from (defaults to current working directory)"
    });
    this.verbose = import_clipanion.Option.Boolean("-v,--verbose", false, {
      description: "increase verbosity of logged output"
    });
    this.noSDK = import_clipanion.Option.Boolean("--noSDK", false, {
      description: "DEPRECATED - This should now be set in the config at client.skip = true'. Don't generate the generated client SDK"
    });
    this.noTelemetry = import_clipanion.Option.Boolean("--noTelemetry", false, {
      description: "Disable anonymous telemetry that is collected"
    });
  }
  async startSubCommand() {
    let subProc;
    if (this.subCommand) {
      subProc = await startSubprocess2({ command: this.subCommand });
      logger.info(
        `Running web application with command: ${import_chalk4.default.cyan(this.subCommand)}`
      );
    }
    function exitHandler(options, exitCode) {
      if (subProc) {
        subProc.kill();
      }
      process.exit();
    }
    process.on("exit", exitHandler);
    process.on("SIGINT", exitHandler);
    process.on("SIGUSR1", exitHandler);
    process.on("SIGUSR2", exitHandler);
    process.on("uncaughtException", (error) => {
      logger.error(`Uncaught exception ${error.name}`);
      console.error(error);
    });
  }
  logDeprecationWarnings() {
    if (this.isomorphicGitBridge) {
      logger.warn("--isomorphicGitBridge has been deprecated");
    }
    if (this.experimentalDataLayer) {
      logger.warn(
        "--experimentalDataLayer has been deprecated, the data layer is now built-in automatically"
      );
    }
    if (this.noSDK) {
      logger.warn(
        "--noSDK has been deprecated, and will be unsupported in a future release. This should be set in the config at client.skip = true"
      );
    }
  }
  async indexContentWithSpinner({
    database,
    graphQLSchema,
    tinaSchema,
    configManager,
    partialReindex,
    text
  }) {
    const textToUse = text || "Indexing local files";
    const warnings = [];
    await spin({
      waitFor: async () => {
        const rootPath = configManager.rootPath;
        let sha;
        try {
          sha = await (0, import_graphql8.getSha)({ fs: import_fs_extra3.default, dir: rootPath });
        } catch (e) {
          if (partialReindex) {
            console.error(
              "Failed to get sha. NOTE: `--partial-reindex` only supported for git repositories"
            );
            throw e;
          }
        }
        const lastSha = await database.getMetadata("lastSha");
        const exists = lastSha && await (0, import_graphql8.shaExists)({ fs: import_fs_extra3.default, dir: rootPath, sha: lastSha });
        let res;
        if (partialReindex && lastSha && exists && sha) {
          const pathFilter = {};
          if (configManager.isUsingLegacyFolder) {
            pathFilter[".tina/__generated__/_schema.json"] = {};
          } else {
            pathFilter["tina/tina-lock.json"] = {};
          }
          for (const collection of tinaSchema.getCollections()) {
            pathFilter[collection.path] = {
              matches: collection.match?.exclude || collection.match?.include ? tinaSchema.getMatches({ collection }) : void 0
            };
          }
          const { added, modified, deleted } = await (0, import_graphql8.getChangedFiles)({
            fs: import_fs_extra3.default,
            dir: rootPath,
            from: lastSha,
            to: sha,
            pathFilter
          });
          const tinaPathUpdates = modified.filter(
            (path14) => path14.startsWith(".tina/__generated__/_schema.json") || path14.startsWith("tina/tina-lock.json")
          );
          if (tinaPathUpdates.length > 0) {
            res = await database.indexContent({
              graphQLSchema,
              tinaSchema
            });
          } else {
            if (added.length > 0 || modified.length > 0) {
              await database.indexContentByPaths([...added, ...modified]);
            }
            if (deleted.length > 0) {
              await database.deleteContentByPaths(deleted);
            }
          }
        } else {
          res = await database.indexContent({
            graphQLSchema,
            tinaSchema
          });
        }
        if (sha) {
          await database.setMetadata("lastSha", sha);
        }
        if (res?.warnings) {
          warnings.push(...res.warnings);
        }
      },
      text: textToUse
    });
    if (warnings.length > 0) {
      logger.warn(`Indexing completed with ${warnings.length} warning(s)`);
      warnings.forEach((warning) => {
        logger.warn(warnText(`${warning}`));
      });
    }
  }
};

// src/next/commands/dev-command/html.ts
var errorHTML = `<style type="text/css">
#no-assets-placeholder body {
  font-family: sans-serif;
  font-size: 16px;
  line-height: 1.4;
  color: #333;
  background-color: #f5f5f5;
}
#no-assets-placeholder {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px;
  text-align: center;
  background-color: #fff;
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);
}
#no-assets-placeholder h1 {
  font-size: 24px;
  margin-bottom: 20px;
}
#no-assets-placeholder p {
  margin-bottom: 10px;
}
#no-assets-placeholder a {
  color: #0077cc;
  text-decoration: none;
}
#no-assets-placeholder a:hover {
  text-decoration: underline;
}
</style>
<div id="no-assets-placeholder">
<h1>Failed loading TinaCMS assets</h1>
<p>
  Your TinaCMS configuration may be misconfigured, and we could not load
  the assets for this page.
</p>
<p>
  Please visit <a href="https://tina.io/docs/tina-cloud/faq/#how-do-i-resolve-failed-loading-tinacms-assets-error">this doc</a> for help.
</p>
</div>
</div>`.trim().replace(/[\r\n\s]+/g, " ");
var devHTML = (port) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TinaCMS</title>
  </head>

  <!-- if development -->
  <script type="module">
    import RefreshRuntime from 'http://localhost:${port}/@react-refresh'
    RefreshRuntime.injectIntoGlobalHook(window)
    window.$RefreshReg$ = () => {}
    window.$RefreshSig$ = () => (type) => type
    window.__vite_plugin_react_preamble_installed__ = true
  </script>
  <script type="module" src="http://localhost:${port}/@vite/client"></script>
  <script>
  function handleLoadError() {
    // Assets have failed to load
    document.getElementById('root').innerHTML = '${errorHTML}';
  }
  </script>
  <script
    type="module"
    src="http://localhost:${port}/src/main.tsx"
    onerror="handleLoadError()"
  ></script>
  <body class="tina-tailwind">
    <div id="root"></div>
  </body>
</html>`;

// src/next/commands/dev-command/server/index.ts
var import_vite3 = require("vite");

// src/next/vite/index.ts
var import_node_path2 = __toESM(require("node:path"));
var import_plugin_react = __toESM(require("@vitejs/plugin-react"));
var import_fs_extra4 = __toESM(require("fs-extra"));
var import_normalize_path3 = __toESM(require("normalize-path"));
var import_vite = require("vite");

// src/next/vite/tailwind.ts
var import_node_path = __toESM(require("node:path"));
var import_aspect_ratio = __toESM(require("@tailwindcss/aspect-ratio"));
var import_container_queries = __toESM(require("@tailwindcss/container-queries"));
var import_typography = __toESM(require("@tailwindcss/typography"));
var import_tailwindcss = __toESM(require("tailwindcss"));
var import_defaultTheme = __toESM(require("tailwindcss/defaultTheme.js"));
var tinaTailwind = (spaPath, prebuildFilePath) => {
  return {
    name: "vite-plugin-tina",
    // @ts-ignore
    config: (viteConfig) => {
      const plugins = [];
      const content = [
        import_node_path.default.join(spaPath, "src/**/*.{vue,js,ts,jsx,tsx,svelte}"),
        prebuildFilePath,
        require.resolve("tinacms")
      ];
      const tw = (0, import_tailwindcss.default)({
        theme: {
          columns: {
            auto: "auto",
            1: "1",
            2: "2",
            3: "3",
            4: "4",
            5: "5",
            6: "6",
            7: "7",
            8: "8",
            9: "9",
            10: "10",
            11: "11",
            12: "12",
            "3xs": "256px",
            "2xs": "288px",
            xs: "320px",
            sm: "384px",
            md: "448px",
            lg: "512px",
            xl: "576px",
            "2xl": "672px",
            "3xl": "768px",
            "4xl": "896px",
            "5xl": "1024px",
            "6xl": "1152px",
            "7xl": "1280px"
          },
          spacing: {
            px: "1px",
            0: "0px",
            0.5: "2px",
            1: "4px",
            1.5: "6px",
            2: "8px",
            2.5: "10px",
            3: "12px",
            3.5: "14px",
            4: "16px",
            5: "20px",
            6: "24px",
            7: "28px",
            8: "32px",
            9: "36px",
            10: "40px",
            11: "44px",
            12: "48px",
            14: "56px",
            16: "64px",
            18: "72px",
            20: "80px",
            24: "96px",
            28: "114px",
            32: "128px",
            36: "144px",
            40: "160px",
            44: "176px",
            48: "192px",
            52: "208px",
            56: "224px",
            60: "240px",
            64: "256px",
            72: "288px",
            80: "320px",
            96: "384px"
          },
          borderRadius: {
            none: "0px",
            sm: "2px",
            DEFAULT: "4px",
            md: "6px",
            lg: "8px",
            xl: "12px",
            "2xl": "16px",
            "3xl": "24px",
            full: "9999px"
          },
          borderWidth: {
            DEFAULT: "1px",
            0: "0",
            2: "2px",
            3: "3px",
            4: "4px",
            6: "6px",
            8: "8px"
          },
          fontSize: {
            xs: ["13px", { lineHeight: "1.33" }],
            sm: ["14px", { lineHeight: "1.43" }],
            base: ["16px", { lineHeight: "1.5" }],
            md: ["16px", { lineHeight: "1.5" }],
            lg: ["18px", { lineHeight: "1.55" }],
            xl: ["20px", { lineHeight: "1.4" }],
            "2xl": ["24px", { lineHeight: "1.33" }],
            "3xl": ["30px", { lineHeight: "1.2" }],
            "4xl": ["36px", { lineHeight: "1.1" }],
            "5xl": ["48px", { lineHeight: "1" }],
            "6xl": ["60px", { lineHeight: "1" }],
            "7xl": ["72px", { lineHeight: "1" }],
            "8xl": ["96px", { lineHeight: "1" }],
            "9xl": ["128px", { lineHeight: "1" }]
          },
          opacity: {
            0: "0",
            5: ".05",
            7: ".07",
            10: ".1",
            15: ".15",
            20: ".2",
            25: ".25",
            30: ".3",
            40: ".4",
            50: ".5",
            60: ".6",
            70: ".7",
            75: ".75",
            80: ".8",
            90: ".9",
            100: "1"
          },
          zIndex: {
            "-1": "-1",
            base: "9000",
            panel: "9400",
            menu: "9800",
            chrome: "10200",
            overlay: "10600",
            modal: "10800",
            0: "0",
            10: "10",
            20: "20",
            30: "30",
            40: "40",
            25: "25",
            50: "50",
            75: "75",
            100: "100",
            auto: "auto"
          },
          extend: {
            scale: {
              97: ".97",
              103: "1.03"
            },
            transitionDuration: {
              0: "0ms",
              2e3: "2000ms"
            },
            boxShadow: {
              xs: "0 0 0 1px rgba(0, 0, 0, 0.05)",
              outline: "0 0 0 3px rgba(66, 153, 225, 0.5)"
            },
            colors: {
              blue: {
                50: "#DCEEFF",
                100: "#B4DBFF",
                200: "#85C5FE",
                300: "#4EABFE",
                400: "#2296fe",
                500: "#0084FF",
                600: "#0574e4",
                700: "#0D5DBD",
                800: "#144696",
                900: "#1D2C6C",
                1e3: "#241748"
              },
              gray: {
                50: "#F6F6F9",
                100: "#EDECF3",
                150: "#E6E3EF",
                200: "#E1DDEC",
                250: "#C9C5D5",
                300: "#b2adbe",
                400: "#918c9e",
                500: "#716c7f",
                600: "#565165",
                700: "#433e52",
                800: "#363145",
                900: "#252336",
                1e3: "#1c1b2e"
              },
              orange: {
                400: "#EB6337",
                500: "#EC4815",
                600: "#DC4419"
              },
              background: "#FFFFFF",
              foreground: "#0A0A0A",
              muted: "#F5F5F5",
              "muted-foreground": "#737373",
              popover: "#FFFFFF",
              "popover-foreground": "#0A0A0A",
              card: "#FFFFFF",
              "card-foreground": "#0A0A0A",
              border: "#E5E5E5",
              input: "#E5E5E5",
              primary: "#171717",
              "primary-foreground": "#FAFAFA",
              secondary: "#F5F5F5",
              "secondary-foreground": "#171717",
              accent: "#F5F5F5",
              "accent-foreground": "#171717",
              destructive: "#FF3B3B",
              "destructive-foreground": "#FAFAFA",
              ring: "#0A0A0A"
            },
            fontFamily: {
              sans: ["Inter", ...import_defaultTheme.default.fontFamily.sans]
            },
            lineHeight: {
              3: "12px",
              4: "16px",
              5: "20px",
              6: "24px",
              7: "28px",
              8: "32px",
              9: "36px",
              10: "40px"
            },
            maxWidth: {
              form: "900px"
            },
            screens: {
              xs: "320px",
              sm: "560px",
              md: "720px",
              lg: "1030px"
            }
          }
        },
        content,
        plugins: [
          (0, import_typography.default)({ className: "tina-prose" }),
          import_aspect_ratio.default,
          import_container_queries.default
        ]
      });
      plugins.push(tw);
      return {
        css: {
          postcss: {
            plugins
          }
        }
      };
    }
  };
};

// src/next/vite/index.ts
async function listFilesRecursively({
  directoryPath,
  config: config2,
  roothPath
}) {
  const fullDirectoryPath = import_node_path2.default.join(
    roothPath,
    config2.publicFolder,
    directoryPath
  );
  const exists = await import_fs_extra4.default.pathExists(fullDirectoryPath);
  if (!exists) {
    return { "0": [] };
  }
  const items = await import_fs_extra4.default.readdir(fullDirectoryPath);
  const staticMediaItems = [];
  for (const item of items) {
    const itemPath = import_node_path2.default.join(fullDirectoryPath, item);
    const stats = await import_fs_extra4.default.promises.lstat(itemPath);
    const staticMediaItem = {
      id: item,
      filename: item,
      type: stats.isDirectory() ? "dir" : "file",
      directory: `${directoryPath.replace(config2.mediaRoot, "")}`,
      src: `/${import_node_path2.default.join(directoryPath, item)}`,
      thumbnails: {
        "75x75": `/${import_node_path2.default.join(directoryPath, item)}`,
        "400x400": `/${import_node_path2.default.join(directoryPath, item)}`,
        "1000x1000": `/${import_node_path2.default.join(directoryPath, item)}`
      }
    };
    if (stats.isDirectory()) {
      staticMediaItem.children = await listFilesRecursively({
        directoryPath: import_node_path2.default.join(directoryPath, item),
        config: config2,
        roothPath
      });
    }
    staticMediaItems.push(staticMediaItem);
  }
  function chunkArrayIntoObject(array, chunkSize) {
    const result = {};
    for (let i = 0; i < array.length; i += chunkSize) {
      const chunkKey = `${i / chunkSize * 20}`;
      result[chunkKey] = array.slice(i, i + chunkSize);
    }
    return result;
  }
  return chunkArrayIntoObject(staticMediaItems, 20);
}
var createConfig = async ({
  configManager,
  apiURL,
  plugins = [],
  noWatch,
  rollupOptions
}) => {
  const publicEnv = {};
  Object.keys(process.env).forEach((key) => {
    if (key.startsWith("TINA_PUBLIC_") || key.startsWith("NEXT_PUBLIC_") || key === "NODE_ENV" || key === "HEAD") {
      try {
        if (typeof process.env[key] === "string") {
          publicEnv[key] = process.env[key];
        } else {
          publicEnv[key] = JSON.stringify(process.env[key]);
        }
      } catch (error) {
        console.warn(
          `Could not stringify public env process.env.${key} env variable`
        );
        console.warn(error);
      }
    }
  });
  const staticMediaPath = import_node_path2.default.join(
    configManager.generatedFolderPath,
    "static-media.json"
  );
  if (configManager.config.media?.tina?.static) {
    const staticMedia = await listFilesRecursively({
      directoryPath: configManager.config.media.tina?.mediaRoot || "",
      config: configManager.config.media.tina,
      roothPath: configManager.rootPath
    });
    await import_fs_extra4.default.outputFile(staticMediaPath, JSON.stringify(staticMedia, null, 2));
  } else {
    await import_fs_extra4.default.outputFile(staticMediaPath, `[]`);
  }
  const alias = {
    TINA_IMPORT: configManager.prebuildFilePath,
    SCHEMA_IMPORT: configManager.generatedGraphQLJSONPath,
    STATIC_MEDIA_IMPORT: staticMediaPath,
    crypto: import_node_path2.default.join(configManager.spaRootPath, "src", "dummy-client.ts"),
    fs: import_node_path2.default.join(configManager.spaRootPath, "src", "dummy-client.ts"),
    os: import_node_path2.default.join(configManager.spaRootPath, "src", "dummy-client.ts"),
    path: import_node_path2.default.join(configManager.spaRootPath, "src", "dummy-client.ts")
  };
  if (configManager.shouldSkipSDK()) {
    alias["CLIENT_IMPORT"] = import_node_path2.default.join(
      configManager.spaRootPath,
      "src",
      "dummy-client.ts"
    );
  } else {
    alias["CLIENT_IMPORT"] = configManager.isUsingTs() ? configManager.generatedTypesTSFilePath : configManager.generatedTypesJSFilePath;
  }
  let basePath;
  if (configManager.config.build.basePath) {
    basePath = configManager.config.build.basePath;
  }
  const fullVersion = configManager.getTinaGraphQLVersion();
  const version2 = `${fullVersion.major}.${fullVersion.minor}`;
  const config2 = {
    root: configManager.spaRootPath,
    base: `/${basePath ? `${(0, import_normalize_path3.default)(basePath)}/` : ""}${(0, import_normalize_path3.default)(
      configManager.config.build.outputFolder
    )}/`,
    appType: "spa",
    resolve: {
      alias,
      dedupe: ["graphql", "tinacms", "react", "react-dom", "react-router-dom"]
    },
    define: {
      /**
       * Since we prebuild the config.ts, it's possible for modules to be loaded which make
       * use of `process`. The main scenario where this is an issue is when co-locating schema
       * definitions with source files, and specifically source files which impor from NextJS.
       *
       * Some examples of what NextJS uses for `process.env` are:
       *  - `process.env.__NEXT_TRAILING_SLASH`
       *  - `process.env.__NEXT_CROSS_ORIGIN`
       *  - `process.env.__NEXT_I18N_SUPPORT`
       *
       * Also, interestingly some of the advice for handling this doesn't work, references to replacing
       * `process.env` with `{}` are problematic, because browsers don't understand the `{}.` syntax,
       * but node does. This was a surprise, but using `new Object()` seems to do the trick.
       */
      "process.env": `new Object(${JSON.stringify(publicEnv)})`,
      // Used by picomatch https://github.com/micromatch/picomatch/blob/master/lib/utils.js#L4
      "process.platform": `"${process.platform}"`,
      __API_URL__: `"${apiURL}"`,
      __BASE_PATH__: `"${configManager.config?.build?.basePath || ""}"`,
      __TINA_GRAPHQL_VERSION__: version2
    },
    logLevel: "error",
    // Vite import warnings are noisy
    optimizeDeps: {
      force: true,
      // Not 100% sure why this isn't being picked up automatically, this works from within the monorepo
      // but breaks externally
      include: ["react/jsx-runtime", "react/jsx-dev-runtime"]
    },
    server: {
      host: configManager.config?.build?.host ?? false,
      watch: noWatch ? {
        ignored: ["**/*"]
      } : {
        // Ignore everything except for the alias fields we specified above
        ignored: [
          `${configManager.tinaFolderPath}/**/!(config.prebuild.jsx|_graphql.json)`
        ]
      },
      fs: {
        strict: false
      }
    },
    build: {
      sourcemap: false,
      outDir: configManager.outputFolderPath,
      emptyOutDir: true,
      rollupOptions
    },
    plugins: [
      /**
       * `splitVendorChunkPlugin` is needed because `tinacms` is quite large,
       * Vite's chunking strategy chokes on memory issues for smaller machines (ie. on CI).
       */
      (0, import_plugin_react.default)({
        babel: {
          // Supresses the warning [NOTE] babel The code generator has deoptimised the styling of
          compact: true
        }
      }),
      (0, import_vite.splitVendorChunkPlugin)(),
      tinaTailwind(configManager.spaRootPath, configManager.prebuildFilePath),
      ...plugins
    ]
  };
  return config2;
};

// src/next/vite/plugins.ts
var import_pluginutils = require("@rollup/pluginutils");
var import_fs = __toESM(require("fs"));
var import_vite2 = require("vite");
var import_esbuild2 = require("esbuild");
var import_path4 = __toESM(require("path"));
var import_body_parser = __toESM(require("body-parser"));
var import_cors = __toESM(require("cors"));
var import_graphql9 = require("@tinacms/graphql");

// src/next/commands/dev-command/server/media.ts
var import_fs_extra5 = __toESM(require("fs-extra"));
var import_path3 = __toESM(require("path"));
var import_busboy = __toESM(require("busboy"));
var createMediaRouter = (config2) => {
  const mediaFolder = import_path3.default.join(
    config2.rootPath,
    config2.publicFolder,
    config2.mediaRoot
  );
  const mediaModel = new MediaModel(config2);
  const handleList = async (req, res) => {
    const requestURL = new URL(req.url, config2.apiURL);
    const folder = requestURL.pathname.replace("/media/list/", "");
    const limit = requestURL.searchParams.get("limit");
    const cursor = requestURL.searchParams.get("cursor");
    const media = await mediaModel.listMedia({
      searchPath: folder,
      cursor,
      limit
    });
    res.end(JSON.stringify(media));
  };
  const handleDelete = async (req, res) => {
    const file = decodeURIComponent(req.url.slice("/media/".length));
    const didDelete = await mediaModel.deleteMedia({ searchPath: file });
    res.end(JSON.stringify(didDelete));
  };
  const handlePost = async function(req, res) {
    const bb = (0, import_busboy.default)({ headers: req.headers });
    bb.on("file", async (_name, file, _info) => {
      const fullPath = decodeURI(req.url?.slice("/media/upload/".length));
      const saveTo = import_path3.default.join(mediaFolder, ...fullPath.split("/"));
      await import_fs_extra5.default.ensureDir(import_path3.default.dirname(saveTo));
      file.pipe(import_fs_extra5.default.createWriteStream(saveTo));
    });
    bb.on("error", (error) => {
      res.statusCode = 500;
      if (error instanceof Error) {
        res.end(JSON.stringify({ message: error }));
      } else {
        res.end(JSON.stringify({ message: "Unknown error while uploading" }));
      }
    });
    bb.on("close", () => {
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true }));
    });
    req.pipe(bb);
  };
  return { handleList, handleDelete, handlePost };
};
var parseMediaFolder = (str) => {
  let returnString = str;
  if (returnString.startsWith("/")) returnString = returnString.substr(1);
  if (returnString.endsWith("/"))
    returnString = returnString.substr(0, returnString.length - 1);
  return returnString;
};
var MediaModel = class {
  constructor({ rootPath, publicFolder, mediaRoot }) {
    this.rootPath = rootPath;
    this.mediaRoot = mediaRoot;
    this.publicFolder = publicFolder;
  }
  async listMedia(args) {
    try {
      const folderPath = (0, import_path3.join)(
        this.rootPath,
        this.publicFolder,
        this.mediaRoot,
        decodeURIComponent(args.searchPath)
      );
      const searchPath = parseMediaFolder(args.searchPath);
      if (!await import_fs_extra5.default.pathExists(folderPath)) {
        return {
          files: [],
          directories: []
        };
      }
      const filesStr = await import_fs_extra5.default.readdir(folderPath);
      const filesProm = filesStr.map(async (file) => {
        const filePath = (0, import_path3.join)(folderPath, file);
        const stat = await import_fs_extra5.default.stat(filePath);
        let src = `/${file}`;
        const isFile = stat.isFile();
        if (!isFile) {
          return {
            isFile,
            size: stat.size,
            src,
            filename: file
          };
        }
        if (searchPath) {
          src = `/${searchPath}${src}`;
        }
        if (this.mediaRoot) {
          src = `/${this.mediaRoot}${src}`;
        }
        return {
          isFile,
          size: stat.size,
          src,
          filename: file
        };
      });
      const offset = Number(args.cursor) || 0;
      const limit = Number(args.limit) || 20;
      const rawItems = await Promise.all(filesProm);
      const sortedItems = rawItems.sort((a, b) => {
        if (a.isFile && !b.isFile) {
          return 1;
        }
        if (!a.isFile && b.isFile) {
          return -1;
        }
        return 0;
      });
      const limitItems = sortedItems.slice(offset, offset + limit);
      const files = limitItems.filter((x) => x.isFile);
      const directories = limitItems.filter((x) => !x.isFile).map((x) => x.src);
      const cursor = rawItems.length > offset + limit ? String(offset + limit) : null;
      return {
        files,
        directories,
        cursor
      };
    } catch (error) {
      console.error(error);
      return {
        files: [],
        directories: [],
        error: error?.toString()
      };
    }
  }
  async deleteMedia(args) {
    try {
      const file = (0, import_path3.join)(
        this.rootPath,
        this.publicFolder,
        this.mediaRoot,
        decodeURIComponent(args.searchPath)
      );
      await import_fs_extra5.default.stat(file);
      await import_fs_extra5.default.remove(file);
      return { ok: true };
    } catch (error) {
      console.error(error);
      return { ok: false, message: error?.toString() };
    }
  }
};

// src/next/commands/dev-command/server/searchIndex.ts
var createSearchIndexRouter = ({
  config: config2,
  searchIndex
}) => {
  const put = async (req, res) => {
    const { docs } = req.body;
    const result = await searchIndex.PUT(docs);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ result }));
  };
  const get = async (req, res) => {
    const requestURL = new URL(req.url, config2.apiURL);
    const query = requestURL.searchParams.get("q");
    const optionsParam = requestURL.searchParams.get("options");
    let options = {
      DOCUMENTS: false
    };
    if (optionsParam) {
      options = {
        ...options,
        ...JSON.parse(optionsParam)
      };
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    if (query) {
      const result = await searchIndex.QUERY(JSON.parse(query), options);
      res.end(JSON.stringify(result));
    } else {
      res.end(JSON.stringify({ RESULT: [] }));
    }
  };
  const del = async (req, res) => {
    const requestURL = new URL(req.url, config2.apiURL);
    const docId = requestURL.pathname.split("/").filter(Boolean).slice(1).join("/");
    const result = await searchIndex.DELETE(docId);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ result }));
  };
  return { del, get, put };
};

// src/next/vite/plugins.ts
var transformTsxPlugin = ({
  configManager: _configManager
}) => {
  const plug = {
    name: "transform-tsx",
    async transform(code, id) {
      const extName = import_path4.default.extname(id);
      if (extName.startsWith(".tsx") || extName.startsWith(".ts")) {
        const result = await (0, import_esbuild2.transform)(code, { loader: "tsx" });
        return {
          code: result.code
        };
      }
    }
  };
  return plug;
};
var devServerEndPointsPlugin = ({
  configManager,
  apiURL,
  database,
  searchIndex,
  databaseLock
}) => {
  const plug = {
    name: "graphql-endpoints",
    configureServer(server) {
      server.middlewares.use((0, import_cors.default)());
      server.middlewares.use(import_body_parser.default.json({ limit: "5mb" }));
      server.middlewares.use(async (req, res, next) => {
        const mediaPaths = configManager.config.media?.tina;
        const mediaRouter = createMediaRouter({
          rootPath: configManager.rootPath,
          apiURL,
          publicFolder: parseMediaFolder(mediaPaths?.publicFolder || ""),
          mediaRoot: parseMediaFolder(mediaPaths?.mediaRoot || "")
        });
        const searchIndexRouter = createSearchIndexRouter({
          config: { apiURL, searchPath: "searchIndex" },
          searchIndex
        });
        if (req.url.startsWith("/media/upload")) {
          await mediaRouter.handlePost(req, res);
          return;
        }
        if (req.url.startsWith("/media")) {
          if (req.method === "DELETE") {
            await mediaRouter.handleDelete(req, res);
            return;
          }
        }
        if (req.url.startsWith("/media/list")) {
          await mediaRouter.handleList(req, res);
          return;
        }
        if (req.url === "/altair") {
          res.end(
            JSON.stringify({
              status: "The GraphQL playground has moved to <your-dev-url>/index.html#/graphql"
            })
          );
          return;
        }
        if (req.url === "/graphql") {
          const { query, variables } = req.body;
          let result;
          await databaseLock(async () => {
            result = await (0, import_graphql9.resolve)({
              config: {
                useRelativeMedia: true
              },
              database,
              query,
              variables,
              verbose: false
            });
          });
          res.end(JSON.stringify(result));
          return;
        }
        if (req.url.startsWith("/searchIndex")) {
          if (req.method === "POST") {
            await searchIndexRouter.put(req, res);
          } else if (req.method === "GET") {
            await searchIndexRouter.get(req, res);
          } else if (req.method === "DELETE") {
            await searchIndexRouter.del(req, res);
          }
          return;
        }
        next();
      });
    }
  };
  return plug;
};
function viteTransformExtension({
  exportAsDefault = true,
  svgrOptions,
  esbuildOptions,
  include = "**/*.svg",
  exclude
} = {}) {
  const filter = (0, import_pluginutils.createFilter)(include, exclude);
  return {
    name: "vite-plugin-svgr",
    async transform(code, id) {
      if (filter(id)) {
        const { transform: transform2 } = await import("@svgr/core");
        const svgCode = await import_fs.default.promises.readFile(
          id.replace(/\?.*$/, ""),
          "utf8"
        );
        const componentCode = await transform2(svgCode, svgrOptions, {
          filePath: id,
          caller: {
            previousExport: exportAsDefault ? null : code
          }
        });
        const res = await (0, import_vite2.transformWithEsbuild)(componentCode, id, {
          loader: "jsx",
          ...esbuildOptions
        });
        return {
          code: res.code,
          map: null
          // TODO:
        };
      }
    }
  };
}

// src/next/commands/dev-command/server/index.ts
var createDevServer = async (configManager, database, searchIndex, apiURL, noWatch, databaseLock) => {
  const plugins = [
    transformTsxPlugin({ configManager }),
    devServerEndPointsPlugin({
      apiURL,
      configManager,
      database,
      searchIndex,
      databaseLock
    }),
    viteTransformExtension()
  ];
  return (0, import_vite3.createServer)(
    await createConfig({
      configManager,
      database,
      apiURL,
      plugins,
      noWatch,
      /**
       * Ensure Vite's import scan uses the spaMainPath as the input
       * so it properly finds everything. This is for dev only, and when
       * running the server outside of this monorepo vite fails to find
       * and optimize the imports, so you get errors about it not being
       * able to find an export from a module, and it's always a CJS
       * module that Vite would usually transform to an ES module.
       */
      rollupOptions: {
        input: configManager.spaMainPath,
        onwarn(warning, warn) {
          if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
            return;
          }
          warn(warning);
        }
      }
    })
  );
};

// src/next/commands/dev-command/index.ts
var DevCommand = class extends BaseCommand {
  constructor() {
    super(...arguments);
    // NOTE: camelCase commands for string options don't work if there's an `=` used https://github.com/arcanis/clipanion/issues/141
    this.watchFolders = import_clipanion2.Option.String("-w,--watchFolders", {
      description: "DEPRECATED - a list of folders (relative to where this is being run) that the cli will watch for changes"
    });
    this.noWatch = import_clipanion2.Option.Boolean("--noWatch", false, {
      description: "Don't regenerate config on file changes"
    });
    this.outputSearchIndexPath = import_clipanion2.Option.String("--outputSearchIndexPath", {
      description: "Path to write the search index to"
    });
    this.noServer = import_clipanion2.Option.Boolean("--no-server", false, {
      description: "Do not start the dev server"
    });
    this.indexingLock = new import_async_lock.default();
  }
  static {
    this.paths = [["dev"], ["server:start"]];
  }
  static {
    // Prevent indexes and reads occurring at once
    this.usage = import_clipanion2.Command.Usage({
      category: `Commands`,
      description: `Builds Tina and starts the dev server`,
      examples: [
        [`A basic example`, `$0 dev`],
        [`A second example`, `$0 dev --rootPath`]
      ]
    });
  }
  async catch(error) {
    logger.error("Error occured during tinacms dev");
    console.error(error);
    process.exit(1);
  }
  logDeprecationWarnings() {
    super.logDeprecationWarnings();
    if (this.watchFolders) {
      logger.warn(
        "--watchFolders has been deprecated, imports from your Tina config file will be watched automatically. If you still need it please open a ticket at https://github.com/tinacms/tinacms/issues"
      );
    }
  }
  async execute() {
    const configManager = new ConfigManager({
      rootPath: this.rootPath,
      legacyNoSDK: this.noSDK
    });
    logger.info("\u{1F999} TinaCMS Dev Server is initializing...");
    this.logDeprecationWarnings();
    createDBServer(Number(this.datalayerPort));
    let database = null;
    const dbLock = async (fn) => {
      return this.indexingLock.acquire("Key", fn);
    };
    const setup = async ({ firstTime }) => {
      try {
        await configManager.processConfig();
        if (firstTime) {
          database = await createAndInitializeDatabase(
            configManager,
            Number(this.datalayerPort)
          );
        } else {
          database.clearCache();
        }
        const { tinaSchema: tinaSchema2, graphQLSchema: graphQLSchema2, lookup, queryDoc, fragDoc } = await (0, import_graphql10.buildSchema)(configManager.config);
        const codegen2 = new Codegen({
          isLocal: true,
          configManager,
          port: Number(this.port),
          queryDoc,
          fragDoc,
          graphqlSchemaDoc: graphQLSchema2,
          tinaSchema: tinaSchema2,
          lookup,
          noClientBuildCache: true
        });
        const apiURL2 = await codegen2.execute();
        if (!configManager.isUsingLegacyFolder) {
          delete require.cache[configManager.generatedSchemaJSONPath];
          delete require.cache[configManager.generatedLookupJSONPath];
          delete require.cache[configManager.generatedGraphQLJSONPath];
          const schemaObject = require(configManager.generatedSchemaJSONPath);
          const lookupObject = require(configManager.generatedLookupJSONPath);
          const graphqlSchemaObject = require(configManager.generatedGraphQLJSONPath);
          const tinaLockFilename = "tina-lock.json";
          const tinaLockContent = JSON.stringify({
            schema: schemaObject,
            lookup: lookupObject,
            graphql: graphqlSchemaObject
          });
          import_fs_extra6.default.writeFileSync(
            import_path5.default.join(configManager.tinaFolderPath, tinaLockFilename),
            tinaLockContent
          );
          if (configManager.hasSeparateContentRoot()) {
            const rootPath = await configManager.getTinaFolderPath(
              configManager.contentRootPath
            );
            const filePath = import_path5.default.join(rootPath, tinaLockFilename);
            await import_fs_extra6.default.ensureFile(filePath);
            await import_fs_extra6.default.outputFile(filePath, tinaLockContent);
          }
        }
        await this.indexContentWithSpinner({
          database,
          graphQLSchema: graphQLSchema2,
          tinaSchema: tinaSchema2,
          configManager
        });
        if (!firstTime) {
          logger.error("Re-index complete");
        }
        if (!this.noWatch) {
          this.watchQueries(
            configManager,
            dbLock,
            async () => await codegen2.execute()
          );
        }
        return { apiURL: apiURL2, database, graphQLSchema: graphQLSchema2, tinaSchema: tinaSchema2 };
      } catch (e) {
        logger.error(`

${dangerText(e.message)}
`);
        if (this.verbose) {
          console.error(e);
        }
        if (firstTime) {
          logger.error(
            warnText(
              "Unable to start dev server, please fix your Tina config / resolve any errors above and try again"
            )
          );
          process.exit(1);
        } else {
          logger.error(warnText("Dev server has not been restarted"));
        }
      }
    };
    const { apiURL, graphQLSchema, tinaSchema } = await setup({
      firstTime: true
    });
    await import_fs_extra6.default.outputFile(configManager.outputHTMLFilePath, devHTML(this.port));
    await import_fs_extra6.default.outputFile(
      configManager.outputGitignorePath,
      "index.html\nassets/"
    );
    const searchIndexClient = new import_search.LocalSearchIndexClient({
      stopwordLanguages: configManager.config.search?.tina?.stopwordLanguages,
      tokenSplitRegex: configManager.config.search?.tina?.tokenSplitRegex
    });
    await searchIndexClient.onStartIndexing();
    const searchIndexer = new import_search.SearchIndexer({
      batchSize: configManager.config.search?.indexBatchSize || 100,
      bridge: new import_graphql10.FilesystemBridge(
        configManager.rootPath,
        configManager.contentRootPath
      ),
      schema: tinaSchema,
      client: searchIndexClient,
      textIndexLength: configManager.config.search?.maxSearchIndexFieldLength || 100
    });
    if (configManager.config.search) {
      await spin({
        waitFor: async () => {
          await searchIndexer.indexAllContent();
        },
        text: "Building search index"
      });
      if (this.outputSearchIndexPath) {
        await searchIndexClient.export(this.outputSearchIndexPath);
      }
    }
    if (this.noServer) {
      logger.info("--no-server option specified - Dev server not started");
      process.exit(0);
    }
    if (!this.noWatch) {
      this.watchContentFiles(
        configManager,
        database,
        dbLock,
        configManager.config.search && searchIndexer
      );
    }
    const server = await createDevServer(
      configManager,
      database,
      searchIndexClient.searchIndex,
      apiURL,
      this.noWatch,
      dbLock
    );
    await server.listen(Number(this.port));
    if (!this.noWatch) {
      import_chokidar.default.watch(configManager.watchList).on("change", async () => {
        await dbLock(async () => {
          logger.info(`Tina config change detected, rebuilding`);
          await setup({ firstTime: false });
          server.ws.send({ type: "full-reload", path: "*" });
        });
      });
    }
    const subItems = [];
    if (configManager.hasSeparateContentRoot()) {
      subItems.push({
        key: "Content repo",
        value: configManager.contentRootPath
      });
    }
    const summaryItems = [
      {
        emoji: "\u{1F999}",
        heading: "TinaCMS URLs",
        subItems: [
          {
            key: "CMS",
            value: `<your-dev-server-url>/${configManager.printoutputHTMLFilePath()}`
          },
          {
            key: "API playground",
            value: `<your-dev-server-url>/${configManager.printoutputHTMLFilePath()}#/graphql`
          },
          {
            key: "API url",
            value: apiURL
          },
          ...subItems
        ]
      }
    ];
    if (!configManager.shouldSkipSDK()) {
      summaryItems.push({
        emoji: "\u{1F916}",
        heading: "Auto-generated files",
        subItems: [
          {
            key: "GraphQL Client",
            value: configManager.printGeneratedClientFilePath()
          },
          {
            key: "Typescript Types",
            value: configManager.printGeneratedTypesFilePath()
          }
        ]
      });
    }
    summary({
      heading: "\u2705 \u{1F999} TinaCMS Dev Server is active:",
      items: [
        ...summaryItems
        // {
        //   emoji: '📚',
        //   heading: 'Useful links',
        //   subItems: [
        //     {
        //       key: 'Custom queries',
        //       value: 'https://tina.io/querying',
        //     },
        //     {
        //       key: 'Visual editing',
        //       value: 'https://tina.io/visual-editing',
        //     },
        //   ],
        // },
      ]
    });
    await this.startSubCommand();
  }
  watchContentFiles(configManager, database, databaseLock, searchIndexer) {
    const collectionContentFiles = [];
    configManager.config.schema.collections.forEach((collection) => {
      const collectionGlob = `${import_path5.default.join(
        configManager.contentRootPath,
        collection.path
      )}/**/*.${collection.format || "md"}`;
      collectionContentFiles.push(collectionGlob);
    });
    let ready = false;
    import_chokidar.default.watch(collectionContentFiles).on("ready", () => {
      ready = true;
    }).on("add", async (addedFile) => {
      if (!ready) {
        return;
      }
      await databaseLock(async () => {
        const pathFromRoot = configManager.printContentRelativePath(addedFile);
        await database.indexContentByPaths([pathFromRoot]).catch(console.error);
        if (searchIndexer) {
          await searchIndexer.indexContentByPaths([pathFromRoot]).catch(console.error);
        }
      });
    }).on("change", async (changedFile) => {
      const pathFromRoot = configManager.printContentRelativePath(changedFile);
      await databaseLock(async () => {
        await database.indexContentByPaths([pathFromRoot]).catch(console.error);
        if (searchIndexer) {
          await searchIndexer.indexContentByPaths([pathFromRoot]).catch(console.error);
        }
      });
    }).on("unlink", async (removedFile) => {
      const pathFromRoot = configManager.printContentRelativePath(removedFile);
      await databaseLock(async () => {
        await database.deleteContentByPaths([pathFromRoot]).catch(console.error);
        if (searchIndexer) {
          await searchIndexer.deleteIndexContent([pathFromRoot]).catch(console.error);
        }
      });
    });
  }
  watchQueries(configManager, databaseLock, callback) {
    const executeCallback = async (_) => {
      await databaseLock(async () => {
        await callback();
      });
    };
    import_chokidar.default.watch(configManager.userQueriesAndFragmentsGlob).on("add", executeCallback).on("change", executeCallback).on("unlink", executeCallback);
  }
};

// src/next/commands/build-command/index.ts
var import_crypto = __toESM(require("crypto"));
var import_path6 = __toESM(require("path"));
var import_core3 = require("@graphql-inspector/core");
var import_graphql11 = require("@tinacms/graphql");
var import_schema_tools2 = require("@tinacms/schema-tools");
var import_search2 = require("@tinacms/search");
var import_clipanion3 = require("clipanion");
var import_fs_extra7 = __toESM(require("fs-extra"));
var import_graphql12 = require("graphql");
var import_progress2 = __toESM(require("progress"));

// src/utils/index.ts
var import_core2 = require("@graphql-inspector/core");
var getFaqLink = (type) => {
  switch (type) {
    case import_core2.ChangeType.FieldRemoved: {
      return "https://tina.io/docs/introduction/faq#how-do-i-resolve-the-local-graphql-schema-doesnt-match-the-remote-graphql-schema-errors";
    }
    default:
      return null;
  }
};

// src/utils/sleep.ts
function timeout(ms) {
  return new Promise((resolve2) => setTimeout(resolve2, ms));
}
async function sleepAndCallFunc({
  fn,
  ms
}) {
  await timeout(ms);
  const res = await fn();
  return res;
}

// src/next/commands/build-command/server.ts
var import_vite5 = require("vite");
var buildProductionSpa = async (configManager, database, apiURL) => {
  const publicEnv = {};
  Object.keys(process.env).forEach((key) => {
    if (key.startsWith("TINA_PUBLIC_") || key.startsWith("NEXT_PUBLIC_") || key === "NODE_ENV" || key === "HEAD") {
      try {
        if (typeof process.env[key] === "string") {
          publicEnv[key] = process.env[key];
        } else {
          publicEnv[key] = JSON.stringify(process.env[key]);
        }
      } catch (error) {
        console.warn(
          `Could not stringify public env process.env.${key} env variable`
        );
        console.warn(error);
      }
    }
  });
  const config2 = await createConfig({
    plugins: [transformTsxPlugin({ configManager }), viteTransformExtension()],
    configManager,
    database,
    apiURL,
    noWatch: true,
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
          return;
        }
        warn(warning);
      }
    }
  });
  return (0, import_vite5.build)(config2);
};

// src/next/commands/build-command/waitForDB.ts
var import_schema_tools = require("@tinacms/schema-tools");
var import_progress = __toESM(require("progress"));
var POLLING_INTERVAL = 5e3;
var STATUS_INPROGRESS = "inprogress";
var STATUS_COMPLETE = "complete";
var STATUS_FAILED = "failed";
var IndexFailedError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "IndexFailedError";
  }
};
var waitForDB = async (config2, apiUrl, previewName, verbose) => {
  const token = config2.token;
  const { clientId, branch, isLocalClient, host } = (0, import_schema_tools.parseURL)(apiUrl);
  if (isLocalClient || !host || !clientId || !branch) {
    if (verbose) {
      logger.info(logText("Not using TinaCloud, skipping DB check"));
    }
    return;
  }
  const bar2 = new import_progress.default(
    "Checking indexing process in TinaCloud... :prog",
    1
  );
  const pollForStatus = async () => {
    try {
      if (verbose) {
        logger.info(logText("Polling for status..."));
      }
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      if (token) {
        headers.append("X-API-KEY", token);
      }
      const response = await fetch(
        `https://${host}/db/${clientId}/status/${previewName || branch}`,
        {
          method: "GET",
          headers,
          cache: "no-cache"
        }
      );
      const { status, error } = await response.json();
      const statusMessage = `Indexing status: '${status}'`;
      if (status === STATUS_COMPLETE) {
        bar2.tick({
          prog: "\u2705"
        });
      } else if (status === STATUS_INPROGRESS) {
        if (verbose) {
          logger.info(logText(`${statusMessage}, trying again in 5 seconds`));
        }
        await sleepAndCallFunc({ fn: pollForStatus, ms: POLLING_INTERVAL });
      } else if (status === STATUS_FAILED) {
        throw new IndexFailedError(
          `Attempting to index but responded with status 'failed'. To retry the indexing process, click the "Reindex" button for '${previewName || branch}' in the TinaCloud configuration for this project.  ${error}`
        );
      } else {
        throw new IndexFailedError(
          `Attempting to index but responded with status 'unknown'. To retry the indexing process, click the "Reindex" button for '${previewName || branch}' in the TinaCloud configuration for this project.  ${error}`
        );
      }
    } catch (e) {
      if (e instanceof IndexFailedError) {
        bar2.tick({
          prog: "\u274C"
        });
        throw e;
      } else {
        throw new Error(
          `Unable to query DB for indexing status, encountered error: ${e.message}`
        );
      }
    }
  };
  await spin({
    text: "Checking indexing process in TinaCloud...",
    waitFor: pollForStatus
  });
};

// src/next/commands/build-command/index.ts
var BuildCommand = class extends BaseCommand {
  constructor() {
    super(...arguments);
    this.localOption = import_clipanion3.Option.Boolean("--local", {
      description: "Starts local Graphql server and builds the local client instead of production client"
    });
    this.skipIndexing = import_clipanion3.Option.Boolean("--skip-indexing", false, {
      description: "Skips indexing the content. This can be used for building the site without indexing the content  (defaults to false)"
    });
    this.partialReindex = import_clipanion3.Option.Boolean("--partial-reindex", false, {
      description: "Re-indexes only the content that has changed since the last build (defaults to false). Not currently supported for separate content repos."
    });
    this.tinaGraphQLVersion = import_clipanion3.Option.String("--tina-graphql-version", {
      description: "Specify the version of @tinacms/graphql to use (defaults to latest)"
    });
    /**
     * This option allows the user to skip the TinaCloud checks if they want to. This could be useful for mismatched GraphQL versions or if they want to build only using the local client and never connect to TinaCloud
     */
    this.skipCloudChecks = import_clipanion3.Option.Boolean("--skip-cloud-checks", false, {
      description: "Skips checking the provided cloud config."
    });
    this.skipSearchIndex = import_clipanion3.Option.Boolean("--skip-search-index", false, {
      description: "Skip indexing the site for search"
    });
    this.upstreamBranch = import_clipanion3.Option.String("--upstream-branch", {
      description: "Optional upstream branch with the schema. If not specified, default will be used."
    });
    this.previewBaseBranch = import_clipanion3.Option.String("--preview-base-branch", {
      description: "The base branch for the preview"
    });
    this.previewName = import_clipanion3.Option.String("--preview-name", {
      description: "The name of the preview branch"
    });
    this.noClientBuildCache = import_clipanion3.Option.Boolean("--no-client-build-cache", false, {
      description: "Disables the client build cache"
    });
  }
  static {
    this.paths = [["build"]];
  }
  static {
    this.usage = import_clipanion3.Command.Usage({
      category: `Commands`,
      description: `Build the CMS and autogenerated modules for usage with TinaCloud`
    });
  }
  async catch(error) {
    console.error(error);
    process.exit(1);
  }
  async execute() {
    logger.info("Starting Tina build");
    this.logDeprecationWarnings();
    const configManager = new ConfigManager({
      rootPath: this.rootPath,
      tinaGraphQLVersion: this.tinaGraphQLVersion,
      legacyNoSDK: this.noSDK
    });
    if (this.previewName && !this.previewBaseBranch) {
      logger.error(
        `${dangerText(
          `ERROR: preview name provided without a preview base branch.`
        )}`
      );
      process.exit(1);
    }
    if (this.previewBaseBranch && !this.previewName) {
      logger.error(
        `${dangerText(
          `ERROR: preview base branch provided without a preview name.`
        )}`
      );
      process.exit(1);
    }
    try {
      await configManager.processConfig();
    } catch (e) {
      logger.error(`
${dangerText(e.message)}`);
      logger.error(
        dangerText("Unable to build, please fix your Tina config and try again")
      );
      process.exit(1);
    }
    let server;
    createDBServer(Number(this.datalayerPort));
    const database = await createAndInitializeDatabase(
      configManager,
      Number(this.datalayerPort)
    );
    const { queryDoc, fragDoc, graphQLSchema, tinaSchema, lookup } = await (0, import_graphql11.buildSchema)(configManager.config);
    const codegen2 = new Codegen({
      configManager,
      port: this.localOption ? Number(this.port) : void 0,
      isLocal: this.localOption,
      queryDoc,
      fragDoc,
      graphqlSchemaDoc: graphQLSchema,
      tinaSchema,
      lookup,
      noClientBuildCache: this.noClientBuildCache
    });
    const apiURL = await codegen2.execute();
    if ((configManager.hasSelfHostedConfig() || this.localOption) && !this.skipIndexing) {
      const text = this.localOption ? void 0 : "Indexing to self-hosted data layer";
      try {
        await this.indexContentWithSpinner({
          text,
          database,
          graphQLSchema,
          tinaSchema,
          configManager,
          partialReindex: this.partialReindex
        });
      } catch (e) {
        logger.error(`

${dangerText(e.message)}
`);
        if (this.verbose) {
          console.error(e);
        }
        process.exit(1);
      }
    }
    if (this.localOption) {
      server = await createDevServer(
        configManager,
        database,
        null,
        apiURL,
        true,
        (lockedFn) => lockedFn()
      );
      await server.listen(Number(this.port));
      console.log("server listening on port", this.port);
    }
    const skipCloudChecks = this.skipCloudChecks || configManager.hasSelfHostedConfig();
    if (!skipCloudChecks) {
      try {
        const clientInfo = await this.checkClientInfo(
          configManager,
          codegen2.productionUrl,
          this.previewBaseBranch
        );
        if (clientInfo.detectedBotBranch) {
          logger.warn(
            `${warnText(
              `WARN: Detected bot branch. Using schema/content from default branch '${clientInfo.defaultBranch}' instead of '${configManager.config.branch}'.`
            )}`
          );
        }
        if (!clientInfo.hasUpstream && this.upstreamBranch) {
          logger.warn(
            `${dangerText(
              `WARN: Upstream branch '${this.upstreamBranch}' specified but no upstream project was found.`
            )}`
          );
        }
        if (clientInfo.hasUpstream || this.previewBaseBranch && this.previewName) {
          await this.syncProject(configManager, codegen2.productionUrl, {
            upstreamBranch: this.upstreamBranch,
            previewBaseBranch: this.previewBaseBranch,
            previewName: this.previewName
          });
        }
        await waitForDB(
          configManager.config,
          codegen2.productionUrl,
          this.previewName,
          false
        );
        await this.checkGraphqlSchema(
          configManager,
          database,
          codegen2.productionUrl,
          clientInfo.timestamp
        );
        await this.checkTinaSchema(
          configManager,
          database,
          codegen2.productionUrl,
          this.previewName,
          this.verbose,
          clientInfo.timestamp
        );
      } catch (e) {
        logger.error(`

${dangerText(e.message)}
`);
        if (this.verbose) {
          console.error(e);
        }
        process.exit(1);
      }
    }
    await buildProductionSpa(configManager, database, codegen2.productionUrl);
    await import_fs_extra7.default.outputFile(
      configManager.outputGitignorePath,
      "index.html\nassets/"
    );
    if (configManager.config.search && !this.skipSearchIndex && !this.localOption) {
      let client;
      const hasTinaSearch = Boolean(configManager.config?.search?.tina);
      if (hasTinaSearch) {
        if (!configManager.config?.branch) {
          logger.error(
            `${dangerText(
              `ERROR: Branch not configured in tina search configuration.`
            )}`
          );
          throw new Error(
            "Branch not configured in tina search configuration."
          );
        }
        if (!configManager.config?.clientId) {
          logger.error(`${dangerText(`ERROR: clientId not configured.`)}`);
          throw new Error("clientId not configured.");
        }
        if (!configManager.config?.search?.tina?.indexerToken) {
          logger.error(
            `${dangerText(
              `ERROR: indexerToken not configured in tina search configuration.`
            )}`
          );
          throw new Error(
            "indexerToken not configured in tina search configuration."
          );
        }
        client = new import_search2.TinaCMSSearchIndexClient({
          apiUrl: `${configManager.config.tinaioConfig?.contentApiUrlOverride || "https://content.tinajs.io"}/searchIndex/${configManager.config?.clientId}`,
          branch: configManager.config?.branch,
          indexerToken: configManager.config?.search?.tina?.indexerToken,
          stopwordLanguages: configManager.config?.search?.tina?.stopwordLanguages
        });
      } else {
        client = configManager.config?.search?.searchClient;
      }
      const searchIndexer = new import_search2.SearchIndexer({
        batchSize: configManager.config.search?.indexBatchSize || 100,
        bridge: new import_graphql11.FilesystemBridge(
          configManager.rootPath,
          configManager.contentRootPath
        ),
        schema: tinaSchema,
        client
      });
      let err;
      await spin({
        waitFor: async () => {
          try {
            await searchIndexer.indexAllContent();
          } catch (e) {
            err = e;
          }
        },
        text: "Building search index"
      });
      if (err) {
        logger.error(`${dangerText(`ERROR: ${err.message}`)}`);
        process.exit(1);
      }
    }
    const summaryItems = [];
    const autogeneratedFiles = [];
    if (!configManager.shouldSkipSDK()) {
      autogeneratedFiles.push({
        key: "GraphQL Client",
        value: configManager.printGeneratedClientFilePath()
      });
      autogeneratedFiles.push({
        key: "Typescript Types",
        value: configManager.printGeneratedTypesFilePath()
      });
    }
    autogeneratedFiles.push({
      key: "Static HTML file",
      value: configManager.printRelativePath(configManager.outputHTMLFilePath)
    });
    summaryItems.push({
      emoji: "\u{1F916}",
      heading: "Auto-generated files",
      subItems: autogeneratedFiles
    });
    summary({
      heading: "Tina build complete",
      items: [
        {
          emoji: "\u{1F999}",
          heading: "Tina Config",
          subItems: [
            {
              key: "API url",
              value: apiURL
            }
          ]
        },
        ...summaryItems
      ]
    });
    if (this.subCommand) {
      await this.startSubCommand();
    } else {
      process.exit();
    }
  }
  async checkClientInfo(configManager, apiURL, previewBaseBranch) {
    const MAX_RETRIES = 5;
    const { config: config2 } = configManager;
    const token = config2.token;
    const { clientId, branch, host } = (0, import_schema_tools2.parseURL)(apiURL);
    const bar2 = new import_progress2.default("Checking clientId and token. :prog", 1);
    const getBranchInfo = async () => {
      const url = `https://${host}/db/${clientId}/status/${previewBaseBranch || branch}`;
      const branchInfo2 = {
        status: "unknown",
        branchKnown: false,
        hasUpstream: false,
        timestamp: 0,
        detectedBotBranch: false,
        defaultBranch: void 0
      };
      try {
        const res = await request({
          token,
          url
        });
        branchInfo2.status = res.status;
        branchInfo2.branchKnown = res.status !== "unknown";
        branchInfo2.timestamp = res.timestamp || 0;
        branchInfo2.hasUpstream = res.hasUpstream;
        branchInfo2.detectedBotBranch = res.json.detectedBotBranch;
        branchInfo2.defaultBranch = res.json.defaultBranch;
      } catch (e) {
        summary({
          heading: "Error when checking client information",
          items: [
            {
              emoji: "\u274C",
              heading: "You provided",
              subItems: [
                {
                  key: "clientId",
                  value: config2.clientId
                },
                {
                  key: "branch",
                  value: config2.branch
                },
                {
                  key: "token",
                  value: config2.token
                }
              ]
            }
          ]
        });
        throw e;
      }
      return branchInfo2;
    };
    const branchInfo = await getBranchInfo();
    bar2.tick({
      prog: "\u2705"
    });
    const branchBar = new import_progress2.default(
      `Checking branch '${config2.branch}' is on TinaCloud. :prog`,
      1
    );
    if (branchInfo.branchKnown) {
      branchBar.tick({
        prog: "\u2705"
      });
      return branchInfo;
    }
    for (let i = 1; i <= MAX_RETRIES; i++) {
      await timeout(5e3);
      const branchInfo2 = await getBranchInfo();
      if (this.verbose) {
        logger.info(
          `Branch status: ${branchInfo2.status}. Attempt: ${i}. Trying again in 5 seconds.`
        );
      }
      if (branchInfo2.branchKnown) {
        branchBar.tick({
          prog: "\u2705"
        });
        return branchInfo2;
      }
    }
    branchBar.tick({
      prog: "\u274C"
    });
    logger.error(
      `${dangerText(
        `ERROR: Branch '${branch}' is not on TinaCloud.`
      )} Please make sure that branch '${branch}' exists in your repository and that you have pushed your all changes to the remote. View all branches and their current status here: ${linkText(
        `https://app.tina.io/projects/${clientId}/configuration`
      )}`
    );
    throw new Error("Branch is not on TinaCloud");
  }
  async syncProject(configManager, apiURL, options) {
    const { config: config2 } = configManager;
    const token = config2.token;
    const { clientId, branch, host } = (0, import_schema_tools2.parseURL)(apiURL);
    const { previewName, previewBaseBranch, upstreamBranch } = options || {};
    let url = `https://${host}/db/${clientId}/reset/${branch}?refreshSchema=true&skipIfSchemaCurrent=true`;
    if (upstreamBranch && previewBaseBranch && previewName) {
      url = `https://${host}/db/${clientId}/reset/${previewBaseBranch}?refreshSchema=true&skipIfSchemaCurrent=true&upstreamBranch=${upstreamBranch}&previewName=${previewName}`;
    } else if (!upstreamBranch && previewBaseBranch && previewName) {
      url = `https://${host}/db/${clientId}/reset/${previewBaseBranch}?refreshSchema=true&skipIfSchemaCurrent=true&previewName=${branch}`;
    } else if (upstreamBranch && !previewBaseBranch && !previewName) {
      url = `https://${host}/db/${clientId}/reset/${branch}?refreshSchema=true&skipIfSchemaCurrent=true&upstreamBranch=${upstreamBranch}`;
    }
    const bar2 = new import_progress2.default("Syncing Project. :prog", 1);
    try {
      const res = await request({
        token,
        url,
        method: "POST"
      });
      bar2.tick({
        prog: "\u2705"
      });
      if (res.status === "success") {
        return;
      }
    } catch (e) {
      summary({
        heading: `Error when requesting project sync`,
        items: [
          {
            emoji: "\u274C",
            heading: "You provided",
            subItems: [
              {
                key: "clientId",
                value: config2.clientId
              },
              {
                key: "branch",
                value: config2.branch
              },
              {
                key: "token",
                value: config2.token
              }
            ]
          }
        ]
      });
      throw e;
    }
  }
  async checkGraphqlSchema(configManager, database, apiURL, timestamp) {
    const bar2 = new import_progress2.default(
      "Checking local GraphQL Schema matches server. :prog",
      1
    );
    const { config: config2 } = configManager;
    const token = config2.token;
    const { remoteSchema, remoteProjectVersion } = await fetchRemoteGraphqlSchema({
      url: apiURL,
      token
    });
    if (!remoteSchema) {
      bar2.tick({
        prog: "\u274C"
      });
      let errorMessage = `The remote GraphQL schema does not exist. Check indexing for this branch.`;
      if (config2?.branch) {
        errorMessage += `

Additional info: Branch: ${config2.branch}, Client ID: ${config2.clientId} `;
      }
      throw new Error(errorMessage);
    }
    const remoteGqlSchema = (0, import_graphql12.buildClientSchema)(remoteSchema);
    const localSchemaDocument = await database.getGraphQLSchemaFromBridge();
    const localGraphqlSchema = (0, import_graphql12.buildASTSchema)(localSchemaDocument);
    try {
      const diffResult = await (0, import_core3.diff)(remoteGqlSchema, localGraphqlSchema);
      if (diffResult.length === 0) {
        bar2.tick({
          prog: "\u2705"
        });
      } else {
        bar2.tick({
          prog: "\u274C"
        });
        const type = diffResult[0].type;
        const reason = diffResult[0].message;
        const errorLevel = diffResult[0].criticality.level;
        const faqLink = getFaqLink(type);
        const tinaGraphQLVersion = configManager.getTinaGraphQLVersion();
        let errorMessage = `The local GraphQL schema doesn't match the remote GraphQL schema. Please push up your changes to GitHub to update your remote GraphQL schema. ${faqLink && `
Check out '${faqLink}' for possible solutions.`}`;
        errorMessage += `

Additional info:

`;
        if (config2?.branch) {
          errorMessage += `	Branch: ${config2.branch}, Client ID: ${config2.clientId}
`;
        }
        errorMessage += `	Local GraphQL version: ${tinaGraphQLVersion.fullVersion} / Remote GraphQL version: ${remoteProjectVersion}
`;
        errorMessage += `	Last indexed at: ${new Date(
          timestamp
        ).toUTCString()}
`;
        errorMessage += `	Reason: [${errorLevel} - ${type}] ${reason}
`;
        throw new Error(errorMessage);
      }
    } catch (e) {
      if (e.message.startsWith("Cannot use")) {
        logger.warn(
          `${warnText(
            "Skipping schema check due to conflicting GraphQL versions"
          )}`
        );
      } else {
        throw e;
      }
    }
  }
  async checkTinaSchema(configManager, database, apiURL, previewName, verbose, timestamp) {
    const bar2 = new import_progress2.default(
      "Checking local Tina Schema matches server. :prog",
      1
    );
    const { config: config2 } = configManager;
    const token = config2.token;
    const { clientId, branch, isLocalClient, host } = (0, import_schema_tools2.parseURL)(apiURL);
    if (isLocalClient || !host || !clientId || !branch) {
      if (verbose) {
        logger.info(logText("Not using TinaCloud, skipping Tina Schema check"));
      }
      return;
    }
    const { tinaSchema: remoteTinaSchemaSha } = await fetchSchemaSha({
      url: `https://${host}/db/${clientId}/${previewName || branch}/schemaSha`,
      token
    });
    if (!remoteTinaSchemaSha) {
      bar2.tick({
        prog: "\u274C"
      });
      let errorMessage = `The remote Tina schema does not exist. Check indexing for this branch.`;
      if (config2?.branch) {
        errorMessage += `

Additional info: Branch: ${config2.branch}, Client ID: ${config2.clientId} `;
      }
      throw new Error(errorMessage);
    }
    if (!database.bridge) {
      throw new Error(`No bridge configured`);
    }
    const localTinaSchema = JSON.parse(
      await database.bridge.get(
        import_path6.default.join(database.tinaDirectory, "__generated__", "_schema.json")
      )
    );
    localTinaSchema.version = void 0;
    const localTinaSchemaSha = import_crypto.default.createHash("sha256").update(JSON.stringify(localTinaSchema)).digest("hex");
    if (localTinaSchemaSha === remoteTinaSchemaSha) {
      bar2.tick({
        prog: "\u2705"
      });
    } else {
      bar2.tick({
        prog: "\u274C"
      });
      let errorMessage = `The local Tina schema doesn't match the remote Tina schema. Please push up your changes to GitHub to update your remote tina schema.`;
      errorMessage += `

Additional info:

`;
      if (config2?.branch) {
        errorMessage += `        Branch: ${config2.branch}, Client ID: ${config2.clientId}
`;
      }
      errorMessage += `        Last indexed at: ${new Date(
        timestamp
      ).toUTCString()}
`;
      throw new Error(errorMessage);
    }
  }
};
async function request(args) {
  const headers = new Headers();
  if (args.token) {
    headers.append("X-API-KEY", args.token);
  }
  headers.append("Content-Type", "application/json");
  const url = args?.url;
  const res = await fetch(url, {
    method: args.method || "GET",
    headers,
    redirect: "follow"
  });
  const json = await res.json();
  if (!res.ok) {
    let additionalInfo = "";
    if (res.status === 401 || res.status === 403) {
      additionalInfo = "Please check that your client ID, URL and read only token are configured properly.";
    }
    if (json) {
      additionalInfo += `

Message from server: ${json.message}`;
    }
    throw new Error(
      `Server responded with status code ${res.status}, ${res.statusText}. ${additionalInfo ? additionalInfo : ""} Please see our FAQ for more information: https://tina.io/docs/errors/faq/`
    );
  }
  if (json.errors) {
    throw new Error(
      `Unable to fetch, please see our FAQ for more information: https://tina.io/docs/errors/faq/

      Errors: 
	${json.errors.map((error) => error.message).join("\n")}`
    );
  }
  return {
    status: json?.status,
    timestamp: json?.timestamp,
    hasUpstream: json?.hasUpstream || false,
    json
  };
}
var fetchRemoteGraphqlSchema = async ({
  url,
  token
}) => {
  const headers = new Headers();
  if (token) {
    headers.append("X-API-KEY", token);
  }
  const body = JSON.stringify({
    query: (0, import_graphql12.getIntrospectionQuery)(),
    variables: {}
  });
  headers.append("Content-Type", "application/json");
  const res = await fetch(url, {
    method: "POST",
    headers,
    body
  });
  const data = await res.json();
  return {
    remoteSchema: data?.data,
    remoteRuntimeVersion: res.headers.get("tinacms-grapqhl-version"),
    remoteProjectVersion: res.headers.get("tinacms-graphql-project-version")
  };
};
var fetchSchemaSha = async ({
  url,
  token
}) => {
  const headers = new Headers();
  if (token) {
    headers.append("X-API-KEY", token);
  }
  const res = await fetch(url, {
    method: "GET",
    headers,
    cache: "no-cache"
  });
  return res.json();
};

// src/next/commands/audit-command/index.ts
var import_clipanion4 = require("clipanion");
var import_graphql14 = require("@tinacms/graphql");

// src/next/commands/audit-command/audit.ts
var import_prompts = __toESM(require("prompts"));
var import_metrics = require("@tinacms/metrics");
var import_graphql13 = require("@tinacms/graphql");
var import_chalk5 = __toESM(require("chalk"));
var audit = async ({
  database,
  clean,
  useDefaultValues,
  noTelemetry,
  verbose
}) => {
  const telemetry = new import_metrics.Telemetry({ disabled: noTelemetry });
  await telemetry.submitRecord({
    event: {
      name: "tinacms:cli:audit:invoke",
      clean: Boolean(clean),
      useDefaults: Boolean(useDefaultValues)
    }
  });
  if (clean) {
    logger.info(
      `You are using the \`--clean\` option. This will modify your content as if a user is submitting a form. Before running this you should have a ${import_chalk5.default.bold(
        "clean git tree"
      )} so unwanted changes can be undone.

`
    );
    const res = await (0, import_prompts.default)({
      name: "useClean",
      type: "confirm",
      message: `Do you want to continue?`
    });
    if (!res.useClean) {
      logger.warn(import_chalk5.default.yellowBright("\u26A0\uFE0F Audit not complete"));
      process.exit(0);
    }
  }
  if (useDefaultValues && !clean) {
    logger.warn(
      import_chalk5.default.yellowBright(
        "WARNING: using the `--useDefaultValues` without the `--clean` flag has no effect. Please re-run audit and add the `--clean` flag"
      )
    );
  }
  const schema = await database.getSchema();
  const collections = schema.getCollections();
  let error = false;
  for (let i = 0; i < collections.length; i++) {
    const collection = collections[i];
    const docs = await database.query(
      { collection: collection.name, first: -1, filterChain: [] },
      (item) => ({ path: item })
    );
    logger.info(
      `Checking ${neutralText(collection.name)} collection. ${docs.edges.length} Documents`
    );
    const returnError = await auditDocuments({
      collection,
      database,
      useDefaultValues,
      documents: docs.edges,
      verbose
    });
    error = error || returnError;
  }
  if (error) {
    logger.error(
      import_chalk5.default.redBright(`\u203C\uFE0F Audit ${import_chalk5.default.bold("failed")} with errors`)
    );
  } else {
    logger.info(import_chalk5.default.greenBright("\u2705 Audit passed"));
  }
};
var auditDocuments = async (args) => {
  const { collection, database, useDefaultValues, documents } = args;
  let error = false;
  for (let i = 0; i < documents.length; i++) {
    const node = documents[i].node;
    const relativePath = node.path.replace(`${collection.path}/`, "");
    const documentQuery = `query {
        document(collection: "${collection.name}", relativePath: "${relativePath}") {
          __typename
          ...on Document {
            _values
          }
        }
      }`;
    const docResult = await (0, import_graphql13.resolve)({
      database,
      query: documentQuery,
      variables: {},
      silenceErrors: true,
      verbose: args.verbose || false,
      isAudit: true
    });
    if (docResult.errors) {
      error = true;
      docResult.errors.forEach((err) => {
        logger.error(import_chalk5.default.red(err.message));
        if (err.originalError.originalError) {
          logger.error(
            // @ts-ignore FIXME: this doesn't seem right
            import_chalk5.default.red(`    ${err.originalError.originalError.message}`)
          );
        }
      });
    } else {
      const topLevelDefaults = {};
      if (useDefaultValues && typeof collection.fields !== "string") {
        collection.fields.filter((x) => !x.list).forEach((x) => {
          const value = x.ui;
          if (typeof value !== "undefined") {
            topLevelDefaults[x.name] = value.defaultValue;
          }
        });
      }
      const tinaSchema = await database.getSchema();
      const values = mergeValuesWithDefaults(
        docResult.data.document._values,
        topLevelDefaults
      );
      const params = tinaSchema.transformPayload(collection.name, values);
      const mutation = `mutation($collection: String!, $relativePath: String!, $params: DocumentUpdateMutation!) {
        updateDocument(
          collection: $collection,
          relativePath: $relativePath,
          params: $params
        ){__typename}
      }`;
      const mutationRes = await (0, import_graphql13.resolve)({
        database,
        query: mutation,
        variables: {
          params,
          collection: collection.name,
          relativePath
        },
        isAudit: true,
        silenceErrors: true,
        verbose: args.verbose || false
      });
      if (mutationRes.errors) {
        mutationRes.errors.forEach((err) => {
          error = true;
          logger.error(import_chalk5.default.red(err.message));
        });
      }
    }
  }
  return error;
};
var mergeValuesWithDefaults = (document, defaults) => {
  return { ...defaults, ...filterObject(document) };
};
function filterObject(obj) {
  const ret = {};
  Object.keys(obj).filter((key) => obj[key] !== void 0).forEach((key) => ret[key] = obj[key]);
  return ret;
}

// src/next/commands/audit-command/index.ts
var import_graphql15 = require("@tinacms/graphql");
var AuditCommand = class extends import_clipanion4.Command {
  constructor() {
    super(...arguments);
    this.rootPath = import_clipanion4.Option.String("--rootPath", {
      description: "Specify the root directory to run the CLI from"
    });
    this.verbose = import_clipanion4.Option.Boolean("-v,--verbose", false, {
      description: "increase verbosity of logged output"
    });
    this.clean = import_clipanion4.Option.Boolean("--clean", false, {
      description: "Clean the output"
    });
    this.useDefaultValues = import_clipanion4.Option.Boolean("--useDefaultValues", false, {
      description: "When cleaning the output, use defaults on the config"
    });
    this.noTelemetry = import_clipanion4.Option.Boolean("--noTelemetry", false, {
      description: "Disable anonymous telemetry that is collected"
    });
    this.datalayerPort = import_clipanion4.Option.String("--datalayer-port", "9000", {
      description: "Specify a port to run the datalayer server on. (default 9000)"
    });
  }
  static {
    this.paths = [["audit"]];
  }
  static {
    this.usage = import_clipanion4.Command.Usage({
      category: `Commands`,
      description: `Audit config and content files`
    });
  }
  async catch(error) {
    logger.error("Error occured during tinacms audit");
    if (this.verbose) {
      console.error(error);
    }
    process.exit(1);
  }
  async execute() {
    const configManager = new ConfigManager({ rootPath: this.rootPath });
    logger.info("Starting Tina Audit");
    try {
      await configManager.processConfig();
    } catch (e) {
      logger.error(e.message);
      process.exit(1);
    }
    createDBServer(Number(this.datalayerPort));
    const database = await createAndInitializeDatabase(
      configManager,
      Number(this.datalayerPort),
      this.clean ? void 0 : new import_graphql15.AuditFileSystemBridge(configManager.rootPath)
    );
    const { tinaSchema, graphQLSchema, lookup } = await (0, import_graphql14.buildSchema)(
      configManager.config
    );
    const warnings = [];
    await spin({
      waitFor: async () => {
        const res = await database.indexContent({
          graphQLSchema,
          tinaSchema,
          lookup
        });
        warnings.push(...res.warnings);
      },
      text: "Indexing local files"
    });
    if (warnings.length > 0) {
      logger.warn(`Indexing completed with ${warnings.length} warning(s)`);
      warnings.forEach((warning) => {
        logger.warn(warnText(`${warning}`));
      });
    }
    await audit({
      database,
      clean: this.clean,
      noTelemetry: this.noTelemetry,
      useDefaultValues: this.useDefaultValues,
      verbose: this.verbose
    });
    process.exit();
  }
};

// src/next/commands/init-command/index.ts
var import_clipanion6 = require("clipanion");

// src/cmds/init/detectEnvironment.ts
var import_fs_extra8 = __toESM(require("fs-extra"));
var import_path7 = __toESM(require("path"));
var checkGitignoreForItem = async ({
  baseDir,
  line
}) => {
  const gitignoreContent = import_fs_extra8.default.readFileSync(import_path7.default.join(baseDir, ".gitignore")).toString();
  return gitignoreContent.split("\n").some((item) => item === line);
};
var makeGeneratedFile = async (name2, generatedFileType, parentPath, opts) => {
  const result = {
    fullPathTS: import_path7.default.join(
      parentPath,
      `${name2}.${opts?.typescriptSuffix || opts?.extensionOverride || "ts"}`
    ),
    fullPathJS: import_path7.default.join(
      parentPath,
      `${name2}.${opts?.extensionOverride || "js"}`
    ),
    fullPathOverride: opts?.extensionOverride ? import_path7.default.join(parentPath, `${name2}.${opts?.extensionOverride}`) : "",
    generatedFileType,
    name: name2,
    parentPath,
    typescriptExists: false,
    javascriptExists: false,
    get resolve() {
      return (typescript) => typescript ? {
        exists: this.typescriptExists,
        path: this.fullPathTS,
        parentPath: this.parentPath
      } : {
        exists: this.javascriptExists,
        path: this.fullPathJS,
        parentPath: this.parentPath
      };
    }
  };
  result.typescriptExists = await import_fs_extra8.default.pathExists(result.fullPathTS);
  result.javascriptExists = await import_fs_extra8.default.pathExists(result.fullPathJS);
  return result;
};
var detectEnvironment = async ({
  baseDir = "",
  pathToForestryConfig,
  rootPath,
  debug = false
}) => {
  const hasForestryConfig = await import_fs_extra8.default.pathExists(
    import_path7.default.join(pathToForestryConfig, ".forestry", "settings.yml")
  );
  const sampleContentPath = import_path7.default.join(
    baseDir,
    "content",
    "posts",
    "hello-world.md"
  );
  const usingSrc = import_fs_extra8.default.pathExistsSync(import_path7.default.join(baseDir, "src")) && (import_fs_extra8.default.pathExistsSync(import_path7.default.join(baseDir, "src", "app")) || import_fs_extra8.default.pathExistsSync(import_path7.default.join(baseDir, "src", "pages")));
  const tinaFolder = import_path7.default.join(baseDir, "tina");
  const tinaConfigExists = Boolean(
    // Does the tina folder exist?
    await import_fs_extra8.default.pathExists(tinaFolder) && // Does the tina folder contain a config file?
    (await import_fs_extra8.default.readdir(tinaFolder)).find((x) => x.includes("config"))
  );
  const pagesDir = [baseDir, usingSrc ? "src" : false, "pages"].filter(
    Boolean
  );
  const generatedFiles = {
    config: await makeGeneratedFile("config", "config", tinaFolder),
    database: await makeGeneratedFile("database", "database", tinaFolder),
    templates: await makeGeneratedFile("templates", "templates", tinaFolder),
    "next-api-handler": await makeGeneratedFile(
      "[...routes]",
      "next-api-handler",
      import_path7.default.join(...pagesDir, "api", "tina")
    ),
    "reactive-example": await makeGeneratedFile(
      "[filename]",
      "reactive-example",
      import_path7.default.join(...pagesDir, "demo", "blog"),
      {
        typescriptSuffix: "tsx"
      }
    ),
    "users-json": await makeGeneratedFile(
      "index",
      "users-json",
      import_path7.default.join(baseDir, "content", "users"),
      { extensionOverride: "json" }
    ),
    "sample-content": await makeGeneratedFile(
      "hello-world",
      "sample-content",
      import_path7.default.join(baseDir, "content", "posts"),
      { extensionOverride: "md" }
    )
  };
  const hasSampleContent = await import_fs_extra8.default.pathExists(sampleContentPath);
  const hasPackageJSON = await import_fs_extra8.default.pathExists("package.json");
  let hasTinaDeps = false;
  if (hasPackageJSON) {
    try {
      const packageJSON = await import_fs_extra8.default.readJSON("package.json");
      const deps = [];
      if (packageJSON?.dependencies) {
        deps.push(...Object.keys(packageJSON.dependencies));
      }
      if (packageJSON?.devDependencies) {
        deps.push(...Object.keys(packageJSON.devDependencies));
      }
      if (deps.includes("@tinacms/cli") && deps.includes("tinacms")) {
        hasTinaDeps = true;
      }
    } catch (e) {
      logger.error(
        "Error reading package.json assuming that no Tina dependencies are installed"
      );
    }
  }
  const hasGitIgnore = await import_fs_extra8.default.pathExists(import_path7.default.join(".gitignore"));
  const hasGitIgnoreNodeModules = hasGitIgnore && await checkGitignoreForItem({ baseDir, line: "node_modules" });
  const hasEnvTina = hasGitIgnore && await checkGitignoreForItem({ baseDir, line: ".env.tina" });
  const hasGitIgnoreEnv = hasGitIgnore && await checkGitignoreForItem({ baseDir, line: ".env" });
  let frontMatterFormat;
  if (hasForestryConfig) {
    const hugoConfigPath = import_path7.default.join(rootPath, "config.toml");
    if (await import_fs_extra8.default.pathExists(hugoConfigPath)) {
      const hugoConfig = await import_fs_extra8.default.readFile(hugoConfigPath, "utf8");
      const metaDataFormat = hugoConfig.toString().match(/metaDataFormat = "(.*)"/)?.[1];
      if (metaDataFormat && (metaDataFormat === "yaml" || metaDataFormat === "toml" || metaDataFormat === "json")) {
        frontMatterFormat = metaDataFormat;
      }
    }
  }
  const env = {
    forestryConfigExists: hasForestryConfig,
    frontMatterFormat,
    gitIgnoreExists: hasGitIgnore,
    gitIgnoreNodeModulesExists: hasGitIgnoreNodeModules,
    gitIgnoreEnvExists: hasGitIgnoreEnv,
    gitIgnoreTinaEnvExists: hasEnvTina,
    packageJSONExists: hasPackageJSON,
    sampleContentExists: hasSampleContent,
    sampleContentPath,
    generatedFiles,
    usingSrc,
    tinaConfigExists,
    hasTinaDeps
  };
  if (debug) {
    console.log("Environment:");
    console.log(JSON.stringify(env, null, 2));
  }
  return env;
};
var detectEnvironment_default = detectEnvironment;

// src/cmds/init/prompts/index.ts
var import_prompts6 = __toESM(require("prompts"));

// src/cmds/init/prompts/askTinaCloudSetup.ts
var import_prompts2 = __toESM(require("prompts"));
var tinaCloudSetupQuestions = [
  {
    name: "clientId",
    type: "text",
    message: `What is your TinaCloud Client ID? (Hit enter to skip and set up yourself later)
${logText(
      "Don't have a Client ID? Create one here: "
    )}${linkText("https://app.tina.io/projects/new")}`,
    initial: process.env.NEXT_PUBLIC_TINA_CLIENT_ID
  },
  {
    name: "token",
    type: "text",
    message: (prev) => `What is your TinaCloud Read Only Token?
${logText(
      "Don't have a Read Only Token? Create one here: "
    )}${linkText(`https://app.tina.io/projects/${prev || "[XXX]"}/tokens`)}`,
    initial: process.env.TINA_TOKEN
  }
];
var askTinaCloudSetup = async ({ config: config2 }) => {
  const { clientId, token } = await (0, import_prompts2.default)(tinaCloudSetupQuestions);
  config2.envVars.push(
    {
      key: "NEXT_PUBLIC_TINA_CLIENT_ID",
      value: clientId
    },
    {
      key: "TINA_TOKEN",
      value: token
    }
  );
};

// src/cmds/init/prompts/gitProvider.ts
var import_prompts3 = __toESM(require("prompts"));
var supportedGitProviders = {
  github: {
    imports: [
      {
        from: "tinacms-gitprovider-github",
        imported: ["GitHubProvider"],
        packageName: "tinacms-gitprovider-github"
      }
    ],
    gitProviderClassText: `new GitHubProvider({
          branch,
          owner: process.env.GITHUB_OWNER,
          repo: process.env.GITHUB_REPO,
          token: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
        })`
  },
  other: {
    gitProviderClassText: ""
  }
};
var chooseGitProvider = async ({ config: config2 }) => {
  const result = await (0, import_prompts3.default)([
    {
      name: "githubToken",
      type: "text",
      message: `What is your GitHub Personal Access Token? (Hit enter to skip and set up later)
${logText(
        "Learn more here: "
      )}${linkText(
        "https://tina.io/docs/self-hosted/existing-site/#github-personal-access-token"
      )}`,
      initial: process.env.GITHUB_PERSONAL_ACCESS_TOKEN
    },
    {
      name: "githubOwner",
      type: "text",
      message: `What is your GitHub Owner (Your Github Username)? 
(Hit enter to skip and set up later)
`
    },
    {
      name: "githubRepo",
      type: "text",
      message: `What is your GitHub Repo name? Ex: my-nextjs-app 
(Hit enter to skip and set up later)
`
    }
  ]);
  config2.envVars.push(
    {
      key: "GITHUB_PERSONAL_ACCESS_TOKEN",
      value: result.githubToken
    },
    {
      key: "GITHUB_OWNER",
      value: result.githubOwner
    },
    {
      key: "GITHUB_REPO",
      value: result.githubRepo
    }
  );
  return supportedGitProviders.github;
};

// src/cmds/init/prompts/databaseAdapter.ts
var import_prompts4 = __toESM(require("prompts"));
var supportedDatabaseAdapters = {
  ["upstash-redis"]: {
    databaseAdapterClassText: `new RedisLevel({
        redis: {
          url: process.env.KV_REST_API_URL || 'http://localhost:8079',
          token: process.env.KV_REST_API_TOKEN || 'example_token',
        },
        debug: process.env.DEBUG === 'true' || false,
      })`,
    imports: [
      {
        imported: ["RedisLevel"],
        from: "upstash-redis-level",
        packageName: "upstash-redis-level"
      }
    ]
  },
  mongodb: {
    databaseAdapterClassText: `new MongodbLevel({
          collectionName: 'tinacms',
          dbName: 'tinacms',
          mongoUri: process.env.MONGODB_URI,
        })`,
    imports: [
      {
        from: "mongodb-level",
        imported: ["MongodbLevel"],
        packageName: "mongodb-level"
      },
      {
        from: "mongodb",
        imported: [],
        // not explicitly imported
        packageName: "mongodb"
      }
    ]
  },
  other: {
    databaseAdapterClassText: ""
  }
};
var databaseAdapterUpdateConfig = {
  other: async (_args) => {
  },
  mongodb: async ({ config: config2 }) => {
    const result = await (0, import_prompts4.default)([
      {
        name: "mongoDBUri",
        type: "text",
        message: `What is the MongoDB URI, Ex: mongodb+srv://<username>:<password>@cluster0.yoeujeh.mongodb.net/?retryWrites=true&w=majority
(Hit enter to skip and set up yourself later)`,
        initial: process.env.MONGODB_URI
      }
    ]);
    config2.envVars.push({
      key: "MONGODB_URI",
      value: result.mongoDBUri
    });
  },
  "upstash-redis": async ({ config: config2 }) => {
    const result = await (0, import_prompts4.default)([
      {
        name: "kvRestApiUrl",
        type: "text",
        message: `What is the KV (Redis) Rest API URL? Ex: https://***.upstash.io
 (Hit enter to skip and set up yourself later)`,
        initial: process.env.KV_REST_API_URL
      },
      {
        name: "kvRestApiToken",
        type: "text",
        message: `What is the KV (Redis) Rest API Token? (Hit enter to skip and set up yourself later)`,
        initial: process.env.KV_REST_API_TOKEN
      }
    ]);
    config2.envVars.push(
      {
        key: "KV_REST_API_URL",
        value: result.kvRestApiUrl
      },
      {
        key: "KV_REST_API_TOKEN",
        value: result.kvRestApiToken
      }
    );
  }
};
var chooseDatabaseAdapter = async ({
  framework,
  config: config2
}) => {
  const answers = await (0, import_prompts4.default)([
    {
      name: "dataLayerAdapter",
      message: "Select a self-hosted Database Adapter",
      type: "select",
      choices: [
        {
          title: "Vercel KV/Upstash Redis",
          value: "upstash-redis"
        },
        {
          title: "MongoDB",
          value: "mongodb"
        }
        // {
        //   title: "I'll create my own database adapter",
        //   value: 'other',
        // },
      ]
    }
  ]);
  if (typeof answers.dataLayerAdapter === "undefined") {
    throw new Error("Database adapter is required");
  }
  const chosen = answers.dataLayerAdapter;
  await databaseAdapterUpdateConfig[chosen]({ config: config2 });
  return supportedDatabaseAdapters[chosen];
};

// src/cmds/init/prompts/authProvider.ts
var import_crypto_js = __toESM(require("crypto-js"));
var import_prompts5 = __toESM(require("prompts"));
var supportedAuthProviders = {
  other: {
    name: "other"
  },
  "tina-cloud": {
    configAuthProviderClass: "",
    backendAuthProvider: "TinaCloudBackendAuthProvider()",
    name: "tina-cloud",
    backendAuthProviderImports: [
      {
        imported: ["TinaCloudBackendAuthProvider"],
        from: "@tinacms/auth",
        packageName: "@tinacms/auth"
      }
    ]
  },
  "next-auth": {
    name: "next-auth",
    configAuthProviderClass: `new UsernamePasswordAuthJSProvider()`,
    configImports: [
      {
        imported: ["UsernamePasswordAuthJSProvider", "TinaUserCollection"],
        from: "tinacms-authjs/dist/tinacms",
        packageName: "tinacms-authjs"
      }
    ],
    extraTinaCollections: ["TinaUserCollection"],
    backendAuthProvider: `AuthJsBackendAuthProvider({
          authOptions: TinaAuthJSOptions({
            databaseClient: databaseClient,
            secret: process.env.NEXTAUTH_SECRET,
          }),
        })`,
    backendAuthProviderImports: [
      {
        from: "tinacms-authjs",
        packageName: "tinacms-authjs",
        imported: ["AuthJsBackendAuthProvider", "TinaAuthJSOptions"]
      }
    ],
    peerDependencies: ["next-auth"]
  }
};
var authProviderUpdateConfig = {
  other: async () => {
  },
  "tina-cloud": askTinaCloudSetup,
  "next-auth": async ({ config: config2 }) => {
    const result = await (0, import_prompts5.default)([
      {
        name: "nextAuthSecret",
        type: "text",
        message: `What is the NextAuth.js Secret? (Hit enter to use a randomly generated secret)`,
        initial: process.env.NEXTAUTH_SECRET || import_crypto_js.default.lib.WordArray.random(16).toString()
      }
    ]);
    config2.envVars.push({
      key: "NEXTAUTH_SECRET",
      value: result.nextAuthSecret
    });
  }
};
var chooseAuthProvider = async ({
  framework,
  config: config2
}) => {
  const authProvider = supportedAuthProviders["next-auth"];
  await authProviderUpdateConfig["next-auth"]({
    config: config2
  });
  return authProvider;
};

// src/cmds/init/prompts/index.ts
var forestryDisclaimer = logText(
  `Note: This migration will update some of your content to match tina.  Please save a backup of your content before doing this migration. (This can be done with git)`
);
var askCommonSetUp = async () => {
  const answers = await (0, import_prompts6.default)([
    {
      name: "framework",
      type: "select",
      message: "What framework are you using?",
      choices: [
        { title: "Next.js", value: { name: "next", reactive: true } },
        { title: "Hugo", value: { name: "hugo", reactive: false } },
        { title: "Jekyll", value: { name: "jekyll", reactive: false } },
        {
          title: "Other (SSG frameworks like gatsby, etc.)",
          value: { name: "other", reactive: false }
        }
      ]
    },
    {
      name: "packageManager",
      type: "select",
      message: "Choose your package manager",
      choices: [
        { title: "PNPM", value: "pnpm" },
        { title: "Yarn", value: "yarn" },
        { title: "NPM", value: "npm" }
      ]
    }
  ]);
  if (typeof answers.framework === "undefined" || typeof answers.packageManager === "undefined") {
    throw new Error("Framework and package manager are required");
  }
  return answers;
};
var askForestryMigrate = async ({
  framework,
  env
}) => {
  const questions = [
    {
      name: "forestryMigrate",
      type: "confirm",
      initial: true,
      message: `Would you like to migrate your Forestry templates?
${forestryDisclaimer}`
    }
  ];
  if (framework.name === "hugo") {
    questions.push({
      name: "frontMatterFormat",
      type: (_, answers2) => {
        if (answers2.forestryMigrate) {
          if (env.frontMatterFormat && env.frontMatterFormat[1]) {
            return null;
          }
          return "select";
        }
      },
      choices: [
        { title: "yaml", value: "yaml" },
        { title: "toml", value: "toml" },
        { title: "json", value: "json" }
      ],
      message: `What format are you using in your frontmatter?`
    });
  }
  const answers = await (0, import_prompts6.default)(questions);
  return answers;
};
var askTinaSetupPrompts = async (params) => {
  const questions = [
    {
      name: "typescript",
      type: "confirm",
      initial: true,
      message: "Would you like to use Typescript for your Tina Configuration (Recommended)?"
    }
  ];
  if (!params.config.publicFolder) {
    questions.push({
      name: "publicFolder",
      type: "text",
      initial: "public",
      message: `Where are public assets stored? (default: "public")
` + logText(
        `Not sure what value to use? Refer to our "Frameworks" doc: ${linkText(
          "https://tina.io/docs/integration/frameworks/#configuring-tina-with-each-framework"
        )}`
      )
    });
  }
  const answers = await (0, import_prompts6.default)(questions);
  return answers;
};
var askIfUsingSelfHosted = async () => {
  const answers = await (0, import_prompts6.default)([
    {
      name: "hosting",
      type: "select",
      choices: [
        {
          title: "TinaCloud",
          value: "tina-cloud"
        },
        {
          title: "Self-Hosted",
          value: "self-host"
        }
      ],
      message: "Do you want to host your project on TinaCloud or self-host? (With self-hosting, the graphql api, auth and database will be hosted on your own server.)"
    }
  ]);
  return answers;
};
var makeImportString = (imports) => {
  if (!imports) {
    return "";
  }
  const filtered = imports.filter((x) => x.imported.length > 0);
  if (filtered.length === 0) {
    return "";
  }
  return filtered.map((x) => {
    return `import { ${x.imported.join(",")} } from '${x.from}'`;
  }).join("\n");
};

// src/cmds/init/prompts/generatedFiles.ts
var import_prompts7 = __toESM(require("prompts"));
var askIfOverride = async ({
  generatedFile,
  usingTypescript
}) => {
  if (usingTypescript) {
    const result = await (0, import_prompts7.default)({
      name: `override`,
      type: "confirm",
      message: `Found existing file at ${generatedFile.fullPathTS}. Would you like to overwrite?`
    });
    return Boolean(result.override);
  } else {
    const result = await (0, import_prompts7.default)({
      name: `override`,
      type: "confirm",
      message: `Found existing file at ${generatedFile.fullPathJS}. Would you like to overwrite?`
    });
    return Boolean(result.override);
  }
};
var askOverwriteGenerateFiles = async ({
  config: config2,
  generatedFiles
}) => {
  const overwriteList = [];
  for (let i = 0; i < generatedFiles.length; i++) {
    const generatedFile = generatedFiles[i];
    if (generatedFile.resolve(config2.typescript).exists) {
      const overwrite = await askIfOverride({
        generatedFile,
        usingTypescript: config2.typescript
      });
      if (overwrite) {
        overwriteList.push(generatedFile.generatedFileType);
      }
    }
  }
  return overwriteList;
};

// src/cmds/init/configure.ts
async function configure(env, opts) {
  if (opts.isBackend && !env.tinaConfigExists) {
    logger.info("Looks like Tina has not been setup, setting up now...");
  }
  if (env.tinaConfigExists && !opts.isBackend) {
    logger.info(
      `Tina config already exists, skipping setup. (If you want to init tina from scratch, delete your tina config file and run this command again)`
    );
    process.exit(0);
  }
  const skipTinaSetupCommands = env.tinaConfigExists;
  const { framework, packageManager } = await askCommonSetUp();
  const config2 = {
    envVars: [],
    framework,
    packageManager,
    forestryMigrate: false,
    isLocalEnvVarName: "TINA_PUBLIC_IS_LOCAL",
    // TODO: give this a better default
    typescript: false
  };
  if (config2.framework.name === "next") {
    config2.publicFolder = "public";
  } else if (config2.framework.name === "hugo") {
    config2.publicFolder = "static";
  }
  if (skipTinaSetupCommands) {
    config2.typescript = env.generatedFiles.config.typescriptExists;
  } else {
    const { typescript, publicFolder } = await askTinaSetupPrompts({
      frameworkName: framework.name,
      config: config2
    });
    config2.typescript = typescript;
    if (publicFolder) {
      config2.publicFolder = publicFolder;
    }
  }
  if (env.forestryConfigExists) {
    const { forestryMigrate: forestryMigrate2, frontMatterFormat } = await askForestryMigrate({
      env,
      framework
    });
    config2.forestryMigrate = forestryMigrate2;
    config2.frontMatterFormat = frontMatterFormat;
  }
  if (opts.isBackend) {
    const result = await askIfUsingSelfHosted();
    config2.hosting = result.hosting;
    if (result.hosting === "tina-cloud") {
      await askTinaCloudSetup({ config: config2 });
    } else if (result.hosting === "self-host") {
      config2.gitProvider = await chooseGitProvider({ config: config2 });
      config2.databaseAdapter = await chooseDatabaseAdapter({
        framework,
        config: config2
      });
      config2.authProvider = await chooseAuthProvider({
        framework,
        config: config2
      });
    }
  }
  config2.nextAuthCredentialsProviderName = "VercelKVCredentialsProvider";
  if (opts.debug) {
    console.log("Configuration:");
    console.log(JSON.stringify(config2, null, 2));
  }
  const firstTimeSetup = !env.tinaConfigExists;
  const generatedFilesInUse = [];
  if (env.tinaConfigExists && !opts.isBackend) {
    generatedFilesInUse.push(env.generatedFiles.config);
  }
  if (config2.hosting === "self-host") {
    generatedFilesInUse.push(env.generatedFiles.database);
    generatedFilesInUse.push(env.generatedFiles["next-api-handler"]);
    generatedFilesInUse.push(env.generatedFiles["users-json"]);
  }
  if (config2.framework.reactive && firstTimeSetup) {
    generatedFilesInUse.push(env.generatedFiles["reactive-example"]);
  }
  if (env.sampleContentExists && firstTimeSetup) {
    generatedFilesInUse.push(env.generatedFiles["sample-content"]);
  }
  config2.overwriteList = await askOverwriteGenerateFiles({
    generatedFiles: generatedFilesInUse,
    config: config2
  });
  return config2;
}
var configure_default = configure;

// src/cmds/index.ts
var CLICommand = class {
  constructor(handler) {
    this.handler = handler;
  }
  async execute(params) {
    await this.handler.setup(params);
    const environment = await this.handler.detectEnvironment(params);
    const config2 = await this.handler.configure(environment, params);
    await this.handler.apply(config2, environment, params);
  }
};

// src/cmds/init/apply.ts
var import_path11 = __toESM(require("path"));

// src/cmds/forestry-migrate/index.ts
var import_fs_extra10 = __toESM(require("fs-extra"));
var import_path9 = __toESM(require("path"));
var import_js_yaml2 = __toESM(require("js-yaml"));
var import_minimatch = __toESM(require("minimatch"));
var import_graphql16 = require("@tinacms/graphql");
var import_schema_tools3 = require("@tinacms/schema-tools");

// src/cmds/forestry-migrate/util/index.ts
var import_fs_extra9 = __toESM(require("fs-extra"));
var import_path8 = __toESM(require("path"));
var import_js_yaml = __toESM(require("js-yaml"));
var import_zod = __toESM(require("zod"));

// src/cmds/forestry-migrate/util/errorSingleton.ts
var ErrorSingleton = class _ErrorSingleton {
  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  constructor() {
  }
  /**
   * The static method that controls the access to the singleton instance.
   *
   * This implementation let you subclass the Singleton class while keeping
   * just one instance of each subclass around.
   */
  static getInstance() {
    if (!_ErrorSingleton.instance) {
      _ErrorSingleton.instance = new _ErrorSingleton();
      _ErrorSingleton.instance.collectionNameErrors = [];
    }
    return _ErrorSingleton.instance;
  }
  addErrorName(error) {
    this.collectionNameErrors.push(error);
  }
  printCollectionNameErrors() {
    if (this.collectionNameErrors?.length) {
      logger.error(
        dangerText("ERROR: TinaCMS only supports alphanumeric template names")
      );
      logger.error("The following templates have been renamed:");
      this.collectionNameErrors.forEach((error) => {
        logger.error(`- ${error.template}.yaml -> ${error.newName}`);
      });
      logger.error(
        `If you wish to edit any of the following templates, you will have to update your content and code to use the new name. See ${linkText(
          "https://tina.io/docs/forestry/common-errors/#migrating-fields-with-non-alphanumeric-characters"
        )} for more information.`
      );
    }
  }
};

// src/cmds/forestry-migrate/util/codeTransformer.ts
var import_prettier = require("prettier");
var import_parser_typescript = __toESM(require("prettier/parser-typescript"));
var addVariablesToCode = (codeWithTinaPrefix) => {
  const code = codeWithTinaPrefix.replace(
    /"__TINA_INTERNAL__:::(.*?):::"/g,
    "$1"
  );
  return { code };
};
var makeFieldsWithInternalCode = ({
  hasBody,
  field,
  bodyField,
  spread
}) => {
  if (hasBody) {
    return [bodyField, `__TINA_INTERNAL__:::...${field}():::`];
  } else {
    if (spread) return `__TINA_INTERNAL__:::...${field}():::`;
    return `__TINA_INTERNAL__:::${field}():::`;
  }
};
var makeTemplateFile = async ({
  templateMap,
  usingTypescript
}) => {
  const importStatements = [];
  const templateCodeText = [];
  for (const template of templateMap.values()) {
    importStatements.push(
      `import { ${stringifyLabelWithField(
        template.templateObj.label
      )} } from './templates'`
    );
    templateCodeText.push(
      `export function ${stringifyLabelWithField(
        template.templateObj.label
      )} (){
        return ${addVariablesToCode(JSON.stringify(template.fields, null, 2)).code} ${usingTypescript ? "as TinaField[]" : ""} 
      } `
    );
  }
  const templateCode = `
${usingTypescript ? "import type { TinaField } from 'tinacms'" : ""}
${templateCodeText.join("\n")}
  `;
  const formattedCode = (0, import_prettier.format)(templateCode, {
    parser: "typescript",
    plugins: [import_parser_typescript.default]
  });
  return { importStatements, templateCodeText: formattedCode };
};

// src/cmds/forestry-migrate/util/index.ts
var errorSingletonInstance = ErrorSingleton.getInstance();
var NAME_TEST_REGEX = /^[a-zA-Z0-9_]*$/;
var NAME_UPDATE_REGEX = /[^a-zA-Z0-9]/g;
var getTinaFieldsFromName = (name2) => {
  if (name2 == "id") {
    return { name: "custom_id", nameOverride: "id" };
  } else {
    if (NAME_TEST_REGEX.test(name2)) {
      return { name: name2 };
    } else {
      return {
        name: name2.replace(NAME_UPDATE_REGEX, "_"),
        nameOverride: name2
      };
    }
  }
};
var stringifyTemplateName = (name2, template) => {
  if (NAME_TEST_REGEX.test(name2)) {
    return name2;
  } else {
    const newName = name2.replace(NAME_UPDATE_REGEX, "_");
    errorSingletonInstance.addErrorName({ name: name2, newName, template });
    return newName;
  }
};
var forestryConfigSchema = import_zod.default.object({
  sections: import_zod.default.array(
    import_zod.default.object({
      type: import_zod.default.union([
        import_zod.default.literal("directory"),
        import_zod.default.literal("document"),
        import_zod.default.literal("heading"),
        import_zod.default.literal("jekyll-pages"),
        import_zod.default.literal("jekyll-posts")
      ]),
      label: import_zod.default.string(),
      path: import_zod.default.string().optional().nullable(),
      match: import_zod.default.string().optional().nullable(),
      exclude: import_zod.default.string().optional().nullable(),
      create: import_zod.default.union([import_zod.default.literal("all"), import_zod.default.literal("documents"), import_zod.default.literal("none")]).optional(),
      templates: import_zod.default.array(import_zod.default.string()).optional().nullable(),
      new_doc_ext: import_zod.default.string().optional().nullable(),
      read_only: import_zod.default.boolean().optional().nullable()
    })
  )
});
var forestryFieldWithoutField = import_zod.default.object({
  // TODO: maybe better type this?
  type: import_zod.default.union([
    import_zod.default.literal("text"),
    import_zod.default.literal("datetime"),
    import_zod.default.literal("list"),
    import_zod.default.literal("file"),
    import_zod.default.literal("image_gallery"),
    import_zod.default.literal("textarea"),
    import_zod.default.literal("tag_list"),
    import_zod.default.literal("number"),
    import_zod.default.literal("boolean"),
    import_zod.default.literal("field_group"),
    import_zod.default.literal("field_group_list"),
    import_zod.default.literal("select"),
    import_zod.default.literal("include"),
    import_zod.default.literal("blocks"),
    import_zod.default.literal("color")
  ]),
  template_types: import_zod.default.array(import_zod.default.string()).optional().nullable(),
  name: import_zod.default.string(),
  label: import_zod.default.string(),
  default: import_zod.default.any().optional(),
  template: import_zod.default.string().optional(),
  config: import_zod.default.object({
    // min and max are used for lists
    min: import_zod.default.number().optional().nullable(),
    max: import_zod.default.number().optional().nullable(),
    required: import_zod.default.boolean().optional().nullable(),
    use_select: import_zod.default.boolean().optional().nullable(),
    date_format: import_zod.default.string().optional().nullable(),
    time_format: import_zod.default.string().optional().nullable(),
    options: import_zod.default.array(import_zod.default.string()).optional().nullable(),
    source: import_zod.default.object({
      type: import_zod.default.union([
        import_zod.default.literal("custom"),
        import_zod.default.literal("pages"),
        import_zod.default.literal("documents"),
        import_zod.default.literal("simple"),
        // TODO: I want to ignore this key if its invalid
        import_zod.default.string()
      ]).optional().nullable(),
      section: import_zod.default.string().optional().nullable()
    }).optional()
  }).optional()
});
var forestryField = import_zod.default.lazy(
  () => forestryFieldWithoutField.extend({
    fields: import_zod.default.array(forestryField).optional()
  })
);
var FrontmatterTemplateSchema = import_zod.default.object({
  label: import_zod.default.string(),
  hide_body: import_zod.default.boolean().optional(),
  fields: import_zod.default.array(forestryField).optional()
});
var transformForestryFieldsToTinaFields = ({
  fields,
  pathToForestryConfig,
  template,
  skipBlocks = false
}) => {
  const tinaFields = [];
  fields?.forEach((forestryField2) => {
    if (forestryField2.name === "menu") {
      logger.info(
        warnText(
          `skipping menu field template ${template}.yaml since TinaCMS does not support Hugo or Jekyll menu fields`
        )
      );
      return;
    }
    let field;
    switch (forestryField2.type) {
      // Single filed types
      case "text":
        field = {
          type: "string",
          ...getTinaFieldsFromName(forestryField2.name),
          label: forestryField2.label
        };
        break;
      case "textarea":
        field = {
          type: "string",
          ...getTinaFieldsFromName(forestryField2.name),
          label: forestryField2.label,
          ui: {
            component: "textarea"
          }
        };
        break;
      case "datetime":
        field = {
          type: forestryField2.type,
          ...getTinaFieldsFromName(forestryField2.name),
          label: forestryField2.label
        };
        break;
      case "number":
        field = {
          type: "number",
          ...getTinaFieldsFromName(forestryField2.name),
          label: forestryField2.label
        };
        break;
      case "boolean":
        field = {
          type: "boolean",
          ...getTinaFieldsFromName(forestryField2.name),
          label: forestryField2.label
        };
        break;
      case "color":
        field = {
          type: "string",
          ...getTinaFieldsFromName(forestryField2.name),
          label: forestryField2.label,
          ui: {
            component: "color"
          }
        };
        break;
      case "file":
        field = {
          type: "image",
          ...getTinaFieldsFromName(forestryField2.name),
          label: forestryField2.label
        };
        break;
      case "image_gallery":
        field = {
          type: "image",
          ...getTinaFieldsFromName(forestryField2.name),
          label: forestryField2.label,
          list: true
        };
        break;
      case "select":
        if (forestryField2.config?.options) {
          field = {
            type: "string",
            ...getTinaFieldsFromName(forestryField2.name),
            label: forestryField2.label,
            options: forestryField2.config?.options || []
          };
        } else {
          logger.info(
            warnText(
              `Warning in template ${template}.yaml . "select" field migration has only been implemented for simple select. Other versions of select have not been implemented yet. To make your \`${forestryField2.name}\` field work, you will need to manually add it to your schema.`
            )
          );
        }
        break;
      // List Types
      case "list":
        field = {
          type: "string",
          ...getTinaFieldsFromName(forestryField2.name),
          label: forestryField2.label,
          list: true
        };
        if (forestryField2.config?.options) {
          field.options = forestryField2.config.options;
        }
        break;
      case "tag_list":
        field = {
          type: "string",
          ...getTinaFieldsFromName(forestryField2.name),
          label: forestryField2.label,
          list: true,
          ui: {
            component: "tags"
          }
        };
        break;
      // Object (Group) types
      case "field_group":
        field = {
          type: "object",
          ...getTinaFieldsFromName(forestryField2.name),
          label: forestryField2.label,
          fields: transformForestryFieldsToTinaFields({
            fields: forestryField2.fields,
            pathToForestryConfig,
            template,
            skipBlocks
          })
        };
        break;
      case "field_group_list":
        field = {
          type: "object",
          ...getTinaFieldsFromName(forestryField2.name),
          label: forestryField2.label,
          list: true,
          fields: transformForestryFieldsToTinaFields({
            fields: forestryField2.fields,
            template,
            pathToForestryConfig,
            skipBlocks
          })
        };
        break;
      case "blocks": {
        if (skipBlocks) {
          break;
        }
        const templates2 = [];
        forestryField2?.template_types.forEach((tem) => {
          const { template: template2 } = getFieldsFromTemplates({
            tem,
            skipBlocks: true,
            pathToForestryConfig
          });
          const fieldsString = stringifyLabelWithField(template2.label);
          const t = {
            // @ts-ignore
            fields: makeFieldsWithInternalCode({
              hasBody: false,
              field: fieldsString
            }),
            label: template2.label,
            name: stringifyTemplateName(tem, tem)
          };
          if (t.name != tem) {
            t.nameOverride = tem;
          }
          templates2.push(t);
        });
        field = {
          type: "object",
          list: true,
          templateKey: "template",
          label: forestryField2.label,
          ...getTinaFieldsFromName(forestryField2.name),
          templates: templates2
        };
        break;
      }
      case "include": {
        const tem = forestryField2.template;
        const { template: template2 } = getFieldsFromTemplates({
          tem,
          skipBlocks: true,
          pathToForestryConfig
        });
        const fieldsString = stringifyLabelWithField(template2.label);
        const field2 = makeFieldsWithInternalCode({
          field: fieldsString,
          hasBody: false,
          spread: true
        });
        tinaFields.push(
          // @ts-ignore
          field2
        );
        break;
      }
      default:
        logger.info(
          warnText(
            `Warning in template ${template}. "${forestryField2.type}" migration has not been implemented yet. To make your \`${forestryField2.name}\` field work, you will need to manually add it to your schema.`
          )
        );
    }
    if (field) {
      if (forestryField2.config?.required) {
        field = { ...field, required: true };
      }
      tinaFields.push(field);
    }
  });
  return tinaFields;
};
var getFieldsFromTemplates = ({ tem, pathToForestryConfig, skipBlocks = false }) => {
  const templatePath = import_path8.default.join(
    pathToForestryConfig,
    ".forestry",
    "front_matter",
    "templates",
    `${tem}.yml`
  );
  let templateString = "";
  try {
    templateString = import_fs_extra9.default.readFileSync(templatePath).toString();
  } catch {
    throw new Error(
      `Could not find template ${tem} at ${templatePath}

 This will require manual migration.`
    );
  }
  const templateObj = import_js_yaml.default.load(templateString);
  const template = parseTemplates({ val: templateObj });
  const fields = transformForestryFieldsToTinaFields({
    fields: template.fields,
    pathToForestryConfig,
    template: tem,
    skipBlocks
  });
  return { fields, templateObj, template };
};
var parseTemplates = ({ val }) => {
  const template = FrontmatterTemplateSchema.parse(val);
  return template;
};
var parseSections = ({ val }) => {
  const schema = forestryConfigSchema.parse(val);
  return schema;
};

// src/cmds/forestry-migrate/index.ts
var BODY_FIELD = {
  // This is the body field
  type: "rich-text",
  name: "body",
  label: "Body of Document",
  description: "This is the markdown body",
  isBody: true
};
var stringifyLabel = (label) => {
  return label.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
};
var stringifyLabelWithField = (label) => {
  const labelString = stringifyLabel(label);
  return `${labelString}Fields`;
};
var transformForestryMatchToTinaMatch = (match) => {
  const newMatch = match.replace(" ", "").replace(/\.?(mdx|md|json|yaml|yml|toml)/g, "")?.replace(/\..*$/g, "")?.replace("{}", "");
  if (match !== newMatch) {
    logger.info(
      `Info: Match ${match} was transformed to ${newMatch}. See ${linkText(
        "https://tina.io/docs/forestry/common-errors/#info-match-match-was-transformed-to-newmatch"
      )}`
    );
  }
  return newMatch;
};
function checkExt(ext) {
  const extReal = ext.replace(".", "");
  if (import_schema_tools3.CONTENT_FORMATS.includes(extReal)) {
    return extReal;
  } else {
    return false;
  }
}
var generateAllTemplates = async ({
  pathToForestryConfig
}) => {
  const allTemplates = (await import_fs_extra10.default.readdir(
    import_path9.default.join(pathToForestryConfig, ".forestry", "front_matter", "templates")
  )).map((tem) => import_path9.default.basename(tem, ".yml"));
  const templateMap = /* @__PURE__ */ new Map();
  const proms = allTemplates.map(async (tem) => {
    try {
      const { fields, templateObj } = getFieldsFromTemplates({
        tem,
        pathToForestryConfig
      });
      templateMap.set(tem, { fields, templateObj });
    } catch (e) {
      logger.log(`Error parsing template frontmatter template', tem + '.yml'`);
      console.error(e);
      templateMap.set(tem, { fields: [], templateObj: {} });
    }
  });
  await Promise.all(proms);
  return templateMap;
};
var generateCollectionFromForestrySection = (args) => {
  const { section, templateMap } = args;
  if (section.read_only) return;
  let format3 = "md";
  if (section.new_doc_ext) {
    const ext = checkExt(section.new_doc_ext);
    if (ext) {
      format3 = ext;
    }
  }
  const baseCollection = {
    format: format3,
    label: section.label,
    name: stringifyLabel(section.label),
    path: section.path || "/"
  };
  if (args.frontMatterFormat) {
    baseCollection.frontmatterFormat = args.frontMatterFormat;
    if (args.frontMatterFormat === "toml") {
      baseCollection.frontmatterDelimiters = "+++";
    }
  }
  if (section.match) {
    baseCollection.match = {
      ...baseCollection?.match || {},
      include: transformForestryMatchToTinaMatch(section.match)
    };
  }
  if (section.exclude) {
    baseCollection.match = {
      ...baseCollection?.match || {},
      exclude: transformForestryMatchToTinaMatch(section.exclude)
    };
  }
  if (section.type === "directory") {
    if (!section?.path || section.path === "/" || section.path === "./" || section.path === ".") {
      logger.log(
        warnText(
          `Warning: Section ${section.label} is using a Root Path. Currently, Tina Does not support Root paths see ${linkText(
            "https://github.com/tinacms/tinacms/issues/3768"
          )} for more updates on this issue.`
        )
      );
      return;
    }
    const forestryTemplates = section?.templates || [];
    if (forestryTemplates.length === 0 && section.create === "all") {
      for (const templateKey of templateMap.keys()) {
        const { templateObj } = templateMap.get(templateKey);
        const pages = templateObj?.pages;
        if (pages) {
          let glob = section.match;
          const skipPath = section.path === "" || section.path === "/" || !section.path;
          if (!skipPath) {
            glob = section.path + "/" + section.match;
          }
          if (pages.some((page) => {
            return (0, import_minimatch.default)(page, glob);
          })) {
            forestryTemplates.push(templateKey);
          }
        }
      }
    }
    const hasBody = ["md", "mdx", "markdown"].includes(format3);
    let c;
    if ((forestryTemplates?.length || 0) > 1) {
      c = {
        ...baseCollection,
        // @ts-expect-error
        templates: forestryTemplates.map((tem) => {
          const currentTemplate = templateMap.get(tem);
          const fieldsString = stringifyLabelWithField(
            currentTemplate.templateObj.label
          );
          return {
            // fields: [BODY_FIELD],
            fields: makeFieldsWithInternalCode({
              hasBody,
              field: fieldsString,
              bodyField: BODY_FIELD
            }),
            label: tem,
            name: stringifyLabel(tem)
          };
        })
      };
    }
    if (forestryTemplates?.length === 1) {
      const tem = forestryTemplates[0];
      const template = templateMap.get(tem);
      const fieldsString = stringifyLabelWithField(template.templateObj.label);
      c = {
        ...baseCollection,
        // fields: [BODY_FIELD],
        // @ts-expect-error
        fields: makeFieldsWithInternalCode({
          field: fieldsString,
          hasBody,
          bodyField: BODY_FIELD
        })
      };
    }
    if (forestryTemplates?.length === 0) {
      logger.warn(
        warnText(
          `No templates found for section ${section.label}. Please see ${linkText(
            "https://tina.io/docs/forestry/content-modelling/"
          )} for more information`
        )
      );
      c = {
        ...baseCollection,
        fields: [BODY_FIELD]
      };
    }
    if (section?.create === "none") {
      c.ui = {
        ...c.ui,
        allowedActions: {
          create: false
        }
      };
    }
    return c;
  } else if (section.type === "document") {
    const filePath = section.path;
    const extname = import_path9.default.extname(filePath);
    const fileName = import_path9.default.basename(filePath, extname);
    const dir = import_path9.default.dirname(filePath);
    const ext = checkExt(extname);
    if (ext) {
      const fields = [];
      if (ext === "md" || ext === "mdx") {
        fields.push(BODY_FIELD);
      }
      for (const currentTemplateName of templateMap.keys()) {
        const { templateObj, fields: additionalFields } = templateMap.get(currentTemplateName);
        const pages = templateObj?.pages || [];
        if (pages.includes(section.path)) {
          fields.push(...additionalFields);
          break;
        }
      }
      if (fields.length === 0) {
        fields.push({
          name: "dummy",
          label: "Dummy field",
          type: "string",
          description: "This is a dummy field, please replace it with the fields you want to edit. See https://tina.io/docs/schema/ for more info"
        });
        logger.warn(
          warnText(
            `No fields found for ${section.path}. Please add the fields you want to edit to the ${section.label} collection in the config file.`
          )
        );
      }
      return {
        ...baseCollection,
        path: dir,
        format: ext,
        ui: {
          allowedActions: {
            create: false,
            delete: false
          }
        },
        match: {
          include: fileName
        },
        fields
      };
    } else {
      logger.log(
        warnText(
          `Error: document section has an unsupported file extension: ${extname} in ${section.path}`
        )
      );
    }
  }
};
var generateCollections = async ({
  pathToForestryConfig,
  usingTypescript,
  frontMatterFormat
}) => {
  const templateMap = await generateAllTemplates({ pathToForestryConfig });
  const { importStatements, templateCodeText } = await makeTemplateFile({
    templateMap,
    usingTypescript
  });
  const forestryConfig = await import_fs_extra10.default.readFile(
    import_path9.default.join(pathToForestryConfig, ".forestry", "settings.yml")
  );
  rewriteTemplateKeysInDocs({
    templateMap,
    markdownParseConfig: {
      frontmatterFormat: frontMatterFormat,
      frontmatterDelimiters: frontMatterFormat === "toml" ? "+++" : void 0
    }
  });
  const collections = parseSections({
    val: import_js_yaml2.default.load(forestryConfig.toString())
  }).sections.map(
    (section) => generateCollectionFromForestrySection({
      section,
      templateMap,
      frontMatterFormat
    })
  ).filter((c) => c !== void 0);
  return {
    collections,
    importStatements: importStatements.join("\n"),
    templateCode: templateCodeText
  };
};
var rewriteTemplateKeysInDocs = (args) => {
  const { templateMap, markdownParseConfig } = args;
  for (const templateKey of templateMap.keys()) {
    const { templateObj } = templateMap.get(templateKey);
    templateObj?.pages?.forEach((page) => {
      try {
        const filePath = import_path9.default.join(page);
        if (import_fs_extra10.default.lstatSync(filePath).isDirectory()) {
          return;
        }
        const extname = import_path9.default.extname(filePath);
        const fileContent = import_fs_extra10.default.readFileSync(filePath).toString();
        const content = (0, import_graphql16.parseFile)(
          fileContent,
          extname,
          (yup) => yup.object({}),
          markdownParseConfig
        );
        const newContent = {
          _template: stringifyLabel(templateKey),
          ...content
        };
        import_fs_extra10.default.writeFileSync(
          filePath,
          (0, import_graphql16.stringifyFile)(newContent, extname, true, markdownParseConfig)
        );
      } catch (error) {
        console.log(
          dangerText("Error updating template -> _template in ", page)
        );
      }
    });
  }
};

// src/cmds/init/apply.ts
var import_metrics2 = require("@tinacms/metrics");
var import_fs_extra13 = __toESM(require("fs-extra"));

// src/next/commands/codemod-command/index.ts
var import_clipanion5 = require("clipanion");
var import_fs_extra11 = __toESM(require("fs-extra"));
var import_path10 = __toESM(require("path"));
var CodemodCommand = class extends import_clipanion5.Command {
  constructor() {
    super(...arguments);
    this.rootPath = import_clipanion5.Option.String("--rootPath", {
      description: "Specify the root directory to run the CLI from"
    });
    this.verbose = import_clipanion5.Option.Boolean("-v,--verbose", false, {
      description: "increase verbosity of logged output"
    });
  }
  static {
    this.paths = [["codemod"], ["codemod", "move-tina-folder"]];
  }
  static {
    this.usage = import_clipanion5.Command.Usage({
      category: `Commands`,
      description: `Use codemods for various Tina tasks`
    });
  }
  async catch(error) {
    console.log(error);
  }
  async execute() {
    const mod = this.path[1];
    if (!mod) {
      logger.error(
        "Must specify an additional argument (eg. 'move-tina-folder')"
      );
      process.exit(1);
    }
    const mods = { "move-tina-folder": () => moveTinaFolder(this.rootPath) };
    const command2 = mods[mod];
    if (!command2) {
      logger.error(`Mod not found for ${mod}`);
      process.exit(1);
    }
    await command2();
  }
};
var moveTinaFolder = async (rootPath = process.cwd()) => {
  const configManager = new ConfigManager({ rootPath });
  try {
    await configManager.processConfig();
  } catch (e) {
    logger.error(e.message);
    process.exit(1);
  }
  const tinaDestination = import_path10.default.join(configManager.rootPath, "tina");
  if (await import_fs_extra11.default.existsSync(tinaDestination)) {
    logger.info(
      `Folder already exists at ${tinaDestination}. Either delete this folder to complete the codemod, or ensure you have properly copied your config from the ".tina" folder.`
    );
  } else {
    await import_fs_extra11.default.moveSync(configManager.tinaFolderPath, tinaDestination);
    await writeGitignore(configManager.rootPath);
    logger.info(
      "Move to 'tina' folder complete. Be sure to update any imports of the autogenerated client!"
    );
  }
};
var writeGitignore = async (rootPath) => {
  await import_fs_extra11.default.outputFileSync(
    import_path10.default.join(rootPath, "tina", ".gitignore"),
    "__generated__"
  );
};

// src/cmds/init/templates/next.ts
var templates = {
  ["demo-post-page"]: ({
    usingSrc,
    dataLayer
  }) => {
    return `// THIS FILE HAS BEEN GENERATED WITH THE TINA CLI.
// @ts-nocheck
// This is a demo file once you have tina setup feel free to delete this file

import Head from 'next/head'
import { useTina } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import client from '${usingSrc ? "../" : ""}../../../tina/__generated__/${dataLayer ? "databaseClient" : "client"}'

const BlogPage = (props) => {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  })

  return (
    <>
      <Head>
        {/* Tailwind CDN */}
        <link
          rel='stylesheet'
          href='https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.7/tailwind.min.css'
          integrity='sha512-y6ZMKFUQrn+UUEVoqYe8ApScqbjuhjqzTuwUMEGMDuhS2niI8KA3vhH2LenreqJXQS+iIXVTRL2iaNfJbDNA1Q=='
          crossOrigin='anonymous'
          referrerPolicy='no-referrer'
        />
      </Head>
      <div>
        <div
          style={{
            textAlign: 'center',
          }}
        >
          <h1 className='text-3xl m-8 text-center leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl'>
            {data.post.title}
          </h1>
          <ContentSection content={data.post.body}></ContentSection>
        </div>
        <div className='bg-green-100 text-center'>
          Lost and looking for a place to start?
          <a
            href='https://tina.io/guides/tina-cloud/getting-started/overview/'
            className='text-blue-500 underline'
          >
            {' '}
            Check out this guide
          </a>{' '}
          to see how add TinaCMS to an existing Next.js site.
        </div>
      </div>
    </>
  )
}

export const getStaticProps = async ({ params }) => {
  let data = {}
  let query = {}
  let variables = { relativePath: \`\${params.filename}.md\` }
  try {
    const res = await client.queries.post(variables)
    query = res.query
    data = res.data
    variables = res.variables
  } catch {
    // swallow errors related to document creation
  }

  return {
    props: {
      variables: variables,
      data: data,
      query: query,
      //myOtherProp: 'some-other-data',
    },
  }
}

export const getStaticPaths = async () => {
  const postsListData = await client.queries.postConnection()

  return {
    paths: postsListData.data.postConnection.edges.map((post) => ({
      params: { filename: post.node._sys.filename },
    })),
    fallback: false,
  }
}

export default BlogPage

const PageSection = (props) => {
  return (
    <>
      <h2>{props.heading}</h2>
      <p>{props.content}</p>
    </>
  )
}

const components = {
  PageSection: PageSection,
}

const ContentSection = ({ content }) => {
  return (
    <div className='relative py-16 bg-white overflow-hidden text-black'>
      <div className='hidden lg:block lg:absolute lg:inset-y-0 lg:h-full lg:w-full'>
        <div
          className='relative h-full text-lg max-w-prose mx-auto'
          aria-hidden='true'
        >
          <svg
            className='absolute top-12 left-full transform translate-x-32'
            width={404}
            height={384}
            fill='none'
            viewBox='0 0 404 384'
          >
            <defs>
              <pattern
                id='74b3fd99-0a6f-4271-bef2-e80eeafdf357'
                x={0}
                y={0}
                width={20}
                height={20}
                patternUnits='userSpaceOnUse'
              >
                <rect
                  x={0}
                  y={0}
                  width={4}
                  height={4}
                  className='text-gray-200'
                  fill='currentColor'
                />
              </pattern>
            </defs>
            <rect
              width={404}
              height={384}
              fill='url(#74b3fd99-0a6f-4271-bef2-e80eeafdf357)'
            />
          </svg>
          <svg
            className='absolute top-1/2 right-full transform -translate-y-1/2 -translate-x-32'
            width={404}
            height={384}
            fill='none'
            viewBox='0 0 404 384'
          >
            <defs>
              <pattern
                id='f210dbf6-a58d-4871-961e-36d5016a0f49'
                x={0}
                y={0}
                width={20}
                height={20}
                patternUnits='userSpaceOnUse'
              >
                <rect
                  x={0}
                  y={0}
                  width={4}
                  height={4}
                  className='text-gray-200'
                  fill='currentColor'
                />
              </pattern>
            </defs>
            <rect
              width={404}
              height={384}
              fill='url(#f210dbf6-a58d-4871-961e-36d5016a0f49)'
            />
          </svg>
          <svg
            className='absolute bottom-12 left-full transform translate-x-32'
            width={404}
            height={384}
            fill='none'
            viewBox='0 0 404 384'
          >
            <defs>
              <pattern
                id='d3eb07ae-5182-43e6-857d-35c643af9034'
                x={0}
                y={0}
                width={20}
                height={20}
                patternUnits='userSpaceOnUse'
              >
                <rect
                  x={0}
                  y={0}
                  width={4}
                  height={4}
                  className='text-gray-200'
                  fill='currentColor'
                />
              </pattern>
            </defs>
            <rect
              width={404}
              height={384}
              fill='url(#d3eb07ae-5182-43e6-857d-35c643af9034)'
            />
          </svg>
        </div>
      </div>
      <div className='relative px-4 sm:px-6 lg:px-8'>
        <div className='text-lg max-w-prose mx-auto'>
          <TinaMarkdown components={components} content={content} />
        </div>
      </div>
    </div>
  )
}
`;
  }
};

// src/cmds/init/templates/config.ts
var clientConfig = (isForestryMigration) => {
  if (isForestryMigration) {
    return "client: {skip: true},";
  }
  return "";
};
var baseFields = `[
  {
    type: 'string',
    name: 'title',
    label: 'Title',
    isTitle: true,
    required: true,
  },
  {
    type: 'rich-text',
    name: 'body',
    label: 'Body',
    isBody: true,
  },
]`;
var generateCollectionString = (args) => {
  if (args.collections) {
    return args.collections;
  }
  let extraTinaCollections = args.config.authProvider?.extraTinaCollections?.join(",\n");
  if (extraTinaCollections) {
    extraTinaCollections = extraTinaCollections + ",";
  }
  const baseCollections = `[
    ${extraTinaCollections || ""}
    {
      name: 'post',
      label: 'Posts',
      path: 'content/posts',
      fields: ${baseFields},
    },
  ]`;
  const nextExampleCollection = `[
    ${extraTinaCollections || ""}
    {
      name: 'post',
      label: 'Posts',
      path: 'content/posts',
      fields: ${baseFields},
      ui: {
        // This is an DEMO router. You can remove this to fit your site
        router: ({ document }) => \`/demo/blog/\${document._sys.filename}\`,
      },
    },
  ]`;
  if (args.config?.framework?.name === "next") {
    return nextExampleCollection;
  }
  return baseCollections;
};
var generateConfig = (args) => {
  const isUsingTinaCloud = !args.selfHosted || args.config.authProvider?.name === "tina-cloud";
  let extraImports = "";
  if (args.selfHosted) {
    if (args.config.authProvider) {
      extraImports = extraImports + makeImportString(args.config.authProvider?.configImports);
    }
    if (!isUsingTinaCloud) {
      extraImports = extraImports + `
import { LocalAuthProvider } from "tinacms";`;
    }
  }
  return `
  import { defineConfig } from "tinacms";
  ${extraImports}
  ${args.extraText || ""}
  
  // Your hosting provider likely exposes this as an environment variable
  const branch = process.env.GITHUB_BRANCH ||
    process.env.VERCEL_GIT_COMMIT_REF ||
    process.env.HEAD ||
    "main"
  ${args.isLocalEnvVarName && args.selfHosted && `const isLocal = process.env.${args.isLocalEnvVarName} === 'true'` || ""}
  export default defineConfig({
    ${args.selfHosted && !isUsingTinaCloud ? `contentApiUrlOverride: "/api/tina/gql",` : ""}
    branch,
    ${args.selfHosted && !isUsingTinaCloud ? `authProvider: isLocal
    ? new LocalAuthProvider()
    :${args.config?.authProvider.configAuthProviderClass},` : ""}
    ${isUsingTinaCloud ? `// Get this from tina.io
        clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,` : ""}
    ${isUsingTinaCloud ? `// Get this from tina.io
    token: process.env.TINA_TOKEN,` : ""}

    ${clientConfig(args.isForestryMigration)}
    build: {
      outputFolder: "admin",
      publicFolder: "${args.publicFolder}",
    },
    media: {
      tina: {
        mediaRoot: "",
        publicFolder: "${args.publicFolder}",
      },
    },
    // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/schema/
    schema: {
      collections: ${generateCollectionString(args)},
    },
  });  
`;
};

// src/cmds/init/templates/database.ts
var databaseTemplate = ({ config: config2 }) => {
  return `
import { createDatabase, createLocalDatabase } from '@tinacms/datalayer'
${makeImportString(config2.gitProvider?.imports)}
${makeImportString(config2.databaseAdapter?.imports)}

const branch = (process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main")

const isLocal =  process.env.${config2.isLocalEnvVarName} === 'true'

export default isLocal
  ? createLocalDatabase()
  : createDatabase({
      gitProvider: ${config2.gitProvider?.gitProviderClassText},
      databaseAdapter: ${config2.databaseAdapter?.databaseAdapterClassText},
      namespace: branch,
    })
`;
};

// src/cmds/init/templates/tinaNextRoute.tsx
var nextApiRouteTemplate = ({
  config: config2,
  env
}) => {
  const extraPath = env.usingSrc ? "../" : "";
  return `import { TinaNodeBackend, LocalBackendAuthProvider } from '@tinacms/datalayer'
  ${makeImportString(config2.authProvider?.backendAuthProviderImports)}
 

  
  import databaseClient from '${extraPath}../../../tina/__generated__/databaseClient'
  
  const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true'
  
  const handler = TinaNodeBackend({
    authProvider: isLocal
      ? LocalBackendAuthProvider()
      : ${config2.authProvider?.backendAuthProvider || ""},
    databaseClient,
  })
  
  export default (req, res) => {
    // Modify the request here if you need to
    return handler(req, res)
  }`;
};

// src/cmds/init/templates/content.ts
var helloWorldPost = `---
title: Hello, World!
---

## Hello World!

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut non lorem diam. Quisque vulputate nibh sodales eros pretium tincidunt. Aenean porttitor efficitur convallis. Nulla sagittis finibus convallis. Phasellus in fermentum quam, eu egestas tortor. Maecenas ac mollis leo. Integer maximus eu nisl vel sagittis.

Suspendisse facilisis, mi ac scelerisque interdum, ligula ex imperdiet felis, a posuere eros justo nec sem. Nullam laoreet accumsan metus, sit amet tincidunt orci egestas nec. Pellentesque ut aliquet ante, at tristique nunc. Donec non massa nibh. Ut posuere lacus non aliquam laoreet. Fusce pharetra ligula a felis porttitor, at mollis ipsum maximus. Donec quam tortor, vehicula a magna sit amet, tincidunt dictum enim. In hac habitasse platea dictumst. Mauris sit amet ornare ligula, blandit consequat risus. Duis malesuada pellentesque lectus, non feugiat turpis eleifend a. Nullam tempus ante et diam pretium, ac faucibus ligula interdum.
`;

// src/cmds/init/apply.ts
var import_prettier2 = require("prettier");

// src/utils/script-helpers.ts
function generateGqlScript(scriptValue, opts) {
  const cmd = `tinacms dev -c "${scriptValue}"`;
  if (opts?.isLocalEnvVarName) {
    return `${opts.isLocalEnvVarName}=true ${cmd}`;
  }
  return cmd;
}
function extendNextScripts(scripts, opts) {
  const result = {
    ...scripts,
    dev: !scripts?.dev || scripts?.dev?.indexOf("tinacms dev -c") === -1 ? generateGqlScript(scripts?.dev || "next dev", opts) : scripts?.dev,
    build: !scripts?.build || !scripts?.build?.startsWith("tinacms build &&") ? `tinacms build && ${scripts?.build || "next build"}` : scripts?.build
  };
  if (opts?.addSetupUsers && !scripts["setup:users"]) {
    result["setup:users"] = "tinacms-next-auth setup";
  }
  return result;
}

// src/cmds/init/codegen/index.ts
var import_typescript3 = __toESM(require("typescript"));
var import_fs_extra12 = __toESM(require("fs-extra"));

// src/cmds/init/codegen/util.ts
var import_typescript2 = __toESM(require("typescript"));
var makeTransformer = (makeVisitor) => (ctx) => (node) => import_typescript2.default.visitNode(node, makeVisitor(ctx));
function parseExpression(expression) {
  const sourceFile = import_typescript2.default.createSourceFile(
    "temp.ts",
    expression,
    import_typescript2.default.ScriptTarget.Latest
  );
  if (sourceFile.statements.length !== 1) {
    throw new Error("Expected one statement");
  }
  const statement = sourceFile.statements[0];
  if (!import_typescript2.default.isExpressionStatement(statement)) {
    throw new Error("Expected an expression statement");
  }
  return [sourceFile, statement.expression];
}
function parseVariableStatement(stmt) {
  const sourceFile = import_typescript2.default.createSourceFile(
    "temp.ts",
    stmt,
    import_typescript2.default.ScriptTarget.Latest
  );
  if (sourceFile.statements.length !== 1) {
    throw new Error("Expected one statement");
  }
  const statement = sourceFile.statements[0];
  if (!import_typescript2.default.isVariableStatement(statement)) {
    throw new Error("Expected a variable statement");
  }
  return [sourceFile, statement];
}

// src/cmds/init/codegen/index.ts
var makeVariableStatementVisitor = (sourceFile, variableStmtSourceFile, variableStmt) => (ctx) => (node) => {
  if (import_typescript3.default.isSourceFile(node)) {
    const newStatements = [...node.statements];
    let encounteredImports = false;
    let firstNonImportStatementIdx = -1;
    let existingStatementIdx = -1;
    const [newVarDec] = variableStmt.declarationList.declarations;
    const newVarDecName = newVarDec.name.getText(variableStmtSourceFile);
    for (let i = 0; i < newStatements.length; i++) {
      const isImport = import_typescript3.default.isImportDeclaration(newStatements[i]);
      if (isImport && !encounteredImports) {
        encounteredImports = true;
      }
      if (!isImport && encounteredImports && firstNonImportStatementIdx === -1) {
        firstNonImportStatementIdx = i;
      }
      const stmt = newStatements[i];
      if (import_typescript3.default.isVariableStatement(stmt)) {
        const [dec] = stmt.declarationList.declarations;
        if (dec.name && import_typescript3.default.isIdentifier(dec.name) && dec.name.getText(sourceFile) === newVarDecName) {
          existingStatementIdx = i;
        }
      }
      if (existingStatementIdx !== -1 && firstNonImportStatementIdx !== -1) {
        break;
      }
    }
    if (firstNonImportStatementIdx === -1) {
      firstNonImportStatementIdx = 0;
    }
    if (existingStatementIdx === -1) {
      newStatements.splice(firstNonImportStatementIdx, 0, variableStmt);
    }
    return import_typescript3.default.factory.updateSourceFile(node, newStatements);
  }
};
var makeImportsVisitor = (sourceFile, importMap) => (ctx) => (node) => {
  if (import_typescript3.default.isSourceFile(node)) {
    const newStatements = [...node.statements];
    let changed = false;
    for (const [moduleName, imports] of Object.entries(importMap)) {
      let foundImportStatement = false;
      for (const statement of newStatements) {
        if (import_typescript3.default.isImportDeclaration(statement) && import_typescript3.default.isStringLiteral(statement.moduleSpecifier) && statement.moduleSpecifier.text === moduleName) {
          foundImportStatement = true;
          const existingImports = statement.importClause?.namedBindings && import_typescript3.default.isNamedImports(statement.importClause.namedBindings) ? statement.importClause.namedBindings.elements.map(
            (e) => e.name.text
          ) : [];
          const newImports = [
            .../* @__PURE__ */ new Set([
              // we use Set to remove duplicates
              ...existingImports,
              ...imports
            ])
          ];
          const importSpecifiers = newImports.map(
            (i) => import_typescript3.default.factory.createImportSpecifier(
              void 0,
              import_typescript3.default.factory.createIdentifier(i),
              import_typescript3.default.factory.createIdentifier(i)
            )
          );
          const namedImports = import_typescript3.default.factory.createNamedImports(importSpecifiers);
          const importClause = import_typescript3.default.factory.createImportClause(
            false,
            void 0,
            namedImports
          );
          const importDec = import_typescript3.default.factory.createImportDeclaration(
            void 0,
            importClause,
            import_typescript3.default.factory.createStringLiteral(moduleName)
          );
          newStatements[newStatements.indexOf(statement)] = importDec;
          changed = true;
        }
      }
      if (!foundImportStatement) {
        const importSpecifiers = imports.map(
          (i) => import_typescript3.default.factory.createImportSpecifier(
            void 0,
            import_typescript3.default.factory.createIdentifier(i),
            import_typescript3.default.factory.createIdentifier(i)
          )
        );
        const namedImports = import_typescript3.default.factory.createNamedImports(importSpecifiers);
        const importClause = import_typescript3.default.factory.createImportClause(
          false,
          void 0,
          namedImports
        );
        const importDec = import_typescript3.default.factory.createImportDeclaration(
          void 0,
          importClause,
          import_typescript3.default.factory.createStringLiteral(moduleName)
        );
        newStatements.unshift(importDec);
        changed = true;
      }
    }
    if (changed) {
      return import_typescript3.default.factory.updateSourceFile(node, newStatements);
    }
  }
};
var makeAddExpressionToSchemaCollectionVisitor = (sourceFile, functionName, newExpressionSourceFile, newExpression) => (ctx) => {
  const visit2 = (node) => {
    if (import_typescript3.default.isCallExpression(node) && import_typescript3.default.isIdentifier(node.expression) && node.expression.text === functionName && node.arguments.length > 0 && import_typescript3.default.isObjectLiteralExpression(node.arguments[0])) {
      const configObject = node.arguments[0];
      const updateProperties = configObject.properties.map((property) => {
        if (import_typescript3.default.isPropertyAssignment(property)) {
          const thisPropertyName = property.name.getText(sourceFile);
          if (thisPropertyName === "schema" && import_typescript3.default.isPropertyAssignment(property) && import_typescript3.default.isObjectLiteralExpression(property.initializer)) {
            const schemaObject = property.initializer;
            const collectionsProperty = schemaObject.properties.find(
              (p) => import_typescript3.default.isPropertyAssignment(p) && p.name.getText(sourceFile) === "collections"
            );
            if (collectionsProperty && import_typescript3.default.isPropertyAssignment(collectionsProperty) && import_typescript3.default.isArrayLiteralExpression(collectionsProperty.initializer)) {
              const collectionsArray = collectionsProperty.initializer;
              const collectionItems = collectionsArray.elements.map(
                (e) => e.getText(sourceFile)
              );
              if (collectionItems.includes(
                newExpression.getText(newExpressionSourceFile)
              )) {
                return property;
              }
              return import_typescript3.default.factory.updatePropertyAssignment(
                property,
                property.name,
                import_typescript3.default.factory.createObjectLiteralExpression(
                  schemaObject.properties.map((subProp) => {
                    if (import_typescript3.default.isPropertyAssignment(subProp) && subProp.name.getText(sourceFile) === "collections" && import_typescript3.default.isArrayLiteralExpression(subProp.initializer)) {
                      return import_typescript3.default.factory.updatePropertyAssignment(
                        subProp,
                        subProp.name,
                        import_typescript3.default.factory.createArrayLiteralExpression(
                          [newExpression, ...subProp.initializer.elements],
                          true
                        )
                      );
                    }
                    return subProp;
                  }),
                  true
                )
              );
            }
          }
        }
        return property;
      });
      return import_typescript3.default.factory.createCallExpression(
        node.expression,
        node.typeArguments,
        [import_typescript3.default.factory.createObjectLiteralExpression(updateProperties, true)]
      );
    }
    return import_typescript3.default.visitEachChild(node, visit2, ctx);
  };
  return (sourceFile2) => {
    return import_typescript3.default.visitEachChild(sourceFile2, visit2, ctx);
  };
};
var makeUpdateObjectLiteralPropertyVisitor = (sourceFile, functionName, propertyName, propertyValueExpressionSourceFile, propertyValue) => (ctx) => {
  const visitor = (node) => {
    if (import_typescript3.default.isCallExpression(node) && import_typescript3.default.isIdentifier(node.expression) && node.expression.text === functionName && node.arguments.length > 0 && import_typescript3.default.isObjectLiteralExpression(node.arguments[0])) {
      let foundProperty = false;
      const configObject = node.arguments[0];
      const updateProperties = configObject.properties.map((property) => {
        if (import_typescript3.default.isPropertyAssignment(property) || import_typescript3.default.isShorthandPropertyAssignment(property)) {
          const name2 = property.name.getText(sourceFile);
          if (name2 === propertyName) {
            foundProperty = true;
            return import_typescript3.default.factory.createPropertyAssignment(name2, propertyValue);
          }
        }
        return property;
      });
      if (!foundProperty) {
        updateProperties.unshift(
          import_typescript3.default.factory.createPropertyAssignment(propertyName, propertyValue)
        );
      }
      return import_typescript3.default.factory.createCallExpression(
        node.expression,
        node.typeArguments,
        [import_typescript3.default.factory.createObjectLiteralExpression(updateProperties, true)]
      );
    }
    return import_typescript3.default.visitEachChild(node, visitor, ctx);
  };
  return (sourceFile2) => {
    return import_typescript3.default.visitNode(sourceFile2, visitor);
  };
};
var addSelfHostedTinaAuthToConfig = async (config2, configFile) => {
  const pathToConfig = configFile.resolve(config2.typescript).path;
  const sourceFile = import_typescript3.default.createSourceFile(
    pathToConfig,
    import_fs_extra12.default.readFileSync(pathToConfig, "utf8"),
    config2.typescript ? import_typescript3.default.ScriptTarget.Latest : import_typescript3.default.ScriptTarget.ESNext
  );
  const { configImports, configAuthProviderClass, extraTinaCollections } = config2.authProvider;
  const importMap = {
    // iterate over configImports and add them to the import map
    ...configImports.reduce(
      (acc, { from, imported }) => {
        acc[from] = imported;
        return acc;
      },
      {}
    )
  };
  const transformedSourceFileResult = import_typescript3.default.transform(
    sourceFile,
    [
      makeImportsVisitor(sourceFile, {
        ...importMap,
        tinacms: ["LocalAuthProvider"]
      }),
      makeVariableStatementVisitor(
        sourceFile,
        ...parseVariableStatement(
          "const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true'"
        )
      ),
      makeUpdateObjectLiteralPropertyVisitor(
        sourceFile,
        "defineConfig",
        "authProvider",
        ...parseExpression(
          `isLocal ? new LocalAuthProvider() : ${configAuthProviderClass}`
        )
      ),
      makeUpdateObjectLiteralPropertyVisitor(
        sourceFile,
        "defineConfig",
        "contentApiUrlOverride",
        ...parseExpression("'/api/tina/gql'")
      ),
      ...extraTinaCollections.map(
        (collectionName) => makeAddExpressionToSchemaCollectionVisitor(
          sourceFile,
          "defineConfig",
          ...parseExpression(collectionName)
        )
      )
    ].map((visitor) => makeTransformer(visitor))
  );
  return import_fs_extra12.default.writeFile(
    pathToConfig,
    import_typescript3.default.createPrinter({ omitTrailingSemicolon: true }).printFile(transformedSourceFileResult.transformed[0])
  );
};

// src/cmds/init/apply.ts
async function apply({
  env,
  params,
  config: config2
}) {
  if (config2.framework.name === "other" && config2.hosting === "self-host") {
    logger.error(
      logText(
        "Self-hosted Tina requires init setup only works with next.js right now. Please check out the docs for info on how to setup Tina on another framework: https://tina.io/docs/self-hosted/existing-site/"
      )
    );
    return;
  }
  const { pathToForestryConfig, noTelemetry, baseDir = "" } = params;
  let collections;
  let templateCode;
  let extraText;
  let isForestryMigration = false;
  if (env.forestryConfigExists) {
    const res = await forestryMigrate({
      frontMatterFormat: env.frontMatterFormat || config2.frontMatterFormat,
      pathToForestryConfig,
      usingTypescript: config2.typescript
    });
    if (res) {
      templateCode = res.templateCodeString;
      collections = res.collectionString;
      extraText = res.importStatements;
      isForestryMigration = true;
    }
  }
  await reportTelemetry({
    usingTypescript: config2.typescript,
    hasForestryConfig: env.forestryConfigExists,
    noTelemetry
  });
  if (!env.packageJSONExists) {
    await createPackageJSON();
  }
  if (!env.gitIgnoreExists) {
    await createGitignore({ baseDir });
  } else {
    const itemsToAdd = [];
    if (!env.gitIgnoreNodeModulesExists) {
      itemsToAdd.push("node_modules");
    }
    if (!env.gitIgnoreEnvExists) {
      itemsToAdd.push(".env");
    }
    if (itemsToAdd.length > 0) {
      await updateGitIgnore({ baseDir, items: itemsToAdd });
    }
  }
  if (isForestryMigration && !env.tinaConfigExists) {
    await addTemplateFile({
      generatedFile: env.generatedFiles["templates"],
      content: templateCode,
      config: config2
    });
  }
  const usingDataLayer = config2.hosting === "self-host";
  if (usingDataLayer) {
    await addDatabaseFile({
      config: config2,
      generatedFile: env.generatedFiles["database"]
    });
    await addNextApiRoute({
      env,
      config: config2,
      generatedFile: env.generatedFiles["next-api-handler"]
    });
    await addTemplateFile({
      config: config2,
      generatedFile: env.generatedFiles["users-json"],
      content: JSON.stringify(
        {
          users: [
            {
              name: "Tina User",
              email: "user@tina.io",
              username: "tinauser",
              password: {
                value: "tinarocks",
                passwordChangeRequired: true
              }
            }
          ]
        },
        null,
        2
      )
    });
  }
  if (!env.forestryConfigExists && !env.tinaConfigExists) {
    await addContentFile({ config: config2, env });
  }
  if (config2.framework.reactive && addReactiveFile[config2.framework.name] && !env.tinaConfigExists) {
    await addReactiveFile[config2.framework.name]({
      baseDir,
      config: config2,
      env,
      dataLayer: usingDataLayer,
      generatedFile: env.generatedFiles["reactive-example"]
    });
  }
  await addDependencies(config2, env, params);
  if (!env.tinaConfigExists) {
    await addConfigFile({
      configArgs: {
        config: config2,
        publicFolder: import_path11.default.join(
          import_path11.default.relative(process.cwd(), pathToForestryConfig),
          config2.publicFolder
        ),
        collections,
        extraText,
        isLocalEnvVarName: config2.isLocalEnvVarName,
        isForestryMigration,
        selfHosted: usingDataLayer
      },
      baseDir,
      generatedFile: env.generatedFiles["config"],
      config: config2
    });
  }
  if (
    // if the config was just generated we do not need to update the config file because it will be generated correctly
    env.tinaConfigExists && // Are we running tinacms init backend
    params.isBackendInit && // Do the user choose the 'self-host' option
    config2.hosting === "self-host" && // the user did not choose the 'tina-cloud' auth provider
    (config2.authProvider?.name || "") !== "tina-cloud"
  ) {
    await addSelfHostedTinaAuthToConfig(config2, env.generatedFiles["config"]);
  }
  logNextSteps({
    config: config2,
    isBackend: params.isBackendInit,
    dataLayer: usingDataLayer,
    packageManager: config2.packageManager,
    framework: config2.framework
  });
}
var forestryMigrate = async ({
  pathToForestryConfig,
  usingTypescript,
  frontMatterFormat
}) => {
  const { collections, importStatements, templateCode } = await generateCollections({
    pathToForestryConfig,
    usingTypescript,
    frontMatterFormat
  });
  const JSONString = JSON.stringify(collections, null, 2);
  const { code } = addVariablesToCode(JSONString);
  return {
    collectionString: code,
    importStatements,
    templateCodeString: templateCode
  };
};
var reportTelemetry = async ({
  hasForestryConfig,
  noTelemetry,
  usingTypescript
}) => {
  if (noTelemetry) {
    logger.info(logText("Telemetry disabled"));
  }
  const telemetry = new import_metrics2.Telemetry({ disabled: noTelemetry });
  const schemaFileType = usingTypescript ? "ts" : "js";
  await telemetry.submitRecord({
    event: {
      name: "tinacms:cli:init:invoke",
      schemaFileType,
      hasForestryConfig
    }
  });
};
var createPackageJSON = async () => {
  logger.info(logText("No package.json found, creating one"));
  await execShellCommand(`npm init --yes`);
};
var createGitignore = async ({ baseDir }) => {
  logger.info(logText("No .gitignore found, creating one"));
  import_fs_extra13.default.outputFileSync(import_path11.default.join(baseDir, ".gitignore"), "node_modules");
};
var updateGitIgnore = async ({
  baseDir,
  items
}) => {
  logger.info(logText(`Adding ${items.join(",")} to .gitignore`));
  const gitignoreContent = import_fs_extra13.default.readFileSync(import_path11.default.join(baseDir, ".gitignore")).toString();
  const newGitignoreContent = [...gitignoreContent.split("\n"), ...items].join(
    "\n"
  );
  await import_fs_extra13.default.writeFile(import_path11.default.join(baseDir, ".gitignore"), newGitignoreContent);
};
var addDependencies = async (config2, env, params) => {
  const { packageManager } = config2;
  const tagVersion = params.tinaVersion ? `@${params.tinaVersion}` : "";
  let deps = [];
  let devDeps = [];
  if (!env.hasTinaDeps) {
    deps.push("tinacms");
    devDeps.push("@tinacms/cli");
  }
  if (config2.typescript) {
    devDeps.push("@types/node");
  }
  if (config2.hosting === "self-host") {
    deps.push("@tinacms/datalayer");
  }
  deps.push(
    ...config2.databaseAdapter?.imports?.map((x) => x.packageName) || []
  );
  deps.push(...config2.authProvider?.peerDependencies || []);
  deps.push(
    ...config2.authProvider?.backendAuthProviderImports?.map(
      (x) => x.packageName
    ) || []
  );
  deps.push(
    ...config2.authProvider?.configImports?.map((x) => x.packageName) || []
  );
  deps.push(...config2.gitProvider?.imports?.map((x) => x.packageName) || []);
  if (tagVersion) {
    deps = deps.map(
      (dep) => dep.indexOf("tina") >= 0 ? `${dep}${tagVersion}` : dep
    );
    devDeps = devDeps.map(
      (dep) => dep.indexOf("tina") >= 0 ? `${dep}${tagVersion}` : dep
    );
  }
  let packageManagers = {
    pnpm: process.env.USE_WORKSPACE ? `pnpm add ${deps.join(" ")} --workspace` : `pnpm add ${deps.join(" ")}`,
    npm: `npm install ${deps.join(" ")}`,
    yarn: `yarn add ${deps.join(" ")}`
  };
  if (packageManagers[packageManager] && deps.length > 0) {
    logger.info(logText("Adding dependencies, this might take a moment..."));
    logger.info(indentedCmd(`${logText(packageManagers[packageManager])}`));
    await execShellCommand(packageManagers[packageManager]);
  }
  if (devDeps.length > 0) {
    packageManagers = {
      pnpm: process.env.USE_WORKSPACE ? `pnpm add -D ${devDeps.join(" ")} --workspace` : `pnpm add -D ${devDeps.join(" ")}`,
      npm: `npm install -D ${devDeps.join(" ")}`,
      yarn: `yarn add -D ${devDeps.join(" ")}`
    };
    if (packageManagers[packageManager]) {
      logger.info(
        logText("Adding dev dependencies, this might take a moment...")
      );
      logger.info(indentedCmd(`${logText(packageManagers[packageManager])}`));
      await execShellCommand(packageManagers[packageManager]);
    }
  }
};
var writeGeneratedFile = async ({
  generatedFile,
  overwrite,
  content,
  typescript
}) => {
  const { exists, path: path14, parentPath } = generatedFile.resolve(typescript);
  if (exists) {
    if (overwrite) {
      logger.info(`Overwriting file at ${path14}... \u2705`);
      import_fs_extra13.default.outputFileSync(path14, content);
    } else {
      logger.info(`Not overwriting file at ${path14}.`);
      logger.info(
        logText(`Please add the following to ${path14}:
${indentText(content)}}`)
      );
    }
  } else {
    logger.info(`Adding file at ${path14}... \u2705`);
    await import_fs_extra13.default.ensureDir(parentPath);
    import_fs_extra13.default.outputFileSync(path14, content);
  }
};
var addConfigFile = async ({
  baseDir,
  configArgs,
  generatedFile,
  config: config2
}) => {
  const content = (0, import_prettier2.format)(generateConfig(configArgs), {
    parser: "babel"
  });
  await writeGeneratedFile({
    overwrite: config2.overwriteList?.includes("config"),
    generatedFile,
    content,
    typescript: config2.typescript
  });
  const { exists } = generatedFile.resolve(config2.typescript);
  if (!exists) {
    await writeGitignore(baseDir);
  }
};
var addDatabaseFile = async ({
  config: config2,
  generatedFile
}) => {
  await writeGeneratedFile({
    generatedFile,
    overwrite: config2.overwriteList?.includes("database"),
    content: databaseTemplate({ config: config2 }),
    typescript: config2.typescript
  });
};
var addNextApiRoute = async ({
  config: config2,
  generatedFile,
  env
}) => {
  const content = (0, import_prettier2.format)(nextApiRouteTemplate({ config: config2, env }), {
    parser: "babel"
  });
  await writeGeneratedFile({
    generatedFile,
    overwrite: config2.overwriteList?.includes("next-api-handler"),
    content,
    typescript: config2.typescript
  });
};
var addTemplateFile = async ({
  content,
  generatedFile,
  config: config2
}) => {
  await writeGeneratedFile({
    generatedFile,
    overwrite: config2.overwriteList?.includes(generatedFile.generatedFileType),
    content,
    typescript: config2.typescript
  });
};
var addContentFile = async ({
  config: config2,
  env
}) => {
  await writeGeneratedFile({
    generatedFile: {
      javascriptExists: false,
      typescriptExists: false,
      fullPathJS: "",
      fullPathTS: "",
      generatedFileType: "sample-content",
      name: "",
      parentPath: "",
      get resolve() {
        return () => ({
          exists: env.sampleContentExists,
          path: env.sampleContentPath,
          parentPath: import_path11.default.dirname(env.sampleContentPath)
        });
      }
    },
    overwrite: config2.overwriteList?.includes("sample-content"),
    content: helloWorldPost,
    typescript: false
  });
};
var logNextSteps = ({
  config: config2,
  dataLayer: _datalayer,
  framework,
  packageManager,
  isBackend
}) => {
  if (isBackend) {
    logger.info(focusText(`
${titleText(" TinaCMS ")} backend initialized!`));
    const envFileText = config2.envVars.map((x) => {
      return `${x.key}=${x.value || "***"}`;
    }).join("\n") + `
TINA_PUBLIC_IS_LOCAL=true`;
    const envFile = import_path11.default.join(process.cwd(), ".env");
    if (!import_fs_extra13.default.existsSync(envFile)) {
      logger.info(`Adding .env file to your project... \u2705`);
      import_fs_extra13.default.writeFileSync(envFile, envFileText);
    } else {
      logger.info(
        "Please add the following environment variables to your .env file"
      );
      logger.info(indentText(envFileText));
    }
    logger.info(
      "Before you can run your site you will need to update it to use the backend client.\nSee docs for more info: https://tina.io/docs/self-hosted/querying-data/"
    );
    logger.info(
      "If you are deploying to vercel make sure to add the environment variables to your project."
    );
    logger.info("Make sure  to push tina-lock.json to your GitHub repo");
  } else {
    logger.info(focusText(`
${titleText(" TinaCMS ")} has been initialized!`));
    logger.info(
      "To get started run: " + cmdText(frameworkDevCmds[framework.name]({ packageManager }))
    );
    if (framework.name === "hugo") {
      logger.info(
        focusText("Hugo is required. "),
        "Don't have Hugo installed? Follow this guide to set it up: ",
        linkText("https://gohugo.io/installation/")
      );
    }
    logger.info(
      "To get your site production ready, run: " + cmdText(`tinacms init backend`)
    );
    logger.info(
      `
Once your site is running, access the CMS at ${linkText(
        "<YourDevURL>/admin/index.html"
      )}`
    );
  }
};
var other = ({ packageManager }) => {
  const packageManagers = {
    pnpm: `pnpm`,
    npm: `npx`,
    // npx is the way to run executables that aren't in your "scripts"
    yarn: `yarn`
  };
  return `${packageManagers[packageManager]} tinacms dev -c "<your dev command>"`;
};
var frameworkDevCmds = {
  other,
  hugo: other,
  jekyll: other,
  next: ({ packageManager }) => {
    const packageManagers = {
      pnpm: `pnpm`,
      npm: `npm run`,
      // npx is the way to run executables that aren't in your "scripts"
      yarn: `yarn`
    };
    return `${packageManagers[packageManager]} dev`;
  }
};
var addReactiveFile = {
  next: async ({
    generatedFile,
    config: config2,
    env,
    baseDir,
    dataLayer
  }) => {
    const packageJsonPath = import_path11.default.join(baseDir, "package.json");
    await writeGeneratedFile({
      generatedFile,
      typescript: config2.typescript,
      overwrite: config2.overwriteList?.includes(
        generatedFile.generatedFileType
      ),
      content: templates["demo-post-page"]({
        usingSrc: env.usingSrc,
        dataLayer
      })
    });
    logger.info("Adding a nextjs example... \u2705");
    const packageJson = JSON.parse(import_fs_extra13.default.readFileSync(packageJsonPath).toString());
    const scripts = packageJson.scripts || {};
    const updatedPackageJson = JSON.stringify(
      {
        ...packageJson,
        scripts: extendNextScripts(scripts, {
          isLocalEnvVarName: config2.isLocalEnvVarName,
          addSetupUsers: config2.authProvider?.name === "next-auth"
        })
      },
      null,
      2
    );
    import_fs_extra13.default.writeFileSync(packageJsonPath, updatedPackageJson);
  }
};
function execShellCommand(cmd) {
  const exec = require("child_process").exec;
  return new Promise((resolve2, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      resolve2(stdout ? stdout : stderr);
    });
  });
}
var apply_default = apply;

// src/cmds/init/index.ts
var command = new CLICommand({
  async setup(params) {
    logger.level = "info";
    process.chdir(params.rootPath);
  },
  detectEnvironment({
    rootPath,
    pathToForestryConfig,
    baseDir = "",
    debug = false,
    tinaVersion
  }) {
    return detectEnvironment_default({
      baseDir,
      pathToForestryConfig,
      rootPath,
      debug,
      tinaVersion
    });
  },
  configure(env, { debug = false, isBackendInit = false }) {
    return configure_default(env, { debug, isBackend: isBackendInit });
  },
  apply(config2, env, params) {
    return apply_default({
      env,
      params,
      config: config2
    });
  }
});

// src/next/commands/init-command/index.ts
var InitCommand = class extends import_clipanion6.Command {
  constructor() {
    super(...arguments);
    this.pathToForestryConfig = import_clipanion6.Option.String("--forestryPath", {
      description: "Specify the relative path to the .forestry directory, if importing an existing forestry site."
    });
    this.rootPath = import_clipanion6.Option.String("--rootPath", {
      description: "Specify the root directory to run the CLI from (defaults to current working directory)"
    });
    this.debug = import_clipanion6.Option.Boolean("--debug", false, {
      description: "Enable debug logging"
    });
    this.noTelemetry = import_clipanion6.Option.Boolean("--noTelemetry", false, {
      description: "Disable anonymous telemetry that is collected"
    });
    this.tinaVersion = import_clipanion6.Option.String("--tinaVersion", {
      description: "Specify a version for tina dependencies"
    });
  }
  static {
    this.paths = [["init"], ["init", "backend"]];
  }
  static {
    this.usage = import_clipanion6.Command.Usage({
      category: `Commands`,
      description: `Add Tina to an existing project`
    });
  }
  async catch(error) {
    logger.error("Error occured during tinacms init");
    console.error(error);
    process.exit(1);
  }
  async execute() {
    const isBackend = Boolean(this.path.find((x) => x === "backend"));
    const rootPath = this.rootPath || process.cwd();
    await command.execute({
      isBackendInit: isBackend,
      rootPath,
      pathToForestryConfig: this.pathToForestryConfig || rootPath,
      noTelemetry: this.noTelemetry,
      debug: this.debug,
      tinaVersion: this.tinaVersion
    });
    process.exit();
  }
};

// src/next/commands/searchindex-command/index.ts
var import_clipanion7 = require("clipanion");
var import_graphql17 = require("@tinacms/graphql");
var import_search3 = require("@tinacms/search");
var SearchIndexCommand = class extends import_clipanion7.Command {
  constructor() {
    super(...arguments);
    this.rootPath = import_clipanion7.Option.String("--rootPath", {
      description: "Specify the root directory to run the CLI from (defaults to current working directory)"
    });
    this.verbose = import_clipanion7.Option.Boolean("-v,--verbose", false, {
      description: "increase verbosity of logged output"
    });
  }
  static {
    this.paths = [["search-index"]];
  }
  static {
    this.usage = import_clipanion7.Command.Usage({
      category: `Commands`,
      description: `Index the site for search`
    });
  }
  async catch(error) {
    logger.error("Error occured during tinacms search-index");
    console.error(error);
    process.exit(1);
  }
  async execute() {
    const rootPath = this.rootPath || process.cwd();
    const configManager = new ConfigManager({ rootPath });
    try {
      await configManager.processConfig();
    } catch (e) {
      logger.error(e.message);
      if (this.verbose) {
        console.error(e);
      }
    }
    if (!configManager.config?.search) {
      logger.error("No search config found");
      process.exit(1);
    }
    const { schema } = configManager.config;
    const tinaSchema = await (0, import_graphql17.createSchema)({
      schema: { ...schema, config: configManager.config }
    });
    let client;
    const hasTinaSearch = Boolean(configManager.config?.search?.tina);
    if (hasTinaSearch) {
      if (!configManager.config?.branch) {
        logger.error(
          `${dangerText(
            `ERROR: Branch not configured in tina search configuration.`
          )}`
        );
        throw new Error("Branch not configured in tina search configuration.");
      }
      if (!configManager.config?.clientId) {
        logger.error(`${dangerText(`ERROR: clientId not configured.`)}`);
        throw new Error("clientId not configured.");
      }
      if (!configManager.config?.search?.tina?.indexerToken) {
        logger.error(
          `${dangerText(
            `ERROR: indexerToken not configured in tina search configuration.`
          )}`
        );
        throw new Error(
          "indexerToken not configured in tina search configuration."
        );
      }
      client = new import_search3.TinaCMSSearchIndexClient({
        apiUrl: `${configManager.config.tinaioConfig?.contentApiUrlOverride || "https://content.tinajs.io"}/searchIndex/${configManager.config?.clientId}`,
        branch: configManager.config?.branch,
        indexerToken: configManager.config?.search?.tina?.indexerToken,
        stopwordLanguages: configManager.config?.search?.tina?.stopwordLanguages
      });
    } else {
      client = configManager.config?.search?.searchClient;
    }
    const searchIndexer = new import_search3.SearchIndexer({
      batchSize: configManager.config.search?.indexBatchSize || 100,
      bridge: new import_graphql17.FilesystemBridge(
        configManager.rootPath,
        configManager.contentRootPath
      ),
      schema: tinaSchema,
      textIndexLength: configManager.config.search?.maxSearchIndexFieldLength || 100,
      client
    });
    let err;
    await spin({
      waitFor: async () => {
        try {
          await searchIndexer.indexAllContent();
        } catch (e) {
          err = e;
        }
      },
      text: "Building search index"
    });
    if (err) {
      logger.error(`${dangerText(`ERROR: ${err.message}`)}`);
      process.exit(1);
    }
    process.exit(0);
  }
};

// src/index.ts
var cli = new import_clipanion8.Cli({
  binaryName: `tinacms`,
  binaryLabel: `TinaCMS`,
  binaryVersion: version
});
cli.register(DevCommand);
cli.register(BuildCommand);
cli.register(AuditCommand);
cli.register(InitCommand);
cli.register(CodemodCommand);
cli.register(SearchIndexCommand);
cli.register(import_clipanion8.Builtins.DefinitionsCommand);
cli.register(import_clipanion8.Builtins.HelpCommand);
cli.register(import_clipanion8.Builtins.VersionCommand);
var index_default = cli;
