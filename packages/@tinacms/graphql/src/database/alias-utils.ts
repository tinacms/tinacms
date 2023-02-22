export const replaceAliasesWithNames = (collection: any, obj: any) => {
  Object.keys(obj).forEach((key) => {
    const field = collection.fields.find((field) => field.alias === key)
    // console.log('template_fields', template.fields)

    if (field) {
      obj[field.name] = obj[key]
      delete obj[key]
    }
    if (typeof obj[key] === 'object') {
      replaceAliasesWithNames(collection, obj[key])
    }
  })
}

export const replaceKeysWithAliases = (template: any, obj: any) => {
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
