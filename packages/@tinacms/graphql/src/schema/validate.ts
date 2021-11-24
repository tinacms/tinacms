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
import { sequential } from '../util'
import * as yup from 'yup'

import type {
  TinaFieldEnriched,
  TinaCloudSchemaEnriched,
  TinaCloudSchemaBase,
  TinaCloudCollectionEnriched,
  TinaCloudTemplateEnriched,
} from '../types'
import { TinaField } from '../..'

const FIELD_TYPES: TinaField['type'][] = [
  'string',
  'number',
  'boolean',
  'datetime',
  'image',
  'reference',
  'object',
  'rich-text',
]

export const validateSchema = async (
  schema: TinaCloudSchemaBase
): Promise<TinaCloudSchemaBase> => {
  // @ts-ignore
  const schema2 = addNamespaceToSchema(
    _.cloneDeep(schema)
  ) as TinaCloudSchemaEnriched
  const collections = await sequential(
    schema2.collections,
    async (collection) => validateCollection(collection)
  )
  return {
    collections,
  }
}

const validateCollection = async (
  collection: TinaCloudCollectionEnriched
): Promise<TinaCloudCollectionEnriched> => {
  let templates: TinaCloudTemplateEnriched[] = []
  let fields: TinaFieldEnriched[] = []
  const messageName = collection.namespace.join('.')
  const collectionSchema = yup.object({
    name: yup
      .string()
      .matches(/^[a-zA-Z0-9_]*$/, {
        message: (obj) =>
          `Collection's "name" must match ${obj.regex} at ${messageName}`,
      })
      .required(),
    label: yup.string().required(),
    path: yup
      .string()
      .required()
      .transform((value) => {
        return value.replace(/^\/|\/$/g, '')
      }),
  })
  await collectionSchema.validate(collection)
  const validCollection = (await collectionSchema.cast(
    collection
  )) as TinaCloudCollectionEnriched
  if (validCollection.templates) {
    templates = await sequential(
      validCollection.templates,
      async (template) => {
        if (typeof template === 'string') {
          throw new Error(`Global templates are not yet supported`)
        }
        const fields = await sequential(template.fields, async (field) => {
          return validateField(field)
        })
        return {
          ...validCollection,
          ...fields,
        } as TinaCloudTemplateEnriched
      }
    )
  }
  if (validCollection.fields) {
    if (typeof validCollection.fields === 'string') {
      throw new Error(`Global templates are not yet supported`)
    }
    fields = await sequential(validCollection.fields, async (field) => {
      return validateField(field)
    })
    return {
      ...validCollection,
      fields,
    } as TinaCloudCollectionEnriched
  }

  return collection
}
const validateField = async (
  field: TinaFieldEnriched
): Promise<TinaFieldEnriched> => {
  const messageName = field.namespace.join('.')
  const schema = yup.object({
    name: yup
      .string()
      .matches(/^[a-zA-Z0-9_]*$/, {
        message: (obj) =>
          `Field's 'name' must match ${obj.regex} at ${messageName}`,
      })
      .required(),
    label: yup.string().required(),
    type: yup
      .string()
      .oneOf(
        FIELD_TYPES,
        (obj) =>
          `'type' must be one of: ${obj.values}, but got '${obj.value}' at ${messageName}`
      ),
  })
  await schema.validate(field)

  return field
}
