import fs from 'fs-extra'
import path from 'path'
import yaml from 'js-yaml'
import z from 'zod'
import type { TinaFieldInner } from '@tinacms/schema-tools'

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
      path: z.string().optional(),
      match: z.string().optional(),
      exclude: z.string().optional(),
      create: z
        .union([z.literal('all'), z.literal('documents'), z.literal('none')])
        .optional(),
      templates: z.array(z.string()).optional(),
      new_doc_ext: z.string().optional(),
      read_only: z.boolean().optional(),
    })
  ),
})

const FrontmatterTemplateSchema = z.object({
  label: z.string(),
  hide_body: z.boolean().optional(),

  fields: z.array(
    z.object({
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
          required: z.boolean().optional(),
          use_select: z.boolean().optional(),
          date_format: z.string().optional(),
          time_format: z.string().optional(),
          options: z.array(z.string()).optional(),
        })
        .optional(),
    })
  ),
})

export const getFieldsFromTemplates = ({
  tem,
  rootPath,
}: {
  tem: string
  rootPath: string
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
  const fields: TinaFieldInner<false>[] = []
  template.fields.forEach((forestryField) => {
    let field: TinaFieldInner<false>
    switch (forestryField.type) {
      // Single filed types
      case 'text':
        field = {
          type: 'string',
          name: forestryField.name,
          label: forestryField.label,
        }
        break
      case 'textarea':
        field = {
          type: 'string',
          name: forestryField.name,
          label: forestryField.label,
          ui: {
            component: 'textarea',
          },
        }
        break
      case 'datetime':
        field = {
          type: forestryField.type,
          name: forestryField.name,
          label: forestryField.label,
        }
        break
      case 'number':
        field = {
          type: 'number',
          name: forestryField.name,
          label: forestryField.label,
        }
        break
      case 'boolean':
        field = {
          type: 'boolean',
          name: forestryField.name,
          label: forestryField.label,
        }
        break
      case 'color':
        field = {
          type: 'string',
          name: forestryField.name,
          label: forestryField.label,
          ui: {
            component: 'color',
          },
        }
        break
      case 'file':
        field = {
          type: 'image',
          name: forestryField.name || 'image',
          label: forestryField.label,
        }
        break
      case 'select':
        field = {
          type: 'string',
          name: forestryField.name,
          label: forestryField.label,
          options: forestryField.config?.options || [],
        }
      // List Types
      case 'tag_list':
        field = {
          type: 'string',
          name: forestryField.name,
          label: forestryField.label,
          list: true,
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

      // Unsupported types
      case 'image_gallery':
      case 'include':
        console.log(
          `Unsupported field type: ${forestryField.type}, in template ${tem}. This will not be added to the schema.`
        )
        break
      default:
        console.log(
          `${forestryField.type} has not been implemented yet. This will require manual migration.`
        )
    }
    if (field) {
      if (forestryField.config?.required) {
        // @ts-ignore
        field = { ...field, required: true }
      }

      fields.push(field)
    }
  })
  return fields
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
