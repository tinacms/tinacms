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

import { BuildArgs, ResolveArgs, assertIsStringArray } from '../'

const typename = 'TagListField'

export const tag_list = {
  build: {
    field: async ({ field, accumulator }: BuildArgs<TagListField>) => {
      accumulator.push(gql.FormFieldBuilder({ name: typename }))
      return gql.FieldDefinition({
        name: field.name,
        type: typename,
      })
    },
    initialValue: ({ field }: BuildArgs<TagListField>) => {
      return gql.FieldDefinition({
        name: field.name,
        type: gql.TYPES.String,
        list: true,
      })
    },
    value: ({ field }: BuildArgs<TagListField>) => {
      return gql.FieldDefinition({
        name: field.name,
        type: gql.TYPES.String,
        list: true,
      })
    },
    input: ({ field }: BuildArgs<TagListField>) => {
      return gql.InputValueDefinition({
        name: field.name,
        type: gql.TYPES.String,
        list: true,
      })
    },
  },
  resolve: {
    field: ({
      field,
    }: Omit<ResolveArgs<TagListField>, 'value'>): TinaTagListField => {
      const { type, ...rest } = field
      return {
        ...rest,
        component: 'tags',
        config: rest.config || {
          required: false,
        },
        __typename: typename,
      }
    },
    initialValue: async ({
      value,
    }: ResolveArgs<TagListField>): Promise<string[]> => {
      assertIsStringArray(value, { source: 'tag value' })
      return value
    },
    value: async ({ value }: ResolveArgs<TagListField>): Promise<string[]> => {
      assertIsStringArray(value, { source: 'tag value' })
      return value
    },
    input: async ({
      field,
      value,
    }: ResolveArgs<TagListField>): Promise<
      { [key: string]: string[] } | false
    > => {
      try {
        assertIsStringArray(value, { source: 'tag value' })
        return { [field.name]: value }
      } catch (e) {
        return false
      }
    },
  },
}

export type TagListField = {
  label: string
  name: string
  type: 'tag_list'
  default?: string
  config?: {
    required?: boolean
  }
  __namespace: string
}

export type TinaTagListField = {
  label: string
  name: string
  component: 'tags'
  default?: string
  config?: {
    required?: boolean
  }
  __typename: typeof typename
}
