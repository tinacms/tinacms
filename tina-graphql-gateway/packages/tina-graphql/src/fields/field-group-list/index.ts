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

import { template } from '../templates'
import { sequential } from '../../util'

import { BuildArgs, ResolveArgs } from '../'
import type { Field, TinaField } from '../index'
import { fieldGroup } from '../field-group'

export type FieldGroupListField = {
  label: string
  name: string
  type: 'field_group_list'
  default?: string
  fields: Field[]
  __namespace: string
  config?: {
    required?: boolean
  }
}
export type TinaFieldGroupListField = {
  label: string
  name: string
  component: 'group-list'
  __typename: string
  default?: string
  fields: TinaField[]
  config?: {
    required?: boolean
  }
}

export const fieldGroupList = {
  build: {
    field: async ({
      cache,
      field,
      accumulator,
    }: BuildArgs<FieldGroupListField>) => {
      const typename = friendlyName(field, { suffix: 'GroupListField' })
      const fieldsUnionName = await template.build.fields({
        cache,
        template: field,
        accumulator,
        includeBody: false,
      })
      accumulator.push(
        gql.FormFieldBuilder({
          name: typename,
          additionalFields: [
            gql.FieldDefinition({
              name: 'fields',
              type: fieldsUnionName,
              list: true,
            }),
          ],
        })
      )
      return gql.FieldDefinition({
        name: field.name,
        type: typename,
      })
    },
    initialValue: async ({
      cache,
      field,
      accumulator,
    }: BuildArgs<FieldGroupListField>) => {
      const initialValueName = await template.build.values({
        cache,
        template: field,
        accumulator,
        includeBody: false,
        includeTemplate: false,
      })

      return gql.FieldDefinition({
        name: field.name,
        type: initialValueName,
        list: true,
      })
    },
    value: async ({
      cache,
      field,
      accumulator,
    }: BuildArgs<FieldGroupListField>) => {
      const name = await template.build.data({
        cache,
        template: field,
        accumulator,
        includeBody: false,
      })
      return gql.FieldDefinition({
        name: field.name,
        type: name,
        list: true,
      })
    },
    input: async ({
      cache,
      field,
      accumulator,
    }: BuildArgs<FieldGroupListField>) => {
      const name = await template.build.input({
        cache,
        template: field,
        accumulator,
        includeBody: false,
      })
      return gql.InputValueDefinition({
        name: field.name,
        type: name,
        list: true,
      })
    },
  },
  resolve: {
    field: async ({
      datasource,
      field,
    }: Omit<
      ResolveArgs<FieldGroupListField>,
      'value'
    >): Promise<TinaFieldGroupListField> => {
      const { type, ...rest } = field
      const t = await template.resolve.form({
        datasource,
        template: field,
        includeBody: false,
      })

      return {
        ...rest,
        ...t,
        component: 'group-list',
        __typename: friendlyName(field, { suffix: 'GroupListField' }),
      }
    },
    initialValue: async ({
      datasource,
      field,
      value,
    }: ResolveArgs<FieldGroupListField>) => {
      assertIsDataArray(value)
      return sequential(
        value,
        async (v: any) =>
          await template.resolve.values({
            datasource,
            template: field,
            data: v,
          })
      )
    },
    value: async ({
      datasource,
      field,
      value,
    }: ResolveArgs<FieldGroupListField>) => {
      assertIsDataArray(value)
      return await sequential(
        value,
        async (v: any) =>
          await template.resolve.data({
            datasource,
            template: field,
            data: v,
          })
      )
    },
    input: async ({
      datasource,
      field,
      value,
    }: ResolveArgs<FieldGroupListField>): Promise<
      { [key: string]: unknown } | false
    > => {
      try {
        assertIsDataArray(value)

        const values = await sequential(value, async (v) => {
          return await template.resolve.input({
            data: v,
            template: field,
            datasource,
          })
        })

        // Empty arrays are useless
        if (values && values.length > 0) {
          return {
            [field.name]: values,
          }
        } else {
          return false
        }
      } catch (e) {
        return false
      }
    },
  },
}

function assertIsDataArray(value: unknown): asserts value is {
  [key: string]: unknown
}[] {
  const schema = yup.array().of(yup.object({}))
  schema.validateSync(value)
}
