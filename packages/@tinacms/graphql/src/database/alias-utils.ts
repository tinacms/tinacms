import { Templateable, TinaFieldEnriched } from '@tinacms/schema-tools/src'

export const replaceNameOverrides = (template: Templateable, obj: any) => {
  if ((template as any).list) {
    return (obj as any[]).map((item) => {
      return _replaceNameOverrides(
        getTemplateForData(template, item).fields,
        item
      )
    })
  } else {
    return _replaceNameOverrides(getTemplateForData(template, obj).fields, obj)
  }
}

const _replaceNameOverrides = (fields: TinaFieldEnriched[], obj: any) => {
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

const getTemplateKey = (field) => {
  //return "_template"
  // Do some extra work to allow custom _template keys

  const DEFAULT_TEMPLATE_KEY = '_template'
  if (field.templates?.length) {
    const templateField = field.templates[0]?.fields?.find(
      (field) => field.name === DEFAULT_TEMPLATE_KEY
    )
    return templateField?.alias || DEFAULT_TEMPLATE_KEY
  }
  return DEFAULT_TEMPLATE_KEY
}

const getTemplateForData = (field: any, data: any) => {
  if (field.templates?.length) {
    const templateKey = getTemplateKey(field)

    if (data[templateKey]) {
      return field.templates.find(
        (template) => template.name === data[templateKey]
      )
    }
  } else {
    return field
  }

  throw new Error('No template found for field ' + field.name)
}

export const applyNameOverrides = (
  template: Templateable,
  obj: any
): object => {
  if ((template as any).list) {
    return (obj as any[]).map((item) => {
      return _applyNameOverrides(
        getTemplateForData(template, item).fields,
        item
      )
    })
  } else {
    return _applyNameOverrides(getTemplateForData(template, obj).fields, obj)
  }
}

const _applyNameOverrides = (fields: TinaFieldEnriched[], obj: any): object => {
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
