import type { BlockElement } from './_runner.test'

const output: BlockElement[] = [
  {
    type: 'p',
    children: [
      { type: 'text', text: 'This is ', italic: true },
      { type: 'text', text: 'some bold', italic: true, bold: true },
      { type: 'text', text: ' and italic content', italic: true },
    ],
  },
]
export { output }
