/**

*/

import { addNamespaceToSchema } from '../ast-builder'
import _ from 'lodash'
import { sequential } from '../util'
import * as yup from 'yup'

import {
  TinaField,
  Schema,
  Collection,
  Template,
  validateTinaCloudSchemaConfig,
} from '@tinacms/schema-tools'

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

export const validateSchema = async (schema: Schema) => {
  const schema2: Schema<true> = addNamespaceToSchema<Schema<true>>(
    _.cloneDeep(schema) as unknown as Schema<true>
  )
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

const validationCollectionsPathAndMatch = (collections: Collection<true>[]) => {
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
    .map((x) => `${x.path}${x.format || 'md'}`)

  if (noMatchCollections.length !== new Set(noMatchCollections).size) {
    throw new Error(
      // TODO: add a link to the docs
      'Two collections without match can not have the same `path`. Please make the `path` unique or add a matches property to the collection.'
    )
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
    .map(
      (x) =>
        `${x.path}|${x?.match?.exclude || ''}|${x?.match?.include || ''}|${
          x.format || 'md'
        }`
    )

  if (hasMatchAndPath.length !== new Set(hasMatchAndPath).size) {
    throw new Error(
      'Can not have two or more collections with the same path and match. Please update either the path or the match to be unique.'
    )
  }

  // Check to make sure that when two paths are the same they all have different matches
  const groupbyPath = collections.reduce((r, a) => {
    const key = `${a.path}|${a.format || 'md'}`
    r[key] = r[key] || []
    r[key].push(a)
    return r
  }, Object.create(null))
  Object.keys(groupbyPath).forEach((key) => {
    const collectionsArr: Collection<true>[] = groupbyPath[key]

    // if there is only one collection with this path
    if (collectionsArr.length === 1) {
      return
    }

    // check to make sure each collection has a match
    // checks this type of invalid state
    //  {
    //   path: 'content/posts',
    //   matches: '**/*.en.md'
    // },
    // {
    //   path: 'content/posts'
    // }
    if (collectionsArr.some((x) => typeof x.match === 'undefined')) {
      throw new Error(
        "Can not have two or more collections with the same path and format if one doesn't have a match property"
      )
    }

    const matches = collectionsArr.map((x) =>
      typeof x?.match === 'object' ? JSON.stringify(x.match) : ''
    )
    if (matches.length === new Set(matches).size) {
      return
    }
    throw new Error(
      'Can not have two or more collections with the same path format and match. Please update either the path or the match to be unique.'
    )
  })
}

// TODO: use ZOD instead of Yup
const validateCollection = async (
  collection: Collection<true>
): Promise<Collection<true>> => {
  let templates: Template<true>[] = []
  let fields: TinaField<true>[] = []
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
      .test('is-required', 'path is a required field', (value) => {
        if (value === '') {
          return true
        }
        return yup.string().required().isValidSync(value)
      })
      .transform((value) => {
        return value.replace(/^\/|\/$/g, '')
      }),
  })
  await collectionSchema.validate(collection)
  const validCollection = (await collectionSchema.cast(
    collection
  )) as Collection<true>
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
    } as Collection<true>
  }

  return collection
}
const validateField = async (
  field: TinaField<true>
): Promise<TinaField<true>> => {
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

  const validField = (await schema.cast(field)) as TinaField<true>

  return validField
}
