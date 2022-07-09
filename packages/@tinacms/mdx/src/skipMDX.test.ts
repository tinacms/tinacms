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
  // const stringResult = ''
  return { astResult, stringResult }
}

describe('Kitchen sink', () => {
  test.skip('tests', async () => {
    const string = await fs
      .readFileSync('./fixtures/kitchen-sink.md')
      .toString()

    const { astResult, stringResult } = parseThenStringify(string, field)
    console.log(JSON.stringify(astResult, null, 2))
    // expect(stringResult).toEqual(string)
    expect(astResult).toMatchInlineSnapshot()
  })
})

describe('HTML Elements', () => {
  const htmlTest1 = '<Cta title="Hello World!" />'
  describe(htmlTest1, () => {
    test(htmlTest1, () => {
      const string = htmlTest1

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
            "type": "html",
            "value": "<Cta title=\\"Hello World!\\" />",
            "children": [
              {
                "type": "text",
                "text": ""
              }
            ]
          }
        ]
      `)
      expect(stringResult).toEqual(string)
    })
  })

  const htmlTest2 = `Some text with {{ shortcodes "arg1" }}`
  test(htmlTest2, () => {
    const string = htmlTest2.trim()

    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(astResult).toMatchInlineSnapshot(`
        [
          {
            "type": "p",
            "children": [
              {
                "type": "text",
                "text": "Some text with {{ shortcodes \\"arg1\\" }}"
              }
            ]
          }
        ]
      `)
    expect(stringResult).toEqual(string)
  })

  const htmlTest3 = `
{{< rimg src="https://res.cloudinary.com/indysigner/image/upload/v1609336455/the-relevance-gap_kzwi6q.png" href="https://infrequently.org/2020/06/platform-adjacency-theory/" sizes="100vw" caption="Image credit: <a href='https://infrequently.org/2020/06/platform-adjacency-theory/'>Alex Russell</a>" alt="The Relevance Gap" >}}
  `
  const htmlTest3Response = `
{{\\< rimg src="https://res.cloudinary.com/indysigner/image/upload/v1609336455/the-relevance-gap\\_kzwi6q.png" href="https://infrequently.org/2020/06/platform-adjacency-theory/" sizes="100vw" caption="Image credit: <a href='https://infrequently.org/2020/06/platform-adjacency-theory/'>Alex Russell</a>" alt="The Relevance Gap" >}}
  `.trim()
  test('Hugo style block shortcodes', () => {
    const string = htmlTest3.trim()

    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(astResult).toMatchInlineSnapshot(`
        [
          {
            "type": "p",
            "children": [
              {
                "type": "text",
                "text": "{{< rimg src=\\"https://res.cloudinary.com/indysigner/image/upload/v1609336455/the-relevance-gap_kzwi6q.png\\" href=\\"https://infrequently.org/2020/06/platform-adjacency-theory/\\" sizes=\\"100vw\\" caption=\\"Image credit: "
              },
              {
                "type": "html",
                "value": "<a href='https://infrequently.org/2020/06/platform-adjacency-theory/'>",
                "children": [
                  {
                    "type": "text",
                    "text": ""
                  }
                ]
              },
              {
                "type": "text",
                "text": "Alex Russell"
              },
              {
                "type": "html",
                "value": "</a>",
                "children": [
                  {
                    "type": "text",
                    "text": ""
                  }
                ]
              },
              {
                "type": "text",
                "text": "\\" alt=\\"The Relevance Gap\\" >}}"
              }
            ]
          }
        ]
      `)
    expect(stringResult).toEqual(htmlTest3Response)
  })
})
