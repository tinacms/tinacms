import { expect, it } from 'vitest'
import { loop, writeSnapshot } from '../setup'
import type { RichTypeInner } from '@tinacms/schema-tools'
export type { BlockElement } from '../../src/parse/plate'

const content = import.meta.glob('./*.md', { as: 'raw' })
const outputString = import.meta.glob('./*.ts', { as: 'raw' })

export const field: RichTypeInner = {
  name: 'body',
  type: 'rich-text',
  templates: [
    {
      name: 'Greeting',
      label: 'Greeting',
      inline: true,
      fields: [{ type: 'string', name: 'message' }],
    },
    {
      name: 'Blockquote',
      label: 'Blockquote',
      fields: [
        { type: 'string', name: 'author' },
        { type: 'rich-text', name: 'children' },
      ],
    },
    {
      name: 'Cta',
      label: 'Call-to-action',
      fields: [
        { type: 'rich-text', name: 'description' },
        { type: 'rich-text', name: 'children' },
      ],
    },
    {
      name: 'MaybeShow',
      label: 'Maybe Show',
      fields: [{ type: 'boolean', name: 'toggle' }],
    },
    {
      name: 'Count',
      label: 'Count',
      fields: [{ type: 'number', name: 'number' }],
    },
    {
      name: 'Tags',
      label: 'Tags',
      fields: [{ type: 'string', name: 'items', list: true }],
    },
  ],
}

loop(
  content,
  outputString,
  field,
  ({ name, output, value, astResult, stringResult }) => {
    it(name, () => {
      expect(stringResult).toEqual(value.trim())
      if (output) {
        expect(output).toEqual(astResult)
      } else {
        writeSnapshot(__filename, name, astResult)
      }
    })
  }
)
