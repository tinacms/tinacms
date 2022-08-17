import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from './_config'
import markdownString from './invalid list item with a code block inside.md?raw'
undefined

const out = output({
  type: 'root',
  children: [
    {
      type: 'invalid_markdown',
      value:
        '* This is an unordered list item\n\n  ```\n  const some = "code"\n  ```\n',
      message: 'code inside list item is not supported',
      children: [{ type: 'text', text: '' }],
      position: {
        start: { line: 3, column: 3, offset: 36 },
        end: { line: 5, column: 6, offset: 67 },
      },
    },
  ],
})

describe('./invalid list item with a code block inside.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownString)
  })
})
