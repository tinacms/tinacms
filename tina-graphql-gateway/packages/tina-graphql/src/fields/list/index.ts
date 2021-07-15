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

import * as yup from 'yup'
import { friendlyName } from 'tina-graphql-helpers'
import { gql } from '../../gql'

import { select } from '../select'
import { text } from '../text'

import { assertIsStringArray, BuildArgs, ResolveArgs } from '../'
import type { TinaField } from '../index'
import type { ImageGalleryField } from '../image-gallery'

const typename = 'ListField'

export const list = {
  /**
   * Image Gallery uses list for now, Tina has plans to
   * implement a proper gallery field
   */
  imageGalleryField: (field: ImageGalleryField) => ({
    ...field,
    type: 'list' as const,
    config: {
      use_select: false,
    },
  }),
  build: {
    /** Returns one of 3 possible types of select options */
    field: async ({ field, cache, accumulator }: BuildArgs<ListField>) => {
      // FIXME: shouldn't have to do this, but if a text or select field
      // is otherwise not present in the schema we need to ensure it's built
      text.build.field({
        cache,
        field: { name: '', label: '', type: 'text', __namespace: '' },
        accumulator,
      })
      select.build.field({
        cache,
        field: {
          name: '',
          label: '',
          type: 'select',
          config: {
            options: [{ label: '', value: '' }],
            source: {
              type: 'simple',
            },
          },
        },
        accumulator,
      })

      const unionName = 'List_FormFieldsUnion'
      accumulator.push(
        gql.UnionTypeDefinition({
          name: unionName,
          types: ['TextField', 'SelectField'],
        })
      )

      accumulator.push(
        gql.FormFieldBuilder({
          name: typename,
          additionalFields: [
            gql.FieldDefinition({
              name: 'defaultItem',
              type: gql.TYPES.String,
            }),
            gql.FieldDefinition({ name: 'field', type: unionName }),
          ],
        })
      )
      return gql.FieldDefinition({
        name: field.name,
        type: typename,
      })
    },
    initialValue: async ({ field }: BuildArgs<ListField>) => {
      return gql.FieldDefinition({
        name: field.name,
        type: gql.TYPES.String,
        list: true,
      })
    },
    value: async ({ cache, field, accumulator }: BuildArgs<ListField>) => {
      let listTypeIdentifier: 'simple' | 'pages' | 'documents' = 'simple'
      listTypeIdentifier =
        field.config?.source?.type === 'documents'
          ? 'documents'
          : field.config?.source?.type === 'pages'
          ? 'pages'
          : 'simple'

      let list
      switch (listTypeIdentifier) {
        case 'documents':
          list = field as DocumentList
          throw new Error(`document select not implemented`)
        case 'pages':
          list = field as SectionList
          const section = await cache.datasource.getSettingsForCollection(
            list.config.source.section
          )
          return gql.FieldDefinition({
            name: field.name,
            type: friendlyName(section.slug, { suffix: 'Document' }),
            list: true,
          })
        case 'simple':
          list = field as SimpleList
          return gql.FieldDefinition({
            name: list.name,
            type: gql.TYPES.String,
            list: true,
          })
      }
    },
    input: async ({ field }: BuildArgs<ListField>) => {
      return gql.InputValueDefinition({
        name: field.name,
        type: gql.TYPES.String,
        list: true,
      })
    },
  },
  resolve: {
    field: async ({
      datasource,
      field,
    }: Omit<ResolveArgs<ListField>, 'value'>): Promise<TinaListField> => {
      const { ...rest } = field

      let listTypeIdentifier: 'simple' | 'pages' | 'documents' = 'simple'
      listTypeIdentifier =
        field.config?.source?.type === 'documents'
          ? 'documents'
          : field.config?.source?.type === 'pages'
          ? 'pages'
          : 'simple'
      let defaultItem = ''

      // FIXME this should be a subset type of TinaField,
      // this property doesn't need most of these fields
      let fieldComponent: TinaField = {
        default: '',
        name: '',
        label: 'Text',
        component: 'text',
        __typename: 'TextField' as const,
      }
      let list
      switch (listTypeIdentifier) {
        case 'documents':
          list = field as DocumentList
          throw new Error(`document list not implemented`)
        case 'pages':
          list = field as SectionList

          const selectField = {
            ...list,
            component: 'select' as const,
            type: 'select' as const,
            __typename: 'SelectField',
          }
          fieldComponent = await select.resolve.field({
            datasource,
            field: selectField,
          })
          defaultItem = fieldComponent?.options[0]?.value || ''
          break
        case 'simple':
          list = field as SimpleList
          break
        // Do nothing, this is the default
      }

      return {
        ...rest,
        component: 'list',
        field: fieldComponent,
        defaultItem,
        __typename: typename,
      }
    },
    initialValue: async ({
      value,
    }: ResolveArgs<ListField>): Promise<
      | {
          _resolver: '_resource'
          _resolver_kind: '_nested_sources'
          _args: { paths: string[] }
        }
      | string[]
    > => {
      assertIsStringArray(value, { source: 'list initial values' })
      return value
    },
    value: async ({
      field,
      value,
    }: ResolveArgs<ListField>): Promise<
      | {
          _resolver: '_resource'
          _resolver_kind: '_nested_sources'
          _args: { fullPaths: string[]; collection: string }
        }
      | string[]
    > => {
      assertIsStringArray(value, { source: 'list values' })
      let listTypeIdentifier: 'simple' | 'pages' | 'documents' = 'simple'
      listTypeIdentifier =
        field.config?.source?.type === 'documents'
          ? 'documents'
          : field.config?.source?.type === 'pages'
          ? 'pages'
          : 'simple'
      let list
      switch (listTypeIdentifier) {
        case 'documents':
          list = field as DocumentList
          throw new Error(`document list not implemented`)
        case 'pages':
          // FIXME - get it
          list = field as SectionList
          return {
            _resolver: '_resource',
            _resolver_kind: '_nested_sources',
            _args: {
              fullPaths: value,
              collection: list.config.source.section,
            },
          }
        case 'simple':
          list = field as SimpleList
          return value
      }
    },
    input: async ({
      field,
      value,
    }: ResolveArgs<ListField>): Promise<
      | {
          [key: string]: {
            _resolver: '_resource'
            _resolver_kind: '_nested_sources'
            _args: { paths: string[] }
          }
        }
      | { [key: string]: string[] }
      | false
    > => {
      try {
        assertIsStringArray(value, { source: 'list input' })
        let listTypeIdentifier: 'simple' | 'pages' | 'documents' = 'simple'
        const isSimple = field.config?.use_select ? false : true
        if (!isSimple) {
          listTypeIdentifier =
            field.config?.source?.type === 'documents'
              ? 'documents'
              : field.config?.source?.type === 'pages'
              ? 'pages'
              : 'simple'
        }
        let list
        switch (listTypeIdentifier) {
          case 'documents':
            list = field as DocumentList
            throw new Error(`document list not implemented`)
          case 'pages':
            // TODO: validate the documents exists
            return { [field.name]: value }
          case 'simple':
            // TODO: validate the item is in the options list if it's a select
            list = field as SimpleList
            return { [field.name]: value }
        }
      } catch (e) {
        console.log(e)
        return false
      }
    },
  },
}

export type BaseListField = {
  label: string
  name: string
  type: 'list'
}

type BaseConfig = {
  use_select: boolean
  required?: boolean
  min?: number
  max?: number
}
export type SimpleList = BaseListField & {
  // FIXME: this isn't required at all for simple lists
  config: BaseConfig & {
    source?: undefined
  }
}
export type DocumentList = BaseListField & {
  config: BaseConfig & {
    source: {
      type: 'documents'
      section: string
      file: string
      path: string
    }
  }
}
export type SectionList = BaseListField & {
  config: BaseConfig & {
    source: {
      type: 'pages'
      section: string
    }
  }
}

export type ListField = SectionList | SimpleList | DocumentList
export type TinaListField = {
  label: string
  name: string
  component: 'list'
  field: TinaField
  defaultItem: string
  __typename: typeof typename
}
