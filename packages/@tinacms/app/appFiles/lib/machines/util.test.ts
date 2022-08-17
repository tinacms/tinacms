import { describe, it, expect } from 'vitest'
import * as util from './util'

describe('getAllIn', () => {
  it('gets the values', async () => {
    const result = util.getAllIn({ some: { value: 'a' } }, 'some.value')
    expect(result).toEqual([{ value: 'a' }])
  })
  it('gets the values from an array', async () => {
    const result = util.getAllIn(
      { some: { values: ['a', 'b'] } },
      'some.values'
    )
    expect(result).toEqual([
      { location: [0], value: 'a' },
      { location: [1], value: 'b' },
    ])
  })
  it('gets values from an array of objects', async () => {
    const result = util.getAllIn(
      { some: { values: [{ nested: 'a' }] } },
      'some.values.[].nested'
    )
    expect(result).toEqual([{ location: [0], value: 'a' }])
  })
  it('gets null values', async () => {
    const result = util.getAllIn({ some: { values: null } }, 'some.values')
    expect(result).toEqual([{ value: null }])
  })
  // FIXME: not sure we'll need this
  it('gets deeply-nested the values', async () => {
    const result = util.getAllIn(
      { some: { values: [{ nested: [{ again: 'a' }] }] } },
      'some.values.[].nested.[].again'
    )
    expect(result).toEqual([{ location: [0, 0], value: 'a' }])
  })
})
