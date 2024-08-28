// import shajs from 'sha.js'
import { createHash } from 'crypto'
import type { Cache } from './index'

// const makeKey = (key: any) => {
//   const input = key && key instanceof Object ? JSON.stringify(key) : key || ''
//   return shajs('sha256').update(input).digest('hex')
// }

const makeKey = (key: any) => {
  const input = key && key instanceof Object ? JSON.stringify(key) : key || ''
  return createHash('sha256').update(input).digest('hex')
}

export const NodeCache = (dir: string, fs: any): Cache => {
  return {
    makeKey,
    get: async (key: string) => {
      try {
        const data = await fs.promises.readFile(`${dir}/${key}`, 'utf-8')
        return JSON.parse(data)
      } catch (e) {
        if (e.code === 'ENOENT') {
          return undefined
        }
        throw e
      }
    },
    set: async (key: string, value: any) => {
      await fs.promises.mkdir(dir, { recursive: true })
      await fs.promises.writeFile(
        `${dir}/${key}`,
        JSON.stringify(value),
        'utf-8'
      )
    },
  }
}
