import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from './_config'
import markdownString from './invalid list item with blockquote inside.md?raw'
undefined

const out = output({
  type: 'root',
  children: [
    {
      type: 'invalid_markdown',
      value: '1. This is an ordeded list item\n\n   > Block quote\n',
      message: 'blockquote inside list item is not supported',
      children: [{ type: 'text', text: '' }],
      position: {
        start: { line: 3, column: 4, offset: 36 },
        end: { line: 3, column: 17, offset: 49 },
      },
    },
  ],
})

describe('./invalid list item with blockquote inside.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownString)
  })
})
