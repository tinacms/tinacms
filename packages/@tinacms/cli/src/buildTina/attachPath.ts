/**

 */

import { pathExists } from 'fs-extra'
import path from 'path'

export const attachPath = async (ctx: any, next: () => void, options: any) => {
  ctx.rootPath = options.rootPath || process.cwd()

  ctx.usingTs = await isProjectTs(ctx.rootPath)
  next()
}

export const isProjectTs = async (rootPath: string) => {
  const tinaPath = path.join(rootPath, '.tina')

  return (
    (await pathExists(path.join(tinaPath, 'schema.ts'))) ||
    (await pathExists(path.join(tinaPath, 'schema.tsx'))) ||
    (await pathExists(path.join(tinaPath, 'config.ts'))) ||
    (await pathExists(path.join(tinaPath, 'config.tsx')))
  )
}
