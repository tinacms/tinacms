import React from 'react'
import MonacoEditor from 'react-monaco-editor'
import { useState } from 'react'
import { parseMDX, stringifyMDX } from '../src/index'
import type { RichTypeInner } from '@tinacms/schema-tools'
import { Explorer2 } from './explorer'
// @ts-ignore
import md1 from './examples/forestryio/1.md?raw'
const markdownFiles = import.meta.glob('../src/tests/autotest/*.md', {
  as: 'raw',
})

// console.log(modules)
export const field: RichTypeInner = {
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
    // {
    //   name: 'signature',
    //   label: 'Signature',
    //   match: {
    //     start: '{{<',
    //     end: '>}}',
    //   },
    //   fields: [
    //     {
    //       name: 'foo',
    //       label: 'foo label',
    //       type: 'string',
    //     },
    //   ],
    // },
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

const fromMarkdownWithDirectives = (string: string) => {
  return parseMDX(string, field, (v) => v)
}

const ast = fromMarkdownWithDirectives(md1)

export type Ast = typeof ast

const Sidebar = ({ setText }) => {
  const [items, setItems] = React.useState<
    {
      name: string
      value: any
    }[]
  >([])

  React.useEffect(() => {
    const run = async () => {
      const items = await Promise.all(
        Object.entries(markdownFiles).map(async ([key, value]) => {
          return { name: key, value: await value() }
        })
      )
      setItems(items)
    }
    run()
  }, [])
  return (
    <div className="h-screen overflow-scroll">
      <ul>
        {items.map((item) => (
          <li>
            <button
              style={{ direction: 'rtl' }}
              className=" max-w-full text-left p-2 truncate"
              onClick={() => setText(item.value)}
            >
              {item.name.replace('../src/tests/autotest/', '')}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export const MarkdownPlayground = () => {
  const [state, setState] = useState(ast)
  const [editor, setEditor] = useState('markdown')
  const [stringValue, setStringValue] = useState('')
  React.useEffect(() => {
    setState(fromMarkdownWithDirectives(stringValue))
  }, [stringValue])
  return (
    <div className="px-2 mx-auto h-screen">
      <div className="grid grid-cols-12 h-screen">
        <div className="col-span-3">
          <Sidebar setText={(value) => setStringValue(value)} />
        </div>
        <div className="bg-white py-5 col-span-3 h-screen">
          <MonacoEditor
            height="100%"
            width="100%"
            language="markdown"
            theme="vs"
            value={stringValue}
            options={{
              minimap: {
                enabled: false,
              },
              wordWrap: 'on',
            }}
            onChange={(value) => {
              setState(fromMarkdownWithDirectives(value))
            }}
          />
        </div>
        <div className="bg-white p-3 col-span-3 h-screen overflow-scroll">
          <MonacoEditor
            height="100%"
            width="100%"
            language="json"
            theme="vs"
            value={JSON.stringify(state, null, 2)}
            options={{
              minimap: {
                enabled: false,
              },
              wordWrap: 'on',
            }}
            onChange={(value) => setState(JSON.parse(value))}
          />
        </div>
        <div className="bg-white py-5 col-span-3 h-screen">
          <MonacoEditor
            height="100%"
            width="100%"
            language="markdown"
            theme="vs"
            value={stringifyMDX(state, field, (v) => v)}
            options={{
              minimap: {
                enabled: false,
              },
              wordWrap: 'on',
            }}
            onChange={(value) => setState(fromMarkdownWithDirectives(value))}
          />
        </div>
      </div>
    </div>
  )
}

export const Json = (props: { src: object }) => (
  <Explorer2
    value={props.src}
    renderValue={({ value, keyName, parentValue, parentKeyName }) => {
      if (typeof value === 'string') {
        return <span className="text-orange-600">{value}</span>
      }
      if (typeof value === 'number') {
        return <span className="text-blue-600">{value}</span>
      }
      if (typeof value === 'boolean') {
        return (
          <span className="text-green-600">
            {value === false ? 'false' : value === true ? 'true' : ''}
          </span>
        )
      }
      return <span />
    }}
  />
)
