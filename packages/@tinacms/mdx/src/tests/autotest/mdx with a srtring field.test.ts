/**



*/
import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from './_config'
import markdownString from './mdx with a srtring field.md?raw'

const out = output({
  type: 'root',
  children: [
    {
      type: 'p',
      children: [
        {
          type: 'mdxJsxTextElement',
          name: 'Greeting',
          children: [{ type: 'text', text: '' }],
          props: { message: 'Hello' },
        },
        { type: 'text', text: ' world!' },
      ],
    },
  ],
})

describe('./mdx with a srtring field.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownString)
  })
})
