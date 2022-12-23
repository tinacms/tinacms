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
import {
  Schema,
  Collection,
  SchemaField,
  Template,
  ObjectField,
} from './types/internal'
import { Schema as SchemaBase } from './types'
import { lastItem, assertShape, addNamespaceToSchema, NAMER } from './util'

type Version = {
  fullVersion: string
  major: string
  minor: string
  patch: string
}

type Meta = {
  flags?: string[]
}

/**
 * TinaSchema is responsible for allowing you to look up certain
 * properties of the user-provided schema with ease.
 *
 */
export class TinaSchema {
  public schema: Schema
  /**
   *
   * Create a schema class from a user defined schema object
   *
   * @param  {{version?:Version;meta?:Meta}&Schema} config
   */
  constructor(
    public config: { version?: Version; meta?: Meta } & (Schema | SchemaBase)
  ) {
    // @ts-ignore
    this.schema = addNamespaceToSchema(config)
  }
  public getIsTitleFieldName = (collection: string) => {
    const col = this.getCollection(collection)
    const field = col?.fields?.find((x) => x.type === 'string' && x.isTitle)
    return field?.name
  }

  public getCollectionsByName = (collectionNames: string[]) => {
    return this.schema.collections.filter((collection) =>
      collectionNames.includes(collection.name)
    )
  }
  public getAllCollectionPaths = () => {
    const paths = this.getCollections().map(
      (collection) => `${collection.path}${collection.match || ''}`
    )
    return paths
  }
  public getCollection = (collectionName: string): Collection => {
    const collection = this.schema.collections.find(
      (collection) => collection.name === collectionName
    )
    if (!collection) {
      throw new Error(`Expected to find collection named ${collectionName}`)
    }
    const extraFields: { [key: string]: object[] } = {}
    const templateInfo = this.getTemplatesForCollectable(collection)
    switch (templateInfo.type) {
      case 'object':
        extraFields['fields'] = templateInfo.template.fields
        break
      case 'union':
        extraFields['templates'] = templateInfo.templates
        break
    }
    return {
      // @ts-ignore FIXME: backwards compatibility, using `slug` should probably be deprecated
      slug: collection.name,
      ...extraFields,
      ...collection,
      format: collection.format || 'md',
    }
  }
  public getCollections = () => {
    return (
      this.schema.collections.map((collection) =>
        this.getCollection(collection.name)
      ) || []
    )
  }
  /**
   * @deprecated gobal templates not supported
   */
  public getGlobalTemplate = (templateName: string) => {
    // const globalTemplate = this.schema.templates?.find(
    //   (template) => template.name === templateName
    // )
    // if (!globalTemplate) {
    //   throw new Error(
    //     `Expected to find global template of name ${templateName}`
    //   )
    // }
    // return globalTemplate
    return null
  }
  public getCollectionByFullPath = (filepath: string) => {
    const collection = this.getCollections().find((collection) => {
      return filepath
        .replace(/\\/g, '/')
        .startsWith(collection.path.replace(/\/?$/, '/'))
    })
    if (!collection) {
      throw new Error(`Unable to find collection for file at ${filepath}`)
    }
    return collection
  }
  public getCollectionAndTemplateByFullPath = (
    filepath: string,
    templateName?: string
  ): {
    collection: Collection
    template: Template
  } => {
    let template
    const collection = this.getCollectionByFullPath(filepath)

    const templates = this.getTemplatesForCollectable(collection)
    if (templates.type === 'union') {
      if (templateName) {
        template = templates.templates.find(
          (template) => lastItem(template.namespace) === templateName
        )
        if (!template) {
          throw new Error(
            `Unable to determine template for item at ${filepath}`
          )
        }
      } else {
        throw new Error(
          `Unable to determine template for item at ${filepath}, no template name provided for collection with multiple templates`
        )
      }
    }
    if (templates.type === 'object') {
      template = templates.template
    }
    if (!template) {
      throw new Error(
        `Something went wrong while trying to determine template for ${filepath}`
      )
    }

    return { collection: collection, template: template }
  }
  public getTemplateForData = ({
    data,
    collection,
  }: {
    data?: unknown
    collection: Collection | ObjectField
  }): Template => {
    const templateInfo = this.getTemplatesForCollectable(collection)
    switch (templateInfo.type) {
      case 'object':
        return templateInfo.template
      case 'union':
        assertShape<{ _template: string }>(data, (yup) =>
          yup.object({ _template: yup.string().required() })
        )
        const template = templateInfo.templates.find(
          (template) =>
            template.namespace[template.namespace.length - 1] === data._template
        )
        if (!template) {
          // TODO: This should be a tina error
          throw new Error(
            `Expected to find template named '${
              data._template
            }' for collection '${lastItem(collection.namespace)}'`
          )
        }
        return template
    }
  }

  public transformPayload = (collectionName: string, payload: object) => {
    const collection = this.getCollection(collectionName)
    if (collection.templates) {
      const template = collection.templates.find((template) => {
        if (typeof template === 'string') {
          throw new Error('Global templates not supported')
        }
        return payload['_template'] === template.name
      })
      if (!template) {
        console.error(payload)
        throw new Error(`Unable to find template for payload`)
      }
      if (typeof template === 'string') {
        throw new Error('Global templates not supported')
      }
      return {
        [collectionName]: {
          [template.name]: this.transformCollectablePayload(payload, template),
        },
      }
    } else {
      return {
        [collectionName]: this.transformCollectablePayload(payload, collection),
      }
    }
  }
  private transformCollectablePayload = (
    payload: object,
    template: Collection | Template | ObjectField
  ) => {
    const accumulator = {}
    Object.entries(payload).forEach(([key, value]) => {
      if (typeof template.fields === 'string') {
        throw new Error('Global templates not supported')
      }
      const field = template.fields.find((field) => {
        if (typeof field === 'string') {
          throw new Error('Global templates not supported')
        }
        return field.name === key
      })
      if (field) {
        accumulator[key] = this.transformField(field, value)
      }
    })
    return accumulator
  }

  private transformField = (field: SchemaField, value: unknown) => {
    if (field.type === 'object')
      if (field.templates) {
        if (field.list) {
          assertShape<{ _template: string }[]>(value, (yup) =>
            yup.array(yup.object({ _template: yup.string().required() }))
          )
          return value.map((item) => {
            const { _template, ...rest } = item
            const template = field.templates.find((template) => {
              if (typeof template === 'string') {
                return false
              }
              return template.name === _template
            })
            if (typeof template === 'string') {
              throw new Error('Global templates not supported')
            }
            return {
              [_template]: this.transformCollectablePayload(rest, template),
            }
          })
        } else {
          assertShape<{ _template: string }>(value, (yup) =>
            yup.object({ _template: yup.string().required() })
          )
          const { _template, ...rest } = value
          return { [_template]: this.transformCollectablePayload(rest, field) }
        }
      } else {
        return value
      }
    else {
      return value
    }
  }

  public isMarkdownCollection = (collectionName: string) => {
    const collection = this.getCollection(collectionName)
    const format = collection.format
    // markdown by default
    if (!format) {
      return true
    }
    if (['markdown', 'md'].includes(format)) {
      return true
    }
    return false
  }

  /**
   * Gets the template or templates from the item.
   * Both `object` fields and collections support
   * the ability for an object to be polymorphic,
   * and if it is, we need to build unions, which
   * are more of a headache for non-polymorphic
   * needs, so we also need the ability to just
   * build object types
   *
   *
   */
  public getTemplatesForCollectable = (
    collection: Collection | ObjectField
  ):
    | { type: 'object'; namespace: string[]; template: Template }
    | { type: 'union'; namespace: string[]; templates: Template[] } => {
    let extraFields: SchemaField[] = []
    // collection.references deprecated
    // if (collection.references) {
    //   extraFields = collection.references
    // }
    if (collection.fields) {
      const template =
        typeof collection.fields === 'string'
          ? this.getGlobalTemplate(collection.fields)
          : collection

      if (
        typeof template.fields === 'string' ||
        typeof template.fields === 'undefined'
      ) {
        throw new Error('Exptected template to have fields but none were found')
      }

      return {
        namespace: collection.namespace,
        type: 'object',
        template: {
          ...template,
          fields: [...template.fields, ...extraFields],
        },
      }
    } else {
      if (collection.templates) {
        return {
          namespace: collection.namespace,
          type: 'union',
          templates: collection.templates.map((templateOrTemplateString) => {
            const template =
              typeof templateOrTemplateString === 'string'
                ? this.getGlobalTemplate(templateOrTemplateString)
                : templateOrTemplateString
            return {
              ...template,
              fields: [...template.fields, ...extraFields],
            }
          }),
        }
      } else {
        throw new Error(
          `Expected either fields or templates array to be defined on collection ${collection.namespace.join(
            '_'
          )}`
        )
      }
    }
  }

  public resolveForm = ({
    collection,
    basename,
    templateName,
    schema,
  }: {
    collection: Collection
    basename: string
    templateName?: string
    schema: TinaSchema
  }) => {
    const template = collection.templates
      ? collection.templates.find((template) => template.name === templateName)
      : collection
    return {
      id: basename,
      label: collection.label,
      name: basename,
      fields: template.fields.map((field) => {
        return this.resolveField(field, schema)
      }),
    }
  }

  public resolveField = (
    field: SchemaField,
    schema: TinaSchema
  ): { [key: string]: unknown } => {
    field
    // @ts-ignore this logic will soon be deprecated
    field.parentTypename = NAMER.dataTypeName(
      // Get the type of the parent namespace
      field.namespace.filter((_, i) => i < field.namespace.length - 1)
    )
    return field
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
          // TODO: correct the type
          // @ts-ignore
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
        // TODO: correct the type
        // @ts-ignore
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
        const templateInfo = schema.getTemplatesForCollectable(field)
        if (templateInfo.type === 'object') {
          // FIXME: need to finish group/group-list
          return {
            ...field,
            component: field.list ? 'group-list' : 'group',
            fields: templateInfo.template.fields.map((field) =>
              this.resolveField(field, schema)
            ),
            ...extraFields,
          }
        } else if (templateInfo.type === 'union') {
          const templates: { [key: string]: object } = {}
          const typeMap: { [key: string]: string } = {}
          templateInfo.templates.forEach((template) => {
            const extraFields = template.ui || {}
            const templateName = lastItem(template.namespace)
            typeMap[templateName] = NAMER.dataTypeName(template.namespace)
            templates[lastItem(template.namespace)] = {
              // @ts-ignore FIXME `Templateable` should have name and label properties
              label: template.label || templateName,
              key: templateName,
              namespace: [...field.namespace, templateName],
              fields: template.fields.map((field) =>
                this.resolveField(field, schema)
              ),
              ...extraFields,
            }
            return true
          })

          return {
            ...field,
            typeMap,
            namespace: field.namespace,
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
        field.templates?.forEach((template) => {
          if (typeof template === 'string') {
            throw new Error(`Global templates not yet supported for rich-text`)
          } else {
            const extraFields = template.ui || {}
            // console.log({ namespace: template.namespace })

            // template.namespace is undefined
            const templateName = lastItem(template.namespace)
            typeMap[templateName] = NAMER.dataTypeName(template.namespace)
            templates[lastItem(template.namespace)] = {
              // @ts-ignore FIXME `Templateable` should have name and label properties
              label: template.label || templateName,
              key: templateName,
              inline: template.inline,
              name: templateName,
              match: template.match,
              fields: template.fields.map((field) =>
                this.resolveField(field, schema)
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
        return {
          ...field,
          component: 'reference',
          ...extraFields,
        }
      default:
        // @ts-ignore
        throw new Error(`Unknown field type ${field.type}`)
    }
  }
}
