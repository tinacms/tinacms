/**

Copyright 2021 Forestry.io Holdings, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/
import { expect, it, describe } from 'vitest'
import type { RichTypeInner } from '@tinacms/schema-tools'
import { parseMDX } from './parse/index'
import { stringifyMDX } from './stringify'
import fs from 'fs'

const test = it

const field: RichTypeInner = { name: 'body', type: 'rich-text', templates: [] }

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
  const astResult = parseMDX(string, field, parseCallback)
  // Trim newlines for readability
  const stringResult = stringifyMDX(astResult, field, stringifyCallback).trim()
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

describe('Bodies of text', () => {
  const text = `
# Hello, world

***

This is a paragraph, and [here](http://example.com) is a link

This is *italic*, and this is **bold**
`
  test('Multi-line text', () => {
    const string = text.trim()

    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(stringResult).toEqual(string)
    expect(astResult).toMatchInlineSnapshot(`
      [
        {
          "type": "h1",
          "children": [
            {
              "type": "text",
              "text": "Hello, world"
            }
          ]
        },
        {
          "type": "hr",
          "children": [
            {
              "type": "text",
              "text": ""
            }
          ]
        },
        {
          "type": "p",
          "children": [
            {
              "type": "text",
              "text": "This is a paragraph, and "
            },
            {
              "type": "a",
              "url": "http://example.com",
              "title": null,
              "children": [
                {
                  "type": "text",
                  "text": "here"
                }
              ]
            },
            {
              "type": "text",
              "text": " is a link"
            }
          ]
        },
        {
          "type": "p",
          "children": [
            {
              "type": "text",
              "text": "This is "
            },
            {
              "type": "text",
              "text": "italic",
              "italic": true
            },
            {
              "type": "text",
              "text": ", and this is "
            },
            {
              "type": "text",
              "text": "bold",
              "bold": true
            }
          ]
        }
      ]
    `)
  })

  const text2 = `
P 1

P 2

P 3

P 4
`
  test('Multi-line text2', () => {
    const string = text2.trim()

    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(stringResult).toEqual(string)
    expect(astResult).toMatchInlineSnapshot(`
      [
        {
          "type": "p",
          "children": [
            {
              "type": "text",
              "text": "P 1"
            }
          ]
        },
        {
          "type": "p",
          "children": [
            {
              "type": "text",
              "text": "P 2"
            }
          ]
        },
        {
          "type": "p",
          "children": [
            {
              "type": "text",
              "text": "P 3"
            }
          ]
        },
        {
          "type": "p",
          "children": [
            {
              "type": "text",
              "text": "P 4"
            }
          ]
        }
      ]
    `)
  })
})
describe('Lists', () => {
  const list1 = `* this is a list`
  test(list1, () => {
    const string = list1

    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(stringResult).toEqual(string)
    expect(astResult).toMatchInlineSnapshot(`
      [
        {
          "type": "ul",
          "children": [
            {
              "type": "li",
              "children": [
                {
                  "type": "lic",
                  "children": [
                    {
                      "type": "text",
                      "text": "this is a list"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    `)
  })

  const list2 = `* > some blockquote`
  test(list2, () => {
    const string = list2

    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(stringResult).toEqual(`* some blockquote`)
    expect(astResult).toMatchInlineSnapshot(`
      [
        {
          "type": "ul",
          "children": [
            {
              "type": "li",
              "children": [
                {
                  "type": "lic",
                  "children": [
                    {
                      "type": "text",
                      "text": "some blockquote"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    `)
  })
  const list3 = `
* list item 1
  1. sub list item 1A
* list item 2
`
  test('Nested list items', () => {
    const string = list3.trim()

    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(stringResult).toEqual(string)
    expect(astResult).toMatchInlineSnapshot(`
      [
        {
          "type": "ul",
          "children": [
            {
              "type": "li",
              "children": [
                {
                  "type": "lic",
                  "children": [
                    {
                      "type": "text",
                      "text": "list item 1"
                    }
                  ]
                },
                {
                  "type": "ol",
                  "children": [
                    {
                      "type": "li",
                      "children": [
                        {
                          "type": "lic",
                          "children": [
                            {
                              "type": "text",
                              "text": "sub list item 1A"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              "type": "li",
              "children": [
                {
                  "type": "lic",
                  "children": [
                    {
                      "type": "text",
                      "text": "list item 2"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    `)
  })

  const list4 = `
* list **with *some* formatting**
`
  test(list4, () => {
    const string = list4.trim()

    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(stringResult).toEqual(string)
    expect(astResult).toMatchInlineSnapshot(`
      [
        {
          "type": "ul",
          "children": [
            {
              "type": "li",
              "children": [
                {
                  "type": "lic",
                  "children": [
                    {
                      "type": "text",
                      "text": "list "
                    },
                    {
                      "type": "text",
                      "text": "with ",
                      "bold": true
                    },
                    {
                      "type": "text",
                      "text": "some",
                      "bold": true,
                      "italic": true
                    },
                    {
                      "type": "text",
                      "text": " formatting",
                      "bold": true
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    `)
  })
  const list5 = `
- \`\`\`
`
  test('Unsupported list items like code blocks throw an error', () => {
    const string = list5

    expect(() => parseMDX(string, field, (s) => s)).toThrowError()
  })
  const list6 = `
  - <Date />
  `
  test(`JSX which is interpretted as block-level is converted to inline`, () => {
    const string = list6

    const { astResult, stringResult } = parseThenStringify(string, {
      ...field,
      templates: [{ name: 'Date', fields: [] }],
    })
    // expect(stringResult).toEqual(string)
    expect(astResult).toMatchInlineSnapshot(`
      [
        {
          "type": "ul",
          "children": [
            {
              "type": "li",
              "children": [
                {
                  "type": "lic",
                  "children": [
                    {
                      "type": "mdxJsxTextElement",
                      "name": "Date",
                      "children": [
                        {
                          "type": "text",
                          "text": ""
                        }
                      ],
                      "props": {}
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    `)
  })
})

describe('Headers', () => {
  const header1 = '# Hello'
  test(header1, () => {
    const string = header1

    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(stringResult).toEqual(string)
    expect(astResult).toMatchInlineSnapshot(`
      [
        {
          "type": "h1",
          "children": [
            {
              "type": "text",
              "text": "Hello"
            }
          ]
        }
      ]
    `)
  })

  const header2 = '# Hello **world**'
  test(header2, () => {
    const string = header2

    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(stringResult).toEqual(string)
    expect(astResult).toMatchInlineSnapshot(`
      [
        {
          "type": "h1",
          "children": [
            {
              "type": "text",
              "text": "Hello "
            },
            {
              "type": "text",
              "text": "world",
              "bold": true
            }
          ]
        }
      ]
    `)
  })
})

describe('Links', () => {
  const linkTest1 = 'Click [here](https://example.com "Tester") to join now'
  test(linkTest1, () => {
    const string = linkTest1

    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(astResult).toMatchInlineSnapshot(`
      [
        {
          "type": "p",
          "children": [
            {
              "type": "text",
              "text": "Click "
            },
            {
              "type": "a",
              "url": "https://example.com",
              "title": "Tester",
              "children": [
                {
                  "type": "text",
                  "text": "here"
                }
              ]
            },
            {
              "type": "text",
              "text": " to join now"
            }
          ]
        }
      ]
    `)
    expect(stringResult).toEqual(string)
  })
})

const blockquote = '> Hello, World!'
test(blockquote, () => {
  const string = blockquote

  const { astResult, stringResult } = parseThenStringify(string, field)
  expect(stringResult).toEqual(string)
  expect(astResult).toMatchInlineSnapshot(`
    [
      {
        "type": "blockquote",
        "children": [
          {
            "type": "text",
            "text": "Hello, World!"
          }
        ]
      }
    ]
  `)
})
describe('Marks', () => {
  const mark1 = 'Some *bold* text'
  test(mark1, () => {
    const string = mark1

    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(stringResult).toEqual(string)
    expect(astResult).toMatchInlineSnapshot(`
      [
        {
          "type": "p",
          "children": [
            {
              "type": "text",
              "text": "Some "
            },
            {
              "type": "text",
              "text": "bold",
              "italic": true
            },
            {
              "type": "text",
              "text": " text"
            }
          ]
        }
      ]
    `)
  })
  const mark2 = 'Some **emphasized** text'
  test(mark2, () => {
    const string = mark2

    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(stringResult).toEqual(string)
    expect(astResult).toMatchInlineSnapshot(`
      [
        {
          "type": "p",
          "children": [
            {
              "type": "text",
              "text": "Some "
            },
            {
              "type": "text",
              "text": "emphasized",
              "bold": true
            },
            {
              "type": "text",
              "text": " text"
            }
          ]
        }
      ]
    `)
  })
  const mark3 = 'Some ***bold and emphasized*** text'
  test(mark3, () => {
    const string = mark3

    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(stringResult).toEqual(string)
    expect(astResult).toMatchInlineSnapshot(`
      [
        {
          "type": "p",
          "children": [
            {
              "type": "text",
              "text": "Some "
            },
            {
              "type": "text",
              "text": "bold and emphasized",
              "italic": true,
              "bold": true
            },
            {
              "type": "text",
              "text": " text"
            }
          ]
        }
      ]
    `)
  })
  const mark4 = 'Some `inline code` text'
  test(mark4, () => {
    const string = mark4

    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(stringResult).toEqual(string)
    expect(astResult).toMatchInlineSnapshot(`
      [
        {
          "type": "p",
          "children": [
            {
              "type": "text",
              "text": "Some "
            },
            {
              "type": "text",
              "text": "inline code",
              "code": true
            },
            {
              "type": "text",
              "text": " text"
            }
          ]
        }
      ]
    `)
  })
})

describe('Nested marks', () => {
  const nestedMark1 = '**Hello *world*, again** *here*'
  test(nestedMark1, () => {
    const string = nestedMark1

    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(astResult).toMatchInlineSnapshot(`
      [
        {
          "type": "p",
          "children": [
            {
              "type": "text",
              "text": "Hello ",
              "bold": true
            },
            {
              "type": "text",
              "text": "world",
              "bold": true,
              "italic": true
            },
            {
              "type": "text",
              "text": ", again",
              "bold": true
            },
            {
              "type": "text",
              "text": " "
            },
            {
              "type": "text",
              "text": "here",
              "italic": true
            }
          ]
        }
      ]
    `)
    expect(stringResult).toEqual(string)
  })

  const nestedMark2 = '*Hello **world**, again*'
  test(nestedMark2, () => {
    const string = nestedMark2

    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(astResult).toMatchInlineSnapshot(`
      [
        {
          "type": "p",
          "children": [
            {
              "type": "text",
              "text": "Hello ",
              "italic": true
            },
            {
              "type": "text",
              "text": "world",
              "italic": true,
              "bold": true
            },
            {
              "type": "text",
              "text": ", again",
              "italic": true
            }
          ]
        }
      ]
    `)
    expect(stringResult).toEqual(string)
  })

  describe('Links in nested marks', () => {
    const linkInNestedMark1 =
      '**Hello [world](https://example.com "Example Site")**'
    test(linkInNestedMark1, () => {
      const string = linkInNestedMark1

      const { astResult, stringResult } = parseThenStringify(string, field)
      expect(astResult).toMatchInlineSnapshot(`
        [
          {
            "type": "p",
            "children": [
              {
                "type": "text",
                "text": "Hello ",
                "bold": true
              },
              {
                "type": "a",
                "url": "https://example.com",
                "title": "Example Site",
                "children": [
                  {
                    "type": "text",
                    "text": "world",
                    "bold": true
                  }
                ]
              }
            ]
          }
        ]
      `)
      expect(stringResult).toEqual(string)
    })
    const linkInNestedMark3 =
      '**Hello [world](https://example.com "Example Site")** And some other text, which has a [link to something](https://something.com)'
    test(linkInNestedMark3, () => {
      const string = linkInNestedMark3

      const { astResult, stringResult } = parseThenStringify(string, field)
      expect(astResult).toMatchInlineSnapshot(`
        [
          {
            "type": "p",
            "children": [
              {
                "type": "text",
                "text": "Hello ",
                "bold": true
              },
              {
                "type": "a",
                "url": "https://example.com",
                "title": "Example Site",
                "children": [
                  {
                    "type": "text",
                    "text": "world",
                    "bold": true
                  }
                ]
              },
              {
                "type": "text",
                "text": " And some other text, which has a "
              },
              {
                "type": "a",
                "url": "https://something.com",
                "title": null,
                "children": [
                  {
                    "type": "text",
                    "text": "link to something"
                  }
                ]
              }
            ]
          }
        ]
      `)
      expect(stringResult).toEqual(string)
    })

    const linkInNestedMark2 =
      '**Hello [*world*](https://example.com "Example Site") ok**'
    test(`Cleans awkward syntax ${linkInNestedMark2}`, () => {
      const string = linkInNestedMark2
      const linkInNestedMark2Cleaned =
        '**Hello *[world](https://example.com "Example Site")* ok**'

      const { astResult, stringResult } = parseThenStringify(string, field)
      expect(astResult).toMatchInlineSnapshot(`
        [
          {
            "type": "p",
            "children": [
              {
                "type": "text",
                "text": "Hello ",
                "bold": true
              },
              {
                "type": "a",
                "url": "https://example.com",
                "title": "Example Site",
                "children": [
                  {
                    "type": "text",
                    "text": "world",
                    "bold": true,
                    "italic": true
                  }
                ]
              },
              {
                "type": "text",
                "text": " ok",
                "bold": true
              }
            ]
          }
        ]
      `)
      expect(stringResult).toEqual(linkInNestedMark2Cleaned)
    })
  })

  const inlineCode = '*Hello `some code`, again*'
  describe('Inline code within marks', () => {
    test(inlineCode, () => {
      const string = inlineCode

      const { astResult, stringResult } = parseThenStringify(string, field)
      expect(stringResult).toEqual(string)
      expect(astResult).toMatchInlineSnapshot(`
        [
          {
            "type": "p",
            "children": [
              {
                "type": "text",
                "text": "Hello ",
                "italic": true
              },
              {
                "type": "text",
                "text": "some code",
                "code": true,
                "italic": true
              },
              {
                "type": "text",
                "text": ", again",
                "italic": true
              }
            ]
          }
        ]
      `)
    })
  })
})
describe('Images', () => {
  const image1 = `![alt description](https://some-image.jpg "Some Title")`
  test(image1, () => {
    const string = image1
    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(stringResult).toEqual(string)
    expect(astResult).toMatchInlineSnapshot(`
      [
        {
          "type": "p",
          "children": [
            {
              "type": "img",
              "url": "https://some-image.jpg",
              "alt": "alt description",
              "caption": "Some Title",
              "children": [
                {
                  "type": "text",
                  "text": ""
                }
              ]
            }
          ]
        }
      ]
    `)
  })
  const image2 = `![](https://some-image.jpg "Some title")`
  test(image2, () => {
    const string = image2
    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(stringResult).toEqual(string)
    expect(astResult).toMatchInlineSnapshot(`
      [
        {
          "type": "p",
          "children": [
            {
              "type": "img",
              "url": "https://some-image.jpg",
              "alt": "",
              "caption": "Some title",
              "children": [
                {
                  "type": "text",
                  "text": ""
                }
              ]
            }
          ]
        }
      ]
    `)
  })
  const image3 = `![](https://some-image.jpg)`
  test(image3, () => {
    const string = image3
    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(stringResult).toEqual(string)
    expect(astResult).toMatchInlineSnapshot(`
      [
        {
          "type": "p",
          "children": [
            {
              "type": "img",
              "url": "https://some-image.jpg",
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
        }
      ]
    `)
  })
})

describe('Code blocks', () => {
  test('simple block of code', () => {
    const string = `\`\`\`
const test = 123
\`\`\``

    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(stringResult).toEqual(string)
    expect(astResult).toMatchInlineSnapshot(`
      [
        {
          "type": "code_block",
          "lang": null,
          "value": "const test = 123",
          "children": [
            {
              "type": "text",
              "text": ""
            }
          ]
        }
      ]
    `)
  })
  test('block of code with language prop', () => {
    const string = `\`\`\`javascript
const test = 123
\`\`\``

    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(stringResult).toEqual(string)
    expect(astResult).toMatchInlineSnapshot(`
      [
        {
          "type": "code_block",
          "lang": "javascript",
          "value": "const test = 123",
          "children": [
            {
              "type": "text",
              "text": ""
            }
          ]
        }
      ]
    `)
  })
})

describe('Break', () => {
  const text = `123 Abc Street\\
Charlottetown, PEI
`
  test(text, () => {
    const string = text.trim()

    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(stringResult).toEqual(string)
    expect(astResult).toMatchInlineSnapshot(`
      [
        {
          "type": "p",
          "children": [
            {
              "type": "text",
              "text": "123 Abc Street"
            },
            {
              "type": "break",
              "children": [
                {
                  "type": "text",
                  "text": ""
                }
              ]
            },
            {
              "type": "text",
              "text": "Charlottetown, PEI"
            }
          ]
        }
      ]
    `)
  })
})

describe('Broken tests', () => {
  const brokenTest2 =
    '*Hello ![Some Alt](https://example.com/image.jpg "Some Title"), again*'
  describe('Inline image within marks', () => {
    test.skip(brokenTest2, () => {
      const string = brokenTest2

      const { astResult, stringResult } = parseThenStringify(string, field)
      expect(astResult).toMatchInlineSnapshot()
      expect(stringResult).toEqual(string)
    })
  })
})

describe('MDX Elements', () => {
  const mdxTest1 = `<Cta title="Hello World!" />`
  describe(mdxTest1, () => {
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
      // expect(stringResult).toEqual(string)
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

    const mdxTestExpression = `
{{< rimg href="https://cloud.netlifyusercontent.com/assets/344dbf88-fdf9-42bb-adb4-46f01eedd629/75452ff6-887e-4bc2-baa2-8674f58100cc/1-web-expose-hardware-capabilities.png" src="https://cloud.netlifyusercontent.com/assets/344dbf88-fdf9-42bb-adb4-46f01eedd629/75452ff6-887e-4bc2-baa2-8674f58100cc/1-web-expose-hardware-capabilities.png" sizes="100vw" caption="Permission Prompt. (<a href='https://cloud.netlifyusercontent.com/assets/344dbf88-fdf9-42bb-adb4-46f01eedd629/75452ff6-887e-4bc2-baa2-8674f58100cc/1-web-expose-hardware-capabilities.png'>Large preview</a>)" alt="Permission Prompt" >}}

{{< rimg here we go >}}

{{% feature-panel %}}

{{< signature "ra, yk, il" >}}
    `
    test('With an expression', () => {
      const string = mdxTestExpression.trim()

      const { astResult, stringResult } = parseThenStringify(string, {
        ...field,
        templates: [
          {
            name: 'MyShortcode',
            label: 'My Shortcode',
            match: {
              start: '{{<',
              end: '>}}',
            },
            fields: [{ name: 'text', label: 'Text', type: 'string' }],
          },
          {
            name: 'MyShortcode2',
            label: 'My Shortcode2',
            match: {
              start: '{{%',
              end: '%}}',
            },
            fields: [{ name: 'text', label: 'Text', type: 'string' }],
          },
        ],
      })
      expect(astResult).toMatchInlineSnapshot(`
        [
          {
            "type": "p",
            "children": [
              {
                "type": "mdxJsxTextElement",
                "name": "MyShortcode",
                "children": [
                  {
                    "type": "text",
                    "text": ""
                  }
                ],
                "props": {
                  "text": "rimg href=\\"https://cloud.netlifyusercontent.com/assets/344dbf88-fdf9-42bb-adb4-46f01eedd629/75452ff6-887e-4bc2-baa2-8674f58100cc/1-web-expose-hardware-capabilities.png\\" src=\\"https://cloud.netlifyusercontent.com/assets/344dbf88-fdf9-42bb-adb4-46f01eedd629/75452ff6-887e-4bc2-baa2-8674f58100cc/1-web-expose-hardware-capabilities.png\\" sizes=\\"100vw\\" caption=\\"Permission Prompt. (<a href='https://cloud.netlifyusercontent.com/assets/344dbf88-fdf9-42bb-adb4-46f01eedd629/75452ff6-887e-4bc2-baa2-8674f58100cc/1-web-expose-hardware-capabilities.png'>Large preview</a>)\\" alt=\\"Permission Prompt\\""
                }
              }
            ]
          },
          {
            "type": "p",
            "children": [
              {
                "type": "mdxJsxTextElement",
                "name": "MyShortcode",
                "children": [
                  {
                    "type": "text",
                    "text": ""
                  }
                ],
                "props": {
                  "text": "rimg here we go"
                }
              }
            ]
          },
          {
            "type": "p",
            "children": [
              {
                "type": "mdxJsxTextElement",
                "name": "MyShortcode2",
                "children": [
                  {
                    "type": "text",
                    "text": ""
                  }
                ],
                "props": {
                  "text": "feature-panel"
                }
              }
            ]
          },
          {
            "type": "p",
            "children": [
              {
                "type": "mdxJsxTextElement",
                "name": "MyShortcode",
                "children": [
                  {
                    "type": "text",
                    "text": ""
                  }
                ],
                "props": {
                  "text": "signature \\"ra, yk, il\\""
                }
              }
            ]
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
    const mdxnested = `<Blockquote>
  # Lorem ipsum dolor.

  Some child text
</Blockquote>`
    test.only('With rich-text multiline', () => {
      const string = mdxnested.trim()

      const { astResult, stringResult } = parseThenStringify(string, {
        ...field,
        templates: [
          {
            name: 'Blockquote',
            label: 'Blockquote',
            fields: [{ name: 'children', label: 'Body', type: 'rich-text' }],
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
                  },
                  {
                    "type": "p",
                    "children": [
                      {
                        "type": "text",
                        "text": "Some child text"
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
