import AsyncLock from "async-lock";
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
        const { NodeCache } = await import("./node-cache-5e8db9f0.mjs");
        this.cache = await NodeCache(this.cacheDir);
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
export {
  TINA_HOST,
  TinaClient,
  createClient
};
