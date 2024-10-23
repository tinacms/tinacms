import type { Cache } from './index'

// Create the cache directory if it doesn't exist.
// Returns the path of the cache directory.
const makeCacheDir = async (dir: string, fs: any) => {
  // TODO: These will need to be changed from using require to import when we eventually move to ESM
  const path = require('node:path')
  const os = require('node:os')

  const pathParts = dir.split(path.sep)
  const cacheHash = pathParts[pathParts.length - 1]
  const rootUser = pathParts[0]
  let cacheDir = dir

  // Check if the root directory exists. If not, create the cache in the tmp directory.
  if (!fs.existsSync(rootUser)) {
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
  const fs = require('node:fs')

  const { createHash } = require('node:crypto')
  const cacheDir = await makeCacheDir(dir, fs)

  return {
    makeKey: (key: any) => {
      const input =
        key && key instanceof Object ? JSON.stringify(key) : key || ''
      return createHash('sha256').update(input).digest('hex')
    },
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
