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
import LRU from 'lru-cache'

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
