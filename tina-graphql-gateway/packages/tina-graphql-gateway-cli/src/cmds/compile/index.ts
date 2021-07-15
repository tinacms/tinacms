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

import glob from 'fast-glob'
import normalize from 'normalize-path'
import path from 'path'
import fs from 'fs-extra'
import * as ts from 'typescript'
import * as jsyaml from 'js-yaml'
import * as yup from 'yup'
import * as _ from 'lodash'
import type { unstable_TinaCloudSchema } from 'tina-graphql'
import { successText, dangerText, logText } from '../../utils/theme'
import { defaultSchema } from './defaultSchema'
import { logger } from '../../logger'

const tinaPath = path.join(process.cwd(), '.tina')
const tinaTempPath = path.join(process.cwd(), '.tina', '__generated__', 'temp')
const tinaConfigPath = path.join(
  process.cwd(),
  '.tina',
  '__generated__',
  'config'
)

const transformField = async (
  tinaField: TinaField,
  schema: TinaCloudSchema
) => {
  const field = tinaField
  // const field = (await yup
  //   .object()
  //   .shape({
  //     name: yup
  //       .string()
  //       .transform((value) => {
  //         return _.snakeCase(value);
  //       })
  //       .matches(
  //         /^[a-zA-Z0-9_]*$/,
  //         (message) =>
  //           `the name field can only contain alphanumeric characters and underscores, got ${message.value}`
  //       )
  //       .required("the name field is required"),
  //     label: yup.string().required(),
  //     type: yup.string().oneOf(types, (message) => {
  //       return `Expected one of ${message.values} but got ${message.value}`;
  //     }),
  //   })
  // FIXME: casting back to TinaField, but probably
  // want to check the entire object, like 'options' for a select field
  // .validate(tinaField)) as TinaField;

  if (field.type === 'group') {
    return {
      ...field,
      type: 'field_group',
      fields: await Promise.all(
        field.fields.map((field) => transformField(field, schema))
      ),
    }
  }
  if (field.type === 'toggle') {
    return {
      ...field,
      type: 'boolean',
    }
  }
  if (field.type === 'group-list') {
    return {
      ...field,
      type: 'field_group_list',
      fields: await Promise.all(
        field.fields.map((field) => transformField(field, schema))
      ),
    }
  }
  if (field.type === 'tags') {
    return {
      ...field,
      type: 'tag_list',
    }
  }
  if (field.type === 'image') {
    return {
      ...field,
      type: 'file',
    }
  }
  if (field.type === 'reference') {
    yup
      .object({
        collection: yup
          .string()
          .oneOf(schema.collections.map((collection) => collection.name)),
      })
      .validate(field)
    return {
      name: field.name,
      label: field.label,
      type: 'select',
      config: {
        source: {
          type: 'pages',
          section: field.collection,
        },
      },
    }
  }
  if (field.type === 'reference-list') {
    return {
      name: field.name,
      label: field.label,
      type: 'list',
      config: {
        source: {
          type: 'pages',
          section: field.collection,
        },
      },
    }
  }

  if (field.type === 'select') {
    return {
      name: field.name,
      label: field.label,
      type: 'select',
      config: {
        source: {
          type: 'simple',
        },
        options: field.options.map((option) => {
          if (typeof option === 'string') {
            return {
              value: option,
              label: option,
            }
          }
          return option
        }),
      },
    }
  }
  return field
}

const buildTemplate = async (
  definition: TinaCloudTemplate,
  schema: TinaCloudSchema
) => {
  const outputYmlPath = path.resolve(
    path.join(
      tinaTempPath.replace('temp', 'config').replace('.js', ''),
      path.join('front_matter/templates', `${definition.name}.yml`)
    )
  )
  const output: { pages?: string[] } & typeof definition = { ...definition }
  output.fields = await Promise.all(
    definition.fields.map(async (field) => {
      if (field.type === 'blocks') {
        return {
          name: field.name,
          label: field.label,
          type: 'blocks',
          template_types: await Promise.all(
            field.templates.map(async (template, index) => {
              await buildTemplate(template, schema)
              return template.name
            })
          ),
        }
      }
      return transformField(field, schema)
    })
  )

  // Don't write twice to the filesystem
  // TODO: check that a compiled template matches
  // with the new one, probably need something robust
  // here to ensure we're keeping things sane
  if (compiledTemplates.includes(output.name)) {
    // logger.info(`already compiled template at ${outputYmlPath}, skipping`);
    return true
  } else {
    compiledTemplates.push(output.name)
  }
  const templateString = '---\n' + jsyaml.dump(output)
  await fs.outputFile(outputYmlPath, templateString)
  return true
}
let types = [
  'text',
  'datetime',
  'number',
  'textarea',
  'tags',
  'image',
  'toggle',
  'select',
  'list',
  'group',
  'group-list',
  'blocks',
  'reference',
  'reference-list',
]

let compiledTemplates = []

export const compile = async (_ctx, _next, { experimental }) => {
  logger.info(logText('Compiling...'))
  // FIXME: This assume it is a schema.ts file
  if (
    !fs.existsSync(tinaPath) ||
    !fs.existsSync(path.join(tinaPath, 'schema.ts'))
  ) {
    logger.info(
      dangerText(`
      .tina/schema.ts not found, Creating one for you...
      See Documentation: https://tina.io/docs/tina-cloud/cli/#getting-started"
      `)
    )
    const file = path.join(tinaPath, 'schema.ts')
    // Ensure there is a .tina/schema.ts file
    await fs.ensureFile(file)
    // Write a basic schema to it
    await fs.writeFile(file, defaultSchema)
  }
  await fs.remove(tinaTempPath)
  await fs.remove(tinaConfigPath)
  await transpile(tinaPath, tinaTempPath)
  Object.keys(require.cache).map((key) => {
    if (key.startsWith(tinaTempPath)) {
      delete require.cache[require.resolve(key)]
    }
  })

  const schemaFunc = require(path.join(tinaTempPath, 'schema.js'))

  if (experimental) {
    const schemaObject: TinaCloudSchema = schemaFunc.default
    await fs.outputFile(
      path.join(tinaConfigPath, 'schema.json'),
      JSON.stringify(schemaObject, null, 2)
    )
    await fs.remove(tinaTempPath)
  } else {
    const schemaObject: TinaCloudSchema = schemaFunc.default.config
    await compileInner(schemaObject)
    compiledTemplates = []
  }
}

const regexMessageFunc = (message) =>
  `Field "${message.path}" with value "${message.value}" must match ${message.regex}. For example - "my-title" is invalid, use "myTitle" or "my_title instead`

export const compileInner = async (schemaObject: TinaCloudSchema) => {
  const collections = await Promise.all(
    schemaObject.collections.map(async (collection) => {
      // TODO: fs.exists is @deprecated — since v1.0.0 Use fs.stat() or fs.access() instea
      // @ts-ignore
      const isValidPath = await fs.exists(collection.path)
      // @ts-ignore
      if (!isValidPath) {
        logger.info(
          dangerText(
            `Collection '${collection.name}', path '${collection.path}' not found, check that path exists on your filesystem`
          )
        )
      }
      return collection
    })
  )

  const sectionOutput = {
    // ...schemaObject,
    sections: collections.map((collection) => {
      return {
        ...collection,
        type: 'directory',
        create: 'documents',
        match: '**/*.md',
        new_doc_ext: 'md',
        templates: collection.templates.map((template) => template.name),
      }
    }),
  }
  const schemaString = '---\n' + jsyaml.dump(sectionOutput)
  await fs.outputFile(
    // TODO: this should probably not be a hard coded temp as it will run into issues if the users path as the word "temp"
    path.join(tinaTempPath.replace('temp', 'config'), 'settings.yml'),
    schemaString
  )
  await Promise.all(
    collections.map(
      async (collection) =>
        await Promise.all(
          collection.templates.map(async (definition) => {
            return buildTemplate(definition, schemaObject)
          })
        )
    )
  )
  logger.info(`Tina config ======> ${successText(tinaConfigPath)}`)
  await fs.remove(tinaTempPath)
  logger.info(logText('Done Compiling...'))
}

const transpile = async (projectDir, tempDir) => {
  logger.info(logText('Transpiling...'))
  // Make sure that post paths are posix (unix paths). This is necessary on windows.
  const posixProjectDir = normalize(projectDir)
  const posixTempDir = normalize(tempDir)

  return Promise.all(
    glob
      // We will replaces \\ with / as required by docs see: https://github.com/mrmlnc/fast-glob#how-to-write-patterns-on-windows
      .sync(path.join(projectDir, '**', '*.ts').replace(/\\/g, '/'), {
        ignore: [
          path
            .join(projectDir, '__generated__', '**', '*.ts')
            .replace(/\\/g, '/'),
        ],
      })
      .map(async function (file) {
        const fullPath = path.resolve(file)

        const contents = await fs.readFileSync(fullPath).toString()
        const newContent = ts.transpile(contents)
        const newPath = file
          .replace(posixProjectDir, posixTempDir)
          .replace('.ts', '.js')
        await fs.outputFile(newPath, newContent)
        return true
      })
  )
}
type validationMessage = {
  message: string
}
class ValidationError extends Error {
  public validationMessage: validationMessage
  constructor(validationMessage: validationMessage, ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError)
    }

    this.name = 'ValidationError'
    this.validationMessage = validationMessage
  }
}

export const unstable_defineSchema = (
  config: unstable_TinaCloudSchema<false>
) => {
  return config
}

export const defineSchema = (config: TinaCloudSchema) => {
  assertShape<TinaCloudSettings>(config, (yup) => {
    return yup.object({
      collections: yup
        .array()
        .of(
          yup.object({
            label: yup.string().required(),
            path: yup.string().required(),
            name: yup
              .string()
              .required()
              .matches(/^[_a-zA-Z][_a-zA-Z0-9]*$/, {
                message: regexMessageFunc,
              }),
          })
        )
        .min(1, (message) => `${message.path} must have at least 1 item`)
        .required(),
    })
  })

  yup.addMethod(yup.array, 'oneOfSchemas', function (schemas) {
    return this.test('one-of-schemas', function (items, context) {
      if (typeof items === 'undefined') {
        return
      }

      try {
        return items.every((item) => {
          return schemas.some((schema, index) => {
            if (schema.isValidSync(item, { strict: true })) {
              return true
            } else {
              if (item.type) {
                const isAType = yup
                  .string()
                  .oneOf(types)
                  .required()
                  .isValidSync(item.type, { strict: true })

                if (!isAType) {
                  throw new ValidationError({
                    message: `at path ${
                      context.path
                    } \`type\` must be one of:\n\t${types.join(
                      ', '
                    )}\nbut received \`${item.type}\``,
                  })
                } else {
                  const schema = schemaMap[item.type]

                  let error = ''
                  if (!schema) {
                    // logger.info("no schema validate", item.type);
                  } else {
                    try {
                      schema.validateSync(item)
                    } catch (e) {
                      error = e.errors.join('\n')
                      throw new ValidationError({
                        message: `Not all items in ${context.path} match one of the allowed schemas:\n\t${error}`,
                      })
                    }
                  }
                }
              }

              return false
            }
          })
        })
      } catch (e) {
        if (e instanceof ValidationError) {
          return context.createError(e.validationMessage)
        } else {
          throw e
        }
      }
    })
  })

  const baseSchema = yup.object({
    label: yup.string().required(),
    name: yup
      .string()
      .required()
      .matches(/^[_a-zA-Z][_a-zA-Z0-9]*$/, {
        message: regexMessageFunc,
      }),
    description: yup.string(),
  })

  const TextSchema = baseSchema.label('text').shape({
    type: yup
      .string()
      .matches(/^text$/)
      .required(),
  })

  const DateTimeSchema = baseSchema.label('datetime').shape({
    type: yup
      .string()
      .matches(/^datetime$/)
      .required(),
    dateFormat: yup.string().required(),
    timeFormat: yup.string(),
  })

  const ToggleSchema = baseSchema.label('toggle').shape({
    type: yup
      .string()
      .matches(/^toggle$/)
      .required(),
  })

  const ImageSchema = baseSchema.label('image').shape({
    type: yup
      .string()
      .matches(/^image$/)
      .required(),
  })

  const NumberSchema = baseSchema.label('number').shape({
    type: yup
      .string()
      .matches(/^number$/)
      .required(),
  })
  const TextAreaSchema = baseSchema.label('textarea').shape({
    type: yup
      .string()
      .matches(/^textarea$/)
      .required(),
  })
  const TagsSchema = baseSchema.label('tags').shape({
    type: yup
      .string()
      .matches(/^tags$/)
      .required(),
  })
  const SelectSchema = baseSchema.label('select').shape({
    type: yup
      .string()
      .matches(/^select$/)
      .required(),
    // options: yup.array().min(1).of(yup.string()).required(),
    options: yup.array().min(1).required(),
  })
  const ListSchema = baseSchema.label('list').shape({
    type: yup
      .string()
      .matches(/^list$/)
      .required(),
  })
  const GroupSchema = baseSchema.label('group').shape({
    type: yup
      .string()
      .matches(/^group$/)
      .required(),
    fields: yup.lazy(() =>
      yup
        .array()
        .min(1, (message) => `${message.path} must have at least 1 item`)
        // @ts-ignore custom method to mimic oneOf for objects https://github.com/jquense/yup/issues/69#issuecomment-496814887
        .oneOfSchemas(FieldSchemas)
        .required()
    ),
  })
  const GroupListSchema = baseSchema.label('group-list').shape({
    type: yup
      .string()
      .matches(/^group-list$/)
      .required(),
    fields: yup.lazy(() =>
      yup
        .array()
        .min(1, (message) => `${message.path} must have at least 1 item`)
        // @ts-ignore custom method to mimic oneOf for objects https://github.com/jquense/yup/issues/69#issuecomment-496814887
        .oneOfSchemas(FieldSchemas)
        .required()
    ),
  })
  const ReferenceSchema = baseSchema.label('reference').shape({
    type: yup
      .string()
      .matches(/^reference$/)
      .required(),
    collection: yup
      .string()
      .oneOf(config.collections.map((collection) => collection.name))
      .required(),
  })
  const ReferenceListSchema = baseSchema.label('reference-list').shape({
    type: yup
      .string()
      .matches(/^reference-list$/)
      .required(),
    collection: yup
      .string()
      .oneOf(
        config.collections.map((collection) => collection.name),
        (message) =>
          `${message.path} must be one of the following values: ${message.values}, but instead received: ${message.value}`
      )
      .required(),
  })

  const BlocksSchema = baseSchema.label('blocks').shape({
    type: yup
      .string()
      .matches(/^blocks$/)
      .required(),
    templates: yup.lazy(() =>
      yup
        .array()
        .min(1, (message) => `${message.path} must have at least 1 item`)
        .of(TemplateSchema)
        .required('templates is a required field')
    ),
  })
  let schemaMap = {
    text: TextSchema,
    datetime: DateTimeSchema,
    textarea: TextAreaSchema,
    select: SelectSchema,
    list: ListSchema,
    image: ImageSchema,
    group: GroupSchema,
    'group-list': GroupListSchema,
    reference: ReferenceSchema,
    'reference-list': ReferenceListSchema,
    blocks: BlocksSchema,
  }
  var FieldSchemas = [
    TextSchema,
    DateTimeSchema,
    TextAreaSchema,
    SelectSchema,
    ListSchema,
    NumberSchema,
    TagsSchema,
    ToggleSchema,
    ImageSchema,
    BlocksSchema,
    // FIXME: for some reason these mess up the blocks test if they're listed before it
    GroupSchema,
    GroupListSchema,
    ReferenceSchema,
    ReferenceListSchema,
  ]

  const TemplateSchema = yup.object({
    label: yup.string().required(),
    name: yup
      .string()
      .required()
      .matches(/^[_a-zA-Z][_a-zA-Z0-9]*$/, {
        message: regexMessageFunc,
      }),
    fields: yup
      .array()
      .min(1, (message) => `${message.path} must have at least 1 item`)
      // @ts-ignore custom method to mimic oneOf for objects https://github.com/jquense/yup/issues/69#issuecomment-496814887
      .oneOfSchemas(FieldSchemas)
      .required(),
  })
  assertShape<TinaCloudSettings>(config, (yup) =>
    yup.object({
      collections: yup
        .array()
        .min(1, (message) => `${message.path} must have at least 1 item`)
        .of(
          yup.object({
            label: yup.string().required(),
            path: yup.string().required(),
            name: yup.string().required(),
            templates: yup
              .array()
              .min(1, (message) => `${message.path} must have at least 1 item`)
              .of(TemplateSchema)
              .required('templates is a required field'),
          })
        )
        .required('collections is a required field'),
    })
  )
  return { _definitionType: 'schema', config }
}

export function assertShape<T extends object>(
  value: unknown,
  yupSchema: (args: typeof yup) => yup.AnySchema<unknown, unknown>
): asserts value is T {
  const shape = yupSchema(yup)
  try {
    shape.validateSync(value)
  } catch (e) {
    throw new Error(
      `There were some issues when compiling your schema:\n${dangerText(
        e.errors.join('\n')
      )}`
    )
  }
}

export interface TinaCloudSchema {
  collections: TinaCloudCollection[]
}
export interface TinaCloudSettings {
  collections: TinaCloudCollection[]
}

/**
 * @deprecated use `TinaCloudCollection` instead
 */
export type TinaCloudSection = TinaCloudCollection
export interface TinaCloudCollection {
  path: string
  name: string
  label: string
  format?: 'json' | 'md'
  templates: TinaCloudTemplate[]
}

export interface TinaCloudTemplate {
  label: string
  name: string
  fields: TinaField[]
}

export type TinaField =
  | TextField
  | DateTimeField
  | NumberField
  | TextareaField
  | SelectField
  | GroupField
  | ImageField
  | GroupListField
  | ListField
  | ToggleField
  | TagsField
  | BlocksField
  | Reference
  | ReferenceList

interface TinaBaseField {
  name: string
  label: string
  description?: string
}

interface TextField extends TinaBaseField {
  type: 'text'
}

interface DateTimeField extends TinaBaseField {
  type: 'datetime'
  dateFormat: string
  timeFormat?: string
}

interface NumberField extends TinaBaseField {
  type: 'number'
}

interface TextareaField extends TinaBaseField {
  type: 'textarea'
}

interface SelectField extends TinaBaseField {
  type: 'select'
  options: ({ label: string; value: string } | string)[]
}

interface ImageField extends TinaBaseField {
  type: 'image'
}

interface GroupField extends TinaBaseField {
  type: 'group'
  fields: TinaField[]
}

interface GroupListField extends TinaBaseField {
  type: 'group-list'
  fields: TinaField[]
}

interface ListField extends TinaBaseField {
  type: 'list'
  field: {
    component: 'text' | 'textarea' | 'number' | 'select'
  }
}
interface ToggleField extends TinaBaseField {
  type: 'toggle'
}

interface TagsField extends TinaBaseField {
  type: 'tags'
}

interface BlocksField extends TinaBaseField {
  type: 'blocks'
  templates: TinaCloudTemplate[]
}

interface Reference extends TinaBaseField {
  type: 'reference'
  collection: string
}

interface ReferenceList extends TinaBaseField {
  type: 'reference-list'
  collection: string
}
