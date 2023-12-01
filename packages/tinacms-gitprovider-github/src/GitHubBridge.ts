import path from 'path'
import { flatten } from 'lodash-es'
import { Octokit } from '@octokit/rest'
import { GraphQLError } from 'graphql'
import type { DocumentNode } from 'graphql'
import type { Bridge, LookupMapType } from '@tinacms/graphql'
import type { GitHubProviderOptions } from './index'

/**
 * NOTE: you can use a GitHub app rather than a personal token
 * using a version of the example code belowe
 */
// import { createAppAuth } from '@octokit/auth-app'
// const octokitOptions = {
//   authStrategy: createAppAuth,
//   auth: {
//     appId: process.env.GITHUB_APP_ID,
//     privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
//     installationId: process.env.GITHUB_APP_INSTALLATION_ID,
//     // repositoryIds: [], // number[]
//     // repositoryNames: [], // string[]
//     // permissions: {}, // Permissions
//     // refresh: true, // boolean
//   },
// }

export type SystemFiles = {
  // _schema: string
  _graphql: DocumentNode
  _lookup: { [returnType: string]: LookupMapType }
}

type GitHubBridgeConfig = GitHubProviderOptions & {
  systemFiles?: SystemFiles
}

export class GitHubBridge implements Bridge {
  public rootPath: string
  private owner: string
  private repo: string
  private branch: string
  private octokit: Octokit
  // private _schema: string | undefined
  private _graphql: SystemFiles['_graphql'] | undefined
  private _lookup: SystemFiles['_lookup'] | undefined

  constructor({
    owner,
    repo,
    branch,
    rootPath,
    systemFiles,
    ...args
  }: GitHubBridgeConfig) {
    this.rootPath = rootPath ?? ''
    this.owner = owner
    this.repo = repo
    this.branch = branch ?? 'main'
    // this._schema = systemFiles?._schema
    this._graphql = systemFiles?._graphql
    this._lookup = systemFiles?._lookup
    this.octokit = new Octokit({
      auth: args.token,
      ...(args.octokitOptions || {}),
    })
  }

  public async delete(filepath: string) {
    console.log(
      `File deleted in data layer file (sync handled by GitProvider): ${filepath}`
    )
  }

  public async put(filepath: string, data: string) {
    console.log(
      `File created/updated in data layer (sync handled by GitProvider): ${filepath}`
    )
  }

  // Is it useful to run an `endsWith(extension)` filter here?
  public async glob(pattern: string, extension: string) {
    const results = await this.readDir(pattern)
    return results.map((item) => {
      const filepath = item.replace(this.rootPath, '')
      return this.removeSurroundingSlashes(filepath)
    })
  }

  public async get(filepath: string) {
    if (this.isSystemFile(filepath)) {
      const systemFile = this.getSystemFile(filepath)
      if (systemFile) return systemFile
    }

    const fullPath = this.buildFullPath(filepath)
    return this.octokit.repos
      .getContent({
        owner: this.owner,
        repo: this.repo,
        ref: this.branch,
        path: fullPath,
      })
      .then((response) => {
        if (!Array.isArray(response.data) && response.data.type === 'file') {
          return Buffer.from(response.data.content, 'base64').toString()
        } else {
          throw new Error(
            `Could not find file at path: ${fullPath} in GitHub Repository: '${this.owner}/${this.repo}'`
          )
        }
      })
      .catch((e) => {
        if (e.status === 401) {
          throw new GraphQLError(
            `Unauthorized request to GitHub Repository: '${this.owner}/${this.repo}', please ensure your access token is valid.`,
            null,
            null,
            null,
            null,
            e,
            { status: e.status }
          )
        }
        throw new GraphQLError(
          `Unable to find record '${fullPath}' in GitHub Repository: '${this.owner}/${this.repo}', Branch: '${this.branch}'`,
          null,
          null,
          null,
          null,
          e,
          { status: e.status }
        )
      })
  }

  // Leading and trailing slashes cause errors in `@octokit/rest`
  private removeSurroundingSlashes(filepath: string): string {
    return filepath.replace(/^\/|\/$/g, '')
  }

  private systemFilenameMatches: Record<keyof SystemFiles, string> = {
    // // _schema: '/_schema.json',
    _lookup: '/_lookup.json',
    _graphql: '/_graphql.json',
  }

  private isSystemFile(filepath: string): boolean {
    return Object.values(this.systemFilenameMatches).some((filename) =>
      filepath.endsWith(filename)
    )
  }

  private getSystemFile(filepath: string): string | undefined {
    const filenameMatches = this.systemFilenameMatches
    switch (true) {
      // case filepath.endsWith(filenameMatches._schema):
      //   return JSON.stringify(this._schema)
      case filepath.endsWith(filenameMatches._lookup):
        return JSON.stringify(this._lookup)
      case filepath.endsWith(filenameMatches._graphql):
        return JSON.stringify(this._graphql)
      default:
        return undefined
    }
  }

  private buildFullPath(filepath: string): string {
    return this.removeSurroundingSlashes(path.join(this.rootPath, filepath))
  }

  private async readDir(filepath: string): Promise<string[]> {
    const fullPath = this.buildFullPath(filepath)
    const repos = await this.octokit.repos
      .getContent({
        owner: this.owner,
        repo: this.repo,
        ref: this.branch,
        path: fullPath,
      })
      .then(async (response) => {
        if (Array.isArray(response.data)) {
          return await Promise.all(
            await response.data.map(async (d) => {
              if (d.type === 'dir') {
                const nestedItems = await this.readDir(d.path)
                if (Array.isArray(nestedItems)) {
                  return nestedItems.map((nestedItem) => {
                    return path.join(d.path, nestedItem)
                  })
                } else {
                  throw new Error(
                    `Expected items to be an array of strings for readDir at ${d.path}`
                  )
                }
              }
              return d.path
            })
          )
        }

        throw new Error(
          `Expected to return an array from GitHub directory ${path}`
        )
      })
    return flatten(repos)
  }
}
