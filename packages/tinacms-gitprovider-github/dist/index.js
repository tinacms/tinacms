var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  GitHubProvider: () => GitHubProvider
});
module.exports = __toCommonJS(index_exports);
var import_rest = require("@octokit/rest");
var import_js_base64 = require("js-base64");
var GitHubProvider = class {
  constructor(args) {
    this.owner = args.owner;
    this.repo = args.repo;
    this.branch = args.branch;
    this.commitMessage = args.commitMessage;
    this.rootPath = args.rootPath;
    this.octokit = new import_rest.Octokit({
      auth: args.token,
      ...args.octokitOptions || {}
    });
  }
  async onPut(key, value) {
    let sha;
    const path = this.rootPath ? `${this.rootPath}/${key}` : key;
    try {
      const {
        // @ts-ignore
        data: { sha: existingSha }
      } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
        ref: this.branch
      });
      sha = existingSha;
    } catch (e) {
    }
    await this.octokit.repos.createOrUpdateFileContents({
      owner: this.owner,
      repo: this.repo,
      path,
      message: this.commitMessage || "Edited with TinaCMS",
      content: import_js_base64.Base64.encode(value),
      branch: this.branch,
      sha
    });
  }
  async onDelete(key) {
    let sha;
    const path = this.rootPath ? `${this.rootPath}/${key}` : key;
    try {
      const {
        // @ts-ignore
        data: { sha: existingSha }
      } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
        ref: this.branch
      });
      sha = existingSha;
    } catch (e) {
    }
    if (sha) {
      await this.octokit.repos.deleteFile({
        owner: this.owner,
        repo: this.repo,
        path,
        message: this.commitMessage || "Edited with TinaCMS",
        branch: this.branch,
        sha
      });
    } else {
      throw new Error(
        `Could not find file ${path} in repo ${this.owner}/${this.repo}`
      );
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GitHubProvider
});
