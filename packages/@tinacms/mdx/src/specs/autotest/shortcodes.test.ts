import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from './_config'
import markdownString from './shortcodes.md?raw'

const out = output({
  type: 'root',
  children: [
    {
      type: 'p',
      children: [
        {
          type: 'mdxJsxTextElement',
          name: 'Shortcode2',
          children: [{ type: 'text', text: '' }],
          props: { text: 'feature-panels' },
        },
      ],
    },
    {
      type: 'p',
      children: [
        {
          type: 'mdxJsxTextElement',
          name: 'Shortcode1',
          children: [{ type: 'text', text: '' }],
          props: {
            text: 'rimg src="https://res.cloudinary.com/indysigner/image/upload/v1609336455/the-relevance-gap_kzwi6q.png" href="https://infrequently.org/2020/06/platform-adjacency-theory/" sizes="100vw" caption="Image credit: <a href=\'https://infrequently.org/2020/06/platform-adjacency-theory/\'>Alex Russell</a>" alt="The Relevance Gap"',
          },
        },
      ],
    },
    {
      type: 'p',
      children: [
        {
          type: 'mdxJsxTextElement',
          name: 'Shortcode2',
          children: [{ type: 'text', text: '' }],
          props: { text: 'ad-panel-leaderboard' },
        },
      ],
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
