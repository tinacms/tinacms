/**



*/
import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from './_config'
import markdownString from './mdx with nested children.md?raw'

const out = output({
  type: 'root',
  children: [
    {
      type: 'mdxJsxFlowElement',
      name: 'Blockquote',
      children: [{ type: 'text', text: '' }],
      props: {
        author: 'Pedro',
        children: {
          type: 'root',
          children: [
            {
              type: 'h1',
              children: [
                { type: 'text', text: 'here is some nested rich text' },
              ],
            },
          ],
        },
      },
    },
  ],
})

describe('./mdx with nested children.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownString)
  })
})
