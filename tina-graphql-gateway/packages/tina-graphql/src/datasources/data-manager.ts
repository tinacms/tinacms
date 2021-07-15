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

import p from 'path'
import _ from 'lodash'
import matter from 'gray-matter'
import * as jsyaml from 'js-yaml'
import DataLoader from 'dataloader'

import { byTypeWorks } from '../types'
import { FieldGroupField } from '../fields/field-group'
import { FieldGroupListField } from '../fields/field-group-list'
import { sequential } from '../util'

import type { Field } from '../fields'
import {
  DataSource,
  AddArgs,
  UpdateArgs,
  DocumentArgs,
  TinaDocument,
} from './datasource'
import type {
  Settings,
  DirectorySection,
  RawTemplate,
  TemplateData,
  WithFields,
} from '../types'

// const tinaPath = ".tina";
const tinaPath = '.tina/__generated__/config'

export class DataManager implements DataSource {
  rootPath: string
  loader: DataLoader<unknown, unknown, unknown>
  dirLoader: DataLoader<unknown, unknown, unknown>
  writeFile: (path: string, content: string) => Promise<void>
  constructor(
    rootPath: string,
    options: {
      writeFile: (path: string, content: string) => Promise<void>
      readFile: (path: string) => Promise<Buffer>
      readDir: (path: string) => Promise<string[]>
    }
  ) {
    this.rootPath = rootPath

    // This is not an application cache - in-memory batching is its purpose
    // read a good conversation on it here https://github.com/graphql/dataloader/issues/62

    /**
     * DataLoader should be initialized as an in-memory, per-request cache, so initializing it
     * here makes sense as it will be cleared for each request. The only time we need to clear
     * it ourselves is when there's a cached value as part of the mutation process, which then
     * needs to return the new value
     */
    const readFileFunc = createReadFileFunc(options.readFile)
    const readDirFunc = createReadDirFunc(options.readDir)
    this.loader = new DataLoader(readFileFunc)
    this.dirLoader = new DataLoader(readDirFunc)
    this.writeFile = options.writeFile

    // Pretty bad behavior from gray-matter, without clearing this we'd run the risk
    // of returning cached objects from different projects. This is undocumented behavior
    // but there's an issue for it here https://github.com/jonschlinkert/gray-matter/issues/106
    // There's another library which might be better if we run into trouble with this
    // https://github.com/jxson/front-matter - or perhaps we should just use remark and
    // js-yaml
    // @ts-ignore
    matter.clearCache()
  }

  getDocumentsForCollection = async (sectionSlug: string) => {
    const section = await this.getCollection(sectionSlug)
    const fullPath = p.join(this.rootPath, section.path)

    // FIXME: replace with fast-glob
    const documents = await readDir(fullPath, this.dirLoader)
    return documents.map((relativePath) => p.join(section.path, relativePath))
  }
  getAllTemplates = async () => {
    const fullPath = p.join(this.rootPath, tinaPath, 'front_matter/templates')
    const templates = await readDir(fullPath, this.dirLoader)
    return await sequential(
      templates,
      async (templateSlug) =>
        await this.getTemplate(templateSlug.replace('.yml', ''))
    )
  }
  getTemplates = async (templateSlugs: string[]) =>
    await sequential(
      templateSlugs,
      async (templateSlug) => await this.getTemplate(templateSlug)
    )
  getSettingsData = async () => {
    const { data } = await readFile<Settings>(
      p.join(this.rootPath, tinaPath, 'settings.yml'),
      this.loader
    )

    return data
  }
  getSettingsForCollection = async (section?: string) => {
    const sectionsSettings = await this.getCollectionsSettings()
    if (!section) {
      throw new Error(`No directory sections found`)
    }
    const result = sectionsSettings.find(({ slug }) => slug === section)

    if (!result) {
      throw new Error(`Expected to find section with slug ${section}`)
    }

    return {
      ...result,
      format: result.format || 'md',
    }
  }
  getCollectionsSettings = async () => {
    const data = await this.getSettingsData()

    const sections = data.sections
      .filter((section) => section.type === 'directory')
      .map((section) => {
        return {
          ...section,
          slug: section.name,
        }
      })

    return sections as DirectorySection[]
  }
  getCollection = async (slug: string) => {
    const data = await this.getSettingsData()

    const sections = data.sections
      .filter((section) => section.type === 'directory')
      .map((section) => {
        return {
          ...section,
          slug: section.name,
        } as DirectorySection
      })

    const section = sections.find((section) => section.slug === slug)

    if (!section) {
      throw new Error(`Unable to find section with slug ${slug}`)
    }
    return section
  }
  getCollectionByPath = async (path: string) => {
    const data = await this.getSettingsData()

    const sections = data.sections
      .filter((section) => section.type === 'directory')
      .map((section) => {
        return {
          ...section,
          slug: section.name,
        } as DirectorySection
      })

    const section = sections.find((section) => {
      return path.startsWith(section.path)
    })
    if (!section) {
      throw new Error(`Unable to find section for path ${path}`)
    }
    return section
  }
  getTemplatesForCollection = async (section?: string) => {
    const data = await this.getSettingsData()

    const sections = data.sections.map((section) => {
      return {
        ...section,
        slug: section.name,
      }
    })

    const templates = section
      ? sections.filter(byTypeWorks('directory')).find((templateSection) => {
          return templateSection.slug === section
        })?.templates
      : _.flatten(
          sections
            .filter(byTypeWorks('directory'))
            .map(({ templates }) => templates)
        )

    if (!templates) {
      throw new Error(`No templates found for section`)
    }

    return await sequential(templates, async (templateBasename) => {
      return await this.getTemplate(templateBasename.replace('.yml', ''))
    })
  }
  getDocumentMeta = async (args: DocumentArgs) => {
    const fullPath = p.join(this.rootPath, args.relativePath)
    const basename = p.basename(fullPath)
    const extension = p.extname(fullPath)
    return { basename, filename: basename.replace(extension, ''), extension }
  }
  getData = async ({ relativePath, collection }: DocumentArgs) => {
    const sectionData = await this.getSettingsForCollection(collection)

    if (!sectionData) {
      throw new Error(`No section found for ${collection}`)
    }

    const fullPath = p.join(this.rootPath, sectionData.path, relativePath)
    return readFile<TinaDocument>(fullPath, this.loader)
  }
  getTemplateForDocument = async (args: DocumentArgs) => {
    const sectionData = await this.getSettingsForCollection(args.collection)
    if (!sectionData) {
      throw new Error(`No section found for ${args.collection}`)
    }
    const fullPath = p.join(this.rootPath, tinaPath, 'front_matter/templates')
    const templates = await readDir(fullPath, this.dirLoader)

    const template = (
      await sequential(templates, async (template) => {
        const data = await this.getTemplate(template.replace('.yml', ''))

        if (data.pages?.includes(p.join(sectionData.path, args.relativePath))) {
          return data
        } else {
          return false
        }
      })
    ).filter(Boolean)[0]

    if (!template) {
      throw new Error(
        `Unable to find template for document ${args.relativePath}`
      )
    }

    return template
  }
  getTemplate = async (
    slug: string,
    options: { namespace: boolean } = { namespace: true }
  ) => {
    const fullPath = p.join(this.rootPath, tinaPath, 'front_matter/templates')
    const templates = await readDir(fullPath, this.dirLoader)
    const template = templates.find((templateBasename) => {
      return templateBasename === `${slug}.yml`
    })
    if (!template) {
      throw new Error(`No template found for slug ${slug}`)
    }
    const { data } = await readFile<RawTemplate>(
      p.join(fullPath, template),
      this.loader
    )

    return namespaceFields({ name: slug, ...data })
  }
  getTemplateWithoutName = async (
    slug: string,
    options: { namespace: boolean } = { namespace: true }
  ) => {
    const fullPath = p.join(this.rootPath, tinaPath, 'front_matter/templates')
    const templates = await readDir(fullPath, this.dirLoader)
    const template = templates.find((templateBasename) => {
      return templateBasename === `${slug}.yml`
    })
    if (!template) {
      throw new Error(`No template found for slug ${slug}`)
    }
    const { data } = await readFile<RawTemplate>(
      p.join(fullPath, template),
      this.loader
    )

    return data
  }
  addDocument = async ({ relativePath, collection, template }: AddArgs) => {
    const fullPath = p.join(this.rootPath, tinaPath, 'front_matter/templates')
    const sectionData = await this.getSettingsForCollection(collection)
    if (!sectionData) {
      throw new Error(`No section found for ${collection}`)
    }
    const path = p.join(sectionData.path, relativePath)

    const fullFilePath = p.join(this.rootPath, path)
    const fullTemplatePath = p.join(fullPath, `${template}.yml`)
    const extension = p.extname(fullFilePath)

    this.loader.clear(fullFilePath)
    this.loader.clear(fullTemplatePath)

    switch (extension) {
      case '.md':
        const markdownString = '---\n' + jsyaml.dump({ _template: template })
        await this.writeFile(fullFilePath, markdownString)
        break
      case '.json':
        const jsonString = JSON.stringify({ _template: template }, null, 2)
        await this.writeFile(fullFilePath, jsonString)
        break
      default:
        throw new Error(
          `Unable to parse file, unknown extension ${extension} for path ${fullPath}`
        )
    }
  }
  updateDocument = async ({ relativePath, collection, params }: UpdateArgs) => {
    const sectionData = await this.getSettingsForCollection(collection)
    if (!sectionData) {
      throw new Error(`No section found for ${collection}`)
    }
    const fullPath = p.join(this.rootPath, sectionData.path, relativePath)
    // FIXME: provide a test-case for this, might not be necessary
    // https://github.com/graphql/dataloader#clearing-cache
    this.loader.clear(fullPath)
    const { _body, ...data } = params
    const extension = p.extname(fullPath)
    switch (extension) {
      case '.md':
        const string = matter.stringify(`\n${_body || ''}`, data)

        await this.writeFile(fullPath, string)
        break
      case '.json':
        const jsonString = JSON.stringify(data, null, 2)

        await this.writeFile(fullPath, jsonString)
        break
      default:
        throw new Error(
          `Unable to parse file, unknown extension ${extension} for path ${fullPath}`
        )
    }
  }
}

const createReadFileFunc = (
  readFileFunc: (path: string) => Promise<Buffer>
) => {
  return async function batchReadFileFunction(keys: readonly string[]) {
    const results: { [key: string]: unknown } = {}
    await Promise.all(
      keys.map(
        async (key) =>
          (results[key] = await internalReadFile(key, readFileFunc))
      )
    )
    return keys.map((key) => results[key] || new Error(`No result for ${key}`))
  }
}

const createReadDirFunc = (
  readDirFunc: (path: string) => Promise<string[]>
) => {
  return async function batchReadDirFunction(keys: readonly string[]) {
    const results: { [key: string]: unknown } = {}
    await Promise.all(
      keys.map(
        async (key) => (results[key] = await internalReadDir(key, readDirFunc))
      )
    )
    return keys.map((key) => results[key] || new Error(`No result for ${key}`))
  }
}

const readFile = async <T>(
  path: string,
  loader: DataLoader<unknown, unknown, unknown>
): Promise<T> => {
  return (await loader.load(path)) as T
}
const internalReadFile = async (
  path: string,
  readFileFunc: (path: string) => Promise<Buffer>
): Promise<unknown> => {
  let extension = p.extname(path)

  const string = await readFileFunc(path)

  switch (extension) {
    case '.yml':
      return parseMatter(string)
    case '.md':
      return parseMatter(string)
    case '.json':
      return { data: JSON.parse(string.toString()), content: '' }
    default:
      throw new Error(
        `Unable to parse file, unknown extension ${extension} for path ${path}`
      )
  }
}

const readDir = async (
  path: string,
  loader: DataLoader<unknown, unknown, unknown>
): Promise<string[]> => {
  return (await loader.load(path)) as string[]
}
const internalReadDir = async (
  path: string,
  readDirFunc: (path: string) => Promise<string[]>
) => {
  return readDirFunc(path)
}

export const FMT_BASE = '.forestry/front_matter/templates'
export const parseMatter = (data: Buffer) => {
  const res = matter(data, {
    excerpt_separator: '<!-- excerpt -->',
  }) as unknown & { content: string }
  // Remove line break at top of _body
  res.content = res.content.replace(/^\n|\n$/g, '')

  return res
}

function isWithFields(t: object): t is WithFields {
  return t.hasOwnProperty('fields')
}

const namespaceFields = (template: TemplateData): TemplateData => {
  return {
    ...template,
    fields: template.fields.map((f) => {
      if (isWithFields(f)) {
        return {
          ...namespaceSubFields(f, template.name),
        }
      } else {
        return {
          ...f,
          __namespace: `${template.name}`,
        }
      }
    }),
  }
}
const namespaceSubFields = (
  template: FieldGroupField | FieldGroupListField,
  parentNamespace: string
): Field => {
  return {
    ...template,
    fields: template.fields.map((f) => {
      if (isWithFields(f)) {
        return {
          ...namespaceSubFields(f, template.name),
          __namespace: `${parentNamespace}_${template.name}`,
        }
      } else {
        return {
          ...f,
        }
      }
    }),
    __namespace: parentNamespace,
  }
}

export const createDatasource = (dataAdaptor: {
  // FIXME: this should just specify that any DataManager interface
  // can be passed, having trouble with 'fs' return types though
  rootPath: any
  readFile: any
  readDir: any
  writeFile: any
}) => {
  return new DataManager(dataAdaptor.rootPath, {
    readFile: dataAdaptor.readFile,
    readDir: dataAdaptor.readDir,
    writeFile: dataAdaptor.writeFile,
  })
}
