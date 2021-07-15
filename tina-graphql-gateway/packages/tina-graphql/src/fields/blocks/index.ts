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

import _ from 'lodash'
import { friendlyName, templateTypeName } from 'tina-graphql-helpers'

import { gql } from '../../gql'
import { template } from '../templates'
import { sequential, assertShape } from '../../util'
import { assertIsArray, assertIsBlockValueArray } from '../'

import type { FieldDefinitionNode, InputValueDefinitionNode } from 'graphql'
import type { BuildArgs, ResolveArgs } from '../'
import type { TinaTemplateData } from '../../types'

export const blocks: Blocks = {
  build: {
    field: async ({ cache, field, accumulator }) => {
      const typename = friendlyName(field, { suffix: 'BlocksField' })
      const templateName = friendlyName(field, {
        suffix: 'BlocksFieldTemplates',
      })

      accumulator.push(
        gql.ObjectTypeDefinition({
          name: templateName,
          fields: await sequential(
            field.template_types,
            async (templateSlug) => {
              const t = await cache.datasource.getTemplate(templateSlug)
              await template.build.form({
                cache,
                template: t,
                accumulator,
                includeBody: false,
              })
              return gql.FieldDefinition({
                name: friendlyName(t, { lowerCase: true }),
                type: friendlyName(t, { suffix: 'Form' }),
              })
            }
          ),
        })
      )

      accumulator.push(
        gql.FormFieldBuilder({
          name: typename,
          additionalFields: [
            gql.FieldDefinition({ name: 'templates', type: templateName }),
          ],
        })
      )

      return gql.FieldDefinition({
        name: field.name,
        type: typename,
      })
    },
    initialValue: async ({ cache, field, accumulator }) => {
      const name = friendlyName(field, { suffix: 'Values' })

      await sequential(field.template_types, async (templateSlug) => {
        const t = await cache.datasource.getTemplate(templateSlug)
        await template.build.values({
          cache,
          template: t,
          accumulator,
          includeBody: false,
        })
      })

      accumulator.push(
        gql.UnionTypeDefinition({
          name: name,
          types: field.template_types.map((t) =>
            friendlyName(t, { suffix: 'Values' })
          ),
        })
      )

      return gql.FieldDefinition({ name: field.name, type: name, list: true })
    },
    value: async ({ cache, field, accumulator }) => {
      const fieldUnionName = friendlyName(field, { suffix: 'Data' })
      await sequential(field.template_types, async (templateSlug) => {
        const t = await cache.datasource.getTemplate(templateSlug)
        await template.build.data({
          cache,
          template: t,
          accumulator,
          includeBody: false,
        })
      })
      accumulator.push(
        gql.UnionTypeDefinition({
          name: fieldUnionName,
          types: field.template_types.map((t) =>
            friendlyName(t, { suffix: 'Data' })
          ),
        })
      )
      return gql.FieldDefinition({
        name: field.name,
        type: fieldUnionName,
        list: true,
      })
    },
    input: async ({ cache, field, accumulator }) => {
      await sequential(field.template_types, async (templateSlug) => {
        const t = await cache.datasource.getTemplate(templateSlug)
        await template.build.input({
          cache,
          template: t,
          accumulator,
          includeBody: false,
        })
      })

      accumulator.push(
        gql.InputObjectTypeDefinition({
          name: friendlyName(field.name, { suffix: 'Input' }),
          fields: field.template_types.map((template) =>
            gql.InputValueDefinition({
              name: friendlyName(template, { lowerCase: true }),
              type: templateTypeName(template, 'Input', false),
            })
          ),
        })
      )

      return gql.InputValueDefinition({
        name: field.name,
        type: friendlyName(field.name, { suffix: 'Input' }),
        list: true,
      })
    },
  },
  resolve: {
    field: async ({ datasource, field }): Promise<TinaBlocksField> => {
      const templates: { [key: string]: TinaTemplateData } = {}
      await sequential(field.template_types, async (templateSlug) => {
        const t = await datasource.getTemplate(templateSlug)
        templates[friendlyName(templateSlug, { lowerCase: true })] =
          await template.resolve.form({
            datasource,
            template: t,
          })
      })

      return {
        ...field,
        component: 'blocks' as const,
        templates,
        __typename: friendlyName(field, { suffix: 'BlocksField' }),
      }
    },
    initialValue: async ({ datasource, value }) => {
      assertIsBlockValueArray(value)

      return await sequential(value, async (item) => {
        const templateData = await datasource.getTemplate(item.template)
        const itemValue = await template.resolve.values({
          datasource,
          template: templateData,
          data: item,
        })

        return {
          ...itemValue,
          _template: friendlyName(itemValue._template, { lowerCase: true }),
        }
      })
    },
    value: async ({ datasource, value }) => {
      assertIsBlockValueArray(value)

      return await sequential(value, async (item) => {
        const templateData = await datasource.getTemplate(item.template)
        const data = await template.resolve.data({
          datasource,
          template: templateData,
          data: item,
        })

        return { template: item.template, ...data }
      })
    },
    input: async ({ field, datasource, value }) => {
      try {
        assertIsArray(value)
      } catch (e) {
        return false
      }

      const accum = (
        await sequential(value, async (item) => {
          try {
            assertShape<object>(item, (yup) => yup.object({}))

            const key = Object.keys(item)[0]
            const data = Object.values(item)[0]

            const resolvedData = await template.resolve.input({
              data,
              template: await datasource.getTemplate(key),
              datasource,
            })

            return {
              template: key,
              ...resolvedData,
            }
          } catch (e) {
            console.log(e)
            return false
          }
        })
      ).filter(Boolean)
      if (accum.length > 0) {
        return { [field.name]: accum }
      } else {
        return false
      }
    },
  },
}

export type BlocksField = {
  label: string
  name: string
  type: 'blocks'
  default?: string
  template_types: string[]
  __namespace: string
  config?: {
    required?: boolean
  }
}
export type TinaBlocksField = {
  label: string
  name: string
  type: 'blocks'
  default?: string
  component: 'blocks'
  config?: {
    required?: boolean
  }
  templates: { [key: string]: TinaTemplateData }
  __typename: string
}

export interface Build {
  /**
     * Builds a union type which adheres to the [Tina Block](https://tinacms.org/docs/plugins/fields/blocks/) shape.
     *
     * Since blocks need to be unique from one another depending on the templates they support, this is field
     * builds a union which is namespaced by the template name:
     *
     * Given the following template definition:
     * ```yaml
     * label: MyPage
     * fields:
     * - name: sections
     *   type: blocks
     *   label: Sections
     *   template_types:
     *     - cta
     *     - hero
     * ```

     * Builds:
     * ```graphql
     * type MyPageSectionsBlocksField {
     *   name: String
     *   label: String
     *   component: String
     *   templates: SomeTemplateSectionsBlocksFieldTemplates
     * }
     * type SomeTemplateSectionsBlocksFieldTemplates {
     *   sectionTemplateFields: SectionForm
     * }
     * type SectionForm {
     *   fields: [MyPageSectionFormFields]
     * }
     * union MyPageSectionFormFields = CtaFormFields | HeroFormFields
     * ```
     */
  field: ({
    cache,
    field,
    accumulator,
  }: BuildArgs<BlocksField>) => Promise<FieldDefinitionNode>
  initialValue: ({
    cache,
    field,
    accumulator,
  }: BuildArgs<BlocksField>) => Promise<FieldDefinitionNode>
  value: ({
    cache,
    field,
    accumulator,
  }: BuildArgs<BlocksField>) => Promise<FieldDefinitionNode>
  input: ({
    cache,
    field,
    accumulator,
  }: BuildArgs<BlocksField>) => Promise<InputValueDefinitionNode>
}

export interface Resolve {
  /**
   * Resolves the values with their respective templates, specified by
   * the template key.
   *
   * ```js
   * // given
   * {
   *   name: 'sections',
   *   type: 'blocks',
   *   label: 'Sections',
   *   template_types: [ 'section' ]
   * }
   *
   * // expect
   * {
   *   name: 'sections',
   *   type: 'blocks',
   *   label: 'Sections',
   *   template_types: [ 'section' ],
   *   component: 'blocks',
   *   templates: {
   *     section: {
   *       __typename: 'Section',
   *       label: 'Section',
   *       hide_body: false,
   *       fields: [Array]
   *     }
   *   },
   *   __typename: 'BlocksFormField'
   * }
   *
   * ```
   */
  field: ({
    datasource,
    field,
  }: Omit<ResolveArgs<BlocksField>, 'value'>) => Promise<TinaBlocksField>
  initialValue: ({
    datasource,
    field,
    value,
  }: ResolveArgs<BlocksField>) => Promise<
    {
      __typename: string
      // FIXME: this should exist for blocks, but
      _template: string
      [key: string]: unknown
    }[]
  >
  value: ({
    datasource,
    field,
    value,
  }: ResolveArgs<BlocksField>) => Promise<unknown>
  input: ({ datasource, field, value }: ResolveArgs<BlocksField>) => unknown
}
export interface Blocks {
  /**
   * Build properties are functions which build the various schemas for objects
   * related to block data
   *
   * The build process is done ahead of time and can be cached as a static GraphQL SDL file
   *
   */
  build: Build
  resolve: Resolve
}
