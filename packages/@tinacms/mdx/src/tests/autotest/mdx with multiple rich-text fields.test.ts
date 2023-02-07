/**



*/
import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from './_config'
import markdownString from './mdx with multiple rich-text fields.md?raw'

const out = output({
  type: 'root',
  children: [
    {
      type: 'mdxJsxFlowElement',
      name: 'Cta',
      children: [{ type: 'text', text: '' }],
      props: {
        description: {
          type: 'root',
          children: [
            {
              type: 'p',
              children: [
                { type: 'text', text: 'Read our privacy policy ' },
                {
                  type: 'a',
                  url: 'http://example.com',
                  title: null,
                  children: [{ type: 'text', text: 'here' }],
                },
              ],
            },
          ],
        },
        children: {
          type: 'root',
          children: [
            {
              type: 'p',
              children: [
                { type: 'text', text: 'Click ' },
                { type: 'text', text: 'here', bold: true },
                { type: 'text', text: '!' },
              ],
            },
          ],
        },
      },
    },
  ],
})

describe('./mdx with multiple rich-text fields.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownString)
  })
})
