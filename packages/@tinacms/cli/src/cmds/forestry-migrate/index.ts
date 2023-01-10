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

import { parseFile, stringifyFile } from '@tinacms/graphql'
import type {
  TinaCloudCollection,
  UICollection,
  TinaFieldInner,
} from '@tinacms/schema-tools'
import { getFieldsFromTemplates, parseSections } from './util'

const stringifyLabel = (label: string) => {
  return label.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
}

export const generateAllCollections = async ({
  rootPath,
}: {
  rootPath: string
}) => {
  const allTemplates = (
    await fs.readdir(
      path.join(rootPath, '.forestry', 'front_matter', 'templates')
    )
  ).map((tem) => path.basename(tem, '.yml'))
  const templateMap = new Map<
    string,
    { fields: TinaFieldInner<false>[]; templateObj: any }
  >()
  const proms = allTemplates.map(async (tem) => {
    const { fields, templateObj } = getFieldsFromTemplates({
      tem,
      collection: stringifyLabel(tem),
      rootPath,
    })

    templateMap.set(tem, { fields, templateObj })
  })
  await Promise.all(proms)
  return templateMap
}

export const generateCollections = async ({
  forestryPath,
  rootPath,
}: {
  forestryPath: string
  rootPath: string
}) => {
  const templateMap = await generateAllCollections({ rootPath })

  const forestryConfig = await fs.readFile(forestryPath)
  const forestryYaml = yaml.load(forestryConfig.toString())

  const forestrySchema = parseSections({ val: forestryYaml })
  const collections: TinaCloudCollection<false>[] = []

  forestrySchema.sections?.forEach((section) => {
    if (section.read_only) return

    switch (section.type) {
      case 'directory':
        const fields: TinaFieldInner<false>[] = [
          {
            // This is the body field
            type: 'rich-text' as const,
            name: 'body',
            label: 'Body of Document',
            description: 'This is the markdown body',
            isBody: true,
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
              const { fields: otherFields, templateObj } = templateMap.get(tem)
              fields.push(...otherFields)
              templates.push({ fields, label: tem, name: stringifyLabel(tem) })

              templateObj?.pages?.forEach((page) => {
                // update the data in page to have _template: tem
                const filePath = path.join(rootPath, page.path)
                const extname = path.extname(filePath)
                const fileContent = fs.readFileSync(filePath).toString()
                const content = parseFile(fileContent, extname, (yup) =>
                  yup.object({})
                )
                const newContent = { _template: tem, ...content }
                fs.writeFileSync(
                  filePath,
                  stringifyFile(newContent, extname, true)
                )
              })
            } catch (e) {
              console.log('Error parsing template ', tem)
              console.error(e)
            }
          })
          const c: TinaCloudCollection<false> = {
            label: section.label,
            name: stringifyLabel(section.label),
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
              // const additionalFields = getFieldsFromTemplates({
              //   tem,
              //   rootPath,
              //   collection: stringifyLabel(section.label),
              // })
              const { fields: additionalFields } = templateMap.get(tem)
              fields.push(...additionalFields)
            } catch (e) {
              console.log('Error parsing template ', tem)
              console.error(e)
            }
          })
          const c: TinaCloudCollection<false> = {
            label: section.label,
            name: stringifyLabel(section.label),
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
  return collections
}
