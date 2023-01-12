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
import minimatch from 'minimatch'
import { parseFile, stringifyFile } from '@tinacms/graphql'
import type {
  TinaCloudCollection,
  UICollection,
  TinaFieldInner,
} from '@tinacms/schema-tools'
import { getFieldsFromTemplates, parseSections } from './util'

const BODY_FIELD = {
  // This is the body field
  type: 'rich-text' as const,
  name: 'body',
  label: 'Body of Document',
  description: 'This is the markdown body',
  isBody: true,
}

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
    try {
      const { fields, templateObj } = getFieldsFromTemplates({
        tem,
        collection: stringifyLabel(tem),
        rootPath,
      })
      templateMap.set(tem, { fields, templateObj })
    } catch (e) {
      console.log('Error parsing template frontmatter template', tem + '.yml')
      console.error(e)
      templateMap.set(tem, { fields: [], templateObj: {} })
    }
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

  const sections = forestrySchema.sections

  for (let index = 0; index < sections.length; index++) {
    const section = sections[index]
    // TODO: What should we do with read only sections?
    if (section.read_only) return

    switch (section.type) {
      case 'directory':
        const forestryTemplates = section?.templates || []

        // If the section has no templates and has `create: all`
        if (forestryTemplates.length === 0 && section.create === 'all') {
          // For all template
          for (let templateKey of templateMap.keys()) {
            // get the shape of the template
            const { templateObj } = templateMap.get(templateKey)
            const pages: undefined | string[] = templateObj?.pages
            // if has pages see if there is I page that matches the current section
            if (pages) {
              if (
                pages.some((page) =>
                  minimatch(page, section.path + '/' + section.match)
                )
              ) {
                forestryTemplates.push(templateKey)
              }
            }
          }
        }
        if ((forestryTemplates?.length || 0) > 1) {
          // deal with templates
          const templates: {
            label: string
            name: string
            ui?: UICollection
            fields: TinaFieldInner<false>[]
          }[] = []
          forestryTemplates.forEach((tem) => {
            try {
              // Add the template to the collection with its fields and the body field
              const { fields, templateObj } = templateMap.get(tem)
              templates.push({
                fields: [BODY_FIELD, ...fields],
                label: tem,
                name: stringifyLabel(tem),
              })

              // Go through all the pages in the template and update  the content to contain _template: ${templateName}
              templateObj?.pages?.forEach((page) => {
                // update the data in page to have _template: tem
                try {
                  const filePath = path.join(rootPath, page)
                  const extname = path.extname(filePath)
                  const fileContent = fs.readFileSync(filePath).toString()
                  const content = parseFile(fileContent, extname, (yup) =>
                    yup.object({})
                  )
                  const newContent = {
                    _template: stringifyLabel(tem),
                    ...content,
                  }
                  fs.writeFileSync(
                    filePath,
                    stringifyFile(newContent, extname, true)
                  )
                } catch (error) {
                  console.log('Error updating file', page)
                }
              })
            } catch (e) {
              console.log('Error parsing template ', tem)
              console.error(e)
            }
          })
          // Add the collection to the list of collections with its templates
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
          const fields: TinaFieldInner<false>[] = [BODY_FIELD]

          // This is a collection with fields
          forestryTemplates?.forEach((tem) => {
            try {
              const { fields: additionalFields, templateObj } =
                templateMap.get(tem)
              fields.push(...additionalFields)
              // Go through all the pages in the template and update  the content to contain _template: ${templateName}
              templateObj?.pages?.forEach((page) => {
                // update the data in page to have _template: tem
                try {
                  const filePath = path.join(rootPath, page)
                  const extname = path.extname(filePath)
                  const fileContent = fs.readFileSync(filePath).toString()
                  const content = parseFile(fileContent, extname, (yup) =>
                    yup.object({})
                  )
                  const newContent = {
                    _template: stringifyLabel(tem),
                    ...content,
                  }
                  fs.writeFileSync(
                    filePath,
                    stringifyFile(newContent, extname, true)
                  )
                } catch (error) {
                  console.log('Error updating file', page)
                }
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
      case 'document':
        console.log(
          `Single Document are not supported in TinaCMS yet. Skipping section ${section.label} (${section.path})`
        )
        break

      // const fields: TinaFieldInner<false>[] = [BODY_FIELD]
      // // Go though all templates
      // for (let currentTemplateName of templateMap.keys()) {
      //   const { templateObj, fields: additionalFields } =
      //     templateMap.get(currentTemplateName)
      //   const pages: string[] = templateObj?.pages || []

      //   // find the template that has the current "path" in its pages
      //   if (pages.includes(section.path)) {
      //     fields.push(...additionalFields)
      //     break
      //   }
      // }

      // const dir = path.dirname(section.path)

      // const c: TinaCloudCollection<false> = {
      //   label: section.label,
      //   name: stringifyLabel(section.label),
      //   path: dir,
      //   ui: {
      //     allowedActions: {
      //       create: false,
      //       delete: false,
      //     },
      //   },
      //   fields,
      // }
      // collections.push(c)
      // break
    }
  }
  return collections
}
