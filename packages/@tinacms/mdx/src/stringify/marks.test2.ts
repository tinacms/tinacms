import { getMarks, mark } from './index'
import type * as Md from 'mdast'
import type * as Plate from '../parse/plate'
import { eat } from './marks'

const text: Plate.TextElement[] = [
  {
    type: 'text',
    text: 'Hello ',
    bold: true,
  },
  {
    type: 'text',
    text: 'world',
    bold: true,
    italic: true,
  },
  {
    type: 'text',
    text: ', again',
    bold: true,
  },
  {
    type: 'text',
    text: ' ',
  },
  {
    type: 'text',
    text: 'here',
    italic: true,
  },
]
const response: Md.PhrasingContent[] = [
  {
    type: 'strong',
    children: [
      {
        type: 'text',
        value: 'Hello ',
      },
      {
        type: 'emphasis',
        children: [
          {
            type: 'text',
            value: 'world',
          },
        ],
      },
      {
        type: 'text',
        value: ', again',
      },
    ],
  },
  {
    type: 'text',
    value: ' ',
  },
  {
    type: 'emphasis',
    children: [
      {
        type: 'text',
        value: 'here',
      },
    ],
  },
]

const test2 = [
  {
    type: 'text',
    text: 'Hello ',
    italic: true,
  },
  {
    type: 'text',
    text: 'world',
    italic: true,
    bold: true,
  },
  {
    type: 'text',
    text: ', again',
    italic: true,
  },
]

const res2 = [
  {
    type: 'emphasis',
    children: [
      {
        type: 'text',
        value: 'Hello ',
      },
      {
        type: 'strong',
        children: [
          {
            type: 'text',
            value: 'world',
          },
        ],
      },
      {
        type: 'text',
        value: ', again',
      },
    ],
  },
]
const text3 = [
  {
    type: 'text',
    text: 'Hello ',
    italic: true,
  },
  {
    type: 'text',
    text: 'some code',
    code: true,
    italic: true,
  },
  {
    type: 'text',
    text: ', again',
    italic: true,
  },
]

const res3 = [
  {
    type: 'emphasis',
    children: [
      {
        type: 'text',
        value: 'Hello ',
      },
      {
        type: 'inlineCode',
        value: 'some code',
      },
      {
        type: 'text',
        value: ', again',
      },
    ],
  },
]

describe('eat', () => {
  test('combines text nodes', () => {
    const res = eat(text)
    expect(res).toMatchObject(response)
  })
  test('combines text nodes', () => {
    const res = eat(test2)
    expect(res).toMatchObject(res2)
  })
  test('combines text nodes', () => {
    const res = eat(text3)
    expect(res).toMatchObject(res3)
  })
})
