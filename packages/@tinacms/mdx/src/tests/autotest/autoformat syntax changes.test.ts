/**



*/
import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from './_config'
import markdownString from './autoformat syntax changes.md?raw'
import markdownStringFormatted from './autoformat syntax changes.result.md?raw'

const out = output({
  type: 'root',
  children: [
    {
      type: 'ul',
      children: [
        {
          type: 'li',
          children: [
            { type: 'lic', children: [{ type: 'text', text: 'Red' }] },
          ],
        },
        {
          type: 'li',
          children: [
            { type: 'lic', children: [{ type: 'text', text: 'Green' }] },
          ],
        },
        {
          type: 'li',
          children: [
            { type: 'lic', children: [{ type: 'text', text: 'Blue' }] },
          ],
        },
      ],
    },
    {
      type: 'ul',
      children: [
        {
          type: 'li',
          children: [
            { type: 'lic', children: [{ type: 'text', text: 'Red' }] },
          ],
        },
        {
          type: 'li',
          children: [
            { type: 'lic', children: [{ type: 'text', text: 'Green' }] },
          ],
        },
        {
          type: 'li',
          children: [
            { type: 'lic', children: [{ type: 'text', text: 'Blue' }] },
          ],
        },
      ],
    },
    {
      type: 'p',
      children: [{ type: 'text', text: 'single asterisks', italic: true }],
    },
    {
      type: 'p',
      children: [{ type: 'text', text: 'single underscores', italic: true }],
    },
    {
      type: 'p',
      children: [{ type: 'text', text: 'double asterisks', bold: true }],
    },
    {
      type: 'p',
      children: [{ type: 'text', text: 'double underscores', bold: true }],
    },
    { type: 'hr', children: [{ type: 'text', text: '' }] },
    { type: 'hr', children: [{ type: 'text', text: '' }] },
    { type: 'hr', children: [{ type: 'text', text: '' }] },
    { type: 'hr', children: [{ type: 'text', text: '' }] },
    { type: 'h1', children: [{ type: 'text', text: 'Headers' }] },
    { type: 'h1', children: [{ type: 'text', text: 'Header 1' }] },
    { type: 'h2', children: [{ type: 'text', text: 'Header 2' }] },
    {
      type: 'h1',
      children: [{ type: 'text', text: 'Indentation is ignored' }],
    },
  ],
})

describe('./autoformat syntax changes.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownStringFormatted)
  })
})
