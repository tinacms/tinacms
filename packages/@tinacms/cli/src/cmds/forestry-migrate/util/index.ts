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
      ]),
      name: z.string(),
      label: z.string(),
      // TODO: maybe better type this?
      default: z.any().optional(),
      // TODO going to skip config for now
      //   config: z.object({
      //     date_format: z.string(),
      //     export_format: z.string(),
      //     maxSize: z.number(),
      //   }),
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
  const templateString = fs.readFileSync(templatePath)
  const templateObj = yaml.load(templateString.toString())
  const template = parseTemplates({ val: templateObj })
  const fields: TinaFieldInner<false>[] = []
  template.fields.forEach((forestryField) => {
    switch (forestryField.type) {
      case 'text':
        fields.push({
          type: 'string',
          name: forestryField.name,
          label: forestryField.label,
        })
        break
      case 'textarea':
        fields.push({
          type: 'string',
          name: forestryField.name,
          label: forestryField.label,
          ui: {
            component: 'textarea',
          },
        })
        break
      case 'datetime':
        fields.push({
          type: forestryField.type,
          name: forestryField.name,
          label: forestryField.label,
        })
        break
      case 'number':
        fields.push({
          type: 'number',
          name: forestryField.name,
          label: forestryField.label,
        })
        break
      case 'boolean':
        fields.push({
          type: 'boolean',
          name: forestryField.name,
          label: forestryField.label,
        })
        break
      case 'list':
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
        break
      case 'file':
        fields.push({
          type: 'image',
          name: forestryField.name || 'image',
          label: forestryField.label,
        })
        break
      case 'image_gallery':
        console.log('image gallery not supported')
      case 'tag_list':
        fields.push({
          type: 'string',
          name: forestryField.name,
          label: forestryField.label,
          list: true,
        })
        break
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
