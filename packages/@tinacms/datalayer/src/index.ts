// Export from @strivemath/tinacms-graphql to maintain backwards compatibility
export type {
  Bridge,
  // User facing
  OnPutCallback,
  OnDeleteCallback,
  Database,
  GitProvider,
} from '@strivemath/tinacms-graphql'
export {
  FilesystemBridge,
  AuditFileSystemBridge,
  IsomorphicBridge,
  // Users facing
  TinaLevelClient,
  resolve,
  createDatabase,
  createLocalDatabase,
} from '@strivemath/tinacms-graphql'

export * from './backend'
