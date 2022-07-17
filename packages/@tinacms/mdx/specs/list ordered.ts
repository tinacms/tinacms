import type { BlockElement } from './_runner.test'

const output: BlockElement[] = [
  {
    type: 'ol',
    children: [
      {
        type: 'li',
        children: [
          { type: 'lic', children: [{ type: 'text', text: 'Item one' }] },
        ],
      },
      {
        type: 'li',
        children: [
          { type: 'lic', children: [{ type: 'text', text: 'Item two' }] },
        ],
      },
    ],
  },
]
export { output }
