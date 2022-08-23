import type { TinaCloudCollection } from '@tinacms/graphql'
import type { resolve } from '@tinacms/graphql'

type ResolveParams = Parameters<typeof resolve>[0]
export type Resolver = (
  params: Omit<ResolveParams, 'database'>
) => ReturnType<typeof resolve>
export type AuditArgs = {
  collection: TinaCloudCollection
  resolve: Resolver
  rootPath: string
  useDefaultValues: boolean
}
