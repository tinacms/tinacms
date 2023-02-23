/**

*/

import { addNamespaceToSchema } from '../ast-builder'
import _ from 'lodash'
import { sequential } from '../util'
import * as yup from 'yup'

import {
  TinaFieldBase,
  TinaFieldEnriched,
  TinaCloudSchema,
  TinaCloudCollection,
  Template,
  validateTinaCloudSchemaConfig,
} from '@tinacms/schema-tools'

const FIELD_TYPES: TinaFieldBase['type'][] = [
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
  schema: TinaCloudSchema
  // TODO: maybe will need to add a return type back
) => {
  const schema2: TinaCloudSchema<true> = addNamespaceToSchema<
    TinaCloudSchema<true>
  >(_.cloneDeep(schema) as unknown as TinaCloudSchema<true>)
  const collections = await sequential(
    schema2.collections,
    async (collection) => validateCollection(collection)
  )
  validationCollectionsPathAndMatch(collections)
  if (schema2.config) {
    const config = validateTinaCloudSchemaConfig(schema2.config)
    return {
      collections,
      config,
    }
  }
  return {
    collections,
  }
}

const validationCollectionsPathAndMatch = (
  collections: TinaCloudCollection<true>[]
) => {
  // Early return if no two `path` are the same
  const paths = collections.map((x) => x.path)
  if (paths.length === new Set(paths).size) {
    // If the paths are all different it is valid
    return
  }

  // make sure that no two collections have the same `path` when no `matches is present`
  // checks this type of invalid state
  // {
  //   path: 'content/posts'
  // },
  // {
  //   path: 'content/posts'
  // }

  const noMatchCollections = collections
    .filter((x) => {
      return typeof x?.match === 'undefined'
    })
    .map((x) => x.path)

  if (noMatchCollections.length !== new Set(noMatchCollections).size) {
    throw new Error('path must be unique')
  }

  // Make sure both path and match are not the same

  // checks this type of invalid state
  // {
  //   path: 'content/posts',
  //   matches: '**/*.en.md'
  // },{
  //   path: 'content/posts'
  //   matches: '**/*.en.md'
  // }

  const hasMatchAndPath = collections
    .filter((x) => {
      return typeof x.path !== 'undefined' && typeof x.match !== 'undefined'
    })
    .map((x) => `${x.path}|${x.match}`)

  if (hasMatchAndPath.length !== new Set(hasMatchAndPath).size) {
    throw new Error('Both `match` and `path` can not be the same')
  }

  // Check to make sure that when two paths are the same they all have different matches
  // checks this type of invalid state
  //  {
  //   path: 'content/posts',
  //   matches: '**/*.en.md'
  // },
  // {
  //   path: 'content/posts'
  // }
  const groupbyPath = collections.reduce((r, a) => {
    r[a.path] = r[a.path] || []
    r[a.path].push(a)
    return r
  }, Object.create(null))

  Object.keys(groupbyPath).forEach((key) => {
    const collectionsArr: TinaCloudCollection<true>[] = groupbyPath[key]
    if (collectionsArr.length === 1) {
      return
    }
    // check if one or more does not have the "matches key" it is invalid
    const matches = collectionsArr.filter((x) => {
      return typeof x.match !== 'undefined'
    })
    if (matches.length !== collections.length) {
      throw new Error('path must be unique when no `match` is provided')
    }
  })
}

// TODO: use ZOD instead of Yup
const validateCollection = async (
  collection: TinaCloudCollection<true>
): Promise<TinaCloudCollection<true>> => {
  let templates: Template<true>[] = []
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
  )) as TinaCloudCollection<true>
  if (validCollection.templates) {
    templates = await sequential(
      validCollection.templates,
      async (template) => {
        const fields = await sequential(template.fields, async (field) => {
          return validateField(field)
        })
        return {
          ...validCollection,
          ...fields,
        } as Template<true>
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
    } as TinaCloudCollection<true>
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
