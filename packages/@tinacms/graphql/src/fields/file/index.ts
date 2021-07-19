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

import { assertIsString, BuildArgs, ResolveArgs } from '../'

const typename = 'FileField'

export const file = {
  build: {
    field: async ({ field, accumulator }: BuildArgs<FileField>) => {
      accumulator.push(gql.FormFieldBuilder({ name: typename }))
      return gql.FieldDefinition({
        name: field.name,
        type: typename,
      })
    },
    initialValue: ({ field }: BuildArgs<FileField>) => {
      return gql.FieldDefinition({ name: field.name, type: gql.TYPES.String })
    },
    value: ({ field }: BuildArgs<FileField>) => {
      return gql.FieldDefinition({ name: field.name, type: gql.TYPES.String })
    },
    input: ({ field }: BuildArgs<FileField>) => {
      return gql.InputValueDefinition({
        name: field.name,
        type: gql.TYPES.String,
      })
    },
  },
  resolve: {
    field: ({
      field,
    }: Omit<ResolveArgs<FileField>, 'value'>): TinaFileField => {
      const { type, ...rest } = field
      return {
        ...rest,
        component: 'image',
        __typename: typename,
        config: rest.config || {
          required: false,
        },
      }
    },
    initialValue: async ({
      value,
    }: ResolveArgs<FileField>): Promise<string> => {
      assertIsString(value, { source: 'file initial value' })
      return value
    },
    value: async ({ value }: ResolveArgs<FileField>): Promise<string> => {
      assertIsString(value, { source: 'file value' })
      return value
    },
    input: async ({
      field,
      value,
    }: ResolveArgs<FileField>): Promise<{ [key: string]: string } | false> => {
      try {
        assertIsString(value, { source: 'file input' })
        return { [field.name]: value }
      } catch (e) {
        return false
      }
    },
  },
}

export type FileField = {
  label: string
  name: string
  type: 'file'
  default?: string
  config?: {
    required?: boolean
  }
  __namespace: string
}

export type TinaFileField = {
  label: string
  name: string
  component: 'image'
  default?: string
  config?: {
    required?: boolean
  }
  __typename: typeof typename
}
