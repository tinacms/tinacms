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

import path from 'path'
import { Database } from '../database'
import { assertShape, lastItem, sequential } from '../util'
import { NAMER } from '../ast-builder'
import isValid from 'date-fns/isValid'
import { parseMDX, stringifyMDX } from '../mdx'

import type {
  Collectable,
  ReferenceTypeWithNamespace,
  Templateable,
  TinaCloudCollection,
  TinaFieldEnriched,
  Template,
  TinaFieldInner,
  TinaSchema,
} from '@tinacms/schema-tools'

import type { GraphQLConfig } from '../types'

import { TinaGraphQLError, TinaParseDocumentError } from './error'
import { FilterCondition, makeFilterChain } from '@tinacms/datalayer'
import { collectConditionsForField, resolveReferences } from './filter-utils'
import {
  resolveMediaRelativeToCloud,
  resolveMediaCloudToRelative,
} from './media-utils'
import { GraphQLError } from 'graphql'

interface ResolverConfig {
  config?: GraphQLConfig
  database: Database
  tinaSchema: TinaSchema
  isAudit: boolean
}

export const createResolver = (args: ResolverConfig) => {
  return new Resolver(args)
}

/**
 * The resolver provides functions for all possible types of lookup
 * values and retrieves them from the database
 */
export class Resolver {
  public config: GraphQLConfig
  public database: Database
  public tinaSchema: TinaSchema
  public isAudit: boolean
  constructor(public init: ResolverConfig) {
    this.config = init.config
    this.database = init.database
    this.tinaSchema = init.tinaSchema
    this.isAudit = init.isAudit
  }
  public resolveCollection = async (
    args,
    collectionName: string,
    hasDocuments?: boolean
  ) => {
    const collection = this.tinaSchema.getCollection(collectionName)
    const extraFields = {}
    // const res = this.tinaSchema.getTemplatesForCollectable(collection);
    // if (res.type === "object") {
    //   extraFields["fields"] = res.template.fields;
    // }
    // if (res.type === "union") {
    //   extraFields["templates"] = res.templates;
    // }

    return {
      // return the collection and hasDocuments to resolve documents at a lower level
      documents: { collection: collection, hasDocuments },
      ...collection,
      ...extraFields,
    }
  }
  public getDocument = async (fullPath: unknown) => {
    if (typeof fullPath !== 'string') {
      throw new Error(`fullPath must be of type string for getDocument request`)
    }

    const rawData = await this.database.get<{
      _collection: string
      _template: string
    }>(fullPath)
    const collection = this.tinaSchema.getCollection(rawData._collection)
    try {
      const template = await this.tinaSchema.getTemplateForData({
        data: rawData,
        collection,
      })

      const {
        base: basename,
        ext: extension,
        name: filename,
      } = path.parse(fullPath)

      const relativePath = fullPath
        .replace(/\\/g, '/')
        .replace(collection.path, '')
        .replace(/^\/|\/$/g, '')

      const breadcrumbs = relativePath.replace(extension, '').split('/')

      const data = {
        _collection: rawData._collection,
        _template: rawData._template,
      }
      try {
        await sequential(template.fields, async (field) => {
          return this.resolveFieldData(field, rawData, data)
        })
      } catch (e) {
        throw new TinaParseDocumentError({
          originalError: e,
          collection: collection.name,
          includeAuditMessage: !this.isAudit,
          file: relativePath,
          stack: e.stack,
        })
      }

      const titleField = template.fields.find((x) => {
        // @ts-ignore
        if (x.type === 'string' && x?.isTitle) {
          return true
        }
      })
      const titleFieldName = titleField?.name
      const title = data[titleFieldName || ' '] || null

      return {
        __typename: collection.fields
          ? NAMER.documentTypeName(collection.namespace)
          : NAMER.documentTypeName(template.namespace),
        id: fullPath,
        ...data,
        _sys: {
          title,
          basename,
          filename,
          extension,
          path: fullPath,
          relativePath,
          breadcrumbs,
          collection,
          template: lastItem(template.namespace),
        },
        _values: data,
      }
    } catch (e) {
      if (e instanceof TinaGraphQLError) {
        // Attach additional information
        throw new TinaGraphQLError(e.message, {
          requestedDocument: fullPath,
          ...e.extensions,
        })
      }
      throw e
    }
  }
  public deleteDocument = async (fullPath: unknown) => {
    if (typeof fullPath !== 'string') {
      throw new Error(`fullPath must be of type string for getDocument request`)
    }

    await this.database.delete(fullPath)
  }

  public buildObjectMutations = (fieldValue: any, field: Collectable) => {
    if (field.fields) {
      const objectTemplate =
        typeof field.fields === 'string'
          ? this.tinaSchema.getGlobalTemplate(field.fields)
          : field
      if (Array.isArray(fieldValue)) {
        return fieldValue.map((item) =>
          // @ts-ignore FIXME Argument of type 'string | object' is not assignable to parameter of type '{ [fieldName: string]: string | object | (string | object)[]; }'
          this.buildFieldMutations(item, objectTemplate)
        )
      } else {
        return this.buildFieldMutations(
          // @ts-ignore FIXME Argument of type 'string | object' is not assignable to parameter of type '{ [fieldName: string]: string | object | (string | object)[]; }'
          fieldValue,
          //@ts-ignore
          objectTemplate
        )
      }
    }
    if (field.templates) {
      if (Array.isArray(fieldValue)) {
        return fieldValue.map((item) => {
          if (typeof item === 'string') {
            throw new Error(
              //@ts-ignore
              `Expected object for template value for field ${field.name}`
            )
          }
          const templates = field.templates.map((templateOrTemplateName) => {
            if (typeof templateOrTemplateName === 'string') {
              return this.tinaSchema.getGlobalTemplate(templateOrTemplateName)
            }
            return templateOrTemplateName
          })
          const [templateName] = Object.entries(item)[0]
          const template = templates.find(
            //@ts-ignore
            (template) => template.name === templateName
          )
          if (!template) {
            throw new Error(`Expected to find template ${templateName}`)
          }
          return {
            // @ts-ignore FIXME Argument of type 'unknown' is not assignable to parameter of type '{ [fieldName: string]: string | { [key: string]: unknown; } | (string | { [key: string]: unknown; })[]; }'
            ...this.buildFieldMutations(item[template.name], template),
            //@ts-ignore
            _template: template.name,
          }
        })
      } else {
        if (typeof fieldValue === 'string') {
          throw new Error(
            //@ts-ignore
            `Expected object for template value for field ${field.name}`
          )
        }
        const templates = field.templates.map((templateOrTemplateName) => {
          if (typeof templateOrTemplateName === 'string') {
            return this.tinaSchema.getGlobalTemplate(templateOrTemplateName)
          }
          return templateOrTemplateName
        })
        const [templateName] = Object.entries(fieldValue)[0]
        const template = templates.find(
          //@ts-ignore
          (template) => template.name === templateName
        )
        if (!template) {
          throw new Error(`Expected to find template ${templateName}`)
        }
        return {
          // @ts-ignore FIXME Argument of type 'unknown' is not assignable to parameter of type '{ [fieldName: string]: string | { [key: string]: unknown; } | (string | { [key: string]: unknown; })[]; }'
          ...this.buildFieldMutations(fieldValue[template.name], template),
          //@ts-ignore
          _template: template.name,
        }
      }
    }
  }

  public createResolveDocument = async ({
    collection,
    realPath,
    args,
    isAddPendingDocument,
  }: {
    collection: TinaCloudCollection<true>
    realPath: string
    args: unknown
    isAddPendingDocument: boolean
  }) => {
    /**
     * TODO: Remove when `addPendingDocument` is no longer needed.
     */
    if (isAddPendingDocument === true) {
      const templateInfo =
        this.tinaSchema.getTemplatesForCollectable(collection)

      switch (templateInfo.type) {
        case 'object':
          await this.database.addPendingDocument(realPath, {})
          break
        case 'union':
          // @ts-ignore
          const templateString = args.template
          const template = templateInfo.templates.find(
            (template) => lastItem(template.namespace) === templateString
          )
          // @ts-ignore
          if (!args.template) {
            throw new Error(
              `Must specify a template when creating content for a collection with multiple templates. Possible templates are: ${templateInfo.templates
                .map((t) => lastItem(t.namespace))
                .join(' ')}`
            )
          }
          // @ts-ignore
          if (!template) {
            throw new Error(
              `Expected to find template named ${templateString} in collection "${
                collection.name
              }" but none was found. Possible templates are: ${templateInfo.templates
                .map((t) => lastItem(t.namespace))
                .join(' ')}`
            )
          }
          await this.database.addPendingDocument(realPath, {
            _template: lastItem(template.namespace),
          })
      }
      return this.getDocument(realPath)
    }

    const params = this.buildObjectMutations(
      // @ts-ignore
      args.params[collection.name],
      collection
    )

    // @ts-ignore
    await this.database.put(realPath, params, collection.name)
    return this.getDocument(realPath)
  }

  public updateResolveDocument = async ({
    collection,
    realPath,
    args,
    isAddPendingDocument,
    isCollectionSpecific,
  }: {
    collection: TinaCloudCollection<true>
    realPath: string
    args: unknown
    isAddPendingDocument: boolean
    isCollectionSpecific: boolean
  }) => {
    /**
     * TODO: Remove when `addPendingDocument` is no longer needed.
     */
    if (isAddPendingDocument === true) {
      const templateInfo =
        this.tinaSchema.getTemplatesForCollectable(collection)

      const params = this.buildParams(args)
      switch (templateInfo.type) {
        case 'object':
          if (params) {
            const values = this.buildFieldMutations(
              params,
              templateInfo.template
            )
            await this.database.put(realPath, values, collection.name)
          }
          break
        case 'union':
          // FIXME: ensure only one field is passed here
          await sequential(templateInfo.templates, async (template) => {
            const templateParams = params[lastItem(template.namespace)]
            if (templateParams) {
              if (typeof templateParams === 'string') {
                throw new Error(
                  `Expected to find an object for template params, but got string`
                )
              }
              const values = {
                // @ts-ignore FIXME: failing on unknown, which we don't need to know because it's recursive
                ...this.buildFieldMutations(templateParams, template),
                _template: lastItem(template.namespace),
              }
              await this.database.put(realPath, values, collection.name)
            }
          })
      }
      return this.getDocument(realPath)
    }

    const params = this.buildObjectMutations(
      //@ts-ignore
      isCollectionSpecific ? args.params : args.params[collection.name],
      collection
    )
    //@ts-ignore
    await this.database.put(realPath, params, collection.name)
    return this.getDocument(realPath)
  }

  public resolveDocument = async ({
    args,
    collection: collectionName,
    isMutation,
    isCreation,
    isDeletion,
    isAddPendingDocument,
    isCollectionSpecific,
  }: {
    args: unknown
    collection?: string
    isMutation: boolean
    isCreation?: boolean
    isDeletion?: boolean
    isAddPendingDocument?: boolean
    isCollectionSpecific?: boolean
  }) => {
    /**
     * `collectionName` is passed in:
     *    * `addPendingDocument()` has `collection` on `args`
     *    * `getDocument()` provides a `collection` on `args`
     *    * `get<Collection>Document()` has `collection` on `lookup`
     */
    let collectionLookup = collectionName || undefined

    /**
     * For generic functions (like `createDocument()` and `updateDocument()`), `collection` is the top key of the `params`
     */
    if (!collectionLookup && isCollectionSpecific === false) {
      //@ts-ignore
      collectionLookup = Object.keys(args.params)[0]
    }

    const collectionNames = this.tinaSchema
      .getCollections()
      .map((item) => item.name)

    assertShape<string>(
      collectionLookup,
      (yup) => {
        return yup.mixed().oneOf(collectionNames)
      },
      `"collection" must be one of: [${collectionNames.join(
        ', '
      )}] but got ${collectionLookup}`
    )

    assertShape<{ relativePath: string }>(args, (yup) =>
      yup.object({ relativePath: yup.string().required() })
    )

    const collection = await this.tinaSchema.getCollection(collectionLookup)
    const realPath = path.join(collection?.path, args.relativePath)
    const alreadyExists = await this.database.documentExists(realPath)

    if (isMutation) {
      if (isCreation) {
        /**
         * createDocument, create<Collection>Document
         */
        if (alreadyExists === true) {
          throw new Error(`Unable to add document, ${realPath} already exists`)
        }
        return this.createResolveDocument({
          collection,
          realPath,
          args,
          isAddPendingDocument,
        })
      }
      if (isDeletion) {
        if (!alreadyExists) {
          throw new Error(
            `Unable to delete document, ${realPath} does not exist`
          )
        }
        const doc = await this.getDocument(realPath)
        await this.deleteDocument(realPath)
        return doc
      }
      /**
       * updateDocument, update<Collection>Document
       */
      if (alreadyExists === false) {
        throw new Error(`Unable to update document, ${realPath} does not exist`)
      }
      return this.updateResolveDocument({
        collection,
        realPath,
        args,
        isAddPendingDocument,
        isCollectionSpecific,
      })
    } else {
      /**
       * getDocument, get<Collection>Document
       */
      return this.getDocument(realPath)
    }
  }

  public resolveCollectionConnections = async ({ ids }: { ids: string[] }) => {
    return {
      totalCount: ids.length,
      edges: await sequential(ids, async (filepath) => {
        const document = await this.getDocument(filepath)
        return {
          node: document,
        }
      }),
    }
  }

  private referenceResolver = async (
    filter: Record<string, object>,
    fieldDefinition: ReferenceTypeWithNamespace
  ) => {
    const referencedCollection = this.tinaSchema.getCollection(
      fieldDefinition.collections[0]
    )
    if (!referencedCollection) {
      throw new Error(
        `Unable to find collection for ${fieldDefinition.collections[0]} querying ${fieldDefinition.name}`
      )
    }

    const sortKeys = Object.keys(
      filter[fieldDefinition.name][referencedCollection.name]
    )
    const resolvedCollectionConnection = await this.resolveCollectionConnection(
      {
        args: {
          sort: sortKeys.length === 1 ? sortKeys[0] : undefined,
          filter: {
            ...filter[fieldDefinition.name][referencedCollection.name],
          },
          first: -1,
        },
        collection: referencedCollection,
        hydrator: (path) => path, // just return the path
      }
    )

    const { edges } = resolvedCollectionConnection
    const values = edges.map((edge) => edge.node)
    return { edges, values }
  }

  private async resolveFilterConditions(
    filter: Record<string, Record<string, object>>,
    fields: TinaFieldInner<false>[],
    collectionName
  ) {
    const conditions: FilterCondition[] = []
    const conditionCollector = (condition: FilterCondition) => {
      if (!condition.filterPath) {
        throw new Error('Error parsing filter - unable to generate filterPath')
      }
      if (!condition.filterExpression) {
        throw new Error(
          `Error parsing filter - missing expression for ${condition.filterPath}`
        )
      }
      conditions.push(condition)
    }

    await resolveReferences(filter, fields, this.referenceResolver)

    for (const fieldName of Object.keys(filter)) {
      const field = (fields as any[]).find(
        (field) => field.name === fieldName
      ) as any
      if (!field) {
        throw new Error(
          `${fieldName} not found in collection ${collectionName}`
        )
      }
      collectConditionsForField(
        fieldName,
        field,
        filter[fieldName],
        '',
        conditionCollector
      )
    }

    return conditions
  }

  public resolveCollectionConnection = async ({
    args,
    collection,
    hydrator,
  }: {
    args: Record<string, Record<string, object> | string | number>
    collection: TinaCloudCollection<true>
    hydrator?: (string) => any
  }) => {
    let conditions: FilterCondition[]
    if (args.filter) {
      if (collection.fields) {
        conditions = await this.resolveFilterConditions(
          args.filter as Record<string, Record<string, object>>,
          collection.fields as TinaFieldInner<false>[],
          collection.name
        )
      } else if (collection.templates) {
        for (const templateName of Object.keys(args.filter)) {
          const template = (collection.templates as Template<false>[]).find(
            (template) => template.name === templateName
          )

          if (template) {
            conditions = await this.resolveFilterConditions(
              args.filter[templateName],
              template.fields as TinaFieldInner<false>[],
              `${collection.name}.${templateName}`
            )
          } else {
            throw new Error(
              `Error template not found: ${templateName} in collection ${collection.name}`
            )
          }
        }
      }
    }

    const queryOptions = {
      filterChain: makeFilterChain({
        conditions: conditions || [],
      }),
      collection: collection.name,
      sort: args.sort as string,
      first: args.first as number,
      last: args.last as number,
      before: args.before as string,
      after: args.after as string,
    }

    const result = await this.database.query(
      queryOptions,
      hydrator ? hydrator : this.getDocument
    )
    const edges = result.edges
    const pageInfo = result.pageInfo

    // This was the non datalayer code
    // } else {
    //   const ext = collection?.format || '.md'
    //   edges = (
    //     await this.database.store.glob(collection.path, this.getDocument, ext)
    //   ).map((document) => ({
    //     node: document,
    //   }))
    // }

    return {
      totalCount: edges.length,
      edges,
      pageInfo: pageInfo || {
        hasPreviousPage: false,
        hasNextPage: false,
        startCursor: '',
        endCursor: '',
      },
    }
  }

  private buildFieldMutations = (
    fieldParams: FieldParams,
    template: Templateable
  ) => {
    const accum: { [key: string]: unknown } = {}
    Object.entries(fieldParams).forEach(([fieldName, fieldValue]) => {
      if (Array.isArray(fieldValue)) {
        if (fieldValue.length === 0) {
          return
        }
      }
      const field = template.fields.find((field) => field.name === fieldName)
      if (!field) {
        throw new Error(`Expected to find field by name ${fieldName}`)
      }
      switch (field.type) {
        case 'datetime':
          // @ts-ignore FIXME: Argument of type 'string | { [key: string]: unknown; } | (string | { [key: string]: unknown; })[]' is not assignable to parameter of type 'string'
          accum[fieldName] = resolveDateInput(fieldValue, field)
          break
        case 'string':
        case 'boolean':
        case 'number':
          accum[fieldName] = fieldValue
          break
        case 'image':
          accum[fieldName] = resolveMediaCloudToRelative(
            fieldValue as string,
            this.config,
            this.tinaSchema.schema
          )
          break
        case 'object':
          accum[fieldName] = this.buildObjectMutations(fieldValue, field)
          break
        case 'rich-text':
          // @ts-ignore
          accum[fieldName] = stringifyMDX(fieldValue, field, (fieldValue) =>
            resolveMediaCloudToRelative(
              fieldValue as string,
              this.config,
              this.tinaSchema.schema
            )
          )
          break
        case 'reference':
          accum[fieldName] = fieldValue
          break
        default:
          // @ts-ignore
          throw new Error(`No mutation builder for field type ${field.type}`)
      }
    })
    return accum
  }

  private resolveFieldData = async (
    { namespace, ...field }: TinaFieldEnriched,
    rawData: unknown,
    accumulator: { [key: string]: unknown }
  ) => {
    if (!rawData) {
      return undefined
    }
    assertShape<{ [key: string]: unknown }>(rawData, (yup) => yup.object())
    const value = rawData[field.name]
    switch (field.type) {
      case 'datetime':
        // See you in March ;)
        if (value instanceof Date) {
          accumulator[field.name] = value.toISOString()
        } else {
          accumulator[field.name] = value
        }
        break
      case 'string':
      case 'boolean':
      case 'number':
      case 'reference':
        accumulator[field.name] = value
        break
      case 'image':
        accumulator[field.name] = resolveMediaRelativeToCloud(
          value as string,
          this.config,
          this.tinaSchema.schema
        )
        break
      case 'rich-text':
        // @ts-ignore value is unknown
        const tree = parseMDX(value, field, (value) =>
          resolveMediaRelativeToCloud(
            value,
            this.config,
            this.tinaSchema.schema
          )
        )
        if (tree?.children[0]?.type === 'invalid_markdown') {
          if (this.isAudit) {
            const invalidNode = tree?.children[0]
            throw new GraphQLError(
              `${invalidNode?.message}${
                invalidNode.position
                  ? ` at line ${invalidNode.position.start.line}, column ${invalidNode.position.start.column}`
                  : ''
              }`
            )
          }
        }
        accumulator[field.name] = tree
        break
      case 'object':
        if (field.list) {
          if (!value) {
            return
          }

          assertShape<{ [key: string]: unknown }[]>(value, (yup) =>
            yup.array().of(yup.object().required())
          )
          accumulator[field.name] = await sequential(value, async (item) => {
            const template = await this.tinaSchema.getTemplateForData({
              data: item,
              collection: {
                namespace,
                ...field,
              },
            })
            const payload = {}
            await sequential(template.fields, async (field) => {
              await this.resolveFieldData(field, item, payload)
            })
            const isUnion = !!field.templates
            return isUnion
              ? {
                  _template: lastItem(template.namespace),
                  ...payload,
                }
              : payload
          })
        } else {
          if (!value) {
            return
          }

          const template = await this.tinaSchema.getTemplateForData({
            data: value,
            collection: {
              namespace,
              ...field,
            },
          })
          const payload = {}
          await sequential(template.fields, async (field) => {
            await this.resolveFieldData(field, value, payload)
          })
          const isUnion = !!field.templates
          accumulator[field.name] = isUnion
            ? {
                _template: lastItem(template.namespace),
                ...payload,
              }
            : payload
        }

        break
      default:
        return field
    }
    return accumulator
  }

  /**
   * A mutation looks nearly identical between updateDocument:
   * ```graphql
   * updateDocument(collection: $collection,relativePath: $path, params: {
   *   post: {
   *     title: "Hello, World"
   *   }
   * })`
   * ```
   * and `updatePostDocument`:
   * ```graphql
   * updatePostDocument(relativePath: $path, params: {
   *   title: "Hello, World"
   * })
   * ```
   * The problem here is that we don't know whether the payload came from `updateDocument`
   * or `updatePostDocument` (we could, but for now it's easier not to pipe those details through),
   * But we do know that when given a `args.collection` value, we can assume that
   * this was a `updateDocument` request, and thus - should grab the data
   * from the corresponding field name in the key
   */
  private buildParams = (args: unknown) => {
    try {
      assertShape<{
        collection: string
        params: {
          [collectionName: string]: FieldParams
        }
      }>(args, (yup) =>
        yup.object({
          collection: yup.string().required(),
          params: yup.object().required(),
        })
      )
      return args.params[args.collection]
    } catch (e) {
      // we're _not_ in a `updateDocument` request
    }
    assertShape<{
      params: FieldParams
    }>(args, (yup) =>
      yup.object({
        params: yup.object().required(),
      })
    )
    return args.params
  }
}

const resolveDateInput = (value: string) => {
  /**
   * Convert string to `new Date()`
   */
  const date = new Date(value)
  if (!isValid(date)) {
    throw 'Invalid Date'
  }

  /**
   * toISOString() converts to UTC
   */
  return date.toISOString()
}

type FieldParams = {
  [fieldName: string]: string | { [key: string]: unknown } | FieldParams[]
}
