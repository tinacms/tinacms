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
import parseISO from 'date-fns/parseISO'
import format from 'date-fns/format'

import type { Templateable, TinaFieldEnriched } from '../types'
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
  public resolveCollection = async (collectionName: string) => {
    const collection = this.tinaSchema.getCollection(collectionName)
    const extraFields = {}
    // const res = this.tinaSchema.getTemplatesForCollectable(collection);
    // if (res.type === "object") {
    //   extraFields["fields"] = res.template.fields;
    // }
    // if (res.type === "union") {
    //   extraFields["templates"] = res.templates;
    // }
    const documents = await this.database.getDocumentsForCollection(
      collectionName
    )
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
    const template = await this.tinaSchema.getTemplateForData({
      data: rawData,
      collection,
    })

    const basename = path.basename(fullPath)
    const extension = path.extname(fullPath)
    const filename = basename.replace(extension, '')
    const relativePath = fullPath
      .replace(collection.path, '')
      .replace(/^\/|\/$/g, '')
    const breadcrumbs = filename.split('/')
    const form = {
      label: basename,
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
  }
  public resolveDocument = async ({
    value,
    args,
    collection: collectionName,
    isMutation,
    isCreation,
  }: {
    value: unknown
    args: unknown
    collection: string
    isMutation: boolean
    isCreation?: boolean
  }) => {
    const collectionNames = this.tinaSchema
      .getCollections()
      .map((item) => item.name)
    assertShape<string>(
      collectionName,
      (yup) => {
        return yup.mixed().oneOf(collectionNames)
      },
      `"collection" must be one of: [${collectionNames.join(
        ', '
      )}] but got ${collectionName}`
    )
    assertShape<{ relativePath: string }>(args, (yup) =>
      yup.object({ relativePath: yup.string().required() })
    )
    const collection = await this.tinaSchema.getCollection(collectionName)
    const realPath = path.join(collection?.path, args.relativePath)

    if (isMutation) {
      if (isCreation) {
        if (await this.database.documentExists(realPath)) {
          throw new Error(`Unable to add document, ${realPath} already exists`)
        }
      }
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
                  `Expected to find an objet for template params, but got string`
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
    }
    return this.getDocument(realPath)
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

  public resolveCollectionConnection = async ({
    args,
    lookup,
  }: {
    args: Record<string, Record<string, object>>
    lookup: CollectionDocumentListLookup
  }) => {
    const documents = await this.database.getDocumentsForCollection(
      lookup.collection
    )
    return {
      totalCount: documents.length,
      edges: await sequential(documents, async (filepath) => {
        const document = await this.getDocument(filepath)
        return {
          node: document,
        }
      }),
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
          if (field.fields) {
            const objectTemplate =
              typeof field.fields === 'string'
                ? this.tinaSchema.getGlobalTemplate(field.fields)
                : field
            if (Array.isArray(fieldValue)) {
              accum[fieldName] = fieldValue.map((item) =>
                // @ts-ignore FIXME Argument of type 'string | object' is not assignable to parameter of type '{ [fieldName: string]: string | object | (string | object)[]; }'
                this.buildFieldMutations(item, objectTemplate)
              )
            } else {
              accum[fieldName] = this.buildFieldMutations(
                // @ts-ignore FIXME Argument of type 'string | object' is not assignable to parameter of type '{ [fieldName: string]: string | object | (string | object)[]; }'
                fieldValue,
                objectTemplate
              )
            }
            break
          }
          if (field.templates) {
            if (Array.isArray(fieldValue)) {
              accum[fieldName] = fieldValue.map((item) => {
                if (typeof item === 'string') {
                  throw new Error(
                    `Expected object for template value for field ${field.name}`
                  )
                }
                const templates = field.templates.map(
                  (templateOrTemplateName) => {
                    if (typeof templateOrTemplateName === 'string') {
                      return this.tinaSchema.getGlobalTemplate(
                        templateOrTemplateName
                      )
                    }
                    return templateOrTemplateName
                  }
                )
                const [templateName] = Object.entries(item)[0]
                const template = templates.find(
                  (template) => template.name === templateName
                )
                if (!template) {
                  throw new Error(`Expected to find template ${templateName}`)
                }
                return {
                  // @ts-ignore FIXME Argument of type 'unknown' is not assignable to parameter of type '{ [fieldName: string]: string | { [key: string]: unknown; } | (string | { [key: string]: unknown; })[]; }'
                  ...this.buildFieldMutations(item[template.name], template),
                  _template: template.name,
                }
              })
            } else {
              throw new Error(
                'Not implement for polymorphic objects which are not lists'
              )
            }
            break
          }
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
      case 'string':
        accumulator[field.name] = field.isBody ? rawData._body : value
        break
      case 'boolean':
      case 'datetime':
      case 'number':
      case 'reference':
      case 'image':
        accumulator[field.name] = value
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
      case 'string':
        if (field.options) {
          if (field.list) {
            // FIXME: this is awaiting checkbox suppport
            return {
              component: 'checkbox',
              ...field,
              ...extraFields,
              options: field.options,
            }
          }
          return {
            component: 'select',
            ...field,
            ...extraFields,
            options: field.required
              ? field.options
              : [{ label: `Choose an option`, value: '' }, ...field.options],
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
      case 'reference':
        const documents = _.flatten(
          await sequential(field.collections, async (collectionName) => {
            return this.database.getDocumentsForCollection(collectionName)
          })
        )

        return {
          ...field,
          component: 'select',
          options: [
            { label: 'Choose an option', value: '' },
            ...documents.map((filepath) => {
              return {
                value: filepath,
                label: filepath,
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

const DEFAULT_DATE_FORMAT = 'MMM dd, yyyy'
const resolveDateInput = (
  value: string,
  field: { dateFormat?: string; timeFormat?: string }
) => {
  /**
   * Convert string to `new Date()`
   */
  const date = parseISO(value)
  if (!isValid(date)) {
    throw 'Invalid Date'
  }

  /**
   * Remove any local timezone offset (putting the date back in UTC)
   * https://stackoverflow.com/questions/48172772/time-zone-issue-involving-date-fns-format
   */
  const dateUTC = new Date(
    date.valueOf() + date.getTimezoneOffset() * 60 * 1000
  )

  /**
   * Determine dateFormat
   * This involves fixing inconsistencies between `moment.js` (that Tina uses to format dates)
   * and `date-fns` (that Gateway uses to format dates).
   * They are explained here:
   * https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
   */
  const dateFormat = field.dateFormat || DEFAULT_DATE_FORMAT
  const fixedDateFormat = dateFormat.replace(/D/g, 'd').replace(/Y/g, 'y')

  /**
   * Determine timeFormat, if any
   */
  const timeFormat = field.timeFormat || false

  /**
   * Format `date` and `time` parts
   */
  const datePart = format(dateUTC, fixedDateFormat)
  const timePart = timeFormat ? ` ${format(dateUTC, timeFormat)}` : ''
  return `${datePart}${timePart}`
}

type FieldParams = {
  [fieldName: string]: string | { [key: string]: unknown } | FieldParams[]
}
