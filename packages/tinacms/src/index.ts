/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

export * from './internalClient'
export * from './auth'
export * from './utils'
export * from './tina-cms'
export { useGraphqlForms } from './hooks/use-graphql-forms'
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
import { MediaStore, TinaCMS } from '@tinacms/toolkit'
import { formifyCallback } from './hooks/use-graphql-forms'

import { validateSchema } from '@tinacms/schema-tools'
export { NAMER, resolveForm } from '@tinacms/schema-tools'

import type {
  Config,
  SchemaField,
  Schema,
  Collection,
  Template,
} from '@tinacms/schema-tools/dist/types'

export type { Config, Schema, Collection, Template, SchemaField }

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
export type Templateable = Template
/**
 * @deprecated use `Template` instead
 */
export type TinaCloudTemplatebase = Template
/**
 * @deprecated use `Collection` instead
 */
export type TinaCloudCollection = Collection
/**
 * @deprecated use `Collection` instead
 */
export type TinaCollection = Collection
/**
 * @deprecated use `Schema` instead
 */
export type TinaSchema = Schema
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
    DocumentCreatorCallback,
    MediaStore
  >
) => {
  if (!config.schema) {
    throw new Error('Static config must have a schema')
  }
  validateSchema({ schema: config.schema })
  return config
}
export const defineConfig = defineStaticConfig
