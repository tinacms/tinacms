/**



*/
import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from './_config'
import markdownString from './autoformat mdx with deeply nested rich-text elements.md?raw'
import markdownStringFormatted from './autoformat mdx with deeply nested rich-text elements.result.md?raw'

const out = output({
  type: 'root',
  children: [
    {
      type: 'mdxJsxFlowElement',
      name: 'Test',
      children: [{ type: 'text', text: '' }],
      props: {
        leftColumn: {
          type: 'root',
          children: [
            {
              type: 'p',
              children: [{ type: 'text', text: 'foo bar baz left' }],
            },
          ],
        },
        rightColumn: {
          type: 'root',
          children: [
            {
              type: 'p',
              children: [{ type: 'text', text: 'foo bar baz right' }],
            },
            {
              type: 'mdxJsxFlowElement',
              name: 'Highlight',
              children: [{ type: 'text', text: '' }],
              props: {
                content: {
                  type: 'root',
                  children: [
                    {
                      type: 'p',
                      children: [{ type: 'text', text: 'Foo bar baz' }],
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    },
    {
      type: 'mdxJsxFlowElement',
      name: 'Test',
      children: [{ type: 'text', text: '' }],
      props: {
        leftColumn: {
          type: 'root',
          children: [
            {
              type: 'p',
              children: [{ type: 'text', text: 'foo bar baz left' }],
            },
          ],
        },
        rightColumn: {
          type: 'root',
          children: [
            {
              type: 'p',
              children: [{ type: 'text', text: 'foo bar baz right' }],
            },
            {
              type: 'mdxJsxFlowElement',
              name: 'Highlight',
              children: [{ type: 'text', text: '' }],
              props: {
                content: {
                  type: 'root',
                  children: [
                    {
                      type: 'p',
                      children: [{ type: 'text', text: 'Foo bar baz' }],
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    },
  ],
})

describe('./autoformat mdx with deeply nested rich-text elements.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownStringFormatted)
  })
})
