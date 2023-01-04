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
import { it, expect, describe } from 'vitest'
import { stringifyShortcode } from './stringifyShortcode'

describe('stringifyShortcode', () => {
  describe('with keyed field', () => {
    it('parses attributes', () => {
      const result = stringifyShortcode(
        '<signature foo="bar123"></signature>',
        {
          name: 'signature',
          label: 'Signature',
          match: {
            start: '{{<',
            end: '>}}',
          },
          fields: [
            {
              name: 'foo',
              label: 'foo label',
              type: 'string',
            },
          ],
        }
      )
      expect(result).toEqual('{{< signature foo="bar123" >}}')
    })
  })

  describe('with unkeyed attributes', () => {
    it('parses attributes', () => {
      const result = stringifyShortcode(
        '<signature text="bar123"></signature>',
        {
          name: 'signature',
          label: 'Signature',
          match: {
            start: '{{<',
            end: '>}}',
          },
          fields: [
            {
              name: 'text',
              label: 'text',
              type: 'string',
            },
          ],
        }
      )
      expect(result).toEqual('{{< signature "bar123" >}}')
    })
  })

  describe('with children', () => {
    it('parses children field', () => {
      const result = stringifyShortcode('<signature># FOO\n##Bar</signature>', {
        name: 'signature',
        label: 'Signature',
        match: {
          start: '{{<',
          end: '>}}',
        },
        fields: [
          {
            name: 'children',
            label: 'children',
            type: 'string',
          },
        ],
      })
      expect(result).toEqual(
        '{{< signature  >}}\n# FOO\n##Bar\n{{< /signature >}}'
      )
    })
  })
})
