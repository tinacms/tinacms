import { Templateable } from '@tinacms/schema-tools/src'
import { replaceNameOverrides, applyNameOverrides } from './alias-utils'

const template: Templateable = {
  name: 'template',
  namespace: [],
  fields: [
    { name: 'field1', namespace: [], type: 'string', nameOverride: 'a' },
    { name: 'field2', namespace: [], type: 'string', nameOverride: 'b' },
    {
      name: 'objectfield',
      namespace: [],
      type: 'object',
      nameOverride: 'c',
      fields: [
        { name: 'subfield', namespace: [], type: 'string' },
        {
          name: 'aliasedSubfield',
          nameOverride: 'd',
          namespace: [],
          type: 'string',
        },
      ],
    },
    { name: 'normalField', namespace: [], type: 'string' },
  ],
}

describe('replaceNameOverrides', () => {
  describe('with empty payload', () => {
    it('should return an empty object', () => {
      const obj = {}
      expect(replaceNameOverrides(template, obj)).toEqual({})
    })
  })
  describe('with payload', () => {
    describe('with nested alias', () => {
      it('should return an object with field names replaced with their nameOverrides', () => {
        const obj = {
          a: 1,
          c: {
            d: 3,
          },
        }
        expect(replaceNameOverrides(template, obj)).toEqual({
          field1: 1,
          objectfield: {
            aliasedSubfield: 3,
          },
        })
      })
    })

    describe('with root level alias', () => {
      it('should return an object with field names replaced with their nameOverrides', () => {
        const obj = {
          a: 1,
          b: {
            subfield: 2,
          },
          normalField: 'value',
        }
        expect(replaceNameOverrides(template, obj)).toEqual({
          field1: 1,
          field2: {
            subfield: 2,
          },
          normalField: 'value',
        })
      })

      it('should return nested objects in response', () => {
        const obj = {
          a: 1,
          c: {
            subfield: 2,
          },
        }
        const expected = {
          field1: 1,
          objectfield: {
            subfield: 2,
          },
        }
        expect(replaceNameOverrides(template, obj)).toEqual(expected)
      })

      it('should not modify the input object', () => {
        const obj = {
          a: 1,
          c: {
            subfield: 2,
          },
        }
        const originalObj = { ...obj }
        replaceNameOverrides(template, obj)
        expect(obj).toEqual(originalObj)
      })
    })
  })
})

describe('applyNameOverrides', () => {
  describe('with empty payload', () => {
    it('should return an empty object', () => {
      const obj = {}
      expect(applyNameOverrides(template, obj)).toEqual({})
    })
  })
  describe('with payload', () => {
    describe('with root-level nameOverride', () => {
      it('should replace the field names', () => {
        const obj = {
          field1: 1,
          field2: 2,
          normalfield: 'value',
        }
        const expected = {
          a: 1,
          b: 2,
          normalfield: 'value',
        }
        expect(applyNameOverrides(template, obj)).toEqual(expected)
      })

      it('should replace the field names for nested fields', () => {
        const obj = {
          field1: 1,
          objectfield: {
            subfield: 2,
          },
        }
        const expected = {
          a: 1,
          c: {
            subfield: 2,
          },
        }
        expect(applyNameOverrides(template, obj)).toEqual(expected)
      })

      it('should not modify the input object', () => {
        const obj = {
          field1: 1,
          objectfield: {
            subfield: 2,
          },
        }
        const originalObj = { ...obj }
        applyNameOverrides(template, obj)
        expect(obj).toEqual(originalObj)
      })
    })

    describe('with nested nameOverride', () => {
      it('should return an object with field names replaced with their nameOverrides', () => {
        const obj = {
          field1: 1,
          objectfield: {
            aliasedSubfield: 2,
          },
        }
        const expected = {
          a: 1,
          c: {
            d: 2,
          },
        }
        expect(applyNameOverrides(template, obj)).toEqual(expected)
      })
    })
  })
})
