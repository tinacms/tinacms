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

import { TinaField } from '@tinacms/graphql'
import prettier from 'prettier'
import fs from 'fs-extra'
import path from 'path'
import { TinaSchema } from '@tinacms/schema-tools'
// @ts-ignore text import
import sdkString from './sdk2.txt'
import { buildTypes2 } from './types'

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
      return buildString(field)
    case 'reference':
      return buildString(field)
    case 'object':
      if (field.templates) {
        const u = `${field.templates
          .map((template) => {
            if (typeof template === 'string') {
              throw new Error('Global templates not supported')
            }
            return `${buildFields(
              { required: true },
              template.fields,
              `_template: "${template.name}"`
            )}`
          })
          .join(' | ')}`

        let res = u
        if (field.list) {
          res = `${res}[]`
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
  field: { list?: boolean; required?: boolean },
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
  let string = `{${fieldStrings.join(',\n')}}`
  if (field.list) {
    string = `${string}[]`
  }
  return string
}

const buildCollection = (name, fields) => {
  const stringFields = buildFields({ required: true }, fields)
  // FIXME: we're faking the old vs new, when this is for real the old type
  // will come from the older schema version in Git.
  const string = `type ${name}OldSchemaType = ${stringFields}\ntype ${name}NewSchemaType = ${stringFields}`
  return string
}

export const migrate = async (ctx: any, next: () => void) => {
  const names = []
  const s2 = []
  ctx.tinaSchema.getCollections().map((collection) => {
    names.push(collection.name)
    s2.push(buildTypes2(collection))
  })

  const types = await buildTypes(ctx.tinaSchema)
  await fs.outputFile(
    path.resolve(process.cwd(), '.tina', 'sdk.ts'),
    prettier.format(
      `import schema from "./__generated__/_schema.json"
${s2.join('\n')}
${types}
`,
      { parser: 'typescript' }
    )
  )

  next()
}

const buildFieldType = (field: TinaField) => {
  switch (field.type) {
    case 'object':
      const opts = []
      if (field.fields) {
        if (typeof field.fields === 'string') {
          throw new Error('Global templates not supported')
        }
        field.fields.forEach((field) => {
          opts.push(field.name)
        })
      } else {
        field.templates.forEach((template) => {
          if (typeof template === 'string') {
            throw new Error('Global templates not supported')
          }
          opts.push(template.name)
        })
      }
      return `boolean | { ${opts.map((o) => `${o}?: boolean`)} }`
    case 'reference':
      return `boolean`
    default:
      return true
  }
}

const buildTypes = (tinaSchema: TinaSchema) => {
  const collections = []
  const collectionTypes = []
  const collectionNames = []
  tinaSchema.getCollections().map((collection) => {
    collectionNames.push(collection.name)
    collectionTypes.push(
      `type ${collection.name}Fields = { ${collection.fields
        .map((f) => `${f.name}?: ${buildFieldType(f)}`)
        .join(', ')}}`
    )
    collectionTypes.push(
      `type ${collection.name}References = { ${collection.fields
        .filter((f) => f.type === 'reference')
        .map(
          (f) =>
            // @ts-ignore
            `${f.name}?: boolean | {${f.collections
              .map(
                (col) =>
                  `${col}: {fields?: ${col}Fields, include?: ${col}References}`
              )
              .join(', ')}}`
        )
        .join(', ')}}`
    )
    collectionTypes.push(
      `type ${collection.name}Options= {
        fields?: ${collection.name}Fields;
        include?: ${collection.name}References;
      }`
    )
    collectionTypes.push(`
    type ${collection.name}Return<
  T extends ${collection.name}Fields | undefined,
  B extends ${collection.name}References
> = T extends object
  ? {
      [Key in keyof T]: T[Key] extends true
        ? Key extends keyof ${collection.name}Type
          ? ${collection.name}Type[Key]
          : never
        : never;
    }
  : ${collection.name}Type<B>;
    `)
    collections.push(`
    function ${collection.name}<
    T extends ${collection.name}Fields | undefined,
    B extends ${collection.name}References
  >(args: { relativePath: string; fields?: never; include?: B }): ${collection.name}Type<B>;
  function ${collection.name}<
    T extends ${collection.name}Fields | undefined,
    B extends ${collection.name}References
  >(args: {
    relativePath: string;
    fields?: T;
    include?: never;
  }): {
    [Key in keyof T]: T[Key] extends true
      ? Key extends keyof ${collection.name}Type
        ? ${collection.name}Type[Key]
        : never
      : never;
  };
  function ${collection.name}<T extends ${collection.name}Fields | undefined, B extends ${collection.name}References>(
    args:
      | {
          relativePath: string;
          fields?: T;
          include?: never;
        }
      | {
          relativePath: string;
          fields?: never;
          include?: B;
        }
  ):
    | ${collection.name}Type<B>
    | {
        [Key in keyof T]: T[Key] extends true
          ? Key extends keyof ${collection.name}Type
            ? ${collection.name}Type[Key]
            : never
          : never;
      } {
    return {} as any;
  }
  function ${collection.name}Connection<
  T extends ${collection.name}Fields | undefined,
  B extends ${collection.name}References
>(args: { first: string; fields?: never; include?: B }): {edges: {node: ${collection.name}Type<B>}[]};
function ${collection.name}Connection<
  T extends ${collection.name}Fields | undefined,
  B extends ${collection.name}References
>(args: {
  first: string;
  fields?: T;
  include?: never;
}): {
  edges: {
    node: {[Key in keyof T]: T[Key] extends true
    ? Key extends keyof ${collection.name}Type
      ? ${collection.name}Type[Key]
      : never
    : never}
  }[]
};
function ${collection.name}Connection<T extends ${collection.name}Fields | undefined, B extends ${collection.name}References>(
  args:
    | {
        first: string;
        fields?: T;
        include?: never;
      }
    | {
        first: string;
        fields?: never;
        include?: B;
      }
):
{
  edges: {
    node:  | ${collection.name}Type<B>
  | {
      [Key in keyof T]: T[Key] extends true
        ? Key extends keyof ${collection.name}Type
          ? ${collection.name}Type[Key]
          : never
        : never;
    }
  }[]
} {
  return {} as any;
}
    `)
  })
  const s = `
  ${collectionTypes.join('\n')}
  ${collections.join('\n\n')}

  type Collection = {
    ${collectionNames.map((c) => `${c}: typeof ${c}`).join(',\n')}
    ${collectionNames
      .map((c) => `${c}Connection: typeof ${c}Connection`)
      .join(',\n')}
  }

${sdkString}
  `

  return s
}
