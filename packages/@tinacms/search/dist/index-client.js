(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("stopword")) : typeof define === "function" && define.amd ? define(["exports", "stopword"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global["@tinacms/search"] = {}, global.NOOP));
})(this, function(exports2, sw) {
  "use strict";
  function _interopNamespaceDefault(e) {
    const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
    if (e) {
      for (const k in e) {
        if (k !== "default") {
          const d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: () => e[k]
          });
        }
      }
    }
    n.default = e;
    return Object.freeze(n);
  }
  const sw__namespace = /* @__PURE__ */ _interopNamespaceDefault(sw);
  class StringBuilder {
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
  }
  const extractText = (data, acc, indexableNodeTypes) => {
    var _a, _b;
    if (data) {
      if (indexableNodeTypes.indexOf(data.type) !== -1 && (data.text || data.value)) {
        const tokens = tokenizeString(data.text || data.value);
        for (const token of tokens) {
          if (acc.append(token)) {
            return;
          }
        }
      }
      (_b = (_a = data.children) == null ? void 0 : _a.forEach) == null ? void 0 : _b.call(
        _a,
        (child) => extractText(child, acc, indexableNodeTypes)
      );
    }
  };
  const relativePath = (path, collection) => {
    return path.replace(/\\/g, "/").replace(collection.path, "").replace(/^\/|\/$/g, "");
  };
  const tokenizeString = (str) => {
    return str.split(/[\s\.,]+/).map((s) => s.toLowerCase()).filter((s) => s);
  };
  const processTextFieldValue = (value, maxLen) => {
    const tokens = tokenizeString(value);
    const builder = new StringBuilder(maxLen);
    for (const part of tokens) {
      if (builder.append(part)) {
        break;
      }
    }
    return builder.toString();
  };
  const processDocumentForIndexing = (data, path, collection, textIndexLength, field) => {
    if (!field) {
      const relPath = relativePath(path, collection);
      data["_id"] = `${collection.name}:${relPath}`;
      data["_relativePath"] = relPath;
    }
    for (const f of (field == null ? void 0 : field.fields) || collection.fields || []) {
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
  const memo = {};
  const lookupStopwords = (keys, defaultStopWords = sw__namespace.eng) => {
    let stopwords = defaultStopWords;
    if (keys) {
      if (memo[keys.join(",")]) {
        return memo[keys.join(",")];
      }
      stopwords = [];
      for (const key of keys) {
        stopwords.push(...sw__namespace[key]);
      }
      memo[keys.join(",")] = stopwords;
    }
    return stopwords;
  };
  const queryToSearchIndexQuery = (query, stopwordLanguages) => {
    let q;
    const parts = query.split(" ");
    const stopwords = lookupStopwords(stopwordLanguages);
    if (parts.length === 1) {
      q = { AND: [parts[0]] };
    } else {
      q = {
        AND: parts.filter(
          (part) => part.toLowerCase() !== "and" && stopwords.indexOf(part.toLowerCase()) === -1
        )
      };
    }
    return q;
  };
  const optionsToSearchIndexOptions = (options) => {
    const opt = {};
    if (options == null ? void 0 : options.limit) {
      opt["PAGE"] = {
        SIZE: options.limit,
        NUMBER: (options == null ? void 0 : options.cursor) ? parseInt(options.cursor) : 0
      };
    }
    return opt;
  };
  const parseSearchIndexResponse = (data, options) => {
    const results = data["RESULT"];
    const total = data["RESULT_LENGTH"];
    if ((options == null ? void 0 : options.cursor) && (options == null ? void 0 : options.limit)) {
      const prevCursor = options.cursor === "0" ? null : (parseInt(options.cursor) - 1).toString();
      const nextCursor = total <= (parseInt(options.cursor) + 1) * options.limit ? null : (parseInt(options.cursor) + 1).toString();
      return {
        results,
        total,
        prevCursor,
        nextCursor
      };
    } else if (!(options == null ? void 0 : options.cursor) && (options == null ? void 0 : options.limit)) {
      const prevCursor = null;
      const nextCursor = total <= options.limit ? null : "1";
      return {
        results,
        total,
        prevCursor,
        nextCursor
      };
    } else {
      return {
        results,
        total,
        prevCursor: null,
        nextCursor: null
      };
    }
  };
  exports2.optionsToSearchIndexOptions = optionsToSearchIndexOptions;
  exports2.parseSearchIndexResponse = parseSearchIndexResponse;
  exports2.processDocumentForIndexing = processDocumentForIndexing;
  exports2.queryToSearchIndexQuery = queryToSearchIndexQuery;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
});
