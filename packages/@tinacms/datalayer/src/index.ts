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

export {
  FilesystemBridge,
  AuditFileSystemBridge,
} from './database/bridge/filesystem'
export { IsomorphicBridge } from './database/bridge/isomorphic'
export {
  FilesystemStore,
  AuditFilesystemStore,
} from './database/store/filesystem'
export { LevelStore } from './database/store/level'
export {
  coerceFilterChainOperands,
  DEFAULT_COLLECTION_SORT_KEY,
  DEFAULT_NUMERIC_LPAD,
  INDEX_KEY_FIELD_SEPARATOR,
  makeFilter,
  makeFilterChain,
  makeFilterSuffixes,
  makeKeyForField,
  makeStringEscaper,
  OP,
} from './database/store'
export type {
  BinaryFilter,
  FilterCondition,
  IndexDefinition,
  PadDefinition,
  StoreQueryOptions,
  StoreQueryResponse,
  PageInfo,
  PutOptions,
  DeleteOptions,
  SeedOptions,
  Store,
  TernaryFilter,
} from './database/store'

export type FilterOperand = string | number | boolean | string[] | number[]

export { atob, btoa } from './util'
