import { Templateable } from '@tinacms/schema-tools/src'

export const replaceAliasesWithNames = (template: Templateable, obj: any) => {
  Object.keys(obj).forEach((key) => {
    const field = template.fields.find((field) => field.alias === key)

    if (field) {
      obj[field.name] = obj[key]
      delete obj[key]
    }
    if (typeof obj[key] === 'object') {
      replaceAliasesWithNames(template, obj[key])
    }
  })
}

export const replaceKeysWithAliases = (template: Templateable, obj: any) => {
  Object.keys(obj).forEach((key) => {
    const field = template.fields.find((field) => field.name === key)
    if (field && field.alias) {
      obj[field.alias] = obj[key]
      delete obj[key]
    }
    if (typeof obj[key] === 'object') {
      replaceKeysWithAliases(template, obj[key])
    }
  })
}
