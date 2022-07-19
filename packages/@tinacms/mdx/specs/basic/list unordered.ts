import type { BlockElement } from './_runner.test'

const output: BlockElement[] = [
  {
    type: 'ul',
    children: [
      {
        type: 'li',
        children: [
          {
            type: 'lic',
            children: [{ type: 'text', text: 'This is an item' }],
          },
          {
            type: 'ul',
            children: [
              {
                type: 'li',
                children: [
                  {
                    type: 'lic',
                    children: [{ type: 'text', text: 'this is a sub-item' }],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: 'li',
        children: [
          {
            type: 'lic',
            children: [{ type: 'text', text: 'this is another item' }],
          },
        ],
      },
    ],
  },
]
export { output }
