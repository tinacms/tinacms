/**



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
    describe('and no text value set', () => {
      it('excludes quotes', () => {
        const result = stringifyShortcode('<signature></signature>', {
          name: 'signature',
          label: 'Signature',
          match: {
            start: '{{<',
            end: '>}}',
          },
          fields: [
            {
              name: '_value',
              label: 'Value',
              type: 'string',
            },
          ],
        })
        expect(result).toEqual('{{< signature  >}}')
      })
    })
    it('parses attributes', () => {
      const result = stringifyShortcode(
        '<signature _value="bar123"></signature>',
        {
          name: 'signature',
          label: 'Signature',
          match: {
            start: '{{<',
            end: '>}}',
          },
          fields: [
            {
              name: '_value',
              label: 'Value',
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
