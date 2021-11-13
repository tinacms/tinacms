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
import { Store } from '.'
import { stringifyFile, parseFile } from '../util'
import { GraphQLError } from 'graphql'
import { sequential } from '../../util'

export type GithubManagerInit = {
  rootPath: string
  accessToken: string
  owner: string
  repo: string
  ref: string
}

export class GithubStore implements Store {
  rootPath: string
  repoConfig: Pick<GithubManagerInit, 'owner' | 'ref' | 'repo'>
  appOctoKit: Octokit
  public async clear() {}
  public async print() {}
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
  public async query(queryStrings: string[]): Promise<object[]> {
    throw new Error(`Unable to perform query for GithubStore`)
  }
  public supportsSeeding() {
    return false
  }
  public async seed() {
    throw new Error(`Seeding data is not possible for Github data store`)
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

  public async glob(pattern: string, callback) {
    const results = await this.readDir(pattern)
    // Remove rootPath and any surround slashes
    const items = results.map((item) =>
      item.replace(this.rootPath, '').replace(/^\/|\/$/g, '')
    )
    if (callback) {
      return sequential(items, async (item) => {
        return callback(item)
      })
    } else {
      return items
    }
  }

  public async get(filepath: string) {
    const realpath = path.join(this.rootPath, filepath)
    return this.appOctoKit.repos
      .getContent({
        ...this.repoConfig,
        path: realpath,
      })
      .then((response) => {
        const responseString = Buffer.from(
          response.data.content,
          'base64'
        ).toString()

        return parseFile(responseString, path.extname(filepath), (yup) =>
          yup.object()
        )
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
  public supportsIndexing() {
    return false
  }
  public async put(filepath: string, data: object) {
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
      // FIXME: keepTemplateKey needs knowledge of collection
      content: new Buffer(
        stringifyFile(data, path.extname(filepath), false)
      ).toString('base64'),
      sha: fileSha,
    })
  }
}
