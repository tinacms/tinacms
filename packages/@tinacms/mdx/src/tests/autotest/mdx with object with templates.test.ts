/**



*/
import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from './_config'
import markdownString from './mdx with object with templates.md?raw'

const out = output({
  type: 'root',
  children: [
    {
      type: 'mdxJsxFlowElement',
      name: 'Action',
      children: [{ type: 'text', text: '' }],
      props: {
        action: {
          _template: 'popup',
          title: 'Say hello',
          description: 'This is a description',
        },
      },
    },
    { type: 'p', children: [{ type: 'text', text: 'And another template' }] },
    {
      type: 'mdxJsxFlowElement',
      name: 'Action',
      children: [{ type: 'text', text: '' }],
      props: {
        action: {
          _template: 'link',
          title: 'Say hello',
          url: 'http://example.com',
        },
      },
    },
  ],
})

describe('./mdx with object with templates.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownString)
  })
})
