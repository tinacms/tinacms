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

import { validateSchema } from '../../schema/validate'
import { TinaField } from '../../..'

const baseField: TinaField = {
  label: 'Title',
  name: 'myTitle',
  type: 'string',
}

const baseCollection = {
  label: 'Some label',
  name: 'someName',
  path: 'content/some-path',
  fields: [baseField],
}

describe('The schema validation', () => {
  it(`Throws an error for "global" templates which aren't yet supported`, async () => {
    await expect(
      validateSchema({
        templates: [
          {
            name: 'globalTemplate',
            label: 'Global Template',
            fields: [baseField],
          },
        ],

        collections: [
          {
            ...baseCollection,
            fields: 'globalTemplate',
          },
        ],
      })
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Global templates are not yet supported"`
    )
  })
  it(`Throws an error for field names that use title-casing`, async () => {
    await expect(
      validateSchema({
        collections: [
          {
            ...baseCollection,
            fields: [{ name: 'my-name', label: 'My Name', type: 'string' }],
          },
        ],
      })
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Field's 'name' must match /^[a-zA-Z0-9_]*$/ at someName.my-name"`
    )
  })
  it(`Throws an error for field types that don't exist`, async () => {
    await expect(
      validateSchema({
        collections: [
          {
            ...baseCollection,
            // @ts-ignore
            fields: [{ ...baseField, type: 'some-type' }],
          },
        ],
      })
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"'type' must be one of: string, number, boolean, datetime, image, reference, object, rich-text, but got 'some-type' at someName.myTitle"`
    )
  })
  it(`Trims the "collection.path" missing`, async () => {
    await expect(
      validateSchema({
        collections: [
          {
            ...baseCollection,
            path: undefined,
          },
        ],
      })
    ).rejects.toThrowErrorMatchingInlineSnapshot(`"path is a required field"`)
  })
  it(`Trims the "collection.path" configuration automatically`, async () => {
    const validSchema = await validateSchema({
      collections: [
        {
          ...baseCollection,
          path: 'some/path/',
        },
      ],
    })

    expect(validSchema).toMatchObject({
      collections: [
        {
          ...baseCollection,
          path: 'some/path',
        },
      ],
    })
  })
})
