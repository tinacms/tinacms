import { Templateable, TinaFieldEnriched } from '@tinacms/schema-tools/src'

export const replaceAliasesWithNames = (template: Templateable, obj: any) => {
  if ((template as any).list) {
    return (obj as any[]).map((item) => {
      const foo = getTemplateForData(template, item).fields
      return _replaceAliasesWithNames(foo, item)
    })
  } else {
    return _replaceAliasesWithNames(
      getTemplateForData(template, obj).fields,
      obj
    )
  }
}

const _replaceAliasesWithNames = (fields: TinaFieldEnriched[], obj: any) => {
  const output: object = {}

  Object.keys(obj).forEach((key) => {
    const field = fields.find(
      (fieldWithMatchingAlias) =>
        (fieldWithMatchingAlias?.alias || fieldWithMatchingAlias?.name) === key
    )

    output[field?.name || key] =
      field?.type == 'object'
        ? replaceAliasesWithNames(field as any, obj[key])
        : obj[key]
  })

  return output
}

const getTemplateForData = (field: any, data: any) => {
  if (field.templates?.length) {
    if (data._template) {
      return field.templates.find(
        (template) => template.name === data._template
      )
    }
  } else {
    return field
  }

  throw new Error('No template found for field ' + field.name)
}

export const replaceKeysWithAliases = (
  template: Templateable,
  obj: any
): object => {
  const output: object = {}
  Object.keys(obj).forEach((key) => {
    const field = template.fields.find((field) => field.name === key)

    const outputKey = field?.alias || key
    output[outputKey] =
      typeof obj[key] === 'object'
        ? replaceKeysWithAliases(template, obj[key])
        : obj[key]
  })
  return output
}
