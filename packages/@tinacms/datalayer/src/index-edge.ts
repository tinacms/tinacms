// Export from @tinacms/graphql to maintain backwards compatibility
export { resolve, createDatabase } from '@tinacms/graphql'

export * from './backend/edge'

export function createLocalDatabase() {
  throw new Error('Not supported in this environment')
}
