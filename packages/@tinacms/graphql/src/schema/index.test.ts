/**

*/

import { TinaSchema } from '@tinacms/schema-tools'
import { describe, test, expect } from 'vitest'

describe('TinaSchema', () => {
  describe('with sibling collections of similar names', () => {
    test('fetches correct collection with getCollectionByFullPath', async () => {
      const schema = createSchema()

      const collection1 = schema.getCollectionByFullPath(
        'content/test/foobar.mdx'
      )
      expect(collection1.name).toEqual('test')

      const collection2 = schema.getCollectionByFullPath(
        'content/test2/foobar.mdx'
      )
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
