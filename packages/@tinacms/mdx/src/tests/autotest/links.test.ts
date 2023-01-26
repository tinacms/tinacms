/**



*/
import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from './_config'
import markdownString from './links.md?raw'

const out = output({
  type: 'root',
  children: [
    {
      type: 'p',
      children: [
        { type: 'text', text: 'Click ' },
        {
          type: 'a',
          url: 'https://example.com',
          title: 'Tester',
          children: [{ type: 'text', text: 'here' }],
        },
        { type: 'text', text: ' to join now' },
      ],
    },
  ],
})

describe('./links.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownString)
  })
})
