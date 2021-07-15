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
import LRU from 'lru-cache'
import { GraphQLError } from 'graphql'

type GithubManagerInit = {
  rootPath: string
  accessToken: string
  owner: string
  repo: string
  ref: string
  cache?: typeof dummyCache
}

const dummyCache = {
  get: <T extends string | string[]>(key: string, setter: () => Promise<T>) => {
    return setter()
  },
}

export class GithubBridge implements Bridge {
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
    this.cache = cache || simpleCache
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
  private readDir = async (filepath: string): Promise<string[]> => {
    const fullPath = path.join(this.rootPath, filepath)
    return _.flatten(
      (
        await this.cache.get(this.generateKey(fullPath), async () =>
          this.appOctoKit.repos
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
                      return nestedItems.map((nestedItem) => {
                        return path.join(d.path, nestedItem)
                      })
                    }
                    return d.path
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

  public glob = async (pattern: string) => {
    const results = await this.readDir(pattern)
    // Remove rootPath and any surround slashes
    return results.map((item) =>
      item.replace(this.rootPath, '').replace(/^\/|\/$/g, '')
    )
  }

  public get = async (filepath: string) => {
    const realpath = path.join(this.rootPath, filepath)
    return this.cache.get(this.generateKey(realpath), async () => {
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
              `Unauthorized request to Github for repo ${this.repoConfig.owner}/${this.repoConfig.repo} please ensure your access token is valid.`
            )
          }
          throw new GraphQLError(`Unable to find record for ${filepath}`)
        })
    })
  }
  public put = async (filepath: string, data: string) => {
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

const cache = new LRU<string, string | string[]>({
  max: 1000,
  length: function (v: string, key) {
    return v.length
  },
})

/*
  ref is used as the the branch for now, so in future we may switch to commits
*/
export const clearCache = ({
  owner,
  repo,
  ref,
  path,
}: {
  owner: string
  repo: string
  ref: string
  path?: string
}) => {
  const repoPrefix = `${owner}/${repo}/${ref}/`
  if (path) {
    const key = `${repoPrefix}/${path}`
    console.log('[LRU cache]: clearing key ', key)
    cache.del(key)
  } else {
    console.log('[LRU cache]: clearing all keys for repo ', repoPrefix)
    cache.forEach((value, key, cache) => {
      if (key.startsWith(repoPrefix)) {
        cache.del(key)
      }
    })
  }
}

/**
 * This is just an example of what you can provide for caching
 * it should be replaced with a scalable solution which shares a cache
 * across lambda instances (like redis)
 */
export const simpleCache = {
  get: async (keyName: string, setter: () => Promise<any>) => {
    const value = cache.get(keyName)

    if (value) {
      console.log('getting from cache', keyName)
      return value
    } else {
      const valueToCache = await setter()
      const isSet = cache.set(keyName, valueToCache)
      console.log('item not in cache, setting', keyName, isSet)
      return valueToCache
    }
  },
}
