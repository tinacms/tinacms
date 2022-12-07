import fs from 'fs-extra'
import yaml from 'js-yaml'
import type { TinaCloudCollection } from '@tinacms/schema-tools'
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
        section.templates.forEach((tem) => {
          const additionalFields = getFieldsFromTemplates({
            tem,
            rootPath: ctx.rootPath,
          })
          fields.push(...(additionalFields as any))
        })
        collections.push({
          label: section.label,
          name: section.label.toLowerCase(),
          path: section.path,
          fields: fields,
        })
        break
    }
  })

  console.log(JSON.stringify(forestrySchema, null, 2))
  console.log(JSON.stringify(collections, null, 2))
  next()
}
