/**

*/

export * from './internalClient'
export * from './auth'
export * from './utils'
export * from './tina-cms'
export { useDocumentCreatorPlugin } from './hooks/use-content-creator'
export * from '@tinacms/toolkit'
export { TinaAdmin } from './admin'
export { RouteMappingPlugin } from './admin/plugins/route-mapping'
export { TinaAdminApi } from './admin/api'

export { MdxFieldPluginExtendible } from '@tinacms/toolkit'

import { TinaCMSProvider2, DocumentCreatorCallback } from './tina-cms'
import type { TinaCMSProviderDefaultProps } from './types/cms'
export type { TinaCMSProviderDefaultProps }
export default TinaCMSProvider2
import { TinaCMS } from '@tinacms/toolkit'
import { formifyCallback } from './hooks/use-graphql-forms'

import { validateSchema } from '@tinacms/schema-tools'
export { NAMER, resolveForm } from '@tinacms/schema-tools'

import type {
  Config,
  SchemaField,
  // Schema,
  // Collection,
  // Template,
} from '@tinacms/schema-tools/dist/types'
import { TinaSchema, Schema, Collection, Template } from '@tinacms/schema-tools'

export type { Config, Schema, Collection, Template, SchemaField, TinaSchema }

/**
 * @deprecated use `SchemaField` instead
 */
export type TinaFieldEnriched = SchemaField
/**
 * @deprecated use `SchemaField` instead
 */
export type TinaField = SchemaField
/**
 * @deprecated use `Template` instead
 */
export type TinaTemplate = Template
/**
 * @deprecated use `Template` instead
 */
export type TinaCloudTemplatebase = Template
/**
 * @deprecated use `Collection` instead
 */
export type TinaCloudCollectionCollection = Collection
/**
 * @deprecated use `Collection` instead
 */
export type TinaCollection = Collection
/**
 * @deprecated use `Schema` instead
 */
export type TinaCloudSchema = Schema

export const defineSchema = (config: Schema) => {
  validateSchema({ schema: config })
  return config
}

export const defineLegacyConfig = (
  config: Omit<TinaCMSProviderDefaultProps, 'children'>
) => {
  validateSchema({ schema: config.schema })
  return config
}

export const defineStaticConfig = (
  config: Config<
    (cms: TinaCMS) => TinaCMS,
    formifyCallback,
    DocumentCreatorCallback
  >
) => {
  if (!config.schema) {
    throw new Error('Static config must have a schema')
  }
  validateSchema({ schema: config.schema })
  return config
}
export const defineConfig = defineStaticConfig
