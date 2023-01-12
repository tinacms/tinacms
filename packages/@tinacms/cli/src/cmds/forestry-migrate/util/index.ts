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

import fs from 'fs-extra'
import path from 'path'
import yaml from 'js-yaml'
import z from 'zod'
import type { TinaFieldInner } from '@tinacms/schema-tools'
import { logger } from '../../../logger'

export const stringifyName = (name: string, template: string) => {
  const testRegex = /^[a-zA-Z0-9_]*$/
  const updateRegex = /[^a-zA-Z0-9]/g

  if (testRegex.test(name)) {
    return name
  } else {
    const newName = name.replace(updateRegex, '_')
    console.log(
      `Name, "${name}" used in Frontmatter template ${template} must be alphanumeric and can only contain underscores.\n ${name} will be updated to ${newName} in the CMS if you wish to edit attribute ${name} you will have to update your frontmatter and code to use ${newName} instead.`
    )

    // replace everything that is not alphanumeric or underscore with an underscore
    return newName
  }
}
// A zod schema for the information we need from the .forestry/settings.yml file
const forestryConfigSchema = z.object({
  sections: z.array(
    z.object({
      type: z.union([
        z.literal('directory'),
        z.literal('document'),
        z.literal('heading'),
        z.literal('jekyll-pages'),
        z.literal('jekyll-posts'),
      ]),
      label: z.string(),
      path: z.string().optional().nullable(),
      match: z.string().optional().nullable(),
      exclude: z.string().optional().nullable(),
      create: z
        .union([z.literal('all'), z.literal('documents'), z.literal('none')])
        .optional(),
      templates: z.array(z.string()).optional().nullable(),
      new_doc_ext: z.string().optional().nullable(),
      read_only: z.boolean().optional().nullable(),
    })
  ),
})

const forestryFieldWithoutField = z.object({
  // TODO: maybe better type this?
  type: z.union([
    z.literal('text'),
    z.literal('datetime'),
    z.literal('list'),
    z.literal('file'),
    z.literal('image_gallery'),
    z.literal('textarea'),
    z.literal('tag_list'),
    z.literal('number'),
    z.literal('boolean'),
    z.literal('field_group'),
    z.literal('field_group_list'),
    z.literal('select'),
    z.literal('include'),
    z.literal('blocks'),
    z.literal('color'),
  ]),
  name: z.string(),
  label: z.string(),
  default: z.any().optional(),
  config: z
    .object({
      // min and max are used for lists
      min: z.number().optional().nullable(),
      max: z.number().optional().nullable(),
      required: z.boolean().optional().nullable(),
      use_select: z.boolean().optional().nullable(),
      date_format: z.string().optional().nullable(),
      time_format: z.string().optional().nullable(),
      options: z.array(z.string()).optional().nullable(),
      source: z
        .object({
          type: z
            .union([
              z.literal('custom'),
              z.literal('pages'),
              z.literal('documents'),
              z.literal('simple'),
              // TODO: I want to ignore this key if its invalid
              z.string(),
            ])
            .optional()
            .nullable(),
          section: z.string().optional().nullable(),
        })
        .optional(),
    })
    .optional(),
})
type ForestryFieldWithoutFieldType = z.infer<typeof forestryFieldWithoutField>

interface ForestryFieldType extends ForestryFieldWithoutFieldType {
  fields?: ForestryFieldType[]
}

const forestryField: z.ZodType<ForestryFieldType> = z.lazy(() =>
  forestryFieldWithoutField.extend({
    fields: z.array(forestryField).optional(),
  })
)

const FrontmatterTemplateSchema = z.object({
  label: z.string(),
  hide_body: z.boolean().optional(),
  fields: z.array(forestryField).optional(),
})

// Takes a field from forestry and converts it to a Tina field
export const transformForestryFieldsToTinaFields = ({
  fields,
  collection,
}: {
  fields: z.infer<typeof FrontmatterTemplateSchema>['fields']
  collection: string
}) => {
  const tinaFields: TinaFieldInner<false>[] = []

  fields?.forEach((forestryField) => {
    if (forestryField.name === 'menu') {
      console.log(
        `skipping menu field in ${collection} since TinaCMS does not support Hugo or Jekyll menu fields`
      )
      return
    }
    let field: TinaFieldInner<false>
    switch (forestryField.type) {
      // Single filed types
      case 'text':
        field = {
          type: 'string',
          name: stringifyName(forestryField.name, ''),
          label: forestryField.label,
        }
        break
      case 'textarea':
        field = {
          type: 'string',
          name: stringifyName(forestryField.name, ''),
          label: forestryField.label,
          ui: {
            component: 'textarea',
          },
        }
        break
      case 'datetime':
        field = {
          type: forestryField.type,
          name: stringifyName(forestryField.name, ''),
          label: forestryField.label,
        }
        break
      case 'number':
        field = {
          type: 'number',
          name: stringifyName(forestryField.name, ''),
          label: forestryField.label,
        }
        break
      case 'boolean':
        field = {
          type: 'boolean',
          name: stringifyName(forestryField.name, ''),
          label: forestryField.label,
        }
        break
      case 'color':
        field = {
          type: 'string',
          name: stringifyName(forestryField.name, ''),
          label: forestryField.label,
          ui: {
            component: 'color',
          },
        }
        break
      case 'file':
        field = {
          type: 'image',
          name: stringifyName(forestryField.name || 'image', ''),
          label: forestryField.label,
        }
        break
      case 'select':
        if (forestryField.config?.options) {
          field = {
            type: 'string',
            name: stringifyName(forestryField.name, ''),
            label: forestryField.label,
            options: forestryField.config?.options || [],
          }
        } else {
          logger.info(
            `Warning in collection ${collection}. "select" field migration has only been implemented for simple select. Other versions of select have not been implemented yet. To make your \`${forestryField.name}\` field work, you will need to manually add it to your schema.`
          )
        }

        // Forestry has lots of options for 'select' we are only going to support the most basic for now.
        // if (forestryField.config?.source?.type === 'pages') {
        //   // TODO: this collection may or may not exist
        //   field = {
        //     type: 'reference',
        //     name: forestryField.name,
        //     label: forestryField.label,
        //     collections: [forestryField.config?.source?.section].filter(
        //       Boolean
        //     ),
        //   }
        break

      // List Types
      case 'list':
        field = {
          type: 'string',
          name: stringifyName(forestryField.name, ''),
          label: forestryField.label,
          list: true,
        }
        if (forestryField.config?.options) {
          field.options = forestryField.config.options
        }
        break
      case 'tag_list':
        field = {
          type: 'string',
          name: stringifyName(forestryField.name, ''),
          label: forestryField.label,
          list: true,
          ui: {
            component: 'tags',
          },
        }
        break

      //   case 'list':
      // TODO: make list work

      // TODO habnde options
      // EX:
      // - type: list
      //   name: categories
      //   label: Categories
      //   config:
      //     use_select: true
      //     source:
      //       type: simple
      //     options:
      //     - CMS
      //     - Jekyll
      //     - Hugo
      //     - Static Sites
      //     - Static Site Generators
      //     - Company
      // break

      // Object (Group) types
      case 'field_group':
        field = {
          type: 'object',
          name: stringifyName(forestryField.name, ''),
          label: forestryField.label,
          fields: transformForestryFieldsToTinaFields({
            fields: forestryField.fields,
            collection,
          }),
        }
        break
      case 'field_group_list':
        field = {
          type: 'object',
          name: stringifyName(forestryField.name, ''),
          label: forestryField.label,
          list: true,
          fields: transformForestryFieldsToTinaFields({
            fields: forestryField.fields,
            collection,
          }),
        }
        break

      // Unsupported types
      case 'image_gallery':
      case 'include':
        console.log(
          `Unsupported field type: ${forestryField.type}, in collection ${collection}. This will not be added to the schema.`
        )
        break
      default:
        logger.info(
          `Warning in collection ${collection}. "${forestryField.type}" migration has not been implemented yet. To make your \`${forestryField.name}\` field work, you will need to manually add it to your schema.`
        )
    }
    if (field) {
      if (forestryField.config?.required) {
        // @ts-ignore
        field = { ...field, required: true }
      }

      tinaFields.push(field)
    }
  })
  return tinaFields
}

export const getFieldsFromTemplates: (_args: {
  tem: string
  collection: string
  rootPath: string
}) => { fields: TinaFieldInner<false>[]; templateObj: any } = ({
  tem,
  rootPath,
  collection,
}) => {
  const templatePath = path.join(
    rootPath,
    '.forestry',
    'front_matter',
    'templates',
    `${tem}.yml`
  )
  let templateString = ''
  try {
    templateString = fs.readFileSync(templatePath).toString()
  } catch {
    throw new Error(
      `Could not find template ${tem} at ${templatePath}\n\n This will require manual migration.`
    )
  }

  const templateObj = yaml.load(templateString)
  const template = parseTemplates({ val: templateObj })
  const fields = transformForestryFieldsToTinaFields({
    fields: template.fields,
    collection,
  })
  return { fields, templateObj }
}

export const parseTemplates = ({ val }: { val: unknown }) => {
  const template = FrontmatterTemplateSchema.parse(val)
  return template
}

export const hasForestryConfig = async ({ rootPath }: { rootPath: string }) => {
  const forestryPath = path.join(rootPath, '.forestry', 'settings.yml')
  const exists = await fs.pathExists(forestryPath)
  return {
    path: forestryPath,
    exists: exists,
  }
}

export const parseSections = ({ val }: { val: unknown }) => {
  const schema = forestryConfigSchema.parse(val)
  return schema
}
