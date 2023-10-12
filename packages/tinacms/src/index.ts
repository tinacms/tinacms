/**

*/

export * from './internalClient'
export * from './auth'
export * from './utils'
export * from './tina-cms'
export { useDocumentCreatorPlugin } from './hooks/use-content-creator'
export { TinaAdmin } from './admin'
export { RouteMappingPlugin } from './admin/plugins/route-mapping'
export { TinaAdminApi } from './admin/api'
export { ErrorDialog } from './admin/components/ErrorDialog'

export * from './toolkit'
export { Form } from './toolkit/forms/form'
export { MdxFieldPluginExtendible } from '@tinacms/toolkit'

import { TinaCMSProvider2, DocumentCreatorCallback } from './tina-cms'
import type { TinaCMSProviderDefaultProps } from './types/cms'
export type { TinaCMSProviderDefaultProps }
export default TinaCMSProvider2
import { MediaStore, TinaCMS } from '@tinacms/toolkit'
import { formifyCallback } from './hooks/use-graphql-forms'

import { RichTextTemplate, validateSchema } from '@tinacms/schema-tools'
export { NAMER, resolveField } from '@tinacms/schema-tools'

import {
  TinaSchema,
  TinaField,
  Config,
  Schema,
  Collection,
  Template,
} from '@tinacms/schema-tools'

export type { Config, Schema, Collection, Template, TinaField, TinaSchema }

/**
 * @deprecated use `TinaField` instead
 */
export type TinaFieldEnriched = TinaField
/**
 * @deprecated use `TinaField` instead
 */
export type SchemaField = TinaField
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

interface MediaStoreClass {
  new (...args: any[]): MediaStore
}

export const defineStaticConfig = (
  config: Config<
    (cms: TinaCMS) => TinaCMS,
    formifyCallback,
    DocumentCreatorCallback,
    MediaStoreClass
  >
) => {
  if (!config.schema) {
    throw new Error('Static config must have a schema')
  }
  validateSchema({ schema: config.schema })
  return config
}
export const defineConfig = defineStaticConfig

/**
 * Out-of-the-box template for rendering basic markdown tables
 */
export const tinaTableTemplate: RichTextTemplate = {
  name: 'table',
  label: 'Table',
  fields: [
    {
      name: 'firstRowHeader',
      label: 'First row is a header',
      type: 'boolean',
    },
    {
      name: 'tableRows',
      label: 'Rows',
      type: 'object',
      list: true,
      ui: {
        itemProps: (value) => {
          if (value?.tableCells) {
            if (Array.isArray(value.tableCells)) {
              return {
                label: value.tableCells
                  .map((cellItem) => stringifyCell(cellItem.tableCell)?.trim())
                  .join(' | '),
              }
            }
          }
          return { label: 'Row' }
        },
      },
      fields: [
        {
          name: 'tableCells',
          label: 'Table Cells',
          list: true,
          type: 'object',
          ui: {
            itemProps: (value) => {
              if (value) {
                if (value.tableCell) {
                  return {
                    label: stringifyCell(value.tableCell)?.trim(),
                  }
                }
              }
              return { label: 'Table Cell' }
            },
          },
          fields: [
            {
              label: 'Table Cell',
              description:
                'Note: table cells do not support block-level elements like headers, code blocks, or lists. Any block-level items other than the first paragraph will be ignored.',
              name: 'tableCell',
              type: 'rich-text',
            },
          ],
        },
      ],
    },
  ],
}

import { stringifyMDX } from '@tinacms/mdx'

const stringifyCell = (cell: any) => {
  return stringifyMDX(cell, { name: 'body', type: 'rich-text' }, () => '')
}
