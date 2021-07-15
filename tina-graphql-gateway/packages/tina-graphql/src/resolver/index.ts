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

import _ from 'lodash'
import { graphql } from 'graphql'
import path from 'path'
import { assertShape, sequential } from '../util'
import { friendlyName } from 'tina-graphql-helpers'

import { resolve } from '../fields/templates/resolver'

import type { DataSource } from '../datasources/datasource'
import type { GraphQLSchema, GraphQLResolveInfo, Source } from 'graphql'
import type { DirectorySection } from '../types'
import type { sectionMap } from '../builder'

export const graphqlInit = async (a: {
  schema: GraphQLSchema
  source: string | Source
  contextValue: ContextT
  variableValues: object
  sectionMap: sectionMap
}) => {
  const { sectionMap, ...rest } = a
  return await graphql({
    ...rest,
    fieldResolver: async (
      source: FieldResolverSource,
      args: FieldResolverArgs,
      context: ContextT,
      info: GraphQLResolveInfo
    ) => {
      return schemaResolver(source, args, context, info, sectionMap)
    },
    rootValue: { _resolver_kind: null },
  })
}

/**
 * The `schemaResolver` function runs for __every__ field we process for queries and mutations.
 *
 * That means that for this query:
 *
 * ```graphql
 * {
 *  getPagesList {
 *    id
 *    sys {
 *      relativePath
 *      breadcrumbs(excludeExtension: true)
 *    }
 *    data {
 *      ...on BlockPage_Doc_Data {
 *        title
 *      }
 *    }
 *  }
 * }
 * ```
 *
 * This same function gets called with `info.fieldName` values of `id`, `sys`, `relativePath`, `breadcrumbs`
 * `data` and `title`. If nothing is provided, that `source[info.fieldName]`
 * value will be used, that is to say, if the ancestor of `relativePath` (`sys`) returns:
 *
 * ```json
 * "sys": {
 *   "relativePath": "about.md",
 *   "breadcrumbs": [
 *     "about"
 *   ]
 * }
 * ```
 *
 * Then we can allow the `relativePath` call to do nothing but pass it's value (`"about.md"`) straight through, this is
 * the default behaviour, and most of what we're doing is retrieving the document, parsing it and returning
 * it, allowing each field to essentially do nothing.
 *
 */
const schemaResolver = async (
  source: FieldResolverSource,
  args: FieldResolverArgs,
  context: ContextT,
  info: GraphQLResolveInfo,
  sectionMap: {
    [key: string]: {
      section: DirectorySection
      mutation?: boolean
      plural: boolean
    }
  }
) => {
  const value = source[info.fieldName]

  switch (info.fieldName) {
    case 'node':
      return resolveNode(args, context)
    case 'documents':
      return resolveDocuments(value, args, context)
    case 'getDocument':
      return resolveDocument({ args, context })
    case 'breadcrumbs':
      return resolveBreadcrumbs(value, args, context)
    case 'getCollection':
      return resolveCollection(args, context)
    case 'getCollections':
      return resolveCollections(context)

    case 'addPendingDocument':
      await addPendingDocument(args, context)
      return resolveDocument({ args, context })
    case 'updateDocument':
      assertShape<{
        relativePath: string
        params: { [key: string]: object }
      }>(args, (yup) =>
        yup.object({
          relativePath: yup.string().required(),
          params: yup.object().required(),
        })
      )

      const sectionSlug = Object.keys(args.params)[0]
      const params = Object.values(args.params)[0]

      const section = await context.datasource.getCollection(sectionSlug)

      const key = Object.keys(params)[0]
      const values = Object.values(params)[0]

      const templates = await context.datasource.getTemplatesForCollection(
        section.slug
      )
      const template = templates.find((template) => template.name === key)
      if (!template) {
        throw new Error(
          `Unabled to find template ${key} for section ${section.slug}`
        )
      }

      const realParams = await resolve.input({
        data: {
          ...values,
          _template: template.name,
        },
        template,
        datasource: context.datasource,
        includeBody: true,
      })
      const relativePath = args.relativePath

      const payload = {
        relativePath,
        collection: section.slug,
        params: realParams,
      }

      assertShape<{
        relativePath: string
        collection: string
        params: { _body?: string } & object
      }>(payload, (yup) => {
        return yup.object({
          relativePath: yup.string().required(),
          collection: yup.string().required(),
          params: yup.object({
            _body: yup.string(),
          }),
        })
      })

      await context.datasource.updateDocument(payload)
      return resolveDocument({
        args: {
          relativePath: relativePath,
          collection: section.slug,
        },
        context,
      })
    default:
      break
  }

  const sectionItem = sectionMap[info.fieldName]
  if (sectionItem) {
    if (sectionItem.plural) {
      const documents = await context.datasource.getDocumentsForCollection(
        sectionItem.section.slug
      )
      return sequential(documents, async (documentPath) =>
        resolveDocument({
          args: {
            fullPath: documentPath,
            collection: sectionItem.section.slug,
          },
          context: context,
        })
      )
    } else if (sectionItem.mutation) {
      assertShape<{ relativePath: string; params: { [key: string]: object } }>(
        args,
        (yup) =>
          yup.object({
            relativePath: yup.string().required(),
            params: yup.object().required(),
          })
      )

      const key = Object.keys(args.params)[0]
      const values = Object.values(args.params)[0]

      const templates = await context.datasource.getTemplatesForCollection(
        sectionItem.section.slug
      )
      const template = templates.find((template) => template.name === key)
      if (!template) {
        throw new Error(
          `Unabled to find template ${key} for section ${sectionItem.section.slug}`
        )
      }

      const params = await resolve.input({
        template,
        data: {
          ...values,
          _template: template.name,
        },
        datasource: context.datasource,
        includeBody: true,
      })

      const payload = {
        relativePath: args.relativePath,
        collection: sectionItem.section.slug,
        params,
      }

      assertShape<{
        relativePath: string
        collection: string
        params: { _body?: string } & object
      }>(payload, (yup) => {
        return yup.object({
          relativePath: yup.string().required(),
          collection: yup.string().required(),
          params: yup.object({
            _body: yup.string(),
          }),
        })
      })
      await context.datasource.updateDocument(payload)
      return resolveDocument({
        args: {
          relativePath: args.relativePath,
          collection: sectionItem.section.slug,
        },
        context,
      })
    } else {
      return resolveDocument({
        args: {
          relativePath: args.relativePath,
          collection: sectionItem.section.slug,
        },
        context,
      })
    }
  }

  if (!value) {
    return null
  }
  /**
   * Field-level references return an object with "instructions" rather than the document themselves.
   *
   * The reason for this is if you have `post->author`, we don't want to actually fetch the author
   * document until we know you need it, so when we come across the author reference in the post's
   * frontmatter, we return instructions for how to retrieve that document
   */
  // FIXME: this check runs event when we have a scalar value, it's probably easier to flip this if/else
  if (isReferenceField(value)) {
    switch (value._resolver_kind) {
      case '_nested_source':
        const documentArgs = {
          args: value._args,
          context,
        }
        return resolveDocument(documentArgs)

      case '_nested_sources':
        return sequential(value._args.fullPaths, async (p) => {
          return resolveDocument({
            args: { fullPath: p, collection: value._args.collection, ...args },
            context,
          })
        })
    }
  } else {
    // No processing needed, just pass the value straight through
    return value
  }
}

/**
 *
 * Most of the starts here, field-level form, data and value resolvers initiate here.
 *
 */
const resolveDocument = async ({
  args,
  context,
}: {
  args: FieldResolverArgs
  context: ContextT
}) => {
  const { datasource } = context

  assertShape<{
    relativePath?: string
    fullPath?: string
    collection: string
  }>(args, (yup) =>
    yup.object({
      relativePath: yup.string(),
      fullPath: yup.string(),
      collection: yup.string().required(),
    })
  )

  const sectionData = await datasource.getSettingsForCollection(args.collection)

  // FIXME: we're supporting both full path and relative path args, when we use this from the hook we only have
  // access to the documents full id, not the relative path, this should support both kinds of calls, but
  // probably needs a better argument option as relativePath is misleading
  const relativePath = args.fullPath
    ? args.fullPath
        .replace(sectionData.path, '')
        .replace(/^[^_a-z\d]*|[^_a-z\d]*$/gi, '')
    : args.relativePath?.startsWith(sectionData.path)
    ? args.relativePath.replace(sectionData.path, '')
    : args.relativePath

  if (!relativePath) {
    throw new Error(`Expected either relativePath or fullPath arguments`)
  }

  const realArgs = { relativePath, collection: args.collection }
  const { data, content } = await datasource.getData(realArgs)
  assertShape<{ _template: string }>(data, (yup) =>
    yup.object({
      _template: yup.string().required(),
    })
  )
  const { _template, ...rest } = data
  const template = await datasource.getTemplate(_template)
  const { basename, filename, extension } = await datasource.getDocumentMeta(
    realArgs
  )

  return {
    __typename: friendlyName(sectionData.slug, { suffix: 'Document' }),
    id: path.join(sectionData.path, realArgs.relativePath),
    sys: {
      path: path.join(sectionData.path, realArgs.relativePath),
      relativePath,
      collection: sectionData,
      template: template.name,
      breadcrumbs: relativePath.split('/').filter(Boolean),
      basename,
      filename,
      extension,
    },
    form: await resolve.form({ datasource, template, includeBody: true }),
    data: await resolve.data({
      datasource,
      template: template,
      data: rest,
      content,
    }),
    values: await resolve.values({
      datasource,
      template,
      data: rest,
      content: content || '',
    }),
  }
}

const resolveNode = async (args: FieldResolverArgs, context: ContextT) => {
  if (typeof args.id !== 'string') {
    throw new Error('Expected argument ID for node query')
  }
  const section = await context.datasource.getCollectionByPath(args.id)
  return await resolveDocument({
    args: { fullPath: args.id, collection: section.slug },
    context,
  })
}

const resolveDocuments = async (
  value: unknown,
  args: FieldResolverArgs,
  context: ContextT
) => {
  assertShape<{ _section: string }>(value, (yup) =>
    yup.object({ _section: yup.string().required() })
  )
  assertShape<{ collection: string }>(args, (yup) =>
    yup.object({ collection: yup.string() })
  )

  let sections = await context.datasource.getCollectionsSettings()

  if (args.collection) {
    sections = sections.filter((section) => section.slug === args.collection)
  }
  if (value && value._section) {
    sections = sections.filter((section) => section.slug === value._section)
  }

  const sectionDocs = _.flatten(
    await sequential(sections, async (s) => {
      const paths = await context.datasource.getDocumentsForCollection(s.slug)
      return await sequential(paths, async (documentPath) => {
        const document = await resolveDocument({
          args: { fullPath: documentPath, collection: s.slug },
          context,
        })

        return document
      })
    })
  )
  return sectionDocs
}

const resolveBreadcrumbs = async (
  value: unknown,
  args: FieldResolverArgs,
  context: ContextT
) => {
  if (args.excludeExtension) {
    if (!Array.isArray(value)) {
      throw new Error(`Expected breadcrumb value to be an array`)
    }
    return value.map((item, i) => {
      if (i === value.length - 1) {
        return item.replace(path.extname(item), '')
      }
      return item
    })
  } else {
    return value
  }
}

const resolveCollection = async (
  args: FieldResolverArgs,
  context: ContextT
) => {
  assertShape<{ collection: string }>(args, (yup) =>
    yup.object({ collection: yup.string().required() })
  )

  let section = await context.datasource.getSettingsForCollection(
    args.collection
  )
  return {
    ...section,
    documents: {
      _section: section.slug,
    },
  }
}

const resolveCollections = async (context: ContextT) => {
  let sections = await context.datasource.getCollectionsSettings()
  return sequential(sections, async (section) => {
    return resolveCollection({ collection: section.slug }, context)
  })
}

const addPendingDocument = async (
  args: FieldResolverArgs,
  context: ContextT
) => {
  assertShape<{ relativePath: string; collection: string; template: string }>(
    args,
    (yup) =>
      yup.object({
        relativePath: yup.string(),
        collection: yup.string(),
        template: yup.string(),
      })
  )
  await context.datasource.addDocument(args)

  return true
}

/**
 * Each document request should populate these reserved
 * properties so we know how to delegate them, for fields
 * list "select" fields which reference another document
 * it is responsible for providing these in the field
 * value resolver
 */
function isReferenceField(
  item: unknown | FieldResolverSource
): item is ReferenceSource {
  try {
    assertShape<{ _resolver: string }>(item, (yup) =>
      yup.object({ _resolver: yup.string().required() })
    )
    return true
  } catch (e) {
    return false
  }
}

export type ContextT = {
  datasource: DataSource
}
type FieldResolverArgs = { [argName: string]: unknown }

/**
 * When the source doesn't contain the value, but instead
 * containst information about how to go and get the value.
 *
 * This used for references, instead of over-fetching, we return
 * these values which act as args for the next resolve function
 * call to use
 */
export type ReferenceSource =
  | { _resolver_kind: null }
  | {
      _resolver: '_resource'
      _resolver_kind: '_nested_source'
      _args: { fullPath: string; collection: string }
    }
  | {
      _resolver: '_resource'
      _resolver_kind: '_nested_sources'
      _args: { fullPaths: string[]; collection: string }
    }

type FieldResolverSource = {
  [key: string]: ReferenceSource | unknown
}
