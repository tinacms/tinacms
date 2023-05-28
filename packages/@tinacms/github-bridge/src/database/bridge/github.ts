import path from 'path'
import { flatten } from 'lodash-es'
import { Octokit } from '@octokit/rest'
import { GraphQLError } from 'graphql'
import type { Bridge } from '@tinacms/graphql'

type RepoConfig = {
  owner: string
  repo: string
  ref: string
}

export class GithubBridge implements Bridge {
  public rootPath: string
  private repoConfig: RepoConfig
  private appOctoKit: Octokit

  constructor(rootPath: string, accessToken: string, repoConfig: RepoConfig) {
    this.rootPath = rootPath || ''
    this.repoConfig = repoConfig
    this.appOctoKit = new Octokit({ auth: accessToken })
  }

  // Is it useful to run an `endsWith(extension)` filter here?
  public async glob(pattern: string, extension: string) {
    const results = await this.readDir(pattern)
    return results.map((item) => {
      const filepath = item.replace(this.rootPath, '')
      return this.removeSurroundingSlashes(filepath)
    })
  }

  public async delete(filepath: string) {
    const fullPath = this.buildFullPath(filepath)
    let fileSha: string | undefined = undefined
    try {
      fileSha = await this.getExistingFile(fullPath)
    } catch (e) {}

    if (!fileSha) {
      throw new Error(`Could not find file to delete at path: ${fullPath}`)
    }

    await this.appOctoKit.repos.deleteFile({
      ...this.repoConfig,
      branch: this.repoConfig.ref,
      path: fullPath,
      message: 'Update from GraphQL client',
      sha: fileSha,
    })
  }

  public async get(filepath: string) {
    const fullPath = this.buildFullPath(filepath)
    return this.appOctoKit.repos
      .getContent({
        ...this.repoConfig,
        path: fullPath,
      })
      .then((response) => {
        if (!Array.isArray(response.data) && response.data.type === 'file') {
          return Buffer.from(response.data.content, 'base64').toString()
        } else {
          throw new Error(
            `Could not find file at path: ${fullPath} in Github Repository: '${this.repoConfig.owner}/${this.repoConfig.repo}'`
          )
        }
      })
      .catch((e) => {
        if (e.status === 401) {
          throw new GraphQLError(
            `Unauthorized request to Github Repository: '${this.repoConfig.owner}/${this.repoConfig.repo}', please ensure your access token is valid.`,
            null,
            null,
            null,
            null,
            e,
            { status: e.status }
          )
        }
        throw new GraphQLError(
          `Unable to find record '${fullPath}' in Github Repository: '${this.repoConfig.owner}/${this.repoConfig.repo}', Ref: '${this.repoConfig.ref}'`,
          null,
          null,
          null,
          null,
          e,
          { status: e.status }
        )
      })
  }

  public async put(filepath: string, data: string) {
    const fullPath = this.buildFullPath(filepath)
    let fileSha: string | undefined = undefined
    try {
      fileSha = await this.getExistingFile(fullPath)
    } catch (e) {
      console.log('No file exists, creating new one')
    }

    await this.appOctoKit.repos.createOrUpdateFileContents({
      ...this.repoConfig,
      branch: this.repoConfig.ref,
      path: fullPath,
      message: 'Update from GraphQL client',
      content: new Buffer(data).toString('base64'),
      sha: fileSha,
    })
  }

  // Leading and trailing slashes cause errors in `@octokit/rest`
  private removeSurroundingSlashes(filepath: string): string {
    return filepath.replace(/^\/|\/$/g, '')
  }

  private buildFullPath(filepath: string): string {
    return this.removeSurroundingSlashes(path.join(this.rootPath, filepath))
  }

  private async readDir(filepath: string): Promise<string[]> {
    const fullPath = this.buildFullPath(filepath)
    const repos = await this.appOctoKit.repos
      .getContent({
        ...this.repoConfig,
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

  private async getExistingFile(filepath: string): Promise<string | undefined> {
    return this.appOctoKit.repos
      .getContent({
        ...this.repoConfig,
        path: filepath,
      })
      .then((response) => {
        if (!Array.isArray(response.data)) {
          return response.data.sha
        }
      })
  }
}
