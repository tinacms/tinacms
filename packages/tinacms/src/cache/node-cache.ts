import AsyncLock from 'async-lock'
import type { Cache } from './index'

const lock = new AsyncLock()

// Create the cache directory if it doesn't exist.
// Returns the path of the cache directory.
export const makeCacheDir = async (
  dir: string,
  fs: any,
  path: any,
  os: any
) => {
  const pathParts = dir.split(path.sep).filter(Boolean)
  const cacheHash = pathParts[pathParts.length - 1]
  const rootUser = pathParts[0]
  let cacheDir = dir

  // Check if the root directory exists. If not, create the cache in the tmp directory.
  if (!fs.existsSync(path.join(path.sep, rootUser))) {
    cacheDir = path.join(os.tmpdir(), cacheHash)
  }

  try {
    fs.mkdirSync(cacheDir, { recursive: true })
  } catch (error) {
    throw new Error(`Failed to create cache directory: ${error.message}`)
  }

  return cacheDir
}

export const NodeCache = async (dir: string): Promise<Cache> => {
  // TODO: These will need to be changed from using require to import when we eventually move to ESM
  const fs = require('node:fs')
  const path = require('node:path')
  const os = require('node:os')

  const { createHash } = require('node:crypto')
  const cacheDir = await makeCacheDir(dir, fs, path, os)

  return {
    makeKey: (key: any) => {
      const input =
        key && key instanceof Object ? JSON.stringify(key) : key || ''
      return createHash('sha256').update(input).digest('hex')
    },
    get: async (key: string) => {
      let readValue: object | undefined

      await lock.acquire(key, async () => {
        try {
          const data = await fs.promises.readFile(`${cacheDir}/${key}`, 'utf-8')
          readValue = JSON.parse(data)
        } catch (e) {
          if (e.code !== 'ENOENT') {
            throw e
          }
        }
      })

      if (readValue) {
        console.log(`Cache hit for ${key}`)
      } else {
        console.log(`Cache miss for ${key}`)
      }

      return readValue
    },
    set: async (key: string, value: any) => {
      console.log(`Cache storage for ${key}`)
      await lock.acquire(key, async () => {
        try {
          await fs.promises.writeFile(
            `${cacheDir}/${key}`,
            JSON.stringify(value),
            {
              encoding: 'utf-8',
              flag: 'wx', // Don't overwrite existing caches
            }
          )
          console.log(`  File written for ${key}`)
        } catch (e) {
          console.error(`Failed to write cache file for ${key}: ${e.message}`)
        }
      })
    },
  }
}
