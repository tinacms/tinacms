/**



*/
import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from './_config'
import markdownString from './autoformat nested inline html.md?raw'
undefined

const out = output({
  type: 'root',
  children: [
    {
      type: 'html',
      value: '<ul>\n  <li>Some Item 1</li>\n  <li>Some Item 2</li>\n</ul>',
      children: [{ type: 'text', text: '' }],
    },
  ],
})

describe('./autoformat nested inline html.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownString)
  })
})
