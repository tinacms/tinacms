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
  LocalSearchIndexClient: () => LocalSearchIndexClient,
  SearchIndexer: () => SearchIndexer,
  TinaCMSSearchIndexClient: () => TinaCMSSearchIndexClient,
  si: () => import_search_index2.default
});
module.exports = __toCommonJS(index_exports);
var import_search_index2 = __toESM(require("search-index"));

// src/indexer/index.ts
var import_graphql = require("@tinacms/graphql");

// src/indexer/utils.ts
var sw = __toESM(require("stopword"));
var StringBuilder = class {
  constructor(limit) {
    this.length = 0;
    this.buffer = [];
    this.limit = limit;
  }
  append(str) {
    if (this.length + str.length > this.limit) {
      return true;
    } else {
      this.buffer.push(str);
      this.length += str.length;
      if (this.length > this.limit) {
        return true;
      }
      return false;
    }
  }
  toString() {
    return this.buffer.join(" ");
  }
};
var extractText = (data, acc, indexableNodeTypes) => {
  if (data) {
    if (indexableNodeTypes.indexOf(data.type) !== -1 && (data.text || data.value)) {
      const tokens = tokenizeString(data.text || data.value);
      for (const token of tokens) {
        if (acc.append(token)) {
          return;
        }
      }
    }
    data.children?.forEach?.(
      (child) => extractText(child, acc, indexableNodeTypes)
    );
  }
};
var relativePath = (path, collection) => {
  return path.replace(/\\/g, "/").replace(collection.path, "").replace(/^\/|\/$/g, "");
};
var tokenizeString = (str) => {
  return str.split(/[\s\.,]+/).map((s) => s.toLowerCase()).filter((s) => s);
};
var processTextFieldValue = (value, maxLen) => {
  const tokens = tokenizeString(value);
  const builder = new StringBuilder(maxLen);
  for (const part of tokens) {
    if (builder.append(part)) {
      break;
    }
  }
  return builder.toString();
};
var processDocumentForIndexing = (data, path, collection, textIndexLength, field) => {
  if (!field) {
    const relPath = relativePath(path, collection);
    data["_id"] = `${collection.name}:${relPath}`;
    data["_relativePath"] = relPath;
  }
  for (const f of field?.fields || collection.fields || []) {
    if (!f.searchable) {
      delete data[f.name];
      continue;
    }
    const isList = f.list;
    if (data[f.name]) {
      if (f.type === "object") {
        if (isList) {
          data[f.name] = data[f.name].map(
            (obj) => processDocumentForIndexing(
              obj,
              path,
              collection,
              textIndexLength,
              f
            )
          );
        } else {
          data[f.name] = processDocumentForIndexing(
            data[f.name],
            path,
            collection,
            textIndexLength,
            f
          );
        }
      } else if (f.type === "string") {
        const fieldTextIndexLength = f.maxSearchIndexFieldLength || textIndexLength;
        if (isList) {
          data[f.name] = data[f.name].map(
            (value) => processTextFieldValue(value, fieldTextIndexLength)
          );
        } else {
          data[f.name] = processTextFieldValue(
            data[f.name],
            fieldTextIndexLength
          );
        }
      } else if (f.type === "rich-text") {
        const fieldTextIndexLength = f.maxSearchIndexFieldLength || textIndexLength;
        if (isList) {
          data[f.name] = data[f.name].map((value) => {
            const acc = new StringBuilder(fieldTextIndexLength);
            extractText(value, acc, ["text", "code_block", "html"]);
            return acc.toString();
          });
        } else {
          const acc = new StringBuilder(fieldTextIndexLength);
          extractText(data[f.name], acc, ["text", "code_block", "html"]);
          data[f.name] = acc.toString();
        }
      }
    }
  }
  return data;
};
var memo = {};
var lookupStopwords = (keys, defaultStopWords = sw.eng) => {
  let stopwords = defaultStopWords;
  if (keys) {
    if (memo[keys.join(",")]) {
      return memo[keys.join(",")];
    }
    stopwords = [];
    for (const key of keys) {
      stopwords.push(...sw[key]);
    }
    memo[keys.join(",")] = stopwords;
  }
  return stopwords;
};

// src/indexer/index.ts
var SearchIndexer = class {
  constructor(options) {
    this.client = options.client;
    this.bridge = options.bridge;
    this.schema = options.schema;
    this.batchSize = options.batchSize || 100;
    this.textIndexLength = options.textIndexLength || 500;
  }
  makeIndexerCallback(itemCallback) {
    return async (collection, contentPaths) => {
      const templateInfo = this.schema.getTemplatesForCollectable(collection);
      await (0, import_graphql.sequential)(contentPaths, async (path) => {
        const data = await (0, import_graphql.transformDocumentIntoPayload)(
          `${collection.path}/${path}`,
          (0, import_graphql.transformDocument)(
            path,
            await (0, import_graphql.loadAndParseWithAliases)(
              this.bridge,
              path,
              collection,
              templateInfo
            ),
            this.schema
          ),
          this.schema
        );
        await itemCallback(
          processDocumentForIndexing(
            data["_values"],
            path,
            collection,
            this.textIndexLength
          )
        );
      });
    };
  }
  async indexContentByPaths(documentPaths) {
    let batch = [];
    const itemCallback = async (item) => {
      batch.push(item);
      if (batch.length > this.batchSize) {
        await this.client.put(batch);
        batch = [];
      }
    };
    await this.client.onStartIndexing?.();
    await (0, import_graphql.scanContentByPaths)(
      this.schema,
      documentPaths,
      this.makeIndexerCallback(itemCallback)
    );
    if (batch.length > 0) {
      await this.client.put(batch);
    }
    await this.client.onFinishIndexing?.();
  }
  async indexAllContent() {
    await this.client.onStartIndexing?.();
    let batch = [];
    const itemCallback = async (item) => {
      batch.push(item);
      if (batch.length > this.batchSize) {
        await this.client.put(batch);
        batch = [];
      }
    };
    const warnings = await (0, import_graphql.scanAllContent)(
      this.schema,
      this.bridge,
      this.makeIndexerCallback(itemCallback)
    );
    if (batch.length > 0) {
      await this.client.put(batch);
    }
    await this.client.onFinishIndexing?.();
    return { warnings };
  }
  async deleteIndexContent(documentPaths) {
    await this.client.onStartIndexing?.();
    await this.client.del(documentPaths);
    await this.client.onFinishIndexing?.();
  }
};

// src/client/index.ts
var import_sqlite_level = require("sqlite-level");
var import_search_index = __toESM(require("search-index"));
var import_memory_level = require("memory-level");
var zlib = __toESM(require("node:zlib"));
var DEFAULT_TOKEN_SPLIT_REGEX = /[\p{L}\d_]+/gu;
var LocalSearchIndexClient = class {
  constructor(options) {
    this.memoryLevel = new import_memory_level.MemoryLevel();
    this.stopwords = lookupStopwords(options.stopwordLanguages);
    this.tokenSplitRegex = options.tokenSplitRegex ? new RegExp(options.tokenSplitRegex, "gu") : DEFAULT_TOKEN_SPLIT_REGEX;
  }
  async onStartIndexing() {
    this.searchIndex = await (0, import_search_index.default)({
      // @ts-ignore
      db: this.memoryLevel,
      stopwords: this.stopwords,
      tokenSplitRegex: this.tokenSplitRegex
    });
  }
  async put(docs) {
    if (!this.searchIndex) {
      throw new Error("onStartIndexing must be called first");
    }
    return this.searchIndex.PUT(docs);
  }
  async del(ids) {
    if (!this.searchIndex) {
      throw new Error("onStartIndexing must be called first");
    }
    return this.searchIndex.DELETE(ids);
  }
  query(query, options) {
    return Promise.resolve({
      nextCursor: void 0,
      prevCursor: void 0,
      results: [],
      total: 0
    });
  }
  async export(filename) {
    const sqliteLevel = new import_sqlite_level.SqliteLevel({ filename });
    const iterator = this.memoryLevel.iterator();
    for await (const [key, value] of iterator) {
      await sqliteLevel.put(key, value);
    }
    await sqliteLevel.close();
  }
};
var TinaCMSSearchIndexClient = class extends LocalSearchIndexClient {
  constructor(options) {
    super(options);
    this.apiUrl = options.apiUrl;
    this.branch = options.branch;
    this.indexerToken = options.indexerToken;
  }
  async onFinishIndexing() {
    const headers = new Headers();
    headers.append("x-api-key", this.indexerToken || "bogus");
    headers.append("Content-Type", "application/json");
    let res = await fetch(`${this.apiUrl}/upload/${this.branch}`, {
      method: "GET",
      headers
    });
    if (res.status !== 200) {
      let json;
      try {
        json = await res.json();
      } catch (e) {
        console.error("Failed to parse error response", e);
      }
      throw new Error(
        `Failed to get upload url. Status: ${res.status}${json?.message ? ` - ${json.message}` : ``}`
      );
    }
    const { signedUrl } = await res.json();
    const sqliteLevel = new import_sqlite_level.SqliteLevel({ filename: ":memory:" });
    const iterator = this.memoryLevel.iterator();
    for await (const [key, value] of iterator) {
      await sqliteLevel.put(key, value);
    }
    const buffer = sqliteLevel.db.serialize();
    await sqliteLevel.close();
    res = await fetch(signedUrl, {
      method: "PUT",
      body: zlib.gzipSync(buffer)
    });
    if (res.status !== 200) {
      throw new Error(
        `Failed to upload search index. Status: ${res.status}
${await res.text()}`
      );
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  LocalSearchIndexClient,
  SearchIndexer,
  TinaCMSSearchIndexClient,
  si
});
