import path from 'path'
import { flatten } from 'lodash-es'
import { Octokit } from '@octokit/rest'
import { GraphQLError } from 'graphql'
import { FilesystemBridge } from '@tinacms/graphql'
import type { Bridge } from '@tinacms/graphql'
import type { GitHubProviderOptions } from './index'

/**
 * NOTE: you can use GitHub App authentication instead of a
 * personal access token following the code example below:
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

type GitHubBridgeConfig = Omit<GitHubProviderOptions, 'commitMessage'> & {
  tinaFilesConfig?: {
    useFilesystemBridge: boolean
    tinaFolderPath: string
  }
}

export class GitHubBridge extends FilesystemBridge implements Bridge {
  private owner: string
  private repo: string
  private branch: string
  private contentPath: string
  private octokit: Octokit
  private useLocalTinaFiles: boolean

  constructor({
    owner,
    repo,
    branch,
    rootPath = '',
    tinaFilesConfig,
    ...args
  }: GitHubBridgeConfig) {
    // The tinaFolderPath is used as the rootPath for the FilesystemBridge
    // (this is useful to retrieve Tina files directly from the code repo)
    super(tinaFilesConfig?.tinaFolderPath ?? rootPath)

    // Optionally find Tina files in the code repo instead of the content repo
    this.useLocalTinaFiles = tinaFilesConfig?.useFilesystemBridge ?? false

    // The root path for the content repository
    this.contentPath = rootPath
    this.owner = owner
    this.repo = repo
    this.branch = branch ?? 'main'
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
      const filepath = item.replace(this.contentPath, '')
      return this.removeSurroundingSlashes(filepath)
    })
  }

  public async get(filepath: string) {
    if (this.useLocalTinaFiles && this.isSystemFile(filepath)) {
      return super.get(filepath)
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
            `Could not find file at path: ${fullPath} in Github Repository: '${this.owner}/${this.repo}'`
          )
        }
      })
      .catch((e) => {
        if (e.status === 401) {
          throw new GraphQLError(
            `Unauthorized request to Github Repository: '${this.owner}/${this.repo}', please ensure your access token is valid.`,
            null,
            null,
            null,
            null,
            e,
            { status: e.status }
          )
        }
        throw new GraphQLError(
          `Unable to find record '${fullPath}' in Github Repository: '${this.owner}/${this.repo}', Branch: '${this.branch}'`,
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

  private isSystemFile(filepath: string): boolean {
    const systemFileNames = [
      '/tina-lock.json',
      '/_schema.json',
      '/_graphql.json',
      '/_lookup.json',
    ]
    return systemFileNames.some((filename) => filepath.endsWith(filename))
  }

  private buildFullPath(filepath: string): string {
    return this.removeSurroundingSlashes(path.join(this.contentPath, filepath))
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
          `Expected to return an array from Github directory ${path}`
        )
      })
    return flatten(repos)
  }
}
