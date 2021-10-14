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

export { GithubBridge } from './primitives/database/github'
export type { GithubManagerInit } from './primitives/database/github'
export {
  gql,
  resolve,
  buildSchema,
  indexDB,
  createDatabase,
  githubRoute,
} from './primitives'
import { clearCache as s3ClearCache, s3Cache } from './cache/s3'

import { clearCache as lruClearCache, simpleCache } from './cache/lru'

export {
  lruClearCache,
  lruClearCache as clearCache,
  s3ClearCache,
  s3Cache,
  simpleCache,
}

import type {
  TinaCloudSchema as TinaCloudSchemaBase,
  TinaCloudCollection as TinaCloudCollectionBase,
  TinaCloudTemplateBase as TinaTemplate,
  TinaFieldBase,
} from './primitives/types'

export * from './primitives/builder/test'
export type TinaCloudSchema = TinaCloudSchemaBase<false>
// Alias to remove Cloud
export type TinaSchema = TinaCloudSchema
export type TinaCloudCollection = TinaCloudCollectionBase<false>
// Alias to remove Cloud
export type TinaCollection = TinaCloudCollectionBase<false>
export type TinaField = TinaFieldBase
export type { TinaTemplate }
