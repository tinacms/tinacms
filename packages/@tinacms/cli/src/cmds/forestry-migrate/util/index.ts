/**

*/

import fs from 'fs-extra'
import path from 'path'
import yaml from 'js-yaml'
import z from 'zod'
import type { TinaField, Template } from '@tinacms/schema-tools'
import { logger } from '../../../logger'
import { warnText } from '../../../utils/theme'
import { ErrorSingleton } from './errorSingleton'
import { stringifyLabelWithField } from '..'
import { makeFieldsWithInternalCode } from './codeTransformer'

const errorSingletonInstance = ErrorSingleton.getInstance()

const NAME_TEST_REGEX = /^[a-zA-Z0-9_]*$/
const NAME_UPDATE_REGEX = /[^a-zA-Z0-9]/g

export const getTinaFieldsFromName = (name: string) => {
  if (name == 'id') {
    return { name: 'custom_id', nameOverride: 'id' }
  } else {
    if (NAME_TEST_REGEX.test(name)) {
      return { name }
    } else {
      return {
        name: name.replace(NAME_UPDATE_REGEX, '_'),
        nameOverride: name,
      }
    }
  }
}

export const stringifyTemplateName = (name: string, template: string) => {
  if (NAME_TEST_REGEX.test(name)) {
    return name
  } else {
    const newName = name.replace(NAME_UPDATE_REGEX, '_')
    errorSingletonInstance.addErrorName({ name, newName, template })
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
  template_types: z.array(z.string()).optional().nullable(),
  name: z.string(),
  label: z.string(),
  default: z.any().optional(),
  template: z.string().optional(),
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
  pathToForestryConfig,
  template,
  skipBlocks = false,
}: {
  fields: z.infer<typeof FrontmatterTemplateSchema>['fields']
  pathToForestryConfig: string
  template: string
  skipBlocks?: boolean
}) => {
  const tinaFields: TinaField[] = []

  fields?.forEach((forestryField) => {
    if (forestryField.name === 'menu') {
      logger.info(
        warnText(
          `skipping menu field template ${template}.yaml since TinaCMS does not support Hugo or Jekyll menu fields`
        )
      )
      return
    }
    let field: TinaField
    switch (forestryField.type) {
      // Single filed types
      case 'text':
        field = {
          type: 'string',
          ...getTinaFieldsFromName(forestryField.name),
          label: forestryField.label,
        }
        break
      case 'textarea':
        field = {
          type: 'string',
          ...getTinaFieldsFromName(forestryField.name),
          label: forestryField.label,
          ui: {
            component: 'textarea',
          },
        }
        break
      case 'datetime':
        field = {
          type: forestryField.type,
          ...getTinaFieldsFromName(forestryField.name),
          label: forestryField.label,
        }
        break
      case 'number':
        field = {
          type: 'number',
          ...getTinaFieldsFromName(forestryField.name),
          label: forestryField.label,
        }
        break
      case 'boolean':
        field = {
          type: 'boolean',
          ...getTinaFieldsFromName(forestryField.name),
          label: forestryField.label,
        }
        break
      case 'color':
        field = {
          type: 'string',
          ...getTinaFieldsFromName(forestryField.name),
          label: forestryField.label,
          ui: {
            component: 'color',
          },
        }
        break
      case 'file':
        field = {
          type: 'image',
          ...getTinaFieldsFromName(forestryField.name),
          label: forestryField.label,
        }
        break
      case 'image_gallery':
        field = {
          type: 'image',
          ...getTinaFieldsFromName(forestryField.name),
          label: forestryField.label,
          list: true,
        }
        break
      case 'select':
        if (forestryField.config?.options) {
          field = {
            type: 'string',
            ...getTinaFieldsFromName(forestryField.name),
            label: forestryField.label,
            options: forestryField.config?.options || [],
          }
        } else {
          logger.info(
            warnText(
              `Warning in template ${template}.yaml . "select" field migration has only been implemented for simple select. Other versions of select have not been implemented yet. To make your \`${forestryField.name}\` field work, you will need to manually add it to your schema.`
            )
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
          ...getTinaFieldsFromName(forestryField.name),
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
          ...getTinaFieldsFromName(forestryField.name),
          label: forestryField.label,
          list: true,
          ui: {
            component: 'tags',
          },
        }
        break

      // Object (Group) types
      case 'field_group':
        field = {
          type: 'object',
          ...getTinaFieldsFromName(forestryField.name),
          label: forestryField.label,
          fields: transformForestryFieldsToTinaFields({
            fields: forestryField.fields,
            pathToForestryConfig,
            template,
            skipBlocks,
          }),
        }
        break
      case 'field_group_list':
        field = {
          type: 'object',
          ...getTinaFieldsFromName(forestryField.name),
          label: forestryField.label,
          list: true,
          fields: transformForestryFieldsToTinaFields({
            fields: forestryField.fields,
            template,
            pathToForestryConfig,
            skipBlocks,
          }),
        }
        break

      case 'blocks': {
        if (skipBlocks) {
          break
        }

        const templates: Template[] = []

        forestryField?.template_types.forEach((tem) => {
          const { template } = getFieldsFromTemplates({
            tem,
            skipBlocks: true,
            pathToForestryConfig,
          })
          const fieldsString = stringifyLabelWithField(template.label)
          const t: Template = {
            // @ts-ignore
            fields: makeFieldsWithInternalCode({
              hasBody: false,
              field: fieldsString,
            }),
            label: template.label,
            name: stringifyTemplateName(tem, tem),
          }
          if (t.name != tem) {
            ;(t as any).nameOverride = tem
          }
          templates.push(t)
        })

        field = {
          type: 'object',
          list: true,
          templateKey: 'template',
          label: forestryField.label,
          ...getTinaFieldsFromName(forestryField.name),
          templates,
        }
        break
      }
      case 'include': {
        const tem = forestryField.template

        const { template } = getFieldsFromTemplates({
          tem,
          skipBlocks: true,
          pathToForestryConfig,
        })
        const fieldsString = stringifyLabelWithField(template.label)
        const field = makeFieldsWithInternalCode({
          field: fieldsString,
          hasBody: false,
          spread: true,
        })
        tinaFields.push(
          // @ts-ignore
          field
        )
        break
      }
      default:
        logger.info(
          warnText(
            `Warning in template ${template}. "${forestryField.type}" migration has not been implemented yet. To make your \`${forestryField.name}\` field work, you will need to manually add it to your schema.`
          )
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
  pathToForestryConfig: string
  skipBlocks?: boolean
}) => {
  fields: TinaField[]
  templateObj: any
  template: {
    label?: string
    hide_body?: boolean
    fields?: ForestryFieldType[]
  }
} = ({ tem, pathToForestryConfig, skipBlocks = false }) => {
  const templatePath = path.join(
    pathToForestryConfig,
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
    pathToForestryConfig,
    template: tem,
    skipBlocks,
  })
  return { fields, templateObj, template }
}

export const parseTemplates = ({ val }: { val: unknown }) => {
  const template = FrontmatterTemplateSchema.parse(val)
  return template
}

export const checkForestrySettingsPath = async ({
  forestryPath,
}: {
  forestryPath: string
}): Promise<string | undefined> => {
  const forestrySettingsPath = path.join(
    forestryPath,
    '.forestry',
    'settings.yml'
  )
  const exists = await fs.pathExists(forestrySettingsPath)
  return exists ? forestrySettingsPath : undefined
}

export const parseSections = ({ val }: { val: unknown }) => {
  const schema = forestryConfigSchema.parse(val)
  return schema
}
