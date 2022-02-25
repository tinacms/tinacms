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
import path from 'path'
import { TinaSchema } from '../schema'
import { assertShape, sequential, lastItem } from '../util'
import { NAMER } from '../ast-builder'
import { Database, CollectionDocumentListLookup } from '../database'
import isValid from 'date-fns/isValid'
import { parseMDX, stringifyMDX } from '../mdx'
import flat from 'flat'

import type {
  Templateable,
  TinaFieldEnriched,
  Collectable,
  TinaCloudCollection,
} from '../types'
import { TinaError } from './error'
import {OP} from '@tinacms/datalayer'
import {BinaryFilter} from '@tinacms/datalayer/dist'

interface ResolverConfig {
  database: Database
  tinaSchema: TinaSchema
}

export const createResolver = (args: ResolverConfig) => {
  return new Resolver(args)
}

/**
 * The resolver provides functions for all possible types of lookup
 * values and retrieves them from the database
 */
export class Resolver {
  public database: Database
  public tinaSchema: TinaSchema
  constructor(public init: ResolverConfig) {
    this.database = init.database
    this.tinaSchema = init.tinaSchema
  }
  public resolveCollection = async (
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
    let documents = {}
    if (hasDocuments) {
      documents = await this.getDocumentsForCollection(collectionName)
    }
    return {
      documents,
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

      const basename = path.basename(fullPath)
      const extension = path.extname(fullPath)
      const filename = basename.replace(extension, '')
      const relativePath = fullPath
        .replace('\\', '/')
        .replace(collection.path, '')
        .replace(/^\/|\/$/g, '')
      const breadcrumbs = filename.split('/')
      const form = {
        label: collection.label,
        name: basename,
        fields: await sequential(template.fields, async (field) => {
          // fieldNode.selectionSet?.selections.find(selection => {
          //   selection
          // })
          return this.resolveField(field)
        }),
      }
      const data = {
        _collection: rawData._collection,
        _template: rawData._template,
      }
      await sequential(template.fields, async (field) =>
        this.resolveFieldData(field, rawData, data)
      )

      return {
        __typename: NAMER.documentTypeName([rawData._collection]),
        id: fullPath,
        sys: {
          basename,
          filename,
          extension,
          path: fullPath,
          relativePath,
          breadcrumbs,
          collection,
          template: lastItem(template.namespace),
        },
        data,
        values: data,
        dataJSON: data,
        form: form,
      }
    } catch (e) {
      if (e instanceof TinaError) {
        // Attach additional information
        throw new TinaError(e.message, {
          requestedDocument: fullPath,
          ...e.extensions,
        })
      }
      throw e
    }
  }

  public getDocumentFields = async () => {
    try {
      const response = {}
      const collections = await this.tinaSchema.getCollections()

      /**
       * Iterate through collections...
       */
      await sequential(collections, async (collection) => {
        const collectable =
          this.tinaSchema.getTemplatesForCollectable(collection)

        switch (collectable.type) {
          /**
           * Collection with no templates...
           */
          case 'object':
            if (collectable.required) {
              console.warn(
                "WARNING: `{type: 'object', required: true}` is unsupported by our User Interface and could result in errors"
              )
            }
            response[collection.name] = {
              collection,
              fields: await sequential(
                collectable.template.fields,
                async (field) => {
                  return this.resolveField(field)
                }
              ),
              mutationInfo: {
                includeCollection: true,
                includeTemplate: false,
              },
            }
            break
          /**
           * Collection with n templates...
           */
          case 'union':
            const templates = {}
            /**
             * Iterate through templates...
             */
            await sequential(collectable.templates, async (template) => {
              templates[lastItem(template.namespace)] = {
                template,
                fields: await sequential(template.fields, async (field) => {
                  return this.resolveField(field)
                }),
              }
            })

            response[collection.name] = {
              collection,
              templates,
              mutationInfo: { includeCollection: true, includeTemplate: true },
            }
            break
        }
      })

      return response
    } catch (e) {
      throw e
    }
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
    await this.database.put(realPath, params)
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
            await this.database.put(realPath, values)
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
              await this.database.put(realPath, values)
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
    await this.database.put(realPath, params)
    return this.getDocument(realPath)
  }

  public resolveDocument = async ({
    args,
    collection: collectionName,
    isMutation,
    isCreation,
    isAddPendingDocument,
    isCollectionSpecific,
  }: {
    args: unknown
    collection?: string
    isMutation: boolean
    isCreation?: boolean
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

  public getDocumentsForCollection = async (collectionName: string) => {
    const collection = this.tinaSchema.getCollection(collectionName)
    return this.database.store.glob(collection.path, this.getDocument)
  }

  public resolveCollectionConnection = async ({
    args,
    lookup,
  }: {
    args: Record<string, Record<string, object> | string | number>
    lookup: CollectionDocumentListLookup
  }) => {
    let edges
    let pageInfo
    if (args.filter || args.index) {
      const collection = this.tinaSchema.getCollection(lookup.collection)
      //validate the index exists
      if (args.index && (!collection.indexes || collection.indexes.map(index => index.name).indexOf(args.index as string) === -1)) {
        throw new Error(`index '${args.index}' on collection '${collection.name}' does not exist`)
      }

      const queries = []
      if (args.filter) {
        const flattenedArgs = flat(args.filter, { delimiter: '#' })
        Object.entries(flattenedArgs).map(([key, value]) => {
          const keys = key.split('#')
          // If the collection has templates, this will be a template name, otherwise it'll be the attribute
          const maybeTemplateName = keys[0]
          const realKey = keys.slice(0, keys.length - 1).join('#')

          let templateName = collection.name
          if (collection.templates) {
            const template = collection.templates.find((template) => {
              if (typeof template === 'string') {
                throw new Error('Global templates not yet supported for queries')
              }
              return template.name === maybeTemplateName
            })
            if (typeof template === 'string') {
              throw new Error('Global templates not yet supported for queries')
            }
            if (template) {
              templateName = template.name
            }
          }
          // TODO not sure what to do with templates?
          // queries.push(
          //   `__attribute__${lookup.collection}#${templateName}#${realKey}#${value}`
          // )
          queries.push(value)
        })
      }

      // TODO can only support one filter in dynamodb - should we define capabilties and allow more?
      const result = await this.database.query(this.makeQueryParams(args, queries[0]), this.getDocument)
      edges = result.edges
      pageInfo = result.pageInfo
    } else {
      const collection = await this.tinaSchema.getCollection(lookup.collection)
      edges = (await this.database.store.glob(
        collection.path,
        this.getDocument
      )).map((document) => ({
        node: document
      }))
    }

    return {
      totalCount: edges.length,
      edges,
      pageInfo: pageInfo || {
        hasPreviousPage: false,
        hasNextPage: false,
        startCursor: "",
        endCursor: ""
      }
    }
  }

  private inferOperatorFromFilter(filter: Record<string, object> | string | number) {
    const key = Object.keys(filter).pop()
    if (!filter[key]) {
      throw new Error(`expected filter for key = ${key}`)
    }
    if ('after' in filter[key]) {
      return OP.GT
    } else if ('before' in filter[key]) {
      return OP.LT
    } else if ('eq' in filter[key]) {
      return OP.EQ
    } else if ('startsWith' in filter[key]) {
      return OP.BEGINS_WITH
    } else if ('lt' in filter[key]) {
      return OP.LT
    } else if ('gt' in filter[key]) {
      return OP.GT
    } else if ('gte' in filter[key]) {
      return OP.GTE
    } else if ('lte' in filter[key]) {
      return OP.LTE
    } else {
      throw new Error('unsupported filter operator' + filter[key])
    }
  }

  private makeQueryParams(args: Record<string, Record<string, object> | string | number>, query: any) {
    // TODO BETWEEN should be supported in level..
    return {
      filter: args.filter ? {
        rightOperand: query,
        operator: this.inferOperatorFromFilter(args.filter)
      } as BinaryFilter : undefined,
      index: args.index as string,
      first: args.first as number,
      last: args.last as number,
      before: args.before as string,
      after: args.after as string
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
        case 'image':
          accum[fieldName] = fieldValue
          break
        case 'object':
          accum[fieldName] = this.buildObjectMutations(fieldValue, field)
          break
        case 'rich-text':
          field
          accum[fieldName] = stringifyMDX(fieldValue, field)
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
      case 'image':
        accumulator[field.name] = value
        break
      case 'rich-text':
        // @ts-ignore value is unknown
        const tree = parseMDX(value, field)
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

  private resolveField = async ({
    namespace,
    ...field
  }: TinaFieldEnriched): Promise<unknown> => {
    const extraFields = field.ui || {}
    switch (field.type) {
      case 'number':
        return {
          component: 'number',
          ...field,
          ...extraFields,
        }
      case 'datetime':
        return {
          component: 'date',
          ...field,
          ...extraFields,
        }
      case 'boolean':
        return {
          component: 'toggle',
          ...field,
          ...extraFields,
        }
      case 'image':
        return {
          component: 'image',
          clearable: true,
          ...field,
          ...extraFields,
        }
      case 'string':
        if (field.options) {
          if (field.list) {
            return {
              component: 'checkbox-group',
              ...field,
              ...extraFields,
              options: field.options,
            }
          }
          return {
            component: 'select',
            ...field,
            ...extraFields,
            options: [
              { label: `Choose an option`, value: '' },
              ...field.options,
            ],
          }
        }
        if (field.list) {
          return {
            // Allows component to be overridden for scalars
            component: 'list',
            field: {
              component: 'text',
            },
            ...field,
            ...extraFields,
          }
        }
        return {
          // Allows component to be overridden for scalars
          component: 'text',
          ...field,
          ...extraFields,
        }
      case 'object':
        const templateInfo = this.tinaSchema.getTemplatesForCollectable({
          ...field,
          namespace,
        })
        if (templateInfo.type === 'object') {
          // FIXME: need to finish group/group-list
          return {
            ...field,
            component: field.list ? 'group-list' : 'group',
            fields: await sequential(
              templateInfo.template.fields,
              async (field) => await this.resolveField(field)
            ),
            ...extraFields,
          }
        } else if (templateInfo.type === 'union') {
          const templates: { [key: string]: object } = {}
          const typeMap: { [key: string]: string } = {}
          await sequential(templateInfo.templates, async (template) => {
            const extraFields = template.ui || {}
            const templateName = lastItem(template.namespace)
            typeMap[templateName] = NAMER.dataTypeName(template.namespace)
            templates[lastItem(template.namespace)] = {
              // @ts-ignore FIXME `Templateable` should have name and label properties
              label: template.label || templateName,
              key: templateName,
              fields: await sequential(
                template.fields,
                async (field) => await this.resolveField(field)
              ),
              ...extraFields,
            }
            return true
          })
          return {
            ...field,
            typeMap,
            component: field.list ? 'blocks' : 'not-implemented',
            templates,
            ...extraFields,
          }
        } else {
          throw new Error(`Unknown object for resolveField function`)
        }
      case 'rich-text':
        const templates: { [key: string]: object } = {}
        const typeMap: { [key: string]: string } = {}
        await sequential(field.templates, async (template) => {
          if (typeof template === 'string') {
            throw new Error(`Global templates not yet supported for rich-text`)
          } else {
            const extraFields = template.ui || {}
            const templateName = lastItem(template.namespace)
            typeMap[templateName] = NAMER.dataTypeName(template.namespace)
            templates[lastItem(template.namespace)] = {
              // @ts-ignore FIXME `Templateable` should have name and label properties
              label: template.label || templateName,
              key: templateName,
              inline: template.inline,
              name: templateName,
              fields: await sequential(
                template.fields,
                async (field) => await this.resolveField(field)
              ),
              ...extraFields,
            }
            return true
          }
        })
        return {
          ...field,
          templates: Object.values(templates),
          component: 'rich-text',
          ...extraFields,
        }
      case 'reference':
        const documents = _.flatten(
          await sequential(field.collections, async (collectionName) => {
            const collection = this.tinaSchema.getCollection(collectionName)
            return this.database.store.glob(collection.path)
          })
        )

        return {
          ...field,
          component: 'reference',
          options: [
            { label: 'Choose an option', value: '' },
            ...documents.map((document) => {
              return {
                value: document,
                label: document,
              }
            }),
          ],
          ...extraFields,
        }
      default:
        // @ts-ignore
        throw new Error(`Unknown field type ${field.type}`)
    }
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
