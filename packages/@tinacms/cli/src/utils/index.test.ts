/**

*/

import { parseMediaFolder } from '.'

describe('parseMediaFolder', () => {
  it('removes the starting slash when it is there', () => {
    expect(parseMediaFolder('/')).toBe('')

    expect(parseMediaFolder('/foo')).toBe('foo')
    expect(parseMediaFolder('/foo/bar')).toBe('foo/bar')
  })
  it('does not remove the starting slash when there is no starting slash', () => {
    expect(parseMediaFolder('foo')).toBe('foo')
    expect(parseMediaFolder('foo/bar')).toBe('foo/bar')
  })
  it('removes the trailing slash when there is one', () => {
    expect(parseMediaFolder('foo/')).toBe('foo')
    expect(parseMediaFolder('foo/bar/')).toBe('foo/bar')
  })
  it('removes the starting and trailing slash when there is both', () => {
    expect(parseMediaFolder('//')).toBe('')
    expect(parseMediaFolder('/foo/')).toBe('foo')
    expect(parseMediaFolder('/foo/bar/')).toBe('foo/bar')
  })
})
