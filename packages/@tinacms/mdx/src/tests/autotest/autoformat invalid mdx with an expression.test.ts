import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from './_config'
import markdownString from './autoformat invalid mdx with an expression.md?raw'
import markdownStringFormatted from './autoformat invalid mdx with an expression.result.md?raw'

const out = output({
  type: 'root',
  children: [
    {
      type: 'p',
      children: [
        { type: 'text', text: '<Greeting message={() => "hello"} />' },
      ],
    },
  ],
})

describe('./autoformat invalid mdx with an expression.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownStringFormatted)
  })
})
