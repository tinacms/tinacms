import { Template, TinaField } from '@tinacms/schema-tools/src'

const replaceBlockAliases = (template: Template, item: any) => {
  const output = { ...item }
  const templateKey = (template as any).templateKey || '_template'

  const templateName = output[templateKey]

  const matchingTemplate = (template as any).templates.find(
    (t) => t.nameOverride == templateName || t.name == templateName
  )
  if (!matchingTemplate) {
    throw new Error(
      `Block template "${templateName}" is not defined for field "${template.name}"`
    )
  }
  output._template = matchingTemplate.name
  if (templateKey != '_template') {
    delete output[templateKey]
  }

  return output
}

export const replaceNameOverrides = (template: Template, obj: any) => {
  if ((template as any).list) {
    return (obj as any[]).map((item) => {
      if (isBlockField(template)) {
        item = replaceBlockAliases(template, item)
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
      throw new Error(
        `Template "${data[templateKey]}" is not defined for field "${field.name}"`
      )
    }

    throw new Error(
      `Missing required key "${templateKey}" on field "${field.name}"`
    )
  } else {
    return field
  }
}

const applyBlockAliases = (template: Template, item: any) => {
  const output = { ...item }
  const templateKey = (template as any).templateKey || '_template'
  const templateName = (output as any)._template

  const matchingTemplate = (template as any).templates.find(
    (t) => t.nameOverride == templateName || t.name == templateName
  )
  if (!matchingTemplate) {
    throw new Error(
      `Block template "${templateName}" is not defined for field "${template.name}"`
    )
  }
  output[templateKey] = matchingTemplate.nameOverride || matchingTemplate.name
  if (templateKey != '_template') {
    delete (output as any)._template
  }
  return output
}

export const applyNameOverrides = (template: Template, obj: any): object => {
  if ((template as any).list) {
    return (obj as any[]).map((item) => {
      let result = _applyNameOverrides(
        getTemplateForData(template, item).fields,
        item
      )
      if (isBlockField(template)) {
        result = applyBlockAliases(template, result)
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
