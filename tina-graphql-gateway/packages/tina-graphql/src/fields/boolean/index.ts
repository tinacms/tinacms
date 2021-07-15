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

import { assertIsBoolean, assertIsString, BuildArgs, ResolveArgs } from '../'

const typename = 'BooleanField'

export const boolean = {
  build: {
    field: async ({ field, accumulator }: BuildArgs<BooleanField>) => {
      accumulator.push(gql.FormFieldBuilder({ name: typename }))
      return gql.FieldDefinition({
        name: field.name,
        type: typename,
      })
    },
    initialValue: ({ field }: BuildArgs<BooleanField>) => {
      return gql.FieldDefinition({ name: field.name, type: gql.TYPES.Boolean })
    },
    value: ({ field }: BuildArgs<BooleanField>) => {
      return gql.FieldDefinition({ name: field.name, type: gql.TYPES.Boolean })
    },
    input: ({ field }: BuildArgs<BooleanField>) => {
      return gql.InputValueDefinition({
        name: field.name,
        type: gql.TYPES.Boolean,
      })
    },
  },
  resolve: {
    field: ({
      field,
    }: Omit<ResolveArgs<BooleanField>, 'value'>): TinaBooleanField => {
      const { type, ...rest } = field

      return {
        ...rest,
        component: 'toggle',
        config: rest.config || {
          required: false,
        },
        __typename: 'BooleanField',
      }
    },
    initialValue: async ({
      value,
    }: ResolveArgs<BooleanField>): Promise<boolean> => {
      assertIsBoolean(value, { source: 'boolean initial value' })
      return value
    },
    value: async ({ value }: ResolveArgs<BooleanField>): Promise<boolean> => {
      assertIsBoolean(value, { source: 'boolean value' })
      return value
    },
    input: async ({
      field,
      value,
    }: ResolveArgs<BooleanField>): Promise<
      { [key: string]: boolean } | false
    > => {
      try {
        assertIsBoolean(value, { source: 'boolean input' })
        return { [field.name]: value }
      } catch (e) {
        return false
      }
    },
  },
}

export type BooleanField = {
  label: string
  name: string
  type: 'boolean'
  default?: string
  config?: {
    required?: boolean
  }
  __namespace: string
}

export type TinaBooleanField = {
  label: string
  name: string
  component: 'toggle'
  default?: string
  config?: {
    required?: boolean
  }
  __typename: typeof typename
}
