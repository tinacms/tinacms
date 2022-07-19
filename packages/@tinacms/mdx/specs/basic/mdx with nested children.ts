import type { BlockElement } from './_runner.test'

const output: BlockElement[] = [
  {
    type: 'mdxJsxFlowElement',
    name: 'Blockquote',
    children: [{ type: 'text', text: '' }],
    props: {
      author: 'Pedro',
      children: {
        type: 'root',
        children: [
          {
            type: 'h1',
            children: [{ type: 'text', text: 'here is some nested rich text' }],
          },
        ],
      },
    },
  },
]
export { output }
