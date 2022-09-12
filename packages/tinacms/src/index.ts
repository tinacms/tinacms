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

import { TinaCMSProvider2, DocumentCreatorCallback } from './tina-cms'
import type { TinaCMSProviderDefaultProps } from './types/cms'
export type { TinaCMSProviderDefaultProps }
export default TinaCMSProvider2
import { TinaCMS } from '@tinacms/toolkit'
import { formifyCallback } from './hooks/use-graphql-forms'

import type {
  TinaCloudSchema as TinaCloudSchemaBase,
  TinaCloudCollection as TinaCloudCollectionBase,
  TinaCloudTemplateBase as TinaTemplate,
  TinaFieldBase,
  TinaCMSConfig,
} from '@tinacms/schema-tools'

import { validateSchema } from '@tinacms/schema-tools'

export type TinaCloudSchema = TinaCloudSchemaBase<false>
// Alias to remove Cloud
// export type TinaSchema = TinaCloudSchema
export type TinaCloudCollection = TinaCloudCollectionBase<false>
// Alias to remove Cloud
export type TinaCollection = TinaCloudCollectionBase<false>
export type TinaField = TinaFieldBase
export type { TinaTemplate }

export const defineSchema = (config: TinaCloudSchema) => {
  validateSchema({ config })
  return config
}

export const defineConfig = (
  config: Omit<TinaCMSProviderDefaultProps, 'children'>
) => {
  return config
}

export const defineStaticConfig = (
  config: TinaCMSConfig<
    (cms: TinaCMS) => TinaCMS,
    formifyCallback,
    DocumentCreatorCallback
  >
) => {
  return config
}
