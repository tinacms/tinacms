import { extractAttributes } from './acorn'
import { markdownToAst } from '.'
import type { MdxJsxAttribute } from 'mdast-util-mdx-jsx'
import type { Template } from '@tinacms/schema-tools'

const getAttributes = (string) => {
  const tree = markdownToAst(string)
  // @ts-ignore
  return tree.children[0].attributes as MdxJsxAttribute[]
}

const template: Template<false> = {
  label: 'Some template',
  name: 'someTemplate',
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
  ],
}

// test.only('doit', () => {
//   const res = markdownToAst(`
// # Hello <Tester myValue={{test1: Nested}} />

// <Nested>

// ## Hi

// [whats](http://example.com) the story?

// </Nested>
// export const Nested = ({ children }) => children;
// `)
//   // console.log(res.children[1].value)
//   console.log(res.children[0].children[1].attributes[0])
// })

describe('Extracting serializable content from an MDX expression', () => {
  test(`extracting an object`, () => {
    const attributes = getAttributes(
      `<Date published={true} value={"2022-2-2"} rating={2} label={"hello"} tags={["one", "two", 'three']} options={{format: 'iso'}} />`
    )
    const res = extractAttributes(attributes, template.fields)

    expect(res).toMatchInlineSnapshot(`
{
  "published": true,
  "value": "2022-2-2",
  "rating": 2,
  "label": "hello",
  "tags": [
    "one",
    "two",
    "three"
  ],
  "options": {
    "format": "iso"
  }
}
`)
  })

  test(`extracting a string literal`, () => {
    const attributes = getAttributes(`<Date label="hello" />`)
    const res = extractAttributes(attributes, template.fields)

    expect(res).toMatchInlineSnapshot(`
{
  "label": "hello"
}
`)
  })
  test(`extracting a rich-text`, () => {
    const attributes = getAttributes(`<Date description={<># Hello!</>} />`)
    const res = extractAttributes(attributes, template.fields)

    expect(res).toMatchInlineSnapshot(`
{
  "description": {
    "type": "root",
    "children": [
      {
        "type": "h1",
        "children": [
          {
            "type": "text",
            "text": "Hello!"
          }
        ]
      }
    ]
  }
}
`)
  })
  test(`array of objects`, () => {
    const attributes = getAttributes(
      `<Gallery images={[{src: "mypic.jpg", description: "Hello, world!"}]} />`
    )
    const res = extractAttributes(attributes, [
      {
        type: 'object',
        name: 'images',
        list: true,
        fields: [
          {
            type: 'string',
            name: 'src',
          },
        ],
      },
    ])

    expect(res).toMatchInlineSnapshot(`
{
  "images": [
    {
      "src": "mypic.jpg",
      "description": "Hello, world!"
    }
  ]
}
`)
  })
  test(`deeply nested objects`, () => {
    const attributes = getAttributes(`<Hero layout={{align: {left: 20}}} />`)
    const res = extractAttributes(attributes, [
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
        ],
      },
    ])

    expect(res).toMatchInlineSnapshot(`
{
  "layout": {
    "align": {
      "left": 20
    }
  }
}
`)
  })
  test(`deeply nested objects with arrays`, () => {
    const attributes = getAttributes(
      `<Hero layout={{screens: [{size: 'lg'}, {size: 'md'}]}} />`
    )
    const res = extractAttributes(attributes, [
      {
        type: 'object',
        name: 'layout',
        fields: [
          {
            type: 'object',
            name: 'screens',
            list: true,
            fields: [
              {
                name: 'size',
                type: 'string',
              },
            ],
          },
        ],
      },
    ])

    expect(res).toMatchInlineSnapshot(`
{
  "layout": {
    "screens": [
      {
        "size": "lg"
      },
      {
        "size": "md"
      }
    ]
  }
}
`)
  })
})

expect.addSnapshotSerializer({
  test: () => true,
  print: (value) => {
    return JSON.stringify(value, null, 2)
  },
})
