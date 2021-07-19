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
import p from 'path'
import { Octokit } from '@octokit/rest'

type GithubManagerInit = {
  rootPath: string
  accessToken: string
  owner: string
  repo: string
  ref: string
  cache?: typeof dummyCache
}

import { DataAdaptor } from './data-adaptor'
export class GithubManager implements DataAdaptor {
  rootPath: string
  repoConfig: Pick<GithubManagerInit, 'owner' | 'ref' | 'repo'>
  appOctoKit: Octokit
  cache: typeof dummyCache
  constructor({
    rootPath,
    accessToken,
    owner,
    repo,
    ref,
    cache,
  }: GithubManagerInit) {
    this.cache = cache || dummyCache
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

  private generateKey = (key: string) => {
    return `${this.repoConfig.owner}/${this.repoConfig.repo}/${this.repoConfig.ref}/${key}`
  }

  readFile = async (path: string) => {
    return this.cache.get(this.generateKey(path), async () => {
      return this.appOctoKit.repos
        .getContent({
          ...this.repoConfig,
          path,
        })
        .then((response) => {
          return Buffer.from(response.data.content, 'base64').toString()
        })
    })
  }
  readDir = async (path: string): Promise<string[]> => {
    return _.flatten(
      (
        await this.cache.get(this.generateKey(path), async () =>
          this.appOctoKit.repos
            .getContent({
              ...this.repoConfig,
              path,
            })
            .then(async (response) => {
              if (Array.isArray(response.data)) {
                return await Promise.all(
                  await response.data.map(async (d) => {
                    if (d.type === 'dir') {
                      const nestedItems = await this.readDir(d.path)
                      return nestedItems.map((nestedItem) => {
                        return p.join(d.name, nestedItem)
                      })
                    }
                    return d.name
                  })
                )
              }

              throw new Error(
                `Expected to return an array from Github directory ${path}`
              )
            })
        )
      )
        .toString()
        .split(',')
    )
  }
  writeFile = async (path: string, content: string) => {
    // check if the file exists
    let fileSha = undefined
    try {
      const fileContent = await this.appOctoKit.repos.getContent({
        ...this.repoConfig,
        path,
      })

      fileSha = fileContent.data.sha
    } catch (e) {
      console.log('No file exists, creating new one')
    }

    await this.appOctoKit.repos.createOrUpdateFileContents({
      ...this.repoConfig,
      branch: this.repoConfig.ref,
      path: path,
      message: 'Update from GraphQL client',
      content: new Buffer(content).toString('base64'),
      sha: fileSha,
    })
  }
}

const dummyCache = {
  get: <T extends string | string[]>(key: string, setter: () => Promise<T>) => {
    return setter()
  },
}
