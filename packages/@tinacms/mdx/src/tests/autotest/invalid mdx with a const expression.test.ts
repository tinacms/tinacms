/**



*/
import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from './_config'
import markdownString from './invalid mdx with a const expression.md?raw'
undefined

const out = output({
  type: 'root',
  children: [
    {
      type: 'invalid_markdown',
      value: 'export const a = "b"\n',
      message: 'Unexpected expression export const a = "b".',
      children: [{ type: 'text', text: '' }],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 21, offset: 20 },
      },
    },
  ],
})

describe('./invalid mdx with a const expression.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownString)
  })
})
