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
export {
  gql,
  buildSchema,
  createDatabase,
  githubRoute,
} from './primitives'
import { clearCache as s3ClearCache, s3Cache } from './cache/s3'

import { clearCache as lruClearCache } from './cache/lru'

export { lruClearCache, lruClearCache as clearCache, s3ClearCache, s3Cache }

import type { TinaCloudSchema as TinaCloudSchemaBase, TinaCloudCollection as TinaCloudCollectionBase, TinaFieldBase } from './primitives/types'

export type TinaCloudSchema = TinaCloudSchemaBase<false>
export type TinaCloudCollection= TinaCloudCollectionBase<false>
export type TinaField = TinaFieldBase
