import { Template, TinaField } from '@tinacms/schema-tools/src'
export const replaceNameOverrides = (template: Template, obj: any) => {
  if ((template as any).list) {
    return (obj as any[]).map((item) => {
      if (isBlockField(template) && (template as any).templateKey) {
        item._template = item[(template as any).templateKey]
        delete item[(template as any).templateKey]
      }

      return _replaceNameOverrides(
        getTemplateForData(template, item).fields,
        item
      )
    })
  } else {
    return _replaceNameOverrides(getTemplateForData(template, obj).fields, obj)
  }
}

function isBlockField(field: any): field is Object {
  return field && field.type === 'object' && field.templates?.length > 0
}

const _replaceNameOverrides = (fields: TinaField[], obj: any) => {
  const output: object = {}

  Object.keys(obj).forEach((key) => {
    const field = fields.find(
      (fieldWithMatchingAlias) =>
        (fieldWithMatchingAlias?.nameOverride ||
          fieldWithMatchingAlias?.name) === key
    )

    output[field?.name || key] =
      field?.type == 'object'
        ? replaceNameOverrides(field as any, obj[key])
        : obj[key]
  })

  return output
}

const getTemplateForData = (field: any, data: any) => {
  if (field.templates?.length) {
    const templateKey = '_template'

    if (data[templateKey]) {
      const result = field.templates.find(
        (template) =>
          template.nameOverride === data[templateKey] ||
          template.name === data[templateKey]
      )
      if (result) {
        return result
      }
    }

    throw new Error(
      `Missing required key "${templateKey}" on field ${field.name}`
    )
  } else {
    return field
  }
}

export const applyNameOverrides = (template: Template, obj: any): object => {
  if ((template as any).list) {
    return (obj as any[]).map((item) => {
      const result = _applyNameOverrides(
        getTemplateForData(template, item).fields,
        item
      )
      if (isBlockField(template) && (template as any).templateKey) {
        result[(template as any).templateKey] = (result as any)._template
        delete (result as any)._template
      }
      return result
    })
  } else {
    return _applyNameOverrides(getTemplateForData(template, obj).fields, obj)
  }
}

const _applyNameOverrides = (fields: TinaField[], obj: any): object => {
  const output: object = {}
  Object.keys(obj).forEach((key) => {
    const field = fields.find((field) => field.name === key)

    const outputKey = field?.nameOverride || key
    output[outputKey] =
      field?.type === 'object'
        ? applyNameOverrides(field as any, obj[key])
        : obj[key]
  })
  return output
}
