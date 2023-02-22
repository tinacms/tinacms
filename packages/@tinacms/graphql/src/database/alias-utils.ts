import { Templateable } from '@tinacms/schema-tools/src'

export const replaceAliasesWithNames = (template: Templateable, obj: any) => {
  const output: object = {}

  Object.keys(obj).forEach((key) => {
    const fieldWithMatchingAlias = template.fields.find(
      (fieldWithMatchingAlias) => fieldWithMatchingAlias.alias === key
    )

    const outputKey = fieldWithMatchingAlias?.name || key
    output[outputKey] =
      typeof output[key] === 'object'
        ? replaceAliasesWithNames(template, obj[key])
        : obj[key]
  })

  return output
}

export const replaceKeysWithAliases = (
  template: Templateable,
  obj: any
): object => {
  const output: object = {}
  Object.keys(obj).forEach((key) => {
    const field = template.fields.find((field) => field.name === key)

    if (field?.alias) {
      output[field.alias] =
        field.type === 'object'
          ? replaceKeysWithAliases(template, obj[key])
          : obj[key]
    } else {
      output[key] = obj[key]
    }
  })
  return output
}
