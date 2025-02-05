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
            text: 'this is ',
          },
          {
            text: 'a ',
            bold: true,
          },
          {
            text: 'wonderful ',
          },
          {
            text: 'test ',
            bold: true,
          },
          {
            text: 'now both ??',
            bold: true,
            italic: true,
          },
        ],
        type: 'p',
        id: 'grpyd',
      },
      {
        type: 'p',
        id: 'sf9da',
        children: [
          {
            bold: true,
            italic: true,
            text: '',
          },
        ],
      },
      {
        type: 'p',
        id: 'ehwtv',
        children: [
          {
            text: 'just bold ',
            bold: true,
          },
          {
            text: ' ',
          },
        ],
      },
      {
        type: 'p',
        id: 'ftplq',
        children: [
          {
            text: '',
          },
        ],
      },
      {
        type: 'p',
        id: 'myntp',
        children: [
          {
            text: 'now not bold',
          },
        ],
      },
      {
        type: 'p',
        id: '6l8xs',
        children: [
          {
            text: '',
          },
        ],
      },
      {
        type: 'p',
        id: 'o2i7t',
        children: [
          {
            text: 'now ',
            bold: true,
          },
          {
            text: 'italic ',
            italic: true,
          },
        ],
      },
    ],
  }
  // @ts-expect-error - `type` property is missing intentionally
  const string = stringifyMDX(tree, field, (v) => v)
  expect(string).toMatchFile(util.mdPath(__dirname))
})
