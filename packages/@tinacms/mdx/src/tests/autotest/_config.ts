/**



*/
import type { RichType } from '@tinacms/schema-tools'
export { output } from '../setup'
export { parseMDX, stringifyMDX } from '../..'

export const field: RichType = {
  name: 'body',
  type: 'rich-text',
  templates: [
    {
      name: 'Test',
      label: 'Two Column Layout',
      fields: [
        {
          name: 'leftColumn',
          label: 'Left Column',
          type: 'rich-text',
        },
        {
          name: 'rightColumn',
          label: 'Right Column',
          type: 'rich-text',
          templates: [
            {
              name: 'Highlight',
              label: 'Highlight block',
              fields: [{ name: 'content', label: 'Body', type: 'rich-text' }],
            },
          ],
        },
      ],
    },
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
      name: 'Ratings',
      label: 'Ratings',
      fields: [{ type: 'number', name: 'value', list: true }],
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
    {
      name: 'rimg',
      label: 'rimg',
      inline: true,
      match: {
        start: '{{<',
        end: '>}}',
      },
      fields: [
        {
          name: 'src',
          label: 'Src',
          type: 'string',
          required: true,
          isTitle: true,
        },
      ],
    },
    {
      name: 'adPanel',
      label: 'Ad Panel',
      inline: true,
      match: {
        start: '{{%',
        end: '%}}',
        name: 'ad-panel-leaderboard',
      },
      fields: [
        {
          name: '_value',
          required: true,
          isTitle: true,
          label: 'Value',
          type: 'string',
        },
      ],
    },
    {
      name: 'pullQuote',
      label: 'Pull Quote',
      inline: true,
      match: {
        start: '{{%',
        end: '%}}',
        name: 'pull-quote',
      },
      fields: [
        {
          name: 'children',
          type: 'rich-text',
        },
      ],
    },
    {
      name: 'featurePanel',
      label: 'Feature Panel',
      inline: true,
      match: {
        start: '{{%',
        end: '%}}',
        name: 'feature-panel',
      },
      fields: [
        {
          name: '_value',
          required: true,
          isTitle: true,
          label: 'Value',
          type: 'string',
        },
      ],
    },
    {
      name: 'signature',
      label: 'Signature',
      match: {
        start: '{{<',
        end: '>}}',
      },
      fields: [
        {
          name: 'foo',
          label: 'foo label',
          type: 'string',
        },
      ],
    },
    {
      name: 'unkeyedSignature',
      label: 'Unkeyed Signature',
      match: {
        start: '{{<',
        end: '>}}',
      },
      fields: [
        {
          name: '_value',
          label: 'Value',
          type: 'string',
        },
      ],
    },
  ],
}
