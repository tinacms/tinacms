import { it, expect } from 'vitest'
import { stringifyMDX } from '../../../stringify'
import { field } from './field'
import * as util from '../util'

it('matches input', () => {
  const tree = {
    type: 'root' as const,
    children: [
      {
        children: [
          {
            type: 'text' as const,
            text: 'This is ',
          },
          {
            // These should have a `type` property, but it was stripped out by the rich-text editor
            text: 'italic',
            italic: true,
          },
        ],
        type: 'p' as const,
      },
      {
        type: 'p' as const,
        children: [
          {
            // These should have a `type` property, but it was stripped out by the rich-text editor
            text: 'boldd',
            bold: true,
          },
        ],
      },
    ],
  }
  // @ts-expect-error - `type` property is missing intentionally
  const string = stringifyMDX(tree, field, (v) => v)
  expect(string).toMatchFile(util.mdPath(__dirname))
})
