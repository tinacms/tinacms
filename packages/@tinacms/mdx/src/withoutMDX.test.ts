import type { RichTypeInner } from '@tinacms/schema-tools'
import { parseMDX } from './parse/index'
import { stringifyMDX } from './stringify'
import fs from 'fs'

const field: RichTypeInner = { name: 'body', type: 'rich-text' }

expect.addSnapshotSerializer({
  test: () => true,
  print: (value) => {
    // @ts-ignore assumes {type: 'root', children: [...]}
    return JSON.stringify(value.children, null, 2)
  },
})

const parseThenStringify = (
  string,
  field,
  parseImageCallback?: any,
  stringifyImageCallback?: any
) => {
  const parseCallback = parseImageCallback || ((url) => url)
  const stringifyCallback = stringifyImageCallback || ((url) => url)
  const astResult = parseMDX(string, field, parseCallback, true)
  // Trim newlines for readability
  const stringResult = stringifyMDX(astResult, field, stringifyCallback).trim()
  return { astResult, stringResult }
}

describe('MDX Elements', () => {
  const mdxTest1 = '<Cta title="Hello World!" />'
  describe(mdxTest1, () => {
    test('unregistered elements throw an error', () => {
      const string = mdxTest1

      expect(() => parseMDX(string, field, (s) => s)).toThrowError()
    })
    test(mdxTest1, () => {
      const string = mdxTest1

      const { astResult, stringResult } = parseThenStringify(string, {
        ...field,
        templates: [
          {
            name: 'Cta',
            label: 'Call to Action',
            fields: [{ name: 'title', type: 'string' }],
          },
        ],
      })
      expect(astResult).toMatchInlineSnapshot(`
[
  {
    "type": "mdxJsxFlowElement",
    "name": "Cta",
    "children": [
      {
        "type": "text",
        "text": ""
      }
    ],
    "props": {
      "title": "Hello World!"
    }
  }
]
`)
      expect(stringResult).toEqual(string)
    })
  })
  const mdxTest2 = '<Tags items={["cooking", "music"]} />'
  describe(mdxTest2, () => {
    test(mdxTest2, () => {
      const string = mdxTest2

      const { astResult, stringResult } = parseThenStringify(string, {
        ...field,
        templates: [
          {
            name: 'Tags',
            label: 'Tags',
            fields: [{ name: 'items', type: 'string', list: true }],
          },
        ],
      })
      expect(astResult).toMatchInlineSnapshot(`
[
  {
    "type": "mdxJsxFlowElement",
    "name": "Tags",
    "children": [
      {
        "type": "text",
        "text": ""
      }
    ],
    "props": {
      "items": [
        "cooking",
        "music"
      ]
    }
  }
]
`)
      expect(stringResult).toEqual(string)
    })
  })
  const mdxTest4 = `<Table rows={[{
    id: 1,
    title: "This is a title",
    rating: 5,
    tags: ["drama", "comedy"]
  }]}/>`
  describe('with object & list props', () => {
    test.skip('A table with rows and columns', () => {
      const string = mdxTest4

      const { astResult, stringResult } = parseThenStringify(string, {
        ...field,
        templates: [
          {
            name: 'Table',
            label: 'Table',
            fields: [
              {
                name: 'rows',
                type: 'object',
                list: true,
                fields: [
                  {
                    type: 'number',
                    name: 'id',
                  },
                  {
                    type: 'string',
                    name: 'title',
                  },
                  {
                    type: 'number',
                    name: 'rating',
                    options: [1, 2, 3, 4, 5],
                  },
                  {
                    name: 'tags',
                    type: 'string',
                    list: true,
                  },
                ],
              },
            ],
          },
        ],
      })
      expect(astResult).toMatchInlineSnapshot()
      expect(stringResult).toEqual(string)
    })
  })

  const mdxTest3 = `Today's date is <Date format="iso" />.`
  test(mdxTest3, () => {
    const string = mdxTest3

    const { astResult, stringResult } = parseThenStringify(string, {
      ...field,
      templates: [
        {
          name: 'Date',
          label: 'Date',
          inline: true,
          fields: [
            { name: 'format', type: 'string', options: ['iso', 'local'] },
          ],
        },
      ],
    })
    expect(astResult).toMatchInlineSnapshot(`
[
  {
    "type": "p",
    "children": [
      {
        "type": "text",
        "text": "Today's date is "
      },
      {
        "type": "mdxJsxTextElement",
        "name": "Date",
        "children": [
          {
            "type": "text",
            "text": ""
          }
        ],
        "props": {
          "format": "iso"
        }
      },
      {
        "type": "text",
        "text": "."
      }
    ]
  }
]
`)
    expect(stringResult).toEqual(string)
  })
  const mdxTest5 = `Today's date is <Date format="iso" />.`
  test(mdxTest5, () => {
    const string = mdxTest5

    const { astResult, stringResult } = parseThenStringify(string, {
      ...field,
      templates: [
        {
          name: 'Date',
          label: 'Date',
          inline: true,
          fields: [{ name: 'format', type: 'string' }],
        },
      ],
    })
    expect(astResult).toMatchInlineSnapshot(`
[
  {
    "type": "p",
    "children": [
      {
        "type": "text",
        "text": "Today's date is "
      },
      {
        "type": "mdxJsxTextElement",
        "name": "Date",
        "children": [
          {
            "type": "text",
            "text": ""
          }
        ],
        "props": {
          "format": "iso"
        }
      },
      {
        "type": "text",
        "text": "."
      }
    ]
  }
]
`)
    expect(stringResult).toEqual(string)
  })

  describe('Nested rich-text', () => {
    const mdxTest3 = `
<Blockquote author="content/authors/pedro.md">
  # Lorem ipsum dolor.
</Blockquote>
`
    test('With rich-text children', () => {
      const string = mdxTest3.trim()

      const { astResult, stringResult } = parseThenStringify(string, {
        ...field,
        templates: [
          {
            name: 'Blockquote',
            label: 'Blockquote',
            fields: [
              { name: 'children', label: 'Quote', type: 'rich-text' },
              {
                name: 'author',
                label: 'Author',
                type: 'reference',
                collections: ['author'],
              },
            ],
          },
        ],
      })
      expect(astResult).toMatchInlineSnapshot(`
[
  {
    "type": "mdxJsxFlowElement",
    "name": "Blockquote",
    "children": [
      {
        "type": "text",
        "text": ""
      }
    ],
    "props": {
      "author": "content/authors/pedro.md",
      "children": {
        "type": "root",
        "children": [
          {
            "type": "h1",
            "children": [
              {
                "type": "text",
                "text": "Lorem ipsum dolor."
              }
            ]
          }
        ]
      }
    }
  }
]
`)
      expect(stringResult).toEqual(string)
    })

    const mdxTest4 = `
<Blockquote
  author="content/authors/pedro.md"
  quote={<>
    # Lorem ipsum dolor.
  </>}
/>`
    test('With rich-text as a prop', () => {
      const string = mdxTest4.trim()

      const { astResult, stringResult } = parseThenStringify(string, {
        ...field,
        templates: [
          {
            name: 'Blockquote',
            label: 'Blockquote',
            fields: [
              { name: 'quote', label: 'Quote', type: 'rich-text' },
              {
                name: 'author',
                label: 'Author',
                type: 'reference',
                collections: ['author'],
              },
            ],
          },
        ],
      })
      expect(astResult).toMatchInlineSnapshot(`
[
  {
    "type": "mdxJsxFlowElement",
    "name": "Blockquote",
    "children": [
      {
        "type": "text",
        "text": ""
      }
    ],
    "props": {
      "author": "content/authors/pedro.md",
      "quote": {
        "type": "root",
        "children": [
          {
            "type": "h1",
            "children": [
              {
                "type": "text",
                "text": "Lorem ipsum dolor."
              }
            ]
          }
        ]
      }
    }
  }
]
`)
      expect(stringResult).toEqual(string)
    })

    const mdxTestImage = `
![](/uploads/image.jpg)

<CustomImage url="/uploads/my-pic.jpg" />`
    test('With an image MDX element', () => {
      const string = mdxTestImage.trim()

      const parseImageCallback = jest.fn((src) => {
        return `some-prefix${src}`
      })
      const stringifyImageCallback = jest.fn((src) => {
        return src.replace('some-prefix', '')
      })

      const { astResult, stringResult } = parseThenStringify(
        string,
        {
          ...field,
          templates: [
            {
              name: 'CustomImage',
              label: 'Image',
              fields: [{ name: 'url', label: 'URL', type: 'image' }],
            },
          ],
        },
        parseImageCallback,
        stringifyImageCallback
      )
      expect(astResult).toMatchInlineSnapshot(`
[
  {
    "type": "p",
    "children": [
      {
        "type": "img",
        "url": "some-prefix/uploads/image.jpg",
        "alt": "",
        "caption": null,
        "children": [
          {
            "type": "text",
            "text": ""
          }
        ]
      }
    ]
  },
  {
    "type": "mdxJsxFlowElement",
    "name": "CustomImage",
    "children": [
      {
        "type": "text",
        "text": ""
      }
    ],
    "props": {
      "url": "some-prefix/uploads/my-pic.jpg"
    }
  }
]
`)
      expect(stringResult).toEqual(
        `
![](/uploads/image.jpg)

<CustomImage url="/uploads/my-pic.jpg" />`.trim()
      )
    })

    const mdxTest5 = `
<Blockquote
  author="content/authors/pedro.md"
  quotes={[
<>
# Lorem ipsum dolor.

</>
]}
/>`
    test.skip('With a list of rich-text items as a prop', () => {
      const string = mdxTest5.trim()

      const { astResult, stringResult } = parseThenStringify(string, {
        ...field,
        templates: [
          {
            name: 'Blockquote',
            label: 'Blockquote',
            fields: [
              {
                name: 'quotes',
                label: 'Quotes',
                type: 'rich-text',
                list: true,
              },
              {
                name: 'author',
                label: 'Author',
                type: 'reference',
                collections: ['author'],
              },
            ],
          },
        ],
      })
      expect(astResult).toMatchInlineSnapshot()
      expect(stringResult).toEqual(string)
    })
  })
})
