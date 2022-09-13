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

import { TinaFieldEnriched } from '../types'
import { TinaSchema } from './TinaSchema'
import { lastItem, NAMER } from '../util'

/**
 *
 * Turns a field the schema (schema.{js,ts} file) into a valid front end FieldConfig
 *
 *
 * @param  {TinaFieldEnriched} field. The field that will be transformed
 * @param  {TinaSchema} schema the entireT Tina Schema
 * @returns unknown
 */
export const resolveField = (
  field: TinaFieldEnriched,
  schema: TinaSchema
): {
  [key: string]: unknown
  name: string
  component: string
  type: string
} => {
  field
  field.parentTypename = NAMER.dataTypeName(
    // Get the type of the parent namespace
    field.namespace.filter((_, i) => i < field.namespace.length - 1)
  )
  const extraFields = field.ui || {}
  switch (field.type) {
    case 'number':
      return {
        component: 'number',
        ...field,
        ...extraFields,
      }
    case 'datetime':
      return {
        component: 'date',
        ...field,
        ...extraFields,
      }
    case 'boolean':
      return {
        component: 'toggle',
        ...field,
        ...extraFields,
      }
    case 'image':
      return {
        component: 'image',
        clearable: true,
        ...field,
        ...extraFields,
      }
    case 'string':
      if (field.options) {
        // TODO: correct the type
        // @ts-ignore
        if (field.list) {
          return {
            component: 'checkbox-group',
            ...field,
            ...extraFields,
            options: field.options,
          }
        }
        return {
          component: 'select',
          ...field,
          ...extraFields,
          options: [{ label: `Choose an option`, value: '' }, ...field.options],
        }
      }
      // TODO: correct the type
      // @ts-ignore
      if (field.list) {
        return {
          // Allows component to be overridden for scalars
          component: 'list',
          field: {
            component: 'text',
          },
          ...field,
          ...extraFields,
        }
      }
      return {
        // Allows component to be overridden for scalars
        component: 'text',
        ...field,
        ...extraFields,
      }
    case 'object':
      const templateInfo = schema.getTemplatesForCollectable(field)
      if (templateInfo.type === 'object') {
        // FIXME: need to finish group/group-list
        return {
          ...field,
          component: field.list ? 'group-list' : 'group',
          fields: templateInfo.template.fields.map((field) =>
            resolveField(field, schema)
          ),
          ...extraFields,
        }
      } else if (templateInfo.type === 'union') {
        const templates: { [key: string]: object } = {}
        const typeMap: { [key: string]: string } = {}
        templateInfo.templates.forEach((template) => {
          const extraFields = template.ui || {}
          const templateName = lastItem(template.namespace)
          typeMap[templateName] = NAMER.dataTypeName(template.namespace)
          templates[lastItem(template.namespace)] = {
            // @ts-ignore FIXME `Templateable` should have name and label properties
            label: template.label || templateName,
            key: templateName,
            namespace: [...field.namespace, templateName],
            fields: template.fields.map((field) => resolveField(field, schema)),
            ...extraFields,
          }
          return true
        })

        return {
          ...field,
          typeMap,
          namespace: field.namespace,
          component: field.list ? 'blocks' : 'not-implemented',
          templates,
          ...extraFields,
        }
      } else {
        throw new Error(`Unknown object for resolveField function`)
      }
    case 'rich-text':
      const templates: { [key: string]: object } = {}
      const typeMap: { [key: string]: string } = {}
      field.templates?.forEach((template) => {
        if (typeof template === 'string') {
          throw new Error(`Global templates not yet supported for rich-text`)
        } else {
          const extraFields = template.ui || {}
          // console.log({ namespace: template.namespace })

          // template.namespace is undefined
          const templateName = lastItem(template.namespace)
          typeMap[templateName] = NAMER.dataTypeName(template.namespace)
          templates[lastItem(template.namespace)] = {
            // @ts-ignore FIXME `Templateable` should have name and label properties
            label: template.label || templateName,
            key: templateName,
            inline: template.inline,
            name: templateName,
            match: template.match,
            fields: template.fields.map((field) => resolveField(field, schema)),
            ...extraFields,
          }
          return true
        }
      })
      return {
        ...field,
        templates: Object.values(templates),
        component: 'rich-text',
        ...extraFields,
      }
    case 'reference':
      return {
        ...field,
        component: 'reference',
        ...extraFields,
      }
    default:
      // @ts-ignore
      throw new Error(`Unknown field type ${field.type}`)
  }
}
