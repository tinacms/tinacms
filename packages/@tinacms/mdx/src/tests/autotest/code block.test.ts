/**



*/
import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from './_config'
import markdownString from './code block.md?raw'

const out = output({
  type: 'root',
  children: [
    {
      type: 'code_block',
      lang: 'javascript',
      value: 'const test = 123',
      children: [{ type: 'text', text: '' }],
    },
    {
      type: 'code_block',
      value: 'some random code',
      children: [{ type: 'text', text: '' }],
    },
  ],
})

describe('./code block.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownString)
  })
})
