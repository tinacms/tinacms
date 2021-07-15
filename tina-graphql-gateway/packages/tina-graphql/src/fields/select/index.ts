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

import { gql } from '../../gql'
import { friendlyName } from 'tina-graphql-helpers'

import { BuildArgs, ResolveArgs, assertIsString } from '../'

const typename = 'SelectField'

export const select = {
  build: {
    /** Returns one of 3 possible types of select options */
    field: async ({ field, accumulator }: BuildArgs<SelectField>) => {
      accumulator.push(
        gql.FormFieldBuilder({
          name: typename,
          additionalFields: [
            gql.FieldDefinition({
              name: 'options',
              list: true,
              type: 'SelectOption',
            }),
          ],
        })
      )
      return gql.FieldDefinition({
        name: field.name,
        type: typename,
      })
    },
    initialValue: async ({ field }: BuildArgs<SelectField>) => {
      return gql.FieldDefinition({
        name: field.name,
        type: gql.TYPES.Reference,
      })
    },
    value: async ({ cache, field, accumulator }: BuildArgs<SelectField>) => {
      let select
      switch (field.config.source.type) {
        case 'documents':
          throw new Error(`document select not implemented`)
        case 'pages':
          select = field as SectionSelect

          const section = await cache.datasource.getSettingsForCollection(
            select.config.source.section
          )
          const name = friendlyName(section.slug)

          return gql.FieldDefinition({
            name: field.name,
            type: friendlyName(name, { suffix: 'Document' }),
          })
        case 'simple':
          return gql.FieldDefinition({
            name: field.name,
            type: gql.TYPES.String,
          })
      }
    },
    input: async ({ field }: BuildArgs<SelectField>) => {
      return gql.InputValueDefinition({
        name: field.name,
        type: gql.TYPES.String,
      })
    },
  },
  resolve: {
    field: async ({
      datasource,
      field,
    }: Omit<ResolveArgs<SelectField>, 'value'>): Promise<TinaSelectField> => {
      let select
      const { type, ...rest } = field
      const f = {
        ...rest,
        component: 'select' as const,
        __typename: typename,
      }
      switch (field.config.source.type) {
        case 'documents':
          throw new Error(`document select not implemented`)
        case 'pages':
          select = field as SectionSelect
          return {
            ...f,
            options: [
              { value: '', label: '' },
              ...(
                await datasource.getDocumentsForCollection(
                  select.config.source.section
                )
              ).map((item) => {
                return {
                  value: item,
                  label: item,
                }
              }),
            ],
          }
        case 'simple':
          select = field as SimpleSelect
          return {
            ...f,
            options: [{ value: '', label: '' }, ...select.config.options],
          }
      }
    },
    initialValue: async ({ value }: ResolveArgs<SelectField>) => {
      return value
    },
    value: async ({ field, value }: ResolveArgs<SelectField>) => {
      switch (field.config.source.type) {
        case 'documents':
          throw new Error(`document select not implemented`)
        case 'pages':
          return {
            _resolver: '_resource',
            _resolver_kind: '_nested_source',
            _args: { fullPath: value, collection: field.config.source.section },
          }
        case 'simple':
          return value
      }
    },
    input: async ({ field, value }: ResolveArgs<SelectField>) => {
      try {
        assertIsString(value, { source: 'select input' })
        switch (field.config.source.type) {
          case 'documents':
            throw new Error(`document select not implemented`)
          case 'pages':
          case 'simple':
            if (!value) {
              return false
            }
            return { [field.name]: value }
        }
      } catch (e) {
        return false
      }
    },
  },
}

export type BaseSelectField = {
  label: string
  name: string
  type: 'select'
}
type DocumentSelect = BaseSelectField & {
  config: {
    required?: boolean
    source: {
      type: 'documents'
      section: string
      file: string
      path: string
    }
  }
}
export type SectionSelect = BaseSelectField & {
  config: {
    required?: boolean
    source: {
      type: 'pages'
      section: string
    }
  }
}

export type SimpleSelect = BaseSelectField & {
  default?: string
  config: {
    options: { label: string; value: string }[]
    required?: boolean
    source: {
      type: 'simple'
    }
  }
}

export type SelectField = SimpleSelect | SectionSelect | DocumentSelect
export type TinaSelectField = {
  label: string
  name: string
  component: 'select'
  options: { label: string; value: string }[]
}
