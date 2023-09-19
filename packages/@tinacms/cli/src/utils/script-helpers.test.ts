/**



*/

import { generateGqlScript, extendNextScripts } from './script-helpers'

describe('generateGqlScript', () => {
  it('wraps original script correctly', () => {
    const newScript = generateGqlScript('next dev -p 3000')

    expect(newScript).toEqual('tinacms dev -c "next dev -p 3000"')
  })
})

describe('extendNextScripts', () => {
  describe('with all existing scrpts', () => {
    it('returns new scripts correctly', () => {
      const newScripts = extendNextScripts({
        foo: 'bar',
        dev: 'next dev -p 3000',
        build: 'next build -p 3000',
      })

      expect(newScripts).toEqual({
        foo: 'bar',
        dev: 'tinacms dev -c "next dev -p 3000"',
        build: 'tinacms build && next build -p 3000',
      })
    })
  })

  describe('with missing existing scrpts', () => {
    it('returns new scripts correctly', () => {
      const newScripts = extendNextScripts({
        foo: 'bar',
      })

      expect(newScripts).toEqual({
        foo: 'bar',
        dev: 'tinacms dev -c "next dev"',
        build: 'tinacms build && next build',
      })
    })
  })
})
