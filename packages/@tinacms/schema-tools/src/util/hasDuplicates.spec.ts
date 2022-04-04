import { hasDuplicates } from './hasDuplicates'
describe('hasDuplicates', () => {
  it('returns true when it has duplicates', () => {
    expect(hasDuplicates(['a', 'f', 'a'])).toEqual(true)
  })
  it('returns false when does not have duplicates', () => {
    expect(hasDuplicates(['a', 'f', 'v'])).toEqual(false)
  })
})
