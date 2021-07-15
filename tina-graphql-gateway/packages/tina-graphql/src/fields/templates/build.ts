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
import { templateTypeName } from 'tina-graphql-helpers'
import { gql } from '../../gql'
import { sequential } from '../../util'

import { text } from '../text'
import { list } from '../list'
import { select } from '../select'
import { blocks } from '../blocks'
import { textarea } from '../textarea'
import { fieldGroup } from '../field-group'
import { fieldGroupList } from '../field-group-list'
import { boolean } from '../boolean'
import { datetime } from '../datetime'
import { file } from '../file'
import { imageGallery } from '../image-gallery'
import { number } from '../number'
import { tag_list } from '../tag-list'

import type {
  UnionTypeDefinitionNode,
  ObjectTypeDefinitionNode,
  EnumTypeDefinitionNode,
  InputObjectTypeDefinitionNode,
  FieldDefinitionNode,
  InputValueDefinitionNode,
  ScalarTypeDefinitionNode,
  InterfaceTypeDefinitionNode,
} from 'graphql'
import type { TemplateData, DirectorySection, Section } from '../../types'
import type { Cache } from '../../cache'
import type { Field } from '..'

type TemplateBuildArgs = {
  cache: Cache
  template: TemplateData
  accumulator: Definitions[]
}

export const buildTemplateOrFieldData = async ({
  cache,
  template,
  accumulator,
  includeBody,
}: TemplateBuildArgs & {
  includeBody: boolean
}) => {
  const name = templateTypeName(template, 'Data', includeBody)

  const fields = await sequential(template.fields, async (field) => {
    return await buildTemplateDataField(cache, field, accumulator)
  })

  if (includeBody) {
    fields.push(
      await buildTemplateDataField(cache, textarea.contentField, accumulator)
    )
  }

  accumulator.push(
    gql.ObjectTypeDefinition({
      name,
      fields,
    })
  )

  return name
}
export const buildTemplateOrFieldValues = async ({
  cache,
  template,
  accumulator,
  includeBody,
  includeTemplate = true,
}: TemplateBuildArgs & {
  includeBody: boolean
  includeTemplate?: boolean
}) => {
  const name = templateTypeName(template, 'Values', includeBody)

  const fields = await sequential(template.fields, async (field) => {
    return buildTemplateInitialValueField(cache, field, accumulator)
  })

  if (includeBody) {
    fields.push(
      await buildTemplateInitialValueField(
        cache,
        textarea.contentField,
        accumulator
      )
    )
  }

  if (includeTemplate) {
    fields.push(
      gql.FieldDefinition({ name: '_template', type: gql.TYPES.String })
    )
  }

  accumulator.push(
    gql.ObjectTypeDefinition({
      name,
      fields,
    })
  )
  return name
}

export const buildTemplateOrFieldFormFields = async ({
  cache,
  template,
  accumulator,
  includeBody,
}: TemplateBuildArgs & { includeBody: boolean }) => {
  const name = templateTypeName(template, 'Form', includeBody)

  const fields = await sequential(
    template.fields,
    async (field) => await buildTemplateFormField(cache, field, accumulator)
  )

  if (includeBody) {
    fields.push(
      await buildTemplateFormField(cache, textarea.contentField, accumulator)
    )
  }

  const fieldsUnionName = `${name}FieldsUnion`
  accumulator.push(
    gql.UnionTypeDefinition({
      name: fieldsUnionName,
      types: _.uniq(
        fields.map((field) => {
          switch (field.type.kind) {
            case 'NamedType':
              return field.type.name.value
            case 'ListType':
            case 'NonNullType':
              throw new Error(
                `Unexpected ${field.type.kind} for field union field`
              )
          }
        })
      ),
    })
  )

  return fieldsUnionName
}

export const buildTemplateOrFieldInput = async ({
  cache,
  template,
  accumulator,
  includeBody,
}: TemplateBuildArgs & { includeBody: boolean }) => {
  const name = templateTypeName(template, 'Input', includeBody)

  const fields = await sequential(
    template.fields,
    async (field) =>
      await buildTemplateInputDataField(cache, field, accumulator)
  )

  if (includeBody) {
    fields.push(
      await buildTemplateInputDataField(
        cache,
        textarea.contentField,
        accumulator
      )
    )
  }

  accumulator.push(
    gql.InputObjectTypeDefinition({
      name,
      fields,
    })
  )

  return name
}

export const buildTemplateOrFieldForm = async ({
  cache,
  template,
  accumulator,
  includeBody,
  nameOverride,
}: TemplateBuildArgs & {
  includeBody: boolean
  nameOverride?: string
}) => {
  const name = nameOverride || templateTypeName(template, 'Form', includeBody)

  const fieldsUnionName = await buildTemplateOrFieldFormFields({
    cache,
    template,
    accumulator,
    includeBody,
  })

  accumulator.push(
    gql.ObjectTypeDefinition({
      name,
      fields: [
        gql.FieldDefinition({ name: 'label', type: `String` }),
        gql.FieldDefinition({ name: 'name', type: `String` }),
        gql.FieldDefinition({
          name: 'fields',
          type: fieldsUnionName,
          list: true,
        }),
      ],
    })
  )

  return name
}

const buildTemplateFormField = async (
  cache: Cache,
  field: Field,
  accumulator: Definitions[]
): Promise<FieldDefinitionNode> => {
  switch (field.type) {
    case 'text':
      return text.build.field({ cache, field, accumulator })
    case 'textarea':
      return textarea.build.field({ cache, field, accumulator })
    case 'select':
      return select.build.field({ cache, field, accumulator })
    case 'blocks':
      return blocks.build.field({ cache, field, accumulator })
    case 'field_group_list':
      return fieldGroupList.build.field({ cache, field, accumulator })
    case 'field_group':
      return fieldGroup.build.field({ cache, field, accumulator })
    case 'list':
      return list.build.field({ cache, field, accumulator })
    case 'boolean':
      return boolean.build.field({ cache, field, accumulator })
    case 'datetime':
      return datetime.build.field({ cache, field, accumulator })
    case 'file':
      return file.build.field({ cache, field, accumulator })
    case 'image_gallery':
      return imageGallery.build.field({ cache, field, accumulator })
    case 'number':
      return number.build.field({ cache, field, accumulator })
    case 'tag_list':
      return tag_list.build.field({ cache, field, accumulator })
    default:
      return text.build.field({ cache, field, accumulator })
  }
}

const buildTemplateInitialValueField = async (
  cache: Cache,
  field: Field,
  accumulator: Definitions[]
): Promise<FieldDefinitionNode> => {
  switch (field.type) {
    case 'text':
      return text.build.initialValue({ cache, field, accumulator })
    case 'textarea':
      return textarea.build.initialValue({ cache, field, accumulator })
    case 'select':
      return await select.build.initialValue({ cache, field, accumulator })
    case 'blocks':
      return blocks.build.initialValue({ cache, field, accumulator })
    case 'field_group':
      return fieldGroup.build.initialValue({ cache, field, accumulator })
    case 'field_group_list':
      return fieldGroupList.build.initialValue({ cache, field, accumulator })
    case 'list':
      return list.build.initialValue({ cache, field, accumulator })
    case 'boolean':
      return boolean.build.initialValue({ cache, field, accumulator })
    case 'datetime':
      return datetime.build.initialValue({ cache, field, accumulator })
    case 'file':
      return file.build.initialValue({ cache, field, accumulator })
    case 'image_gallery':
      return imageGallery.build.initialValue({ cache, field, accumulator })
    case 'number':
      return number.build.initialValue({ cache, field, accumulator })
    case 'tag_list':
      return tag_list.build.initialValue({ cache, field, accumulator })
    default:
      return text.build.initialValue({ cache, field, accumulator })
  }
}

const buildTemplateDataField = async (
  cache: Cache,
  field: Field,
  accumulator: Definitions[]
): Promise<FieldDefinitionNode> => {
  switch (field.type) {
    case 'text':
      return text.build.value({ cache, field, accumulator })
    case 'textarea':
      return textarea.build.value({ cache, field, accumulator })
    case 'select':
      return await select.build.value({ cache, field, accumulator })
    case 'blocks':
      return blocks.build.value({ cache, field, accumulator })
    case 'field_group':
      return await fieldGroup.build.value({ cache, field, accumulator })
    case 'field_group_list':
      return fieldGroupList.build.value({ cache, field, accumulator })
    case 'list':
      return list.build.value({ cache, field, accumulator })
    case 'boolean':
      return boolean.build.value({ cache, field, accumulator })
    case 'datetime':
      return datetime.build.value({ cache, field, accumulator })
    case 'file':
      return file.build.value({ cache, field, accumulator })
    case 'image_gallery':
      return imageGallery.build.value({ cache, field, accumulator })
    case 'number':
      return number.build.value({ cache, field, accumulator })
    case 'tag_list':
      return tag_list.build.value({ cache, field, accumulator })
    default:
      return text.build.value({ cache, field, accumulator })
  }
}

const buildTemplateInputDataField = async (
  cache: Cache,
  field: Field,
  accumulator: Definitions[]
): Promise<InputValueDefinitionNode> => {
  switch (field.type) {
    case 'text':
      return text.build.input({ cache, field, accumulator })
    case 'textarea':
      return textarea.build.input({ cache, field, accumulator })
    case 'select':
      return select.build.input({ cache, field, accumulator })
    case 'blocks':
      return await blocks.build.input({ cache, field, accumulator })
    case 'field_group':
      return fieldGroup.build.input({ cache, field, accumulator })
    case 'field_group_list':
      return fieldGroupList.build.input({ cache, field, accumulator })
    case 'list':
      return list.build.input({ cache, field, accumulator })
    case 'boolean':
      return boolean.build.input({ cache, field, accumulator })
    case 'datetime':
      return datetime.build.input({ cache, field, accumulator })
    case 'file':
      return file.build.input({ cache, field, accumulator })
    case 'image_gallery':
      return imageGallery.build.input({ cache, field, accumulator })
    case 'number':
      return number.build.input({ cache, field, accumulator })
    case 'tag_list':
      return tag_list.build.input({ cache, field, accumulator })
    default:
      return text.build.input({ cache, field, accumulator })
  }
}

export const builder = {
  form: buildTemplateOrFieldForm,
  fields: buildTemplateOrFieldFormFields,
  data: buildTemplateOrFieldData,
  values: buildTemplateOrFieldValues,
  input: buildTemplateOrFieldInput,
}

export type Definitions =
  | ObjectTypeDefinitionNode
  | UnionTypeDefinitionNode
  | InputObjectTypeDefinitionNode
  | ScalarTypeDefinitionNode
  | InterfaceTypeDefinitionNode
  | EnumTypeDefinitionNode

export type sectionMap = {
  [key: string]: {
    section: DirectorySection
    plural: boolean
    mutation?: boolean
    queryName: string
    returnType: string
  }
}
type mutationsArray = {
  section: Section
  mutationName: string
  returnType: string
}[]
