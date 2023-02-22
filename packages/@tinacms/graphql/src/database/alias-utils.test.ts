import { Templateable } from '@tinacms/schema-tools/src'
import { replaceAliasesWithNames, replaceKeysWithAliases } from './alias-utils'

const template: Templateable = {
  name: 'template',
  namespace: [],
  fields: [
    { name: 'field1', namespace: [], type: 'string', alias: 'a' },
    { name: 'field2', namespace: [], type: 'string', alias: 'b' },
    {
      name: 'objectfield',
      namespace: [],
      type: 'object',
      alias: 'c',
      fields: [{ name: 'subfield', namespace: [], type: 'string' }],
    },
    { name: 'normalField', namespace: [], type: 'string' },
  ],
}

describe('replaceAliasesWithNames', () => {
  describe('with empty payload', () => {
    it('should return an empty object', () => {
      const obj = {}
      expect(replaceAliasesWithNames(template, obj)).toEqual({})
    })
  })
  describe('with payload', () => {
    it('should return an object with field names replaced with their aliases', () => {
      const obj = {
        a: 1,
        b: {
          subfield: 2,
        },
        normalField: 'value',
      }
      expect(replaceAliasesWithNames(template, obj)).toEqual({
        field1: 1,
        field2: {
          subfield: 2,
        },
        normalField: 'value',
      })
    })

    it('should return an object with nested objects with field names replaced with their aliases', () => {
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
      expect(replaceAliasesWithNames(template, obj)).toEqual(expected)
    })

    it('should not modify the input object', () => {
      const obj = {
        a: 1,
        c: {
          subfield: 2,
        },
      }
      const originalObj = { ...obj }
      replaceAliasesWithNames(template, obj)
      expect(obj).toEqual(originalObj)
    })
  })
})

describe('replaceKeysWithAliases', () => {
  describe('with empty payload', () => {
    it('should return an empty object', () => {
      const obj = {}
      expect(replaceKeysWithAliases(template, obj)).toEqual({})
    })
  })
  describe('with payload', () => {
    it('should replace the field names in a simple object with their corresponding aliases specified in the `template`', () => {
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
      expect(replaceKeysWithAliases(template, obj)).toEqual(expected)
    })

    it('should replace the field names in an object with nested objects with their corresponding aliases specified in the `template`', () => {
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
      expect(replaceKeysWithAliases(template, obj)).toEqual(expected)
    })

    it('should not modify the input object', () => {
      const obj = {
        field1: 1,
        objectfield: {
          subfield: 2,
        },
      }
      const originalObj = { ...obj }
      replaceKeysWithAliases(template, obj)
      expect(obj).toEqual(originalObj)
    })
  })
})
