/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import _ from 'lodash'
import path from 'path'
import { Octokit } from '@octokit/rest'
import { Bridge } from '.'
import { GraphQLError } from 'graphql'

export type GithubManagerInit = {
  rootPath: string
  accessToken: string
  owner: string
  repo: string
  ref: string
}

// TODO: Use the name and email of the signed in user as the `committer`
// when making requests to the GitHub API
export class GithubBridge implements Bridge {
  rootPath: string
  repoConfig: Pick<GithubManagerInit, 'owner' | 'ref' | 'repo'>
  appOctoKit: Octokit

  constructor({ rootPath, accessToken, owner, repo, ref }: GithubManagerInit) {
    this.rootPath = rootPath
    this.repoConfig = {
      owner,
      repo,
      ref,
    }
    this.appOctoKit = new Octokit({
      auth: accessToken,
    })
  }

  // NOTE: We strip any leading and trailing slashes from each filepath as
  // leading slashes cause errors in the latest version of `@octokit/rest`
  private buildFullPath(filepath: string): string {
    return path.join(this.rootPath, filepath).replace(/^\/|\/$/g, '')
  }

  // See the success response types for the 'repos/get-content' operation here:
  // https://github.com/octokit/openapi-types.ts/blob/main/packages/openapi-types/types.d.ts
  // Those types apply to this endpoint: "/repos/{owner}/{repo}/contents/{path}"
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
    return _.flatten(repos)
  }

  private async getExistingFile(filepath: string): Promise<string | undefined> {
    return this.appOctoKit.repos
      .getContent({
        ...this.repoConfig,
        path: filepath,
      })
      .then((response) => {
        // Type narrowing to keep TypeScript happy
        if (!Array.isArray(response.data)) {
          return response.data.sha
        }
      })
  }

  // TODO: Should we run an `endsWith(extension)` filter?
  public async glob(pattern: string, extension: string) {
    const results = await this.readDir(pattern)
    // Remove rootPath and any surround slashes
    return results.map((item) =>
      item.replace(this.rootPath, '').replace(/^\/|\/$/g, '')
    )
  }

  public supportsBuilding() {
    return false
  }

  public async delete(filepath: string) {
    const fullPath = this.buildFullPath(filepath)
    let fileSha = undefined
    try {
      fileSha = await this.getExistingFile(fullPath)
    } catch (e) {
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
        // Type narrowing to keep TypeScript happy
        if (!Array.isArray(response.data) && response.data.type === 'file') {
          return Buffer.from(response.data.content, 'base64').toString()
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
          `Unable to find record '${filepath}' in Github Repository: '${this.repoConfig.owner}/${this.repoConfig.repo}', Ref: '${this.repoConfig.ref}'`,
          null,
          null,
          null,
          null,
          e,
          { status: e.status }
        )
      })
  }

  public async putConfig(filepath: string, data: string) {
    throw new Error(`Config files cannot be changed by the Github bridge`)
  }

  public async put(filepath: string, data: string) {
    const fullPath = this.buildFullPath(filepath)
    // check if the file exists
    let fileSha = undefined
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
}
