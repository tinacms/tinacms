/**



*/
import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from './_config'
import markdownString from './shortcodes.md?raw'

const out = output({
  type: 'root',
  children: [
    {
      type: 'mdxJsxFlowElement',
      name: 'featurePanel',
      children: [
        {
          type: 'text',
          text: '',
        },
      ],
      props: {},
    },
    {
      type: 'mdxJsxFlowElement',
      name: 'rimg',
      children: [
        {
          type: 'text',
          text: '',
        },
      ],
      props: {
        src: 'https://res.cloudinary.com/indysigner/image/upload/v1609336455/the-relevance-gap_kzwi6q.png',
      },
    },
    {
      type: 'mdxJsxFlowElement',
      name: 'adPanel',
      children: [
        {
          type: 'text',
          text: '',
        },
      ],
      props: { _value: 'neat' },
    },
  ],
})

describe('./shortcodes.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownString)
  })
})
