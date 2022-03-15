import {
  TinaFieldEnriched,
  TinaCloudCollection,
  Templateable,
  Collectable,
  TinaCloudSchemaEnriched,
  TinaCloudSchemaBase,
  CollectionTemplateable,
} from '../types'
import { assertShape } from '..'

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
 */
export class TinaSchema {
  public schema: TinaCloudSchemaEnriched
  constructor(
    public config: { version?: Version; meta?: Meta } & TinaCloudSchemaBase
  ) {
    // @ts-ignore
    this.schema = config
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
  public getCollection = (
    collectionName: string
  ): TinaCloudCollection<true> => {
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
  public getGlobalTemplate = (templateName: string) => {
    const globalTemplate = this.schema.templates?.find(
      (template) => template.name === templateName
    )
    if (!globalTemplate) {
      throw new Error(
        `Expected to find global template of name ${templateName}`
      )
    }
    return globalTemplate
  }
  public getCollectionByFullPath = async (filepath: string) => {
    const collection = this.getCollections().find((collection) => {
      return filepath.replace('\\', '/').startsWith(collection.path)
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
    collection: TinaCloudCollection<true>
    template: Templateable
  } => {
    let template
    const collection = this.getCollections().find((collection) => {
      // FIXME: searching by startsWith will break for collections
      // that only differ by their "matches" property (eg. **/*.en.md vs **/*.fr.md)
      return filepath.replace('\\', '/').startsWith(collection.path)
    })
    if (!collection) {
      throw new Error(`Unable to find collection for file at ${filepath}`)
    }
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
  public getTemplateForData = async ({
    data,
    collection,
  }: {
    data?: unknown
    collection: Collectable
  }): Promise<Templateable> => {
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
            // {
            //   collection: lastItem(collection.namespace),
            //   possibleTemplates: templateInfo.templates.map((template) =>
            //     lastItem(template.namespace)
            //   ),
            //   data: data,
            // }
          )
        }
        return template
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
    collection: Collectable
  ): CollectionTemplateable => {
    let extraFields: TinaFieldEnriched[] = []
    if (collection.references) {
      extraFields = collection.references
    }
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
        // @ts-ignore FIXME: Templateable should have a 'name' property
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
}

/**
 * Iterate through an array of promises sequentially, ensuring the order
 * is preserved.
 *
 * ```js
 * await sequential(templates, async (template) => {
 *   await doSomething(template)
 * })
 * ```
 */
export const sequential = async <A, B>(
  items: A[] | undefined,
  callback: (args: A, idx: number) => Promise<B>
) => {
  const accum: B[] = []
  if (!items) {
    return []
  }

  const reducePromises = async (previous: Promise<B>, endpoint: A) => {
    const prev = await previous
    // initial value will be undefined
    if (prev) {
      accum.push(prev)
    }

    return callback(endpoint, accum.length)
  }

  // @ts-ignore FIXME: this can be properly typed
  const result = await items.reduce(reducePromises, Promise.resolve())
  if (result) {
    // @ts-ignore FIXME: this can be properly typed
    accum.push(result)
  }

  return accum
}

export const lastItem = (arr: (number | string)[]) => {
  return arr[arr.length - 1]
}

const capitalize = (s: string) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}
const generateNamespacedFieldName = (names: string[], suffix: string = '') => {
  return (suffix ? [...names, suffix] : names).map(capitalize).join('')
}

export const NAMER = {
  dataFilterTypeNameOn: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, '_FilterOn')
  },
  dataFilterTypeName: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, 'Filter')
  },
  dataMutationTypeNameOn: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, '_MutationOn')
  },
  dataMutationTypeName: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, 'Mutation')
  },
  updateName: (namespace: string[]) => {
    return 'update' + generateNamespacedFieldName(namespace, 'Document')
  },
  createName: (namespace: string[]) => {
    return 'create' + generateNamespacedFieldName(namespace, 'Document')
  },
  queryName: (namespace: string[]) => {
    return 'get' + generateNamespacedFieldName(namespace, 'Document')
  },
  generateQueryListName: (namespace: string[]) => {
    return 'get' + generateNamespacedFieldName(namespace, 'List')
  },
  fragmentName: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, '') + 'Parts'
  },
  collectionTypeName: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, 'Collection')
  },
  documentTypeName: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, 'Document')
  },
  dataTypeName: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, '')
  },
  referenceConnectionType: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, 'Connection')
  },
  referenceConnectionEdgesTypeName: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, 'ConnectionEdges')
  },
}

type ResolveFormArgs = {
  collection: TinaCloudCollection<true>
  basename: string
  template: Templateable
  schema: TinaSchema
}

export const resolveForm = async ({
  collection,
  basename,
  template,
  schema,
}: ResolveFormArgs) => {
  return {
    label: collection.label,
    name: basename,
    fields: await sequential(template.fields, async (field) => {
      // fieldNode.selectionSet?.selections.find(selection => {
      //   selection
      // })
      return resolveField(field, schema)
    }),
  }
}

export const resolveField = async (
  { namespace, ...field }: TinaFieldEnriched,
  schema: TinaSchema
): Promise<unknown> => {
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
          options: [{ label: `Choose an option`, value: '' }, ...field.options],
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
      const templateInfo = schema.getTemplatesForCollectable({
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
            async (field) => await resolveField(field, schema)
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
              async (field) => await resolveField(field, schema)
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
              async (field) => await resolveField(field, schema)
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
      // const documents = _.flatten(
      //   await sequential(field.collections, async (collectionName) => {
      //     const collection = schema.getCollection(collectionName)
      //     return this.database.store.glob(collection.path)
      //   })
      // )

      return {
        ...field,
        component: 'reference',
        //   TODO: This is where we can pass args to reference
        //   options: [
        // { label: 'Choose an option', value: '' },
        // ...documents.map((document) => {
        //   return {
        //     value: document,
        //     label: document,
        //   }
        // }),
        //   ],
        ...extraFields,
      }
    default:
      // @ts-ignore
      throw new Error(`Unknown field type ${field.type}`)
  }
}
