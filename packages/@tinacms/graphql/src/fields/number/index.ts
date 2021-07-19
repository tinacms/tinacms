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

import { BuildArgs, ResolveArgs, assertIsNumber } from '../'

const typename = 'NumberField'

export const number = {
  build: {
    field: async ({ field, accumulator }: BuildArgs<NumberField>) => {
      accumulator.push(gql.FormFieldBuilder({ name: typename }))
      return gql.FieldDefinition({
        name: field.name,
        type: typename,
      })
    },
    initialValue: ({ field }: BuildArgs<NumberField>) => {
      return gql.FieldDefinition({
        name: field.name,
        type: gql.TYPES.Number,
      })
    },
    value: ({ field }: BuildArgs<NumberField>) => {
      return gql.FieldDefinition({
        name: field.name,
        type: gql.TYPES.Number,
      })
    },
    input: ({ field }: BuildArgs<NumberField>) => {
      return gql.InputValueDefinition({
        name: field.name,
        type: gql.TYPES.Number,
      })
    },
  },
  resolve: {
    field: ({
      field,
    }: Omit<ResolveArgs<NumberField>, 'value'>): TinaNumberField => {
      const { type, ...rest } = field
      return {
        ...rest,
        component: 'number',
        config: rest.config || {
          required: false,
        },
        __typename: typename,
      }
    },
    initialValue: async ({
      value,
    }: ResolveArgs<NumberField>): Promise<number> => {
      assertIsNumber(value, { source: 'number field initial value' })
      return value
    },
    value: async ({ value }: ResolveArgs<NumberField>): Promise<number> => {
      assertIsNumber(value, { source: 'number field value' })
      return value
    },
    input: async ({
      field,
      value,
    }: ResolveArgs<NumberField>): Promise<
      { [key: string]: number } | false
    > => {
      try {
        assertIsNumber(value, { source: 'number field input' })
        return { [field.name]: value }
      } catch (e) {
        return false
      }
    },
  },
}

export type NumberField = {
  label: string
  name: string
  type: 'number'
  default?: string
  config?: {
    required?: boolean
  }
  __namespace: string
}

export type TinaNumberField = {
  label: string
  name: string
  component: 'number'
  default?: string
  config?: {
    required?: boolean
  }
  __typename: typeof typename
}
