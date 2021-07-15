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
import { compileInner, defineSchema } from './index'
import _ from 'lodash'

type Case = Parameters<typeof defineSchema>[0]

const validFieldPartial: Case['collections'][0]['templates'][0]['fields'][0] = {
  type: 'text',
  label: 'Title',
  name: 'title',
}
const validTemplatePartial: Case['collections'][0]['templates'][0] = {
  label: 'Posts',
  name: 'posts',
  fields: [validFieldPartial],
}
const validSectionPartial: Case['collections'][0] = {
  label: 'Posts',
  path: 'content/posts',
  name: 'posts',
  templates: [validTemplatePartial],
}
const validSchema = { collections: [validSectionPartial] }
const safeReplaceAt = <T extends object>(
  object: T,
  path: string,
  value: unknown
): T => {
  return _.set(
    // cloneDeep so we dont mutate the object for other tests
    { ..._.cloneDeep(object) },
    path,
    value
  )
}

const invalidCases: { [key: string]: Case } = {
  //@ts-ignore
  'misspelled collection': { sectionz: [{}] },
  // @ts-ignore
  'no collection defiend': {},
  'collection with missing name': {
    collections: [{ ...validSectionPartial, name: undefined }],
  },
  'collection with missing label': {
    collections: [{ ...validSectionPartial, label: undefined }],
  },
  'collection with missing path': {
    collections: [{ ...validSectionPartial, path: undefined }],
  },
  'no template defined': {
    collections: [{ ...validSectionPartial, templates: undefined }],
  },
  'template with missing name': {
    collections: [
      {
        ...validSectionPartial,
        templates: [{ ...validTemplatePartial, name: undefined }],
      },
    ],
  },
  'template with missing label': {
    collections: [
      {
        ...validSectionPartial,
        templates: [{ ...validTemplatePartial, label: undefined }],
      },
    ],
  },
  'template with no fields defined': {
    collections: [
      {
        ...validSectionPartial,
        templates: [{ ...validTemplatePartial, fields: undefined }],
      },
    ],
  },
  'template with empty fields': {
    collections: [
      {
        ...validSectionPartial,
        // @ts-ignore
        templates: [{ ...validTemplatePartial, fields: [] }],
      },
    ],
  },
  'template with a field of an invalid type': {
    collections: [
      {
        ...validSectionPartial,
        templates: [
          {
            ...validTemplatePartial,
            // @ts-ignore
            fields: [{ ...validFieldPartial, type: 'some-type' }],
          },
        ],
      },
    ],
  },
  'group field with no sub-fields': {
    ...safeReplaceAt(validSchema, 'collections[0].templates[0].fields[0]', {
      ...validFieldPartial,
      type: 'group',
      fields: [],
    }),
  },
  'group field with invalid sub-field': {
    ...safeReplaceAt(validSchema, 'collections[0].templates[0].fields[0]', {
      ...validFieldPartial,
      type: 'group',
      fields: [{ ...validFieldPartial, type: 'some-field-type' }],
    }),
  },
  'block field with invalid template': {
    ...safeReplaceAt(validSchema, 'collections[0].templates[0].fields[0]', {
      ...validFieldPartial,
      type: 'blocks',
      templates: [
        {
          name: 'cta',
          label: 'cta',
          fields: [
            {
              name: 'title',
              label: undefined,
              type: 'text',
            },
          ],
        },
      ],
    }),
  },
  'reference field with a collection that does not exist': {
    ...safeReplaceAt(validSchema, 'collections[0].templates[0].fields[0]', {
      ...validFieldPartial,
      type: 'reference',
      collection: 'abc',
    }),
  },
}

const validCases: { [key: string]: Case } = {
  'valid config': { collections: [validSectionPartial] },
  'text field': { collections: [validSectionPartial] },
  'textarea field': safeReplaceAt(
    validSchema,
    'collections[0].templates[0].fields[0].type',
    'textarea'
  ),
  'select field': {
    ...safeReplaceAt(validSchema, 'collections[0].templates[0].fields[0]', {
      ...validFieldPartial,
      type: 'select',
      options: ['some-option'],
    }),
  },
  'list field': {
    ...safeReplaceAt(validSchema, 'collections[0].templates[0].fields[0]', {
      ...validFieldPartial,
      type: 'list',
    }),
  },
  'group field': {
    ...safeReplaceAt(validSchema, 'collections[0].templates[0].fields[0]', {
      ...validFieldPartial,
      type: 'group',
      fields: [validFieldPartial],
    }),
  },
  'group-list field': {
    ...safeReplaceAt(validSchema, 'collections[0].templates[0].fields[0]', {
      ...validFieldPartial,
      type: 'group-list',
      fields: [validFieldPartial],
    }),
  },
  'block field': {
    ...safeReplaceAt(validSchema, 'collections[0].templates[0].fields[0]', {
      ...validFieldPartial,
      type: 'blocks',
      templates: [
        {
          name: 'cta',
          label: 'cta',
          fields: [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
            },
          ],
        },
      ],
    }),
  },
  'toggle field': {
    ...safeReplaceAt(validSchema, 'collections[0].templates[0].fields[0]', {
      ...validFieldPartial,
      type: 'toggle',
    }),
  },
  'tags field': {
    ...safeReplaceAt(validSchema, 'collections[0].templates[0].fields[0]', {
      ...validFieldPartial,
      type: 'tags',
    }),
  },
  'image field': {
    ...safeReplaceAt(validSchema, 'collections[0].templates[0].fields[0]', {
      ...validFieldPartial,
      type: 'image',
    }),
  },
  'number field': {
    ...safeReplaceAt(validSchema, 'collections[0].templates[0].fields[0]', {
      ...validFieldPartial,
      type: 'number',
    }),
  },
  'reference field with a collection that exists': {
    ...safeReplaceAt(validSchema, 'collections[0].templates[0].fields[0]', {
      ...validFieldPartial,
      type: 'reference',
      collection: 'posts',
    }),
  },
  'reference-list field with a collection that exists': {
    ...safeReplaceAt(validSchema, 'collections[0].templates[0].fields[0]', {
      ...validFieldPartial,
      type: 'reference-list',
      collection: 'posts',
    }),
  },
}

describe('defineSchema', () => {
  describe('throws an error for invalid schemas', () => {
    Object.keys(invalidCases).map((key, index) => {
      it(key, async () => {
        const config = invalidCases[key]
        expect(() => defineSchema(config)).toThrowError()
      })
    })
  })
  describe('succeeds for valid schemas', () => {
    Object.keys(validCases).map((key, index) => {
      it(key, async () => {
        const config = validCases[key]
        expect(() => defineSchema(config)).not.toThrowError()
      })
    })
  })
})
