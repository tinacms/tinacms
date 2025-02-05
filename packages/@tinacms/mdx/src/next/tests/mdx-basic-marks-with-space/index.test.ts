import { it, expect } from 'vitest'
import { stringifyMDX } from '../../../stringify'
import { field } from './field'
import * as util from '../util'

it('matches input', () => {
  const tree = {
    type: 'root',
    children: [
      {
        type: 'p',
        children: [
          {
            type: 'text',
            text: 'boldd    ',
            bold: true,
          },
        ],
      },
      {
        type: 'p',
        children: [
          {
            type: 'text',
            text: ' boldd',
            bold: true,
          },
        ],
      },
      {
        type: 'p',
        children: [
          {
            type: 'text',
            text: 'something',
          },
          {
            type: 'text',
            text: ' boldd',
            bold: true,
          },
        ],
      },
      {
        type: 'p',
        children: [
          {
            type: 'text',
            text: 'boldd ',
            bold: true,
          },
          {
            type: 'text',
            text: 'something',
          },
        ],
      },
      {
        type: 'p',
        children: [
          {
            type: 'text',
            text: 'boldd ',
            bold: true,
          },
        ],
      },
    ],
  } as const
  // @ts-expect-error - `type` property is missing intentionally
  const string = stringifyMDX(tree, field, (v) => v)
  expect(string).toMatchFile(util.mdPath(__dirname))
})
