/**

*/

import { TinaField } from '../types/index'
import { TinaSchema } from './TinaSchema'
import { lastItem, NAMER } from '../util'

/**
 * Turns a field the schema (schema.{js,ts} file) into a valid front end FieldConfig
 */
export const resolveField = (
  field: TinaField<true>,
  schema: TinaSchema
): {
  [key: string]: unknown
  name: string
  component: TinaField<true>['ui']['component']
  type: string
} => {
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
      if (field.list) {
        return {
          component: 'list',
          field: {
            component: 'image',
          },
          ...field,
          ...extraFields,
        }
      }
      return {
        component: 'image',
        clearable: true,
        ...field,
        ...extraFields,
      }
    case 'string':
      if (field.options) {
        if (field.list) {
          return {
            component: 'checkbox-group',
            ...field,
            ...extraFields,
            options: field.options,
          }
        }
        if (
          field.options[0] &&
          typeof field.options[0] === 'object' &&
          field.options[0].icon
        ) {
          return {
            component: 'button-toggle',
            ...field,
            ...extraFields,
            options: field.options,
          }
        }
        return {
          component: 'select',
          ...field,
          ...extraFields,
          options:
            field.ui && field.ui.component !== 'select'
              ? field.options
              : [{ label: `Choose an option`, value: '' }, ...field.options],
        }
      }
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

          // template.namespace is undefined
          const templateName = lastItem(template.namespace)
          typeMap[templateName] = NAMER.dataTypeName(template.namespace)
          templates[lastItem(template.namespace)] = {
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
