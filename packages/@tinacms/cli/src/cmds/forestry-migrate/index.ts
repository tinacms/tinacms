import fs from 'fs-extra'
import path from 'path'
import yaml from 'js-yaml'
import minimatch from 'minimatch'
import { parseFile, stringifyFile } from '@tinacms/graphql'
import type { Collection, TinaField, UITemplate } from '@tinacms/schema-tools'
import { getFieldsFromTemplates, parseSections } from './util'
import { logger } from '../../logger'
import { warnText } from '../../utils/theme'

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
const transformForestryMatchToTinaMatch = (match: string) => {
  const newMatch = match
    // remove white space
    .replace(' ', '')
    // replace all common extensions with nothing
    .replace(/\.?(mdx|md|json|yaml|yml|toml)/g, '')
    // replaces everything after the first . with nothing
    ?.replace(/\..*$/g, '')
    // remove {} if there is any left
    ?.replace('{}', '')

  if (match !== newMatch) {
    // TODO: add link to docs
    logger.warn(`Warning: Match ${match} was transformed to ${newMatch}`)
  }

  return newMatch
}
type Ext = 'mdx' | 'md' | 'json' | 'yaml' | 'yml' | 'toml'

function checkExt(ext: string): Ext | false {
  const extReal = ext.replace('.', '')
  if (['mdx', 'md', 'json', 'yaml', 'yml', 'toml'].includes(extReal)) {
    return extReal as Ext
  } else {
    return false
  }
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
    { fields: TinaField[]; templateObj: any }
  >()
  const proms = allTemplates.map(async (tem) => {
    try {
      const { fields, templateObj } = getFieldsFromTemplates({
        tem,
        rootPath,
      })
      templateMap.set(tem, { fields, templateObj })
    } catch (e) {
      logger.log(`Error parsing template frontmatter template', tem + '.yml'`)
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
  const collections: Collection[] = []

  const sections = forestrySchema.sections

  for (let index = 0; index < sections.length; index++) {
    const section = sections[index]
    // TODO: What should we do with read only sections?
    if (section.read_only) return

    const baseCollection: Omit<Collection, 'fields' | 'templates'> = {
      label: section.label,
      name: stringifyLabel(section.label),
      path: section.path,
    }
    // Add include and exclude if they exist
    if (section.match) {
      baseCollection.match = {
        ...(baseCollection?.match || {}),
        include: transformForestryMatchToTinaMatch(section.match),
      }
    }
    if (section.exclude) {
      baseCollection.match = {
        ...(baseCollection?.match || {}),
        exclude: transformForestryMatchToTinaMatch(section.exclude),
      }
    }
    if (section.type === 'directory') {
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
          ui?: UITemplate
          fields: TinaField[]
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
        const c: Collection = {
          ...baseCollection,
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
        const fields: TinaField[] = [BODY_FIELD]

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
                logger.log('Error updating file', page)
              }
            })
          } catch (e) {
            logger.log('Error parsing template ', tem)
            console.error(e)
          }
        })
        const c: Collection = {
          ...baseCollection,
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
    } else if (section.type === 'document') {
      const filePath = section.path
      const extname = path.extname(filePath)
      const fileName = path.basename(filePath, extname)
      const dir = path.dirname(filePath)
      const ext = checkExt(extname)
      if (ext) {
        const fields: TinaField[] = []
        if (ext === 'md' || ext === 'mdx') {
          fields.push(BODY_FIELD)
        }
        // Go though all templates
        for (let currentTemplateName of templateMap.keys()) {
          const { templateObj, fields: additionalFields } =
            templateMap.get(currentTemplateName)
          const pages: string[] = templateObj?.pages || []

          // find the template that has the current "path" in its pages
          if (pages.includes(section.path)) {
            fields.push(...additionalFields)
            break
          }
        }

        // if we don't find any fields, add a dummy field
        if (fields.length === 0) {
          fields.push({
            name: 'dummy',
            label: 'Dummy field',
            type: 'string',
            description:
              'This is a dummy field, please replace it with the fields you want to edit. See https://tina.io/docs/schema/ for more info',
          })
          logger.warn(
            warnText(
              `No fields found for ${section.path}. Please add the fields you want to edit to the ${section.label} collection in the config file.`
            )
          )
        }

        collections.push({
          ...baseCollection,
          path: dir,
          format: ext,
          ui: {
            allowedActions: {
              create: false,
              delete: false,
            },
          },
          match: {
            include: fileName,
          },
          fields,
        })
      } else {
        logger.log(
          warnText(
            `Error: document section has an unsupported file extension: ${extname} in ${section.path}`
          )
        )
      }
    }
  }
  return collections
}
