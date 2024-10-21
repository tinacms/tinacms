import { TinaLevelClient } from '../level/tinaLevel'
import { FilesystemBridge } from './bridge/filesystem'
import { Database, DatabaseArgs } from './shared'

export type CreateLocalDatabaseArgs = Omit<DatabaseArgs, 'level'> & {
  port?: number
  rootPath?: string
}

export const createLocalDatabase = (config?: CreateLocalDatabaseArgs) => {
  const level = new TinaLevelClient(config?.port)
  level.openConnection()
  const fsBridge = new FilesystemBridge(config?.rootPath || process.cwd())
  return new Database({
    bridge: fsBridge,
    ...(config || {}),
    level,
  })
}
