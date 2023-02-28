/**

*/

import { hasDuplicates, findDuplicates } from './hasDuplicates'

describe('hasDuplicates', () => {
  it('returns true when it has duplicates', () => {
    expect(hasDuplicates(['a', 'f', 'a'])).toEqual(true)
  })
  it('returns false when does not have duplicates', () => {
    expect(hasDuplicates(['a', 'f', 'v'])).toEqual(false)
  })
  it('returns false when undefined is passed', () => {
    expect(hasDuplicates(undefined)).toEqual(false)
  })
})

describe('findDuplicates', () => {
  it('returns the duplicate when it has duplicates', () => {
    expect(findDuplicates(['a', 'f', 'a'])).toEqual('"a"')
  })
  it('returns undefined when does not have duplicates', () => {
    expect(findDuplicates(['a', 'f', 'v'])).toEqual(undefined)
  })
  it('returns undefined when undefined is passed', () => {
    expect(findDuplicates(undefined)).toEqual(undefined)
  })
  it('returns a list of the duplicate when there is more then one', () => {
    expect(findDuplicates(['a', 'a', 'b', 'b'])).toEqual('"a", "b"')
    expect(findDuplicates(['a', 'a', 'b', 'b', 'b'])).toEqual('"a", "b"')
    expect(
      findDuplicates(['a', 'b', 'f', 'g', 'z', 'a', 'b', 'b', 'b', 'u'])
    ).toEqual('"a", "b"')
  })
})
