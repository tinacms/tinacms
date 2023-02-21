/**



*/
import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from './_config'
import markdownString from './mdx which hasnt been registered returns html.md?raw'

const out = output({
  type: 'root',
  children: [
    {
      type: 'html',
      value: '<SomeUnregisteredComponen hello="world" />',
      children: [{ type: 'text', text: '' }],
    },
    {
      type: 'html',
      value:
        '<SomeUnregisteredComponen>\n  # Some markdown in the child\n</SomeUnregisteredComponen>',
      children: [{ type: 'text', text: '' }],
    },
  ],
})

describe('./mdx which hasnt been registered returns html.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  // it('stringifies the AST into the expect string', () => {
  //   expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownString)
  // })
})
