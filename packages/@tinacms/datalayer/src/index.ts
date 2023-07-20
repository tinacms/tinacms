// Export from @tinacms/graphql to maintain backwards compatibility
export type {
  Bridge,
  // User facing
  OnPutCallback,
  OnDeleteCallback,
  Database,
} from '@tinacms/graphql'
export {
  FilesystemBridge,
  AuditFileSystemBridge,
  IsomorphicBridge,
  // Users facing
  TinaLevelClient,
  resolve,
  createDatabase,
  createLocalDatabase,
} from '@tinacms/graphql'

export * from './providers/github'
