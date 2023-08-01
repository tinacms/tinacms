import { parse } from './text-format'
import { describe, it, expect } from 'vitest'

describe('text format', () => {
  describe('parse', () => {
    it("returns text field's value", () => {
      const value = 'this is a test value'
      const result = parse(value)

      expect(result).toEqual(value)
    })

    it('returns empty string if value is undefined', () => {
      const result = parse()

      expect(result).toEqual('')
    })
  })
})
