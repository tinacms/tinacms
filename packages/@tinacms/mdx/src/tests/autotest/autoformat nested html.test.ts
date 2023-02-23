/**



*/
import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from './_config'
import markdownString from './autoformat nested html.md?raw'
import markdownStringFormatted from './autoformat nested html.result.md?raw'

const out = output({
  type: 'root',
  children: [
    {
      type: 'html',
      value:
        '<ul>\n  <li>\n    Some Item 1\n  </li>\n\n  <li>\n    Some Item 2\n  </li>\n</ul>',
      children: [{ type: 'text', text: '' }],
    },
  ],
})

describe('./autoformat nested html.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownStringFormatted)
  })
})
