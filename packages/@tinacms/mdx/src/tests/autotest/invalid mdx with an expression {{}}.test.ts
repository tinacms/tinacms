/**



*/
import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from './_config'
import markdownString from './invalid mdx with an expression {{}}.md?raw'
undefined

const out = output({
  type: 'root',
  children: [
    {
      type: 'invalid_markdown',
      value: 'Hello {{ world! }}\n',
      message: '1:15: Could not parse expression with acorn: Unexpected token',
      children: [{ type: 'text', text: '' }],
      position: {
        start: { line: 1, column: 15, offset: 14 },
        end: { line: null, column: null },
      },
    },
  ],
})

describe('./invalid mdx with an expression {{}}.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownString)
  })
})
