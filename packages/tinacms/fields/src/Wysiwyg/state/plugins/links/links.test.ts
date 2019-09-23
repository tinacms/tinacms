import { HTTP_LINK_REGEX } from './index'

describe('link regex', () => {
  valid('http://google.com')
  valid('https://google.com')
  valid('http://www.google.com')
  valid('https://www.google.com')
  valid(
    'http://github.com/forestryio/kb#boards?repos=65822921,89267021,57069439&showPRs=false'
  )
  valid(
    'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp'
  )
  valid('https://www.example.com/foo/?bar=baz&inga=42&quux')
  valid('http://code.google.com/events/#&product=browser')
})

function valid(url: string) {
  it(`should match: ${url}`, () => {
    let result = url.match(HTTP_LINK_REGEX)
    let match = result ? result[0] : ''
    expect(match).toBe(url)
  })
}
