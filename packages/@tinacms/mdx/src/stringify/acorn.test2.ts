import { extractAttributes, stringifyAttributes } from './acorn'
import { markdownToAst } from '.'
import type { MdxJsxAttribute } from 'mdast-util-mdx-jsx'
import type { Template } from '@tinacms/schema-tools'
import { stringifyMDX } from '.'

const template: Template<false> = {
  label: 'Date',
  name: 'Date',
  fields: [
    {
      type: 'string',
      name: 'label',
    },
    {
      type: 'number',
      name: 'rating',
    },
    {
      type: 'string',
      name: 'tags',
      list: true,
    },
    {
      type: 'datetime',
      name: 'value',
    },
    {
      type: 'boolean',
      name: 'published',
    },
    {
      type: 'rich-text',
      name: 'description',
    },
    {
      type: 'object',
      name: 'options',
      fields: [
        {
          type: 'string',
          name: 'format',
        },
      ],
    },
    {
      type: 'object',
      name: 'args',
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
    {
      type: 'object',
      name: 'layout',
      fields: [
        {
          type: 'object',
          name: 'align',
          fields: [
            {
              name: 'left',
              type: 'number',
            },
          ],
        },
        {
          type: 'object',
          name: 'theme',
          fields: [
            {
              name: 'size',
              type: 'number',
            },
            {
              name: 'config',
              type: 'object',
              fields: [
                {
                  name: 'primary',
                  type: 'string',
                },
                {
                  name: 'secondary',
                  type: 'string',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

const props = {
  label: 'Hello',
  rating: 3,
  tags: ['cooking', 'music'],
  value: '2022-2-2',
  args: [
    { key: 'arg1', value: 'value1' },
    { key: 'arg2', value: 'value1' },
    { key: 'arg3', value: 'value3' },
    { key: 'arg4', value: 'value4' },
  ],
  published: true,
  layout: {
    align: 2,
    theme: [{ size: 'lg', config: { primary: 'blue', secondary: 'red' } }],
  },
  description: {
    type: 'root',
    children: [
      {
        type: 'h1',
        children: [{ type: 'text', text: 'Hello world!' }],
      },
      {
        type: 'p',
        children: [
          { type: 'text', text: 'This is some ' },
          { type: 'text', text: 'rich', bold: true },
          { type: 'text', text: ' text.' },
        ],
      },
    ],
  },
}

describe('Writing to markdown', () => {
  test.only(`serializing empty paragraphs are ignored`, () => {
    const res2 = stringifyMDX(
      {
        type: 'root',
        children: [
          {
            type: 'p',
            children: [
              {
                type: 'text',
                text: 'P 1',
              },
            ],
          },
          {
            type: 'p',
            children: [
              {
                type: 'text',
                text: '',
              },
            ],
          },
          {
            type: 'p',
            children: [
              {
                type: 'text',
                text: 'P 2',
              },
            ],
          },
        ],
      },
      { name: 'body', type: 'rich-text', templates: [template] }
    )
    expect(res2).toMatchInlineSnapshot(`
P 1

P 2
`)
  })
})
describe('Serializable form data into an MDX expression', () => {
  test(`serializing a block object`, () => {
    const res2 = stringifyMDX(
      {
        type: 'root',
        children: [
          {
            type: 'mdxJsxFlowElement',
            name: 'Date',
            props: props,
            children: [{ type: 'text', text: '' }],
          },
        ],
      },
      { name: 'body', type: 'rich-text', templates: [template] }
    )
    expect(res2).toMatchInlineSnapshot(`
<Date
  label="Hello"
  rating={3}
  tags={["cooking", "music"]}
  value="2022-2-2"
  args={[
    { key: "arg1", value: "value1" },
    { key: "arg2", value: "value1" },
    { key: "arg3", value: "value3" },
    { key: "arg4", value: "value4" }
  ]}
  published={true}
  layout={{
    align: 2,
    theme: [{ size: "lg", config: { primary: "blue", secondary: "red" } }]
  }}
  description={<>
    # Hello world!

    This is some **rich** text.
  </>}
/>
`)
  })
  test(`serializing an inline object`, () => {
    const res2 = stringifyMDX(
      {
        type: 'root',
        children: [
          {
            type: 'p',
            children: [
              { type: 'text', text: 'This is a ' },
              {
                type: 'mdxJsxTextElement',
                name: 'Date',
                props: props,
                children: [{ type: 'text', text: '' }],
              },
              { type: 'text', text: ' with text on either side' },
            ],
          },
        ],
      },
      { name: 'body', type: 'rich-text', templates: [template] }
    )
    expect(res2).toMatchInlineSnapshot(
      `This is a <Date label="Hello" rating={3} tags={["cooking", "music"]} value="2022-2-2" args={[ { key: "arg1", value: "value1" }, { key: "arg2", value: "value1" }, { key: "arg3", value: "value3" }, { key: "arg4", value: "value4" }]} published={true} layout={{ align: 2, theme: [{ size: "lg", config: { primary: "blue", secondary: "red" } }]}} description={<># Hello world!      This is some **rich** text.</>} /> with text on either side`
    )
  })
})

expect.addSnapshotSerializer({
  test: () => true,
  print: (value) => {
    return value.trim()
  },
})
