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

import {
  AbstractLevel,
  AbstractSublevel,
  AbstractSublevelOptions,
} from 'abstract-level'

export type Level = AbstractLevel<
  Buffer | Uint8Array | string,
  string,
  Record<string, any>
>

export type PutOp = {
  type: 'put'
  key: string
  value: Record<string, any>
  sublevel?: AbstractSublevel<
    Level,
    Buffer | Uint8Array | string,
    string,
    Record<string, any>
  >
}

export type DelOp = {
  type: 'del'
  key: string
  sublevel?: AbstractSublevel<
    Level,
    Buffer | Uint8Array | string,
    string,
    Record<string, Record<string, any>>
  >
}

export type BatchOp = PutOp | DelOp

export const INDEX_KEY_FIELD_SEPARATOR = '\x1D'
export const CONTENT_ROOT_PREFIX = '~'
export const SUBLEVEL_OPTIONS: AbstractSublevelOptions<
  string,
  Record<string, any>
> = {
  separator: INDEX_KEY_FIELD_SEPARATOR,
  valueEncoding: 'json',
}
