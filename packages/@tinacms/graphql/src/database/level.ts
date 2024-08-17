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

export const ARRAY_ITEM_VALUE_SEPARATOR = ','
export const INDEX_KEY_FIELD_SEPARATOR = '\x1D'
export const CONTENT_ROOT_PREFIX = '~'
export const SUBLEVEL_OPTIONS: AbstractSublevelOptions<
  string,
  Record<string, any>
> = {
  separator: INDEX_KEY_FIELD_SEPARATOR,
  valueEncoding: 'json',
}

export class LevelWrapper {
  private level: Level
  constructor(level: Level) {
    this.level = level
  }
}

const LevelProxyHandler = {
  get: function (target, property) {
    if (!target[property]) {
      throw new Error(`The property, ${property.toString()}, doesn't exist`)
    }
    if (typeof target[property] !== 'function') {
      throw new Error(`The property, ${property.toString()}, is not a function`)
    }

    if (property === 'get') {
      return async (...args) => {
        let result: any
        try {
          // eslint-disable-next-line prefer-spread
          result = await target[property].apply(target, args)
        } catch (e: any) {
          if (e.code !== 'LEVEL_NOT_FOUND') {
            throw e
          }
        }
        return result
      }
    } else if (property === 'sublevel') {
      // wrap sublevel in a proxy to intercept get
      return (...args) => {
        return new Proxy(
          // eslint-disable-next-line prefer-spread
          target[property].apply(target, args),
          LevelProxyHandler
        )
      }
    } else {
      // eslint-disable-next-line prefer-spread
      return (...args) => target[property].apply(target, args)
    }
  },
}

export class LevelProxy {
  constructor(level: Level) {
    return new Proxy(level as any, LevelProxyHandler)
  }
}
