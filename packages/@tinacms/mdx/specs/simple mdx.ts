import type { BlockElement } from './runner.test'

const output: BlockElement[] = [
  {
    type: 'p',
    children: [
      {
        type: 'mdxJsxTextElement',
        name: 'Greeting',
        children: [{ type: 'text', text: '' }],
        props: { message: 'Hello' },
      },
      { type: 'text', text: ' world!' },
    ],
  },
]
export { output }
