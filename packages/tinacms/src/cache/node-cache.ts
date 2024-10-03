import type { Cache } from './index'

// makeCacheDir creates the cache directory if it doesn't exist
const makeCacheDir = async (dir: string, fs: any) => {
  const path = await import('node:path')
  const os = await import('node:os')

  const parts = dir.split(path.sep).filter(Boolean)

  let cacheDir = dir
  // check if the root directory exists, if not then create create in tmp and return new path
  if (!fs.existsSync(path.join(path.sep, parts[0]))) {
    cacheDir = path.join(os.tmpdir(), parts[parts.length - 1])
  }

  fs.mkdirSync(cacheDir, { recursive: true })
  return cacheDir
}

export const NodeCache = async (dir: string): Promise<Cache> => {
  const fs = await import('node:fs')
  const { createHash } = await import('node:crypto')
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
