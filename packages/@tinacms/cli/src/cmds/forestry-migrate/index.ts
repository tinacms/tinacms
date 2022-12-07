import fs from 'fs-extra'
import yaml from 'js-yaml'
import type {
  TinaCloudCollection,
  UICollection,
  TinaFieldInner,
} from '@tinacms/schema-tools'
import {
  getFieldsFromTemplates,
  hasForestryConfig,
  parseSections,
} from './util'

export const forestryMigrate = async (
  ctx: any,
  next: () => void,
  _options: any
) => {
  const forestryPath = await hasForestryConfig({ rootPath: ctx.rootPath })

  ctx.hasForestryConfig = forestryPath.exists

  // if there is no forestry config, we can skip this
  if (!forestryPath.exists) {
    return next()
  }

  const forestryConfig = await fs.readFile(forestryPath.path)
  const forestryYaml = yaml.load(forestryConfig.toString())

  const forestrySchema = parseSections({ val: forestryYaml })
  const collections: TinaCloudCollection<false>[] = []

  forestrySchema.sections?.forEach((section) => {
    if (section.read_only) return

    switch (section.type) {
      case 'directory':
        const fields = [
          {
            type: 'rich-text' as const,
            name: 'body',
            label: 'Body of Document',
            description: 'This is the markdown body',
          },
        ]
        if ((section.templates?.length || 0) > 1) {
          // deal with templates
          const templates: {
            label: string
            name: string
            ui?: UICollection
            fields: TinaFieldInner<false>[]
          }[] = []
          section.templates.forEach((tem) => {
            try {
              const fields = getFieldsFromTemplates({
                tem,
                rootPath: ctx.rootPath,
              })
              templates.push({ fields, label: tem, name: tem.toLowerCase() })
            } catch (e) {
              console.log('Error parsing template ', tem)
              console.error(e)
            }
          })
          const c: TinaCloudCollection<false> = {
            label: section.label,
            name: section.label.toLowerCase(),
            path: section.path,
            templates,
          }
          if (section?.create === 'none') {
            c.ui = {
              ...c.ui,
              allowedActions: {
                create: false,
              },
            }
          }
          collections.push(c)
        } else {
          // deal with fields
          section.templates?.forEach((tem) => {
            try {
              const additionalFields = getFieldsFromTemplates({
                tem,
                rootPath: ctx.rootPath,
              })
              fields.push(...(additionalFields as any))
            } catch (e) {
              console.log('Error parsing template ', tem)
              console.error(e)
            }
          })
          const c: TinaCloudCollection<false> = {
            label: section.label,
            name: section.label.toLowerCase(),
            path: section.path,
            fields,
          }
          if (section?.create === 'none') {
            c.ui = {
              ...c.ui,
              allowedActions: {
                create: false,
              },
            }
          }
          collections.push(c)
        }
        break
    }
  })
  ctx.collections = JSON.stringify(collections, null, 2)

  // console.log(JSON.stringify(forestrySchema, null, 2))
  // console.log(JSON.stringify(collections, null, 2))
  next()
}
