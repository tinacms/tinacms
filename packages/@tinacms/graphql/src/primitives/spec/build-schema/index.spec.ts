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

import path from 'path'
import { setup, setupFixture, setupFixture2 } from '../setup'
import { toMatchFile } from 'jest-file-snapshot'
import { createSchema } from '../../schema'

describe('The given configuration', () => {
  it(`errors`, async () => {
    const schema = await createSchema({
      schema: {
        collections: [
          {
            label: 'Some label',
            name: 'someName',
            path: 'content/some-path',
            fields: [{ label: 'Title', name: 'title', type: 'string' }],
          },
        ],
      },
    })
    // todo validate schema
    console.log(schema.schema)
    expect(true).toBe(true)
  })
})
