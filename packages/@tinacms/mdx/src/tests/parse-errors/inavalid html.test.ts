import { it, expect } from 'vitest'
import { parseMDX } from '../../parse'
import { field } from '../autotest/_config'
const md = `Some text and then a closing </a> tag`

it('Throws an error', () => {
  expect(() =>
    parseMDX(md, field, (v) => v)
  ).toThrowErrorMatchingInlineSnapshot(
    '"Unable to parse markdown at line: 1, column: 31. TinaCMS supports a stricter version of markdown and a subset of MDX - learn more: https://tina.io/docs/editing/mdx/#differences-from-other-mdx-implementations"'
  )
})
