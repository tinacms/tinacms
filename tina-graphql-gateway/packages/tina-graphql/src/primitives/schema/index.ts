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

import { addNamespaceToSchema } from '../ast-builder'
import _ from 'lodash'
import { lastItem, assertShape } from '../util'

import type {
  CollectionTemplateable,
  Collectable,
  TinaFieldEnriched,
  TinaCloudSchemaEnriched,
  TinaCloudSchemaBase,
  Templateable,
  TinaCloudCollection,
} from '../types'

export const createSchema = async ({
  schema,
}: {
  schema: TinaCloudSchemaBase
}) => {
  return new TinaSchema(schema)
}

/**
 * TinaSchema is responsible for allowing you to look up certain
 * properties of the user-provided schema with ease.
 */
export class TinaSchema {
  public schema: TinaCloudSchemaEnriched
  constructor(public config: TinaCloudSchemaBase) {
    // @ts-ignore
    this.schema = addNamespaceToSchema(
      _.cloneDeep(config)
    ) as TinaCloudSchemaEnriched
  }

  public getCollectionsByName = (collectionNames: string[]) => {
    return this.schema.collections.filter((collection) =>
      collectionNames.includes(collection.name)
    )
  }
  public getCollection = (collectionName: string) => {
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
      slug: collection.name,
      ...extraFields,
      ...collection,
    }
  }
  public getCollections = () => {
    return this.schema.collections || []
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
      return filepath.startsWith(collection.path)
    })
    if (!collection) {
      throw new Error(`Unable to find collection for file at ${filepath}`)
    }
    return collection
  }
  public getCollectionAndTemplateByFullPath = async (
    filepath: string,
    templateName?: string
  ): Promise<{
    collection: TinaCloudCollection<true>
    template: Templateable
  }> => {
    let template
    const collection = this.getCollections().find((collection) => {
      return filepath.startsWith(collection.path)
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
          throw new Error(`Exptected to find template named ${data._template}`)
        }
        return template
    }
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
