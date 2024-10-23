import type { Cache } from './index'

//? Note - These will need to be changed from using require to import when we eventually move to ESM
// makeCacheDir creates the cache directory if it doesn't exist
const makeCacheDir = async (dir: string, fs: any) => {
  const path = require('node:path')
  const os = require('node:os')

  // Ensure that `dir` is a valid string
  if (typeof dir !== 'string' || !dir.trim()) {
    throw new Error('Invalid directory path')
  }

  const pathParts = dir.split(path.sep)
  const cacheHash = pathParts[pathParts.length - 1]
  let cacheDir = dir

  // ["Users", "jackpettit", "Developer", "tina", "tina-cloud-starter", "tina", "__generated__", "".cache", "1729659325506"]
  // "/tmp/17.../"

  if (!fs.existsSync(dir)) {
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
