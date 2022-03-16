import { TinaFieldEnriched } from '../types'
import { TinaSchema } from './TinaSchema'
import { sequential, lastItem, NAMER } from '../util'

export const resolveField = async (
  { namespace, ...field }: TinaFieldEnriched,
  schema: TinaSchema
): Promise<unknown> => {
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
      const templateInfo = schema.getTemplatesForCollectable({
        ...field,
        namespace,
      })
      if (templateInfo.type === 'object') {
        // FIXME: need to finish group/group-list
        return {
          ...field,
          component: field.list ? 'group-list' : 'group',
          fields: await sequential(
            templateInfo.template.fields,
            async (field) => await resolveField(field, schema)
          ),
          ...extraFields,
        }
      } else if (templateInfo.type === 'union') {
        const templates: { [key: string]: object } = {}
        const typeMap: { [key: string]: string } = {}
        await sequential(templateInfo.templates, async (template) => {
          const extraFields = template.ui || {}
          const templateName = lastItem(template.namespace)
          typeMap[templateName] = NAMER.dataTypeName(template.namespace)
          templates[lastItem(template.namespace)] = {
            // @ts-ignore FIXME `Templateable` should have name and label properties
            label: template.label || templateName,
            key: templateName,
            fields: await sequential(
              template.fields,
              async (field) => await resolveField(field, schema)
            ),
            ...extraFields,
          }
          return true
        })
        return {
          ...field,
          typeMap,
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
      await sequential(field.templates, async (template) => {
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
            fields: await sequential(
              template.fields,
              async (field) => await resolveField(field, schema)
            ),
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
      // const documents = _.flatten(
      //   await sequential(field.collections, async (collectionName) => {
      //     const collection = schema.getCollection(collectionName)
      //     return this.database.store.glob(collection.path)
      //   })
      // )

      return {
        ...field,
        component: 'reference',
        //   TODO: This is where we can pass args to reference
        //   options: [
        // { label: 'Choose an option', value: '' },
        // ...documents.map((document) => {
        //   return {
        //     value: document,
        //     label: document,
        //   }
        // }),
        //   ],
        ...extraFields,
      }
    default:
      // @ts-ignore
      throw new Error(`Unknown field type ${field.type}`)
  }
}
