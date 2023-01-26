/**



*/
import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from './_config'
import markdownString from './mdx field with a scalar field as a list.md?raw'

const out = output({
  type: 'root',
  children: [
    {
      type: 'mdxJsxFlowElement',
      name: 'Ratings',
      children: [{ type: 'text', text: '' }],
      props: { value: [1, 2, 3] },
    },
  ],
})

describe('./mdx field with a scalar field as a list.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownString)
  })
})
