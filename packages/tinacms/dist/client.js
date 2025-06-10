(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("async-lock")) : typeof define === "function" && define.amd ? define(["exports", "async-lock"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.tinacms = {}, global.NOOP));
})(this, function(exports2, AsyncLock) {
  "use strict";
  const TINA_HOST = "content.tinajs.io";
  function replaceGithubPathSplit(url, replacement) {
    const parts = url.split("github/");
    if (parts.length > 1 && replacement) {
      return parts[0] + "github/" + replacement;
    } else {
      return url;
    }
  }
  class TinaClient {
    constructor({
      token,
      url,
      queries,
      errorPolicy,
      cacheDir
    }) {
      this.initialized = false;
      this.apiUrl = url;
      this.readonlyToken = token == null ? void 0 : token.trim();
      this.queries = queries(this);
      this.errorPolicy = errorPolicy || "throw";
      this.cacheDir = cacheDir || "";
    }
    async init() {
      if (this.initialized) {
        return;
      }
      try {
        if (this.cacheDir && typeof window === "undefined" && typeof require !== "undefined") {
          const { NodeCache: NodeCache2 } = await Promise.resolve().then(() => nodeCache);
          this.cache = await NodeCache2(this.cacheDir);
          this.cacheLock = new AsyncLock();
        }
      } catch (e) {
        console.error(e);
      }
      this.initialized = true;
    }
    async request({ errorPolicy, ...args }, options) {
      var _a;
      await this.init();
      const errorPolicyDefined = errorPolicy || this.errorPolicy;
      const headers = new Headers();
      if (this.readonlyToken) {
        headers.append("X-API-KEY", this.readonlyToken);
      }
      headers.append("Content-Type", "application/json");
      if (options == null ? void 0 : options.fetchOptions) {
        if ((_a = options == null ? void 0 : options.fetchOptions) == null ? void 0 : _a.headers) {
          Object.entries(options.fetchOptions.headers).forEach(([key2, value]) => {
            headers.append(key2, value);
          });
        }
      }
      const { headers: _, ...providedFetchOptions } = (options == null ? void 0 : options.fetchOptions) || {};
      const bodyString = JSON.stringify({
        query: args.query,
        variables: (args == null ? void 0 : args.variables) || {}
      });
      const optionsObject = {
        method: "POST",
        headers,
        body: bodyString,
        redirect: "follow",
        ...providedFetchOptions
      };
      const draftBranch = headers.get("x-branch");
      const url = replaceGithubPathSplit((args == null ? void 0 : args.url) || this.apiUrl, draftBranch);
      let key = "";
      let result;
      if (this.cache) {
        key = this.cache.makeKey(bodyString);
        await this.cacheLock.acquire(key, async () => {
          result = await this.cache.get(key);
          if (!result) {
            result = await requestFromServer(
              url,
              args.query,
              optionsObject,
              errorPolicyDefined
            );
            await this.cache.set(key, result);
          }
        });
      } else {
        result = await requestFromServer(
          url,
          args.query,
          optionsObject,
          errorPolicyDefined
        );
      }
      return result;
    }
  }
  async function requestFromServer(url, query, optionsObject, errorPolicyDefined) {
    const res = await fetch(url, optionsObject);
    if (!res.ok) {
      let additionalInfo = "";
      if (res.status === 401) {
        additionalInfo = "Please check that your client ID, URL and read only token are configured properly.";
      }
      throw new Error(
        `Server responded with status code ${res.status}, ${res.statusText}. ${additionalInfo ? additionalInfo : ""} Please see our FAQ for more information: https://tina.io/docs/errors/faq/`
      );
    }
    const json = await res.json();
    if (json.errors && errorPolicyDefined === "throw") {
      throw new Error(
        `Unable to fetch, please see our FAQ for more information: https://tina.io/docs/errors/faq/
      Errors: 
	${json.errors.map((error) => error.message).join("\n")}`
      );
    }
    const result = {
      data: json == null ? void 0 : json.data,
      errors: (json == null ? void 0 : json.errors) || null,
      query
    };
    return result;
  }
  function createClient(args) {
    const client = new TinaClient(args);
    return client;
  }
  const makeCacheDir = async (dir, fs, path, os) => {
    const pathParts = dir.split(path.sep).filter(Boolean);
    const cacheHash = pathParts[pathParts.length - 1];
    const rootUser = pathParts[0];
    let cacheDir = dir;
    if (!fs.existsSync(path.join(path.sep, rootUser))) {
      cacheDir = path.join(os.tmpdir(), cacheHash);
    }
    try {
      fs.mkdirSync(cacheDir, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create cache directory: ${error.message}`);
    }
    return cacheDir;
  };
  const NodeCache = async (dir) => {
    const fs = require("node:fs");
    const path = require("node:path");
    const os = require("node:os");
    const { createHash } = require("node:crypto");
    const cacheDir = await makeCacheDir(dir, fs, path, os);
    return {
      makeKey: (key) => {
        const input = key && key instanceof Object ? JSON.stringify(key) : key || "";
        return createHash("sha256").update(input).digest("hex");
      },
      get: async (key) => {
        let readValue;
        const cacheFilename = `${cacheDir}/${key}`;
        try {
          const data = await fs.promises.readFile(cacheFilename, "utf-8");
          readValue = JSON.parse(data);
        } catch (e) {
          if (e.code !== "ENOENT") {
            console.error(
              `Failed to read cache file to ${cacheFilename}: ${e.message}`
            );
          }
        }
        return readValue;
      },
      set: async (key, value) => {
        const cacheFilename = `${cacheDir}/${key}`;
        try {
          await fs.promises.writeFile(cacheFilename, JSON.stringify(value), {
            encoding: "utf-8",
            flag: "wx"
            // Don't overwrite existing caches
          });
        } catch (e) {
          if (e.code !== "EEXIST") {
            console.error(
              `Failed to write cache file to ${cacheFilename}: ${e.message}`
            );
          }
        }
      }
    };
  };
  const nodeCache = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    NodeCache,
    makeCacheDir
  }, Symbol.toStringTag, { value: "Module" }));
  exports2.TINA_HOST = TINA_HOST;
  exports2.TinaClient = TinaClient;
  exports2.createClient = createClient;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
});
