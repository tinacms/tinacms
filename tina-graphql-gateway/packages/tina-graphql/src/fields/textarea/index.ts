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

const typename = 'TextareaField'
export const textarea = {
  contentField: {
    type: 'textarea' as const,
    name: '_body',
    label: 'Body',
    __namespace: '',
  },
  build: {
    field: async ({ field, accumulator }: BuildArgs<TextareaField>) => {
      accumulator.push(gql.FormFieldBuilder({ name: typename }))
      return gql.FieldDefinition({
        name: field.name,
        type: typename,
      })
    },
    initialValue: ({ field }: BuildArgs<TextareaField>) => {
      return gql.FieldDefinition({ name: field.name, type: gql.TYPES.String })
    },
    value: ({ field }: BuildArgs<TextareaField>) => {
      return gql.FieldDefinition({ name: field.name, type: gql.TYPES.String })
    },
    input: ({ field }: BuildArgs<TextareaField>) => {
      return gql.InputValueDefinition({
        name: field.name,
        type: gql.TYPES.String,
      })
    },
  },
  resolve: {
    field: ({
      field,
    }: Omit<ResolveArgs<TextareaField>, 'value'>): TinaTextareaField => {
      const { type, ...rest } = field
      return {
        ...rest,
        component: 'textarea',
        config: rest.config || {
          required: false,
        },
        __typename: 'TextareaField',
      }
    },
    initialValue: async ({
      value,
    }: ResolveArgs<TextareaField>): Promise<string> => {
      assertIsString(value, { source: 'textarea initial value' })
      return value
    },
    value: async ({ value }: ResolveArgs<TextareaField>): Promise<string> => {
      assertIsString(value, { source: 'textarea value' })
      return value
    },
    input: async ({
      field,
      value,
    }: ResolveArgs<TextareaField>): Promise<
      { [key: string]: string } | false
    > => {
      try {
        assertIsString(value, { source: 'textarea input' })
        return { [field.name]: value }
      } catch (e) {
        return false
      }
    },
  },
}

export type TextareaField = {
  label: string
  name: string
  type: 'textarea'
  default?: string
  config?: {
    required?: boolean
  }
  __namespace: string
}

export type TinaTextareaField = {
  label: string
  name: string
  component: 'textarea'
  default?: string
  config?: {
    required?: boolean
  }
  __typename: typeof typename
}
