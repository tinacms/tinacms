/**



*/
import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from './_config'
import markdownString from './blockquote.md?raw'

const out = output({
  type: 'root',
  children: [
    { type: 'blockquote', children: [{ type: 'text', text: 'Hello, World!' }] },
  ],
})

describe('./blockquote.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownString)
  })
})
