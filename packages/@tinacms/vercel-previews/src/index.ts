import { vercelStegaEncode } from '@vercel/stega'
import type { Plugin } from 'tinacms'

function encodeEditInfo(path: string, value: string, id: string): string {
  const res = `${vercelStegaEncode({
    origin: 'tinacms',
    data: { fieldName: `${id}---${path}` },
  })}${value}`

  return res
}

export interface PreviewHelperPlugin extends Plugin {
  __type: 'preview-helper'
  encode: typeof encodeEditInfo
}

export function createSourceMapEncoder(
  encodeAtPath?: (path: string, value: any) => boolean
): PreviewHelperPlugin {
  return {
    __type: 'preview-helper',
    name: 'preview-helper',
    encode: (path, value, id): string => {
      if (encodeAtPath(path, value)) {
        return encodeEditInfo(path, value, id)
      }
      return value
    },
  }
}

export const hashFromQuery = (input: string) => {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash + char) & 0xffffffff // Apply bitwise AND to ensure non-negative value
  }
  const nonNegativeHash = Math.abs(hash)
  const alphanumericHash = nonNegativeHash.toString(36)
  return alphanumericHash
}

export const withSourceMaps = <
  T extends {
    query: string
    variables: object
    data: object
  }
>(
  payload: T,
  options: {
    encodeStrings?: boolean
    encodeAtPath?: (path: string, value: any) => boolean
  }
) => {
  if (!options.encodeStrings) {
    return payload
  }
  const stringifiedQuery = JSON.stringify({
    query: payload.query,
    variables: payload.variables,
  })
  const id = hashFromQuery(stringifiedQuery)
  const callback = options.encodeAtPath || (() => true)
  const dataWithMetadata = transformObject(payload.data, (value, path) => {
    const pathString = path.join('.')
    if (callback(pathString, value)) {
      return encodeEditInfo(pathString, value, id)
    }
    return value
  })
  return { ...payload, data: dataWithMetadata }
}

type ObjectPath = (string | number)[]

function isValidHttpUrl(string: string) {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

function transformObject<T>(
  obj: T,
  callback: (value: string, path: ObjectPath) => string,
  path: ObjectPath = []
): T {
  if (typeof obj !== 'object' || obj === null) {
    return obj // Return non-object values as is
  }

  if (Array.isArray(obj)) {
    return obj.map((item, index) =>
      transformObject(item, callback, [...path, index])
    ) as unknown as T // Handle arrays recursively
  }

  const transformedObj = {} as T
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = [...path, key]

    if (typeof value === 'string') {
      if (['__typename'].includes(key) || isValidHttpUrl(value)) {
        transformedObj[key] = value
      } else {
        transformedObj[key] = callback(value, currentPath) // Apply the callback to transform string values
      }
    } else {
      transformedObj[key] = transformObject(value, callback, currentPath) // Recursively transform nested objects
    }
  }

  return transformedObj
}
