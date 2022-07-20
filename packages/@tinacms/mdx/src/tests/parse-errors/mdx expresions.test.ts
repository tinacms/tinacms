import { it, expect, describe } from 'vitest'
import { parseMDX } from '../../parse'
import { field } from '../autotest/_config'

describe('Errors during MDX parse', () => {
  it(`<Greeting message={() => "hello"} />`, (info) => {
    const md = info.meta.name
    expect(() =>
      parseMDX(md, field, (v) => v)
    ).toThrowErrorMatchingInlineSnapshot(
      '"Expected type to be Literal but received ArrowFunctionExpression. TinaCMS supports a stricter version of markdown and a subset of MDX - learn more: https://tina.io/docs/editing/mdx/#differences-from-other-mdx-implementations"'
    )
  })

  it(`Hello {{ world! }}`, (info) => {
    const md = info.meta.name
    expect(() =>
      parseMDX(md, field, (v) => v)
    ).toThrowErrorMatchingInlineSnapshot(
      '"Unable to parse markdown at line: 1, column: 15. TinaCMS supports a stricter version of markdown and a subset of MDX - learn more: https://tina.io/docs/editing/mdx/#differences-from-other-mdx-implementations"'
    )
  })

  it(`export const a = "b"`, (info) => {
    const md = info.meta.name
    expect(() =>
      parseMDX(md, field, (v) => v)
    ).toThrowErrorMatchingInlineSnapshot(
      '"Unexpected expression export const a = \\"b\\" TinaCMS supports a stricter version of markdown and a subset of MDX - learn more: https://tina.io/docs/editing/mdx/#differences-from-other-mdx-implementations"'
    )
  })

  it(`import { a } from "./b"`, (info) => {
    const md = info.meta.name
    expect(() =>
      parseMDX(md, field, (v) => v)
    ).toThrowErrorMatchingInlineSnapshot(
      '"Unexpected expression import { a } from \\"./b\\" TinaCMS supports a stricter version of markdown and a subset of MDX - learn more: https://tina.io/docs/editing/mdx/#differences-from-other-mdx-implementations"'
    )
  })
})
