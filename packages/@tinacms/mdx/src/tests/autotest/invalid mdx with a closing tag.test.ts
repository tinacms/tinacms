/**



*/
import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from './_config'
import markdownString from './invalid mdx with a closing tag.md?raw'
undefined

const out = output({
  type: 'root',
  children: [
    {
      type: 'invalid_markdown',
      value: 'This is a </a> broken html tag\n',
      message:
        '1:12-1:13: Unexpected closing slash `/` in tag, expected an open tag first',
      children: [{ type: 'text', text: '' }],
      position: {
        start: { line: 1, column: 12, offset: 11, _index: 0, _bufferIndex: 11 },
        end: { line: 1, column: 13, offset: 12, _index: 0, _bufferIndex: 12 },
      },
    },
  ],
})

describe('./invalid mdx with a closing tag.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownString)
  })
})
