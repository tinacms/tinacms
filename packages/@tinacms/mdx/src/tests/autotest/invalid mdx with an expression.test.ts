/**



*/
import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from './_config'
import markdownString from './invalid mdx with an expression.md?raw'
undefined

const out = output({
  type: 'root',
  children: [
    {
      type: 'invalid_markdown',
      value: '<Greeting message={() => "hello"} />\n',
      message:
        'Unable to parse field value for field "message" (type: string). Expected type to be Literal but received ArrowFunctionExpression. TinaCMS supports a stricter version of markdown and a subset of MDX. https://tina.io/docs/editing/mdx/#differences-from-other-mdx-implementations',
      children: [{ type: 'text', text: '' }],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 37, offset: 36 },
      },
    },
  ],
})

describe('./invalid mdx with an expression.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownString)
  })
})
