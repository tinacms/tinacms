import { stripMarkdownLinks } from './getTocContent'

test('should do nothing when there is no link markup', () => {
  expect(stripMarkdownLinks('test')).toEqual('test')
})

test('should remove link markup when a link is present', () => {
  expect(stripMarkdownLinks('[this is a test](http://test.com)')).toEqual(
    'this is a test'
  )
})

test('should remove link markup when multiple links are present', () => {
  expect(
    stripMarkdownLinks(
      '[this is a test](http://test.com) and [another test](http://anothertest.com)'
    )
  ).toEqual('this is a test and another test')
})
