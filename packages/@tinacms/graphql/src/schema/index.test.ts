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

import { TinaSchema } from './index'

describe('TinaSchema', () => {
  describe('with sibling collections of similar names', () => {
    test('fetches correct collection with getCollectionByFullPath', async () => {
      const schema = createSchema()

      const collection1 = schema.getCollectionByFullPath('content/test/foobar')
      expect(collection1.name).toEqual('test')

      const collection2 = schema.getCollectionByFullPath('content/test2/foobar')
      expect(collection2.name).toEqual('test2')
    })
  })
})

const createSchema = () => {
  return new TinaSchema({
    version: { fullVersion: '', major: '', minor: '', patch: '' },
    meta: { flags: [] },
    collections: [
      {
        label: 'Test',
        name: 'test',
        path: 'content/test',
        format: 'mdx',
        fields: [
          {
            label: 'field',
            type: 'string',
            name: 'field',
          },
        ],
      },
      {
        label: 'Test2',
        name: 'test2',
        path: 'content/test2',
        format: 'mdx',
        fields: [
          {
            label: 'field',
            type: 'string',
            name: 'field',
          },
        ],
      },
    ],
  })
}
