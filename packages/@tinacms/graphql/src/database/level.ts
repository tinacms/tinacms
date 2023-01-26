/**

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
