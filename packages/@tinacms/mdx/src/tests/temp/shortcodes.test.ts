/**



*/
import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from '../autotest/_config'
import markdownString from './shortcodes.md?raw'
import markdownEscapeAllString from './shortcodes escape all.md?raw'
import markdownEscapeHtmlString from './shortcodes escape html.md?raw'

const out = output({
  type: 'root',
  children: [
    {
      type: 'mdxJsxFlowElement',
      name: 'rimg',
      props: {
        src: 'https://res.cloudinary.com/indysigner/image/upload/v1609336455/the-relevance-gap_kzwi6q.png',
      },
      children: [{ type: 'text', text: '' }],
    },
    {
      type: 'p',
      children: [{ type: 'text', text: '{{< unregistered-ad-panel >}}' }],
    },
    {
      type: 'p',
      children: [{ type: 'text', text: '<invalidhtml>' }],
    },
    {
      type: 'mdxJsxFlowElement',
      name: 'pullQuote',
      props: {
        children: {
          type: 'root',
          children: [
            {
              type: 'p',
              children: [{ type: 'text', text: 'Some text' }],
            },
          ],
        },
      },
      children: [{ type: 'text', text: '' }],
    },
    { type: 'p', children: [{ type: 'text', text: '<' }] },
    { type: 'p', children: [{ type: 'text', text: '<' }] },
    { type: 'p', children: [{ type: 'text', text: '[ hello' }] },
    {
      type: 'p',
      children: [{ type: 'text', text: '[ this escape was already here' }],
    },
  ],
})

import { RichTypeInner } from '@tinacms/schema-tools'

describe('./shortcodes.md escaping ALL', () => {
  const f: RichTypeInner = {
    ...field,
    parser: { type: 'markdown', skipEscaping: 'all' },
  }
  const result = parseMDX(markdownString, f, (v) => v)
  it('parses the string in the expected AST', () => {
    expect(result).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    const value = stringifyMDX(result, f, (v) => v)
    expect(value).toEqual(markdownEscapeAllString)
  })
})

describe('./shortcodes.md escaping HTML', () => {
  const f: RichTypeInner = {
    ...field,
    parser: { type: 'markdown', skipEscaping: 'html' },
  }
  const result = parseMDX(markdownString, f, (v) => v)
  it('stringifies the AST into the expect string', () => {
    const value = stringifyMDX(result, f, (v) => v)
    expect(value).toEqual(markdownEscapeHtmlString)
  })
})
