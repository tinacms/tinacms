import { it, expect } from 'vitest'
import { stringifyMDX } from '../../../stringify'
import { field } from './field'
import * as util from '../util'
import { RootElement } from '../../../parse/plate'

it('matches input', () => {
  const tree: RootElement = {
    type: 'root',
    children: [
      {
        type: 'mdxJsxFlowElement',
        name: 'Cta',
        children: [
          {
            type: 'text',
            text: '',
          },
        ],
        props: {
          children: {},
        },
      },
    ],
  }

  const string = stringifyMDX(tree, field, (v) => v)
  expect(string).toMatchFile(util.mdPath(__dirname))
})
