/**



*/
import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from './_config'
import markdownString from './break.md?raw'

const out = output({
  type: 'root',
  children: [
    {
      type: 'p',
      children: [
        { type: 'text', text: '123 Abc Street' },
        { type: 'break', children: [{ type: 'text', text: '' }] },
        { type: 'text', text: 'Town Central, CA' },
        { type: 'break', children: [{ type: 'text', text: '' }] },
        { type: 'text', text: '90210' },
      ],
    },
  ],
})

describe('./break.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownString)
  })
})
