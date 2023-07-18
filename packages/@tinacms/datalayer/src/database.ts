import type {
  DatabaseArgs,
  Level,
  OnDeleteCallback,
  OnPutCallback,
} from '@tinacms/graphql'
import { TinaLevelClient, Database } from '@tinacms/graphql'

import type { GitProvider } from './gitProviders'

export type CreateDatabase = Omit<
  DatabaseArgs,
  'level' | 'onPut' | 'onDelete'
> & {
  databaseAdapter: Level
  gitProvider: GitProvider

  /**
   * @deprecated Use databaseAdapter instead
   */
  level?: Level
  /**
   * @deprecated Use gitProvider instead
   */
  onPut?: OnPutCallback
  /**
   * @deprecated Use gitProvider instead
   */
  onDelete?: OnDeleteCallback
}

export type CreateLocalDatabaseArgs = Omit<DatabaseArgs, 'level'> & {
  port?: number
}
export const createLocalDatabase = (config?: CreateLocalDatabaseArgs) => {
  const level = new TinaLevelClient(config?.port)
  level.openConnection()
  return new Database({
    ...(config || {}),
    level,
  })
}

export const createDatabase = (config: CreateDatabase) => {
  if (config.onPut && config.onDelete) {
    console.warn(
      'onPut and onDelete are deprecated. Please use gitProvider.onPut and gitProvider.onDelete instead.'
    )
  }
  if (config.level) {
    console.warn('level is deprecated. Please use databaseAdapter instead.')
  }
  if (
    config.onPut &&
    config.onDelete &&
    config.level &&
    !config.databaseAdapter &&
    !config.gitProvider
  ) {
    // This is required for backwards compatibility
    return new Database({
      ...config,
      level: config.level,
    })
  }

  if (!config.gitProvider) {
    throw new Error(
      'createDatabase requires a gitProvider. Please provide a gitProvider.'
    )
  }

  if (!config.databaseAdapter) {
    throw new Error(
      'createDatabase requires a databaseAdapter. Please provide a databaseAdapter.'
    )
  }

  return new Database({
    ...config,
    bridge: config.bridge,
    level: config.databaseAdapter,
    onPut: config.gitProvider.onPut.bind(config.gitProvider),
    onDelete: config.gitProvider.onDelete.bind(config.gitProvider),
  })
}
