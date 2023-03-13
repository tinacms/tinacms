import {
  createDatabase,
  FilesystemBridge,
  Database,
  TinaLevelClient,
  Bridge,
} from '@tinacms/graphql'
import { ConfigManager } from './config-manager'
import { logger } from '../logger'
import { pipeline } from 'readable-stream'
import { createServer } from 'net'
import { ManyLevelHost } from 'many-level'
import { MemoryLevel } from 'memory-level'

export const createDBServer = () => {
  const levelHost = new ManyLevelHost(
    // @ts-ignore
    new MemoryLevel<string, Record<string, any>>({
      valueEncoding: 'json',
    })
  )
  const dbServer = createServer(function (socket) {
    // Pipe socket into host stream and vice versa
    return pipeline(socket, levelHost.createRpcStream(), socket, () => {
      // Disconnected
    })
  })
  dbServer.once('error', (err) => {
    // @ts-ignore err.code undefined
    if (err?.code === 'EADDRINUSE') {
      throw new Error(`Tina Dev server is already in use`)
    }
  })
  dbServer.listen(9000)
}

export async function createAndInitializeDatabase(
  configManager: ConfigManager,
  bridgeOverride?: Bridge
) {
  let database: Database
  const bridge =
    bridgeOverride ||
    new FilesystemBridge(configManager.rootPath, configManager.contentRootPath)
  if (
    configManager.hasSelfHostedConfig() &&
    configManager.config.contentApiUrlOverride
  ) {
    database = (await configManager.loadDatabaseFile()) as Database
    database.bridge = bridge
  } else {
    if (
      configManager.hasSelfHostedConfig() &&
      !configManager.config.contentApiUrlOverride
    ) {
      logger.warn(
        `Found a database config file at ${configManager.printRelativePath(
          configManager.selfHostedDatabaseFilePath
        )} but there was no "contentApiUrlOverride" set. Falling back to built-in datalayer`
      )
    }
    const level = new TinaLevelClient()
    level.openConnection()
    database = createDatabase({
      bridge,
      level,
    })
  }

  return database
}
