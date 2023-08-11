/**

*/

import type { StaticMedia, TinaCMS } from '@tinacms/toolkit'
import type { Schema, Config } from '@tinacms/schema-tools'
import type { TinaCloudMediaStoreClass } from '../auth'
import type { useDocumentCreatorPlugin } from '../hooks/use-content-creator'
import type { formifyCallback } from '../hooks/use-graphql-forms'
import type { TinaIOConfig } from '../internalClient'
import type { TinaClient } from '../client'

type APIProviderProps = {
  /**
   * @deprecated Please see https://tina.io/blog/tina-v-0.68.14 for information on how to upgrade to the new API
   *
   */
  apiURL?: string

  /**
   * The API url From this client will be used to make requests.
   */
  client: TinaClient<unknown>
}

interface BaseProviderProps {
  /** Callback if you need access to the TinaCMS instance */
  cmsCallback?: (cms: TinaCMS) => TinaCMS
  /** Callback if you need access to the "formify" API */
  formifyCallback?: formifyCallback
  /** Callback if you need access to the "document creator" API */
  documentCreatorCallback?: Parameters<typeof useDocumentCreatorPlugin>[0]
  /** TinaCMS media store instance */
  mediaStore?:
    | TinaCloudMediaStoreClass
    | (() => Promise<TinaCloudMediaStoreClass>)
  staticMedia?: StaticMedia
  tinaioConfig?: TinaIOConfig
  schema?: Schema
}

// TODO: This type can probably be deprecated and removed
type QueryProviderProps =
  | {
      /** Your React page component */
      children: (props?: any) => React.ReactNode
      /** The query from getStaticProps */
      query: string | undefined
      /** Any variables from getStaticProps */
      variables: object | undefined
      /** The `data` from getStaticProps */
      data: object
    }
  | {
      /** Your React page component */
      children: React.ReactNode
      /** The query from getStaticProps */
      query?: never
      /** Any variables from getStaticProps */
      variables?: never
      /** The `data` from getStaticProps */
      data?: never
    }

export type TinaCMSProviderDefaultProps = QueryProviderProps &
  APIProviderProps &
  BaseProviderProps &
  Config & {
    tinaGraphQLVersion: string
  }
