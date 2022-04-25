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

import { TinaCollection, TinaField } from '@tinacms/graphql'

const buildBoolean = (field) => {
  return buildString(field, 'boolean')
}

const buildImage = (field) => {
  return buildString(field)
}
const buildDatetime = (field) => {
  return buildString(field)
}
const buildString = (field, type?: string) => {
  let s = type || `string`
  if (field.options) {
    const values = []
    field.options.map((option) => {
      if (typeof option === 'string') {
        values.push(`"${option}"`)
      } else {
        values.push(`"${option.value}"`)
      }
    })
    s = `${values.join(' | ')}`
  }
  let o = ''
  if (!field.required) {
    o = '?'
  }
  if (field.list) {
    return `${field.name}${o}: ${s}[]`
  }
  return `${field.name}${o}: ${s}`
}
const buildNumber = (field) => {
  return buildString(field, 'number')
}
const buildField = (field: TinaField) => {
  switch (field.type) {
    case 'boolean':
      return buildBoolean(field)
    case 'datetime':
      return buildDatetime(field)
    case 'image':
      return buildImage(field)
    case 'number':
      return buildNumber(field)
    case 'string':
      return buildString(field)
    case 'rich-text':
      return buildString(field, 'object')
    case 'reference':
      return `${field.name}${field.required ? '' : '?'}: R["${
        field.name
      }"] extends true
      ? ${field.collections[0]}Type
      : R["${field.name}"] extends { ${field.collections[0]}: ${
        field.collections[0]
      }Options }
      ? ${field.collections[0]}Return<
        R["${field.name}"]["${field.collections[0]}"]["fields"],
        R["${field.name}"]["${field.collections[0]}"]["include"]
      >
      : { id: string }`
    case 'object':
      if (field.templates) {
        const u = `${field.templates
          .map((template) => {
            if (typeof template === 'string') {
              throw new Error('Global templates not supported')
            }
            return `${buildFields(
              // @ts-ignore
              { required: true },
              template.fields,
              `_template: "${template.name}"`
            )}`
          })
          .join(' | ')}`

        let res = u
        if (field.list) {
          res = `(${res})[]`
        }
        let o = ''
        if (!field.required) {
          o = '?'
        }
        return `${field.name}${o}: ${res}`
      } else {
        if (typeof field.fields === 'string') {
          throw new Error('Global templates not supported')
        }
        let o = ''
        if (!field.required) {
          o = '?'
        }

        return `${field.name}${o}: ${buildFields(field, field.fields)}`
      }
    default:
      break
  }
}

const buildFields = (
  field: { name: string; list?: boolean; required?: boolean },
  fields: TinaField[],
  extra?: string
) => {
  const fieldStrings = []
  fields.forEach((field) => {
    fieldStrings.push(buildField(field))
  })
  if (extra) {
    fieldStrings.push(extra)
  }
  // FIXME: need to distinguish between collections and objects
  if (field.name) {
    fieldStrings.push(
      `_collection: "${field.name}", _template: "${field.name}"`
    )
  }
  let string = `{${fieldStrings.join(',\n')}}`
  if (field.list) {
    string = `${string}[]`
  }
  return string
}

export const buildCollectionResponses = (name, fields) => {
  const stringFields = buildFields(
    // @ts-ignore
    { name, required: true, _collections: true },
    fields
  )
  // FIXME: we're faking the old vs new, when this is for real the old type
  // will come from the older schema version in Git.
  const string = `type ${name}Type<R extends ${name}References = {}> = ${stringFields}`
  return string
}

export const buildTypes2 = (collection: TinaCollection) => {
  return buildCollectionResponses(collection.name, collection.fields)
}
