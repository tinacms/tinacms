// @ts-nocheck
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
const capitalize = (s: string) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const generateNamespacedFieldName = (names: string[], suffix: string = '') => {
  return (suffix ? [...names, suffix] : names).map(capitalize).join('')
}

export const query = <
  B,
  A extends keyof Collection,
  T extends ReturnType<Collection[A]>,
  C extends { [Key in keyof B]: T }
>(
  callback: (sdk: Collection) => C
): Promise<{ data: C; errors?: object[]; query: string }> => {
  const cb = {}

  const addField = (field: any, options: any): any => {
    switch (field.type) {
      case 'object':
        if (field.fields) {
          const f = addFields(field.fields, options)
          return `${field.name} { __typename
          ${f}
       }`
        } else {
          return `${field.name} { __typename
            ${field.templates.map((template: any) => {
              const f = addFields(template.fields, options)
              return `...on ${generateNamespacedFieldName(template.namespace)} {
                ${f}
              }`
            })}
       }`
        }
      case 'reference':
        if (options?.include) {
          if (Object.keys(options.include).includes(field.name)) {
            const referencedCollections = field.collections.map((col: any) =>
              schema.collections.find((c) => c.name === col)
            )
            if (options.include[field.name] === true) {
              return `${field.name} {
                __typename
                ${referencedCollections.map((collection: any) => {
                  const f = addFields(collection.fields, options)
                  return `...on ${generateNamespacedFieldName(
                    collection.namespace
                  )} {
                    ${f}
                  }`
                })}
              }`
            }
            let referenceSelections = []
            referencedCollections.map((collection) => {
              console.log(options.include[field.name][collection.name])
              const f = addFields(
                collection.fields,
                options.include[field.name][collection.name]
              )
              referenceSelections.push(`...on ${generateNamespacedFieldName(
                collection.namespace
              )} {
                ${f}
              }`)
            })
            return `${field.name} {
              __typename
              ${referenceSelections.join('\n')}
            }`
          }
        }
        return `${field.name} { __typename
        ...on Document {
          id
        }
       }`

      default:
        return field.name
    }
  }

  const addFields = (fields: any[], options: any): any => {
    if (options?.fields) {
      const f: any = []
      Object.entries(options.fields).forEach(([k, v]) => {
        if (v) {
          const ff = fields.find((field) => field.name === k)
          if (ff) {
            f.push(ff)
          } else {
            throw new Error(`oops: ${k}`)
          }
        }
      })
      fields = f
    }

    return fields.map((f) => addField(f, options)).join('\n')
  }
  const docName = (name: any, relativePath: any, list?: boolean) => {
    if (!list) {
      return `${name}${
        list ? 'Connection' : ''
      }(relativePath: "${relativePath}")`
    }
    return `${name}${list ? 'Connection' : ''}`
  }

  const buildCol = (collection: any, args: any) => {
    if (collection.templates) {
      throw new Error('no templates supported')
    }
    if (typeof collection.fields === 'string') {
      throw new Error('no global templates supported')
    }
    const f = addFields(collection.fields, args)
    return `${docName(collection.name, args.relativePath)} {
${f}
}`
  }
  const buildColConnection = (collection: any, args: any) => {
    if (collection.templates) {
      throw new Error('no templates supported')
    }
    if (typeof collection.fields === 'string') {
      throw new Error('no global templates supported')
    }
    const f = addFields(collection.fields, args)
    return `${docName(collection.name, args.relativePath, true)} {
edges { node {${f}} }
}`
  }

  schema.collections.forEach((collection: any) => {
    // @ts-ignore
    cb[collection.name] = (args) => {
      return buildCol(collection, args)
    }
    cb[`${collection.name}Connection`] = (args) => {
      return buildColConnection(collection, args)
    }
  })
  // @ts-ignore
  const query = callback(cb)

  let queryString = `query {`
  Object.entries(query).forEach(([key, value]) => {
    queryString = queryString + `${key}: ${value}\n`
  })
  queryString = queryString + `}`

  return fetch('http://localhost:4001/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: queryString,
    }),
  }).then(async (res) => {
    const json = await res.json()
    return {
      query: queryString,
      ...json,
    }
  })
}

export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any
