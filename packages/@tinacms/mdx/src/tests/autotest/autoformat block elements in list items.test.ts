/**



*/
import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from './_config'
import markdownString from './autoformat block elements in list items.md?raw'
import markdownStringFormatted from './autoformat block elements in list items.result.md?raw'

const out = output({
  type: 'root',
  children: [
    {
      type: 'ul',
      children: [
        {
          type: 'li',
          children: [
            {
              type: 'lic',
              children: [
                { type: 'text', text: 'this is a blockquote in a list item' },
              ],
            },
          ],
        },
      ],
    },
  ],
})

describe('./autoformat block elements in list items.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownStringFormatted)
  })
})
