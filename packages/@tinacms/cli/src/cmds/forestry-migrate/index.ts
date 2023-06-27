import fs from 'fs-extra'
import path from 'path'
import yaml from 'js-yaml'
import minimatch from 'minimatch'
import { parseFile, stringifyFile } from '@tinacms/graphql'
import type { Collection, TinaField, UITemplate } from '@tinacms/schema-tools'
import { getFieldsFromTemplates, parseSections } from './util'
import { logger } from '../../logger'
import { dangerText, linkText, warnText } from '../../utils/theme'
import {
  makeTemplateFile,
  makeFieldsWithInternalCode,
} from './util/codeTransformer'

const BODY_FIELD = {
  // This is the body field
  type: 'rich-text' as const,
  name: 'body',
  label: 'Body of Document',
  description: 'This is the markdown body',
  isBody: true,
}

export const stringifyLabel = (label: string) => {
  return label.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
}
export const stringifyLabelWithField = (label: string) => {
  const labelString = stringifyLabel(label)
  return `${labelString}Fields`
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
    logger.info(
      `Info: Match ${match} was transformed to ${newMatch}. See ${linkText(
        'https://tina.io/docs/forestry/common-errors/#info-match-match-was-transformed-to-newmatch'
      )}`
    )
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

export const generateAllTemplates = async ({
  pathToForestryConfig,
}: {
  pathToForestryConfig: string
}) => {
  const allTemplates = (
    await fs.readdir(
      path.join(pathToForestryConfig, '.forestry', 'front_matter', 'templates')
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
        pathToForestryConfig,
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

const generateCollectionFromForestrySection = (args: {
  frontMatterFormat?: 'yaml' | 'toml' | 'json'
  section: {
    templates?: string[]
    label?: string
    path?: string
    match?: string
    type?:
      | 'directory'
      | 'document'
      | 'heading'
      | 'jekyll-pages'
      | 'jekyll-posts'
    exclude?: string
    create?: 'all' | 'documents' | 'none'
    new_doc_ext?: string
    read_only?: boolean
  }
  templateMap: Map<
    string,
    {
      fields: TinaField[]
      templateObj: any
    }
  >
}) => {
  const { section, templateMap } = args
  // TODO: What should we do with read only sections?
  if (section.read_only) return

  // find the document format
  let format: Ext = 'md'
  if (section.new_doc_ext) {
    const ext = checkExt(section.new_doc_ext)
    if (ext) {
      format = ext
    }
  }

  const baseCollection: Omit<Collection, 'fields' | 'templates'> = {
    format: format,
    label: section.label,
    name: stringifyLabel(section.label),
    path: section.path || '/',
  }
  if (args.frontMatterFormat) {
    baseCollection.frontmatterFormat = args.frontMatterFormat
    if (args.frontMatterFormat === 'toml') {
      baseCollection.frontmatterDelimiters = '+++'
    }
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
    if (
      !section?.path ||
      section.path === '/' ||
      section.path === './' ||
      section.path === '.'
    ) {
      logger.log(
        warnText(
          `Warning: Section ${
            section.label
          } is using a Root Path. Currently, Tina Does not support Root paths see ${linkText(
            'https://github.com/tinacms/tinacms/issues/3768'
          )} for more updates on this issue.`
        )
      )
      return
    }
    const forestryTemplates = section?.templates || []

    // If the section has no templates and has `create: all`
    if (forestryTemplates.length === 0 && section.create === 'all') {
      // For all template
      for (const templateKey of templateMap.keys()) {
        // get the shape of the template
        const { templateObj } = templateMap.get(templateKey)
        const pages: undefined | string[] = templateObj?.pages
        // if has pages see if there is I page that matches the current section
        if (pages) {
          // Glob used for matching
          let glob = section.match

          // We don't want to match the root if the path is empty or /
          // This is because /*.md will not match on foo.md
          const skipPath =
            section.path === '' || section.path === '/' || !section.path
          if (!skipPath) {
            glob = section.path + '/' + section.match
          }
          // If we find any pages that match the glob add the forestry template to the section
          if (
            pages.some((page) => {
              return minimatch(page, glob)
            })
          ) {
            forestryTemplates.push(templateKey)
          }
        }
      }
    }

    const hasBody = ['md', 'mdx', 'markdown'].includes(format)

    let c: Collection

    if ((forestryTemplates?.length || 0) > 1) {
      c = {
        ...baseCollection,
        // @ts-expect-error
        templates: forestryTemplates.map((tem) => {
          const currentTemplate = templateMap.get(tem)
          const fieldsString = stringifyLabelWithField(
            currentTemplate.templateObj.label
          )
          return {
            // fields: [BODY_FIELD],
            fields: makeFieldsWithInternalCode({
              hasBody,
              field: fieldsString,
              bodyField: BODY_FIELD,
            }),
            label: tem,
            name: stringifyLabel(tem),
          }
        }),
      }
    }

    if (forestryTemplates?.length === 1) {
      const tem = forestryTemplates[0]
      const template = templateMap.get(tem)
      const fieldsString = stringifyLabelWithField(template.templateObj.label)
      c = {
        ...baseCollection,
        // fields: [BODY_FIELD],
        // @ts-expect-error
        fields: makeFieldsWithInternalCode({
          field: fieldsString,
          hasBody,
          bodyField: BODY_FIELD,
        }),
      }
    }

    // We did not find any fields
    if (forestryTemplates?.length === 0) {
      logger.warn(
        warnText(
          `No templates found for section ${
            section.label
          }. Please see ${linkText(
            'https://tina.io/docs/forestry/content-modelling/'
          )} for more information`
        )
      )
      c = {
        ...baseCollection,
        fields: [BODY_FIELD],
      }
    }

    if (section?.create === 'none') {
      c.ui = {
        ...c.ui,
        allowedActions: {
          create: false,
        },
      }
    }
    return c
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
      for (const currentTemplateName of templateMap.keys()) {
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

      return {
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
      }
    } else {
      logger.log(
        warnText(
          `Error: document section has an unsupported file extension: ${extname} in ${section.path}`
        )
      )
    }
  }
}

export const generateCollections = async ({
  pathToForestryConfig,
  usingTypescript,
  frontMatterFormat,
}: {
  frontMatterFormat?: 'toml' | 'yaml' | 'json'
  pathToForestryConfig: string
  usingTypescript: boolean
}) => {
  const templateMap = await generateAllTemplates({ pathToForestryConfig })

  const { importStatements, templateCodeText } = await makeTemplateFile({
    templateMap,
    usingTypescript,
  })

  const forestryConfig = await fs.readFile(
    path.join(pathToForestryConfig, '.forestry', 'settings.yml')
  )

  rewriteTemplateKeysInDocs({
    templateMap,
    markdownParseConfig: {
      frontmatterFormat: frontMatterFormat,
      frontmatterDelimiters: frontMatterFormat === 'toml' ? '+++' : undefined,
    },
  })
  const collections = parseSections({
    val: yaml.load(forestryConfig.toString()),
  })
    .sections.map(
      (section): Collection =>
        generateCollectionFromForestrySection({
          section,
          templateMap,
          frontMatterFormat,
        })
    )
    .filter((c) => c !== undefined)
  return {
    collections,
    importStatements: importStatements.join('\n'),
    templateCode: templateCodeText,
  }
}

const rewriteTemplateKeysInDocs = (args: {
  templateMap: Map<
    string,
    {
      fields: TinaField[]
      templateObj: any
    }
  >
  markdownParseConfig?: {
    frontmatterFormat?: 'toml' | 'yaml' | 'json'
    frontmatterDelimiters?: [string, string] | string
  }
}) => {
  const { templateMap, markdownParseConfig } = args
  // Go through all the pages in the template and update  the content to contain _template: ${templateName}

  for (const templateKey of templateMap.keys()) {
    const { templateObj } = templateMap.get(templateKey)

    templateObj?.pages?.forEach((page) => {
      // update the data in page to have _template: tem
      try {
        const filePath = path.join(page)
        if (fs.lstatSync(filePath).isDirectory()) {
          // For some reason some templates have directories in the `pages` property
          return
        }
        const extname = path.extname(filePath)
        const fileContent = fs.readFileSync(filePath).toString()
        const content = parseFile(
          fileContent,
          extname,
          (yup) => yup.object({}),
          markdownParseConfig
        )
        const newContent = {
          _template: stringifyLabel(templateKey),
          ...content,
        }
        fs.writeFileSync(
          filePath,
          stringifyFile(newContent, extname, true, markdownParseConfig)
        )
      } catch (error) {
        console.log(
          dangerText('Error updating template -> _template in ', page)
        )
      }
    })
  }
}
