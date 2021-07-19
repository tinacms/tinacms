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
import { S3 } from 'aws-sdk'

const bucketName = process.env.CACHE_S3_BUCKET_NAME || 'tina-contentapi'

const realCache = new S3()

export const clearCacheWith =
  (cache: S3) =>
  async ({
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
    const repoPrefix = `${owner}/${repo}/${ref}`
    if (path) {
      const key = `${repoPrefix}/${path}`
      console.log('[S3 cache]: clearing key ', key)
      await cache
        .deleteObject({
          Bucket: bucketName,
          Key: key,
        })
        .promise()
    } else {
      console.log('[S3 cache]: clearing all keys for repo ', repoPrefix)
      const data = await cache
        .listObjectsV2({
          Bucket: bucketName,
          Prefix: repoPrefix,
        })
        .promise()
      if (data.Contents) {
        await cache
          .deleteObjects({
            Bucket: bucketName,
            Delete: {
              Objects: data.Contents.map((key) => ({ Key: key.Key! })),
            },
          })
          .promise()
      }
    }
  }

export const s3CacheWith = (cache: S3) => ({
  get: async (keyName: string, setter: () => Promise<any>) => {
    try {
      const value = await cache
        .getObject({
          Bucket: bucketName,
          Key: keyName,
        })
        .promise()
      console.log('getting from cache', keyName)
      return value.Body
    } catch (error) {
      if (error.code != 'NoSuchKey') throw error
      const valueToCache = await setter()
      await cache
        .upload({
          Bucket: bucketName,
          Key: keyName,
          Body: valueToCache.toString(),
        })
        .promise()
      console.log('item not in cache, setting', keyName)
      return valueToCache
    }
  },
})

export const clearCache = clearCacheWith(realCache)
export const s3Cache = s3CacheWith(realCache)
