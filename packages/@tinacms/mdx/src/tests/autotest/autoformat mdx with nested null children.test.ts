/**



*/
import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from './_config'
import markdownString from './autoformat mdx with nested null children.md?raw'
import markdownStringFormatted from './autoformat mdx with nested null children.result.md?raw'

const out = output({
  type: 'root',
  children: [
    {
      type: 'mdxJsxFlowElement',
      name: 'Blockquote',
      children: [{ type: 'text', text: '' }],
      props: { author: 'Pedro', children: { type: 'root', children: [] } },
    },
  ],
})

describe('./autoformat mdx with nested null children.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownStringFormatted)
  })
})
