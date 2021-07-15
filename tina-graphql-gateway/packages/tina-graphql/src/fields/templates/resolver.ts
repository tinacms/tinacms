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
import { sequential, assertShape } from '../../util'
import { templateTypeName } from 'tina-graphql-helpers'

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

import type { DataSource } from '../../datasources/datasource'
import type { Field } from '../../fields'
import type { TemplateData } from '../../types'

export const resolve = {
  data: async ({ datasource, template, data, content }: any) => {
    const accum: { [key: string]: unknown } = {}
    const { template: _templateName, ...rest } = data

    const values = content ? { ...rest, _body: content } : rest

    await sequential(Object.keys(values), async (key) => {
      const field = findField(
        [...template.fields, textarea.contentField],
        key,
        template
      )
      return (accum[key] = await dataValue(datasource, field, values[key]))
    })

    return {
      __typename: templateTypeName(
        template,
        'Data',
        typeof content !== 'undefined' // FIXME: be more explicit
      ),
      ...accum,
    }
  },
  values: async ({ datasource, template, data, content }: any) => {
    const accum: { [key: string]: unknown } = {}
    const { template: _templateName, ...rest } = data

    const values = content ? { ...rest, _body: content } : rest

    await sequential(Object.keys(values), async (key) => {
      const field = findField(
        [...template.fields, textarea.contentField],
        key,
        template
      )
      return (accum[key] = await dataInitialValuesField(
        datasource,
        field,
        values[key]
      ))
    })

    return {
      __typename: templateTypeName(
        template,
        'Values',
        typeof content !== 'undefined' // FIXME: be more explicit
      ),
      _template: template.name,
      ...accum,
    }
  },
  form: async ({
    datasource,
    template,
    includeBody,
  }: {
    datasource: DataSource
    template: TemplateData
    includeBody?: boolean
  }) => {
    const fields = await sequential(template.fields, async (field) =>
      dataField(datasource, field)
    )

    if (includeBody) {
      fields.push(
        await textarea.resolve.field({
          datasource,
          field: textarea.contentField,
        })
      )
    }

    return {
      ...template,
      __typename: templateTypeName(template, 'Form', !!includeBody),
      fields,
    }
  },
  // FIXME
  input: async ({
    datasource,
    data,
    includeBody,
    template,
  }: {
    datasource: DataSource
    template: TemplateData
    data: unknown
    includeBody?: true
  }) => {
    if (includeBody) {
      template.fields.push(textarea.contentField)
    }

    if (includeBody) {
      assertShape<{ _template: string; [key: string]: unknown }>(data, (yup) =>
        yup.object({ _template: yup.string().required() })
      )
    } else {
      assertShape<{ [key: string]: unknown }>(data, (yup) => yup.object())
    }

    const fieldsToWrite = await sequential(template.fields, async (field) => {
      return inputField({
        datasource,
        field,
        value: data[field.name],
      })
    })
    if (includeBody) {
      fieldsToWrite.push({ _template: data._template })
    }

    const accum: { [key: string]: unknown } = {}
    fieldsToWrite.filter(Boolean).forEach((item) => {
      assertShape<object>(item, (yup) => yup.object())

      const key = Object.keys(item)[0]
      const value = Object.values(item)[0]
      accum[key] = value
    })

    return accum
  },
}

const dataInitialValuesField = async (
  datasource: DataSource,
  field: Field,
  value: unknown
) => {
  switch (field.type) {
    case 'text':
      return text.resolve.initialValue({ datasource, field, value })
    case 'textarea':
      return textarea.resolve.initialValue({ datasource, field, value })
    case 'blocks':
      return blocks.resolve.initialValue({ datasource, field, value })
    case 'select':
      return select.resolve.initialValue({ datasource, field, value })
    case 'list':
      return list.resolve.initialValue({ datasource, field, value })
    case 'field_group':
      return fieldGroup.resolve.initialValue({ datasource, field, value })
    case 'field_group_list':
      return fieldGroupList.resolve.initialValue({ datasource, field, value })
    case 'boolean':
      return boolean.resolve.initialValue({ datasource, field, value })
    case 'datetime':
      return datetime.resolve.initialValue({ datasource, field, value })
    case 'file':
      return file.resolve.initialValue({ datasource, field, value })
    case 'image_gallery':
      return imageGallery.resolve.initialValue({ datasource, field, value })
    case 'number':
      return number.resolve.initialValue({ datasource, field, value })
    case 'tag_list':
      return tag_list.resolve.initialValue({ datasource, field, value })
  }
}
const dataValue = async (
  datasource: DataSource,
  field: Field,
  value: unknown
) => {
  switch (field.type) {
    case 'text':
      return text.resolve.value({ datasource, field, value })
    case 'textarea':
      return textarea.resolve.value({ datasource, field, value })
    case 'blocks':
      return blocks.resolve.value({ datasource, field, value })
    case 'select':
      return select.resolve.value({ datasource, field, value })
    case 'list':
      return list.resolve.value({ datasource, field, value })
    case 'field_group':
      return fieldGroup.resolve.value({ datasource, field, value })
    case 'field_group_list':
      return fieldGroupList.resolve.value({
        datasource,
        field,
        value,
      })
    case 'boolean':
      return boolean.resolve.value({ datasource, field, value })
    case 'datetime':
      return datetime.resolve.value({ datasource, field, value })
    case 'file':
      return file.resolve.value({ datasource, field, value })
    case 'image_gallery':
      return imageGallery.resolve.value({ datasource, field, value })
    case 'number':
      return number.resolve.value({ datasource, field, value })
    case 'tag_list':
      return tag_list.resolve.value({ datasource, field, value })
  }
}
const dataField = async (datasource: DataSource, field: Field) => {
  switch (field.type) {
    case 'text':
      return text.resolve.field({ datasource, field })
    case 'textarea':
      return textarea.resolve.field({ datasource, field })
    case 'blocks':
      return blocks.resolve.field({ datasource, field })
    case 'select':
      return select.resolve.field({ datasource, field })
    case 'list':
      return list.resolve.field({ datasource, field })
    case 'field_group':
      return fieldGroup.resolve.field({ datasource, field })
    case 'field_group_list':
      return fieldGroupList.resolve.field({
        datasource,
        field,
      })
    case 'boolean':
      return boolean.resolve.field({ datasource, field })
    case 'datetime':
      return datetime.resolve.field({ datasource, field })
    case 'file':
      return file.resolve.field({ datasource, field })
    case 'image_gallery':
      return imageGallery.resolve.field({ datasource, field })
    case 'number':
      return number.resolve.field({ datasource, field })
    case 'tag_list':
      return tag_list.resolve.field({ datasource, field })
  }
}
const inputField = async ({
  datasource,
  field,
  value,
}: {
  datasource: DataSource
  field: Field
  value: unknown
}) => {
  switch (field.type) {
    case 'text':
      return text.resolve.input({ datasource, field, value })
    case 'textarea':
      return textarea.resolve.input({ datasource, field, value })
    case 'blocks':
      return blocks.resolve.input({ datasource, field, value })
    case 'select':
      return select.resolve.input({ datasource, field, value })
    case 'list':
      return list.resolve.input({ datasource, field, value })
    case 'field_group':
      return fieldGroup.resolve.input({ datasource, field, value })
    case 'field_group_list':
      return fieldGroupList.resolve.input({ datasource, field, value })
    case 'boolean':
      return boolean.resolve.input({ datasource, field, value })
    case 'datetime':
      return datetime.resolve.input({ datasource, field, value })
    case 'file':
      return file.resolve.input({ datasource, field, value })
    case 'image_gallery':
      return imageGallery.resolve.input({ datasource, field, value })
    case 'number':
      return number.resolve.input({ datasource, field, value })
    case 'tag_list':
      return tag_list.resolve.input({ datasource, field, value })
  }
}

const findField = (
  fields: Field[],
  fieldName: string,
  template: TemplateData
) => {
  const field = fields.find((f) => {
    return f?.name === fieldName
  })
  if (!field) {
    throw new Error(
      `Unable to find field for item with name: ${fieldName} on template ${
        template.name
      } Possible fields are: ${template.fields
        .map((field) => field.name)
        .join(', ')}
      `
    )
  }
  return field
}
