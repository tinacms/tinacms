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

import { friendlyName } from 'tina-graphql-helpers'
import * as yup from 'yup'
import { gql } from '../../gql'

import { template } from '../templates'

import type { Field, TinaField } from '../index'
import { BuildArgs, ResolveArgs } from '../'

export const fieldGroup = {
  build: {
    field: async ({
      cache,
      field,
      accumulator,
    }: BuildArgs<FieldGroupField>) => {
      const typename = friendlyName(field, { suffix: 'GroupField' })
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
    }: BuildArgs<FieldGroupField>) => {
      const initialValueName = await template.build.values({
        cache,
        template: field,
        accumulator,
        includeBody: false,
        includeTemplate: false,
      })

      return gql.FieldDefinition({ name: field.name, type: initialValueName })
    },
    value: async ({
      cache,
      field,
      accumulator,
    }: BuildArgs<FieldGroupField>) => {
      const name = await template.build.data({
        cache,
        template: field,
        accumulator,
        includeBody: false,
      })
      return gql.FieldDefinition({ name: field.name, type: name })
    },
    input: async ({
      cache,
      field,
      accumulator,
    }: BuildArgs<FieldGroupField>) => {
      const name = await template.build.input({
        cache,
        template: field,
        accumulator,
        includeBody: false,
      })
      return gql.InputValueDefinition({ name: field.name, type: name })
    },
  },
  resolve: {
    field: async ({
      datasource,
      field,
    }: Omit<
      ResolveArgs<FieldGroupField>,
      'value'
    >): Promise<TinaFieldGroupField> => {
      const { type, ...rest } = field
      const t = await template.resolve.form({
        datasource,
        template: field,
        includeBody: false,
      })

      return {
        ...rest,
        ...t,
        component: 'group',
        __typename: friendlyName(field, { suffix: 'GroupField' }),
      }
    },
    initialValue: async ({
      datasource,
      field,
      value,
    }: ResolveArgs<FieldGroupField>) => {
      assertIsData(value)

      return await template.resolve.values({
        datasource,
        template: field,
        data: value,
      })
    },
    value: async ({
      datasource,
      field,
      value,
    }: ResolveArgs<FieldGroupField>) => {
      assertIsData(value)

      return await template.resolve.data({
        datasource,
        template: field,
        data: value,
      })
    },
    input: async ({
      datasource,
      field,
      value,
    }: ResolveArgs<FieldGroupField>) => {
      try {
        assertIsData(value)
        return {
          [field.name]: await template.resolve.input({
            data: value,
            template: field,
            datasource,
          }),
        }
      } catch (e) {
        return false
      }
    },
  },
}

function assertIsData(value: unknown): asserts value is {
  [key: string]: unknown
} {
  const schema = yup.object({}).required()
  schema.validateSync(value)
}

/**
 * The Forestry definition for Field Group
 *
 * ```yaml
 * label: Some Name
 * name: some-name
 * type: field_group
 * fields:
 *   - label: Some nested field
 *     name: my-field
 *     type: Text
 * ```
 */
export type FieldGroupField = {
  label: string
  name: string
  type: 'field_group'
  default?: string
  fields: Field[]
  config?: {
    required?: boolean
  }
  __namespace: string
}
export type TinaFieldGroupField = {
  label: string
  name: string
  component: 'group'
  __typename: string
  default?: string
  fields: TinaField[]
  config?: {
    required?: boolean
  }
}
export type FieldGroupValue = {
  [key: string]: unknown
}
