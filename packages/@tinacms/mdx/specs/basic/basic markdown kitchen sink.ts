import type { BlockElement } from './_runner.test'

const output: BlockElement[] = [
  { type: 'h1', children: [{ type: 'text', text: 'Hello, world' }] },
  { type: 'hr', children: [{ type: 'text', text: '' }] },
  {
    type: 'p',
    children: [
      { type: 'text', text: 'This is a paragraph, and ' },
      {
        type: 'a',
        url: 'http://example.com',
        title: null,
        children: [{ type: 'text', text: 'here' }],
      },
      { type: 'text', text: ' is a link' },
    ],
  },
  {
    type: 'p',
    children: [
      { type: 'text', text: 'This is ' },
      { type: 'text', text: 'italic', italic: true },
      { type: 'text', text: ', and this is ' },
      { type: 'text', text: 'bold', bold: true },
    ],
  },
]
export { output }
