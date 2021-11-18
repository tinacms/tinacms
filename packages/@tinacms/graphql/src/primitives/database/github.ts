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
import { Bridge } from './bridge'
import { GraphQLError } from 'graphql'

export type GithubManagerInit = {
  rootPath: string
  accessToken: string
  owner: string
  repo: string
  ref: string
}

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
  private async readDir(filepath: string): Promise<string[]> {
    const fullPath = path.join(this.rootPath, filepath)
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

  public async glob(pattern: string) {
    const results = await this.readDir(pattern)
    // Remove rootPath and any surround slashes
    return results.map((item) =>
      item.replace(this.rootPath, '').replace(/^\/|\/$/g, '')
    )
  }

  public async get(filepath: string) {
    const realpath = path.join(this.rootPath, filepath)
    return this.appOctoKit.repos
      .getContent({
        ...this.repoConfig,
        path: realpath,
      })
      .then((response) => {
        return Buffer.from(response.data.content, 'base64').toString()
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
  public async put(filepath: string, data: string) {
    const realpath = path.join(this.rootPath, filepath)
    // check if the file exists
    let fileSha = undefined
    try {
      const fileContent = await this.appOctoKit.repos.getContent({
        ...this.repoConfig,
        path: realpath,
      })

      fileSha = fileContent.data.sha
    } catch (e) {
      console.log('No file exists, creating new one')
    }

    await this.appOctoKit.repos.createOrUpdateFileContents({
      ...this.repoConfig,
      branch: this.repoConfig.ref,
      path: realpath,
      message: 'Update from GraphQL client',
      content: new Buffer(data).toString('base64'),
      sha: fileSha,
    })
  }
}
