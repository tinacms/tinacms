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
import yaml from 'js-yaml'
import type {
  TinaCloudCollection,
  UICollection,
  TinaFieldInner,
} from '@tinacms/schema-tools'
import { getFieldsFromTemplates, parseSections } from './util'

export const generateCollections = async ({
  forestryPath,
  rootPath,
}: {
  forestryPath: string
  rootPath: string
}) => {
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
              const fields = getFieldsFromTemplates({
                tem,
                collection: c.name,
                rootPath,
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
                rootPath,
                collection: c.name,
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
  return collections
}
