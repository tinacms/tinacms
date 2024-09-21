import type { Cache } from './index'
import { createHash } from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'

const makeKey = (key: any) => {
  const input = key && key instanceof Object ? JSON.stringify(key) : key || ''
  return createHash('sha256').update(input).digest('hex')
}

// makeCacheDir creates the cache directory if it doesn't exist
const makeCacheDir = (dir: string, fs: any) => {
  // const path = require('path')
  // const os = require('os')

  const parts = dir.split(path.sep)

  let cacheDir = dir
  // check if the root directory exists, if not then create create in tmp and return new path
  if (!fs.existsSync(parts[0])) {
    cacheDir = path.join(os.tmpdir(), parts[0])
  }

  fs.mkdirSync(cacheDir, { recursive: true })
  return cacheDir
}

export const NodeCache = (dir: string): Cache => {
  // const fs = require('fs')
  const cacheDir = makeCacheDir(dir, fs)
  return {
    makeKey,
    get: async (key: string) => {
      try {
        const data = await fs.promises.readFile(`${cacheDir}/${key}`, 'utf-8')
        return JSON.parse(data)
      } catch (e) {
        if (e.code === 'ENOENT') {
          return undefined
        }
        throw e
      }
    },
    set: async (key: string, value: any) => {
      await fs.promises.writeFile(
        `${cacheDir}/${key}`,
        JSON.stringify(value),
        'utf-8'
      )
    },
  }
}
