import type { RichTypeInner } from '@tinacms/schema-tools'
export { output } from '../setup'
export { parseMDX, stringifyMDX } from '../..'

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
    {
      name: 'Date',
      label: 'Date',
      fields: [{ type: 'datetime', name: 'here' }],
    },
    {
      name: 'Playground',
      label: 'Playground',
      fields: [
        { type: 'string', name: 'code' },
        {
          name: 'config',
          type: 'object',
          list: true,
          fields: [
            {
              type: 'string',
              name: 'key',
            },
            {
              type: 'string',
              name: 'value',
            },
          ],
        },
      ],
    },
    {
      name: 'Action',
      label: 'Action',
      fields: [
        {
          type: 'object',
          name: 'action',
          templates: [
            {
              label: 'Popup',
              name: 'popup',
              fields: [
                {
                  type: 'string',
                  name: 'title',
                },
                {
                  type: 'string',
                  name: 'descrption',
                },
              ],
            },
            {
              label: 'Link',
              name: 'link',
              fields: [
                {
                  type: 'string',
                  name: 'title',
                },
                {
                  type: 'string',
                  name: 'url',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
