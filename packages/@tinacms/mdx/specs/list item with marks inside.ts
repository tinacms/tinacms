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
            children: [
              { type: 'text', text: 'this is an ' },
              { type: 'text', text: 'item', bold: true },
              { type: 'text', text: ' and a ' },
              {
                type: 'a',
                url: 'http://example.com',
                title: null,
                children: [{ type: 'text', text: 'link' }],
              },
            ],
          },
        ],
      },
    ],
  },
]
export { output }
