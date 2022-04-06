import { slugifyTocHeading } from './slugifyToc'

test('simple emphasized string', () => {
  expect(slugifyTocHeading('_test_')).toEqual('test')
})

test('string with partial emphasis', () => {
  expect(slugifyTocHeading('This is a _test_')).toEqual('this-is-a-test')
})

test('string with underscore', () => {
  expect(slugifyTocHeading('_type')).toEqual('_type')
})

test('string with underscore and escaped underscore', () => {
  expect(slugifyTocHeading('_test or \\_test')).toEqual('_test-or-_test')
})

test('emphasized string with escaped underscore', () => {
  expect(slugifyTocHeading('_unstable\\_revalidate_')).toEqual(
    'unstable_revalidate'
  )
})

test('emphasized string with other escaped syntax', () => {
  expect(slugifyTocHeading('_unstable\\#revalidate_')).toEqual(
    'unstable#revalidate'
  )
})

test('two separate emphasized strings', () => {
  expect(slugifyTocHeading('_GithubFile_ and _useGithubFile_')).toEqual(
    'githubfile-and-usegithubfile'
  )
})
