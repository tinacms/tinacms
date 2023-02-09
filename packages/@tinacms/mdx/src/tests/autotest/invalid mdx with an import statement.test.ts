import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from './_config'
import markdownString from './invalid mdx with an import statement.md?raw'
undefined

const out = output({
  type: 'root',
  children: [
    {
      type: 'p',
      children: [{ type: 'text', text: 'import { a } from "./b"' }],
    },
  ],
})

describe('./invalid mdx with an import statement.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownString)
  })
})
