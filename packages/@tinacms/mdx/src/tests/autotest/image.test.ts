import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from './_config'
import markdownString from './image.md?raw'
undefined

const out = output({
  type: 'root',
  children: [
    {
      type: 'p',
      children: [
        {
          type: 'img',
          url: 'https://some-image.jpg',
          alt: 'alt description',
          caption: 'Some Title',
          children: [{ type: 'text', text: '' }],
        },
      ],
    },
    {
      type: 'p',
      children: [
        {
          type: 'img',
          url: 'https://some-image.jpg',
          caption: 'Some title',
          children: [{ type: 'text', text: '' }],
        },
      ],
    },
    {
      type: 'p',
      children: [
        {
          type: 'img',
          url: 'https://some-image.jpg',
          caption: null,
          children: [{ type: 'text', text: '' }],
        },
      ],
    },
  ],
})

describe('./image.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownString)
  })
})
