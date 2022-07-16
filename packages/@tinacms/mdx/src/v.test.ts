import { assert, describe, expect, it, vi } from 'vitest'
import type { RichTypeInner } from '@tinacms/schema-tools'
import { parseMDX } from './parse/index'
import { stringifyMDX } from './stringify'

const field: RichTypeInner = { name: 'body', type: 'rich-text', templates: [] }

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

const test = it

expect.addSnapshotSerializer({
  serialize(val, config, indentation, depth, refs, printer) {
    console.log(config.plugins[3])
    return `${printer(
      val.foo,
      {
        ...config,
        callToJSON: false,
      },
      indentation,
      depth,
      refs
    )}`
  },
  test(val) {
    return val && Object.prototype.hasOwnProperty.call(val, 'foo')
  },
})

test.only('foo snapshot test', () => {
  const bar = {
    foo: {
      x: 1,
      y: 2,
    },
  }

  expect(bar).toMatchSnapshot()
})

import kitchenSink from '../fixtures/kitchen-sink.md?raw'
// const modules = import.meta.globEager('../fixtures/*.md?raw')
const modules = import.meta.glob('../fixtures/*.md', {
  assert: { type: 'raw' },
})

// console.log(modules)
describe('Kitchen sink', () => {
  it('tests', async () => {
    const { astResult, stringResult } = parseThenStringify(kitchenSink, field)
    // expect(stringResult).toEqual(string)
    expect(astResult).toMatchSnapshot()
  })
})

describe('suite name', () => {
  it('foo', () => {
    assert.equal(Math.sqrt(4), 2)
  })

  it('bar', () => {
    expect(1 + 1).eq(2)
  })

  it('snapshot', () => {
    expect({ foo: 'bar' }).toMatchInlineSnapshot(`
      {
        "foo": "bar",
      }
    `)
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
      {
        "children": [
          {
            "children": [
              {
                "text": "Hello, world",
                "type": "text",
              },
            ],
            "type": "h1",
          },
          {
            "children": [
              {
                "text": "",
                "type": "text",
              },
            ],
            "type": "hr",
          },
          {
            "children": [
              {
                "text": "This is a paragraph, and ",
                "type": "text",
              },
              {
                "children": [
                  {
                    "text": "here",
                    "type": "text",
                  },
                ],
                "title": null,
                "type": "a",
                "url": "http://example.com",
              },
              {
                "text": " is a link",
                "type": "text",
              },
            ],
            "type": "p",
          },
          {
            "children": [
              {
                "text": "This is ",
                "type": "text",
              },
              {
                "italic": true,
                "text": "italic",
                "type": "text",
              },
              {
                "text": ", and this is ",
                "type": "text",
              },
              {
                "bold": true,
                "text": "bold",
                "type": "text",
              },
            ],
            "type": "p",
          },
        ],
        "type": "root",
      }
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
      {
        "children": [
          {
            "children": [
              {
                "text": "P 1",
                "type": "text",
              },
            ],
            "type": "p",
          },
          {
            "children": [
              {
                "text": "P 2",
                "type": "text",
              },
            ],
            "type": "p",
          },
          {
            "children": [
              {
                "text": "P 3",
                "type": "text",
              },
            ],
            "type": "p",
          },
          {
            "children": [
              {
                "text": "P 4",
                "type": "text",
              },
            ],
            "type": "p",
          },
        ],
        "type": "root",
      }
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
      {
        "children": [
          {
            "children": [
              {
                "children": [
                  {
                    "children": [
                      {
                        "text": "this is a list",
                        "type": "text",
                      },
                    ],
                    "type": "lic",
                  },
                ],
                "type": "li",
              },
            ],
            "type": "ul",
          },
        ],
        "type": "root",
      }
    `)
  })

  const list2 = `* > some blockquote`
  test(list2, () => {
    const string = list2

    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(stringResult).toEqual(`* some blockquote`)
    expect(astResult).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "children": [
                  {
                    "children": [
                      {
                        "text": "some blockquote",
                        "type": "text",
                      },
                    ],
                    "type": "lic",
                  },
                ],
                "type": "li",
              },
            ],
            "type": "ul",
          },
        ],
        "type": "root",
      }
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
      {
        "children": [
          {
            "children": [
              {
                "children": [
                  {
                    "children": [
                      {
                        "text": "list item 1",
                        "type": "text",
                      },
                    ],
                    "type": "lic",
                  },
                  {
                    "children": [
                      {
                        "children": [
                          {
                            "children": [
                              {
                                "text": "sub list item 1A",
                                "type": "text",
                              },
                            ],
                            "type": "lic",
                          },
                        ],
                        "type": "li",
                      },
                    ],
                    "type": "ol",
                  },
                ],
                "type": "li",
              },
              {
                "children": [
                  {
                    "children": [
                      {
                        "text": "list item 2",
                        "type": "text",
                      },
                    ],
                    "type": "lic",
                  },
                ],
                "type": "li",
              },
            ],
            "type": "ul",
          },
        ],
        "type": "root",
      }
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
      {
        "children": [
          {
            "children": [
              {
                "children": [
                  {
                    "children": [
                      {
                        "text": "list ",
                        "type": "text",
                      },
                      {
                        "bold": true,
                        "text": "with ",
                        "type": "text",
                      },
                      {
                        "bold": true,
                        "italic": true,
                        "text": "some",
                        "type": "text",
                      },
                      {
                        "bold": true,
                        "text": " formatting",
                        "type": "text",
                      },
                    ],
                    "type": "lic",
                  },
                ],
                "type": "li",
              },
            ],
            "type": "ul",
          },
        ],
        "type": "root",
      }
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
      {
        "children": [
          {
            "children": [
              {
                "children": [
                  {
                    "children": [
                      {
                        "children": [
                          {
                            "text": "",
                            "type": "text",
                          },
                        ],
                        "name": "Date",
                        "props": {},
                        "type": "mdxJsxTextElement",
                      },
                    ],
                    "type": "lic",
                  },
                ],
                "type": "li",
              },
            ],
            "type": "ul",
          },
        ],
        "type": "root",
      }
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
      {
        "children": [
          {
            "children": [
              {
                "text": "Hello",
                "type": "text",
              },
            ],
            "type": "h1",
          },
        ],
        "type": "root",
      }
    `)
  })

  const header2 = '# Hello **world**'
  test(header2, () => {
    const string = header2

    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(stringResult).toEqual(string)
    expect(astResult).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "text": "Hello ",
                "type": "text",
              },
              {
                "bold": true,
                "text": "world",
                "type": "text",
              },
            ],
            "type": "h1",
          },
        ],
        "type": "root",
      }
    `)
  })
})

describe('Links', () => {
  const linkTest1 = 'Click [here](https://example.com "Tester") to join now'
  test(linkTest1, () => {
    const string = linkTest1

    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(astResult).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "text": "Click ",
                "type": "text",
              },
              {
                "children": [
                  {
                    "text": "here",
                    "type": "text",
                  },
                ],
                "title": "Tester",
                "type": "a",
                "url": "https://example.com",
              },
              {
                "text": " to join now",
                "type": "text",
              },
            ],
            "type": "p",
          },
        ],
        "type": "root",
      }
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
    {
      "children": [
        {
          "children": [
            {
              "text": "Hello, World!",
              "type": "text",
            },
          ],
          "type": "blockquote",
        },
      ],
      "type": "root",
    }
  `)
})
describe('Marks', () => {
  const mark1 = 'Some *bold* text'
  test(mark1, () => {
    const string = mark1

    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(stringResult).toEqual(string)
    expect(astResult).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "text": "Some ",
                "type": "text",
              },
              {
                "italic": true,
                "text": "bold",
                "type": "text",
              },
              {
                "text": " text",
                "type": "text",
              },
            ],
            "type": "p",
          },
        ],
        "type": "root",
      }
    `)
  })
  const mark2 = 'Some **emphasized** text'
  test(mark2, () => {
    const string = mark2

    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(stringResult).toEqual(string)
    expect(astResult).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "text": "Some ",
                "type": "text",
              },
              {
                "bold": true,
                "text": "emphasized",
                "type": "text",
              },
              {
                "text": " text",
                "type": "text",
              },
            ],
            "type": "p",
          },
        ],
        "type": "root",
      }
    `)
  })
  const mark3 = 'Some ***bold and emphasized*** text'
  test(mark3, () => {
    const string = mark3

    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(stringResult).toEqual(string)
    expect(astResult).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "text": "Some ",
                "type": "text",
              },
              {
                "bold": true,
                "italic": true,
                "text": "bold and emphasized",
                "type": "text",
              },
              {
                "text": " text",
                "type": "text",
              },
            ],
            "type": "p",
          },
        ],
        "type": "root",
      }
    `)
  })
  const mark4 = 'Some `inline code` text'
  test(mark4, () => {
    const string = mark4

    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(stringResult).toEqual(string)
    expect(astResult).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "text": "Some ",
                "type": "text",
              },
              {
                "code": true,
                "text": "inline code",
                "type": "text",
              },
              {
                "text": " text",
                "type": "text",
              },
            ],
            "type": "p",
          },
        ],
        "type": "root",
      }
    `)
  })
})

describe('Nested marks', () => {
  const nestedMark1 = '**Hello *world*, again** *here*'
  test(nestedMark1, () => {
    const string = nestedMark1

    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(astResult).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "bold": true,
                "text": "Hello ",
                "type": "text",
              },
              {
                "bold": true,
                "italic": true,
                "text": "world",
                "type": "text",
              },
              {
                "bold": true,
                "text": ", again",
                "type": "text",
              },
              {
                "text": " ",
                "type": "text",
              },
              {
                "italic": true,
                "text": "here",
                "type": "text",
              },
            ],
            "type": "p",
          },
        ],
        "type": "root",
      }
    `)
    expect(stringResult).toEqual(string)
  })

  const nestedMark2 = '*Hello **world**, again*'
  test(nestedMark2, () => {
    const string = nestedMark2

    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(astResult).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "italic": true,
                "text": "Hello ",
                "type": "text",
              },
              {
                "bold": true,
                "italic": true,
                "text": "world",
                "type": "text",
              },
              {
                "italic": true,
                "text": ", again",
                "type": "text",
              },
            ],
            "type": "p",
          },
        ],
        "type": "root",
      }
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
        {
          "children": [
            {
              "children": [
                {
                  "bold": true,
                  "text": "Hello ",
                  "type": "text",
                },
                {
                  "children": [
                    {
                      "bold": true,
                      "text": "world",
                      "type": "text",
                    },
                  ],
                  "title": "Example Site",
                  "type": "a",
                  "url": "https://example.com",
                },
              ],
              "type": "p",
            },
          ],
          "type": "root",
        }
      `)
      expect(stringResult).toEqual(string)
    })
    const linkInNestedMark3 =
      '**Hello [world](https://example.com "Example Site")** And some other text, which has a [link to something](https://something.com)'
    test(linkInNestedMark3, () => {
      const string = linkInNestedMark3

      const { astResult, stringResult } = parseThenStringify(string, field)
      expect(astResult).toMatchInlineSnapshot(`
        {
          "children": [
            {
              "children": [
                {
                  "bold": true,
                  "text": "Hello ",
                  "type": "text",
                },
                {
                  "children": [
                    {
                      "bold": true,
                      "text": "world",
                      "type": "text",
                    },
                  ],
                  "title": "Example Site",
                  "type": "a",
                  "url": "https://example.com",
                },
                {
                  "text": " And some other text, which has a ",
                  "type": "text",
                },
                {
                  "children": [
                    {
                      "text": "link to something",
                      "type": "text",
                    },
                  ],
                  "title": null,
                  "type": "a",
                  "url": "https://something.com",
                },
              ],
              "type": "p",
            },
          ],
          "type": "root",
        }
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
        {
          "children": [
            {
              "children": [
                {
                  "bold": true,
                  "text": "Hello ",
                  "type": "text",
                },
                {
                  "children": [
                    {
                      "bold": true,
                      "italic": true,
                      "text": "world",
                      "type": "text",
                    },
                  ],
                  "title": "Example Site",
                  "type": "a",
                  "url": "https://example.com",
                },
                {
                  "bold": true,
                  "text": " ok",
                  "type": "text",
                },
              ],
              "type": "p",
            },
          ],
          "type": "root",
        }
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
        {
          "children": [
            {
              "children": [
                {
                  "italic": true,
                  "text": "Hello ",
                  "type": "text",
                },
                {
                  "code": true,
                  "italic": true,
                  "text": "some code",
                  "type": "text",
                },
                {
                  "italic": true,
                  "text": ", again",
                  "type": "text",
                },
              ],
              "type": "p",
            },
          ],
          "type": "root",
        }
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
      {
        "children": [
          {
            "children": [
              {
                "alt": "alt description",
                "caption": "Some Title",
                "children": [
                  {
                    "text": "",
                    "type": "text",
                  },
                ],
                "type": "img",
                "url": "https://some-image.jpg",
              },
            ],
            "type": "p",
          },
        ],
        "type": "root",
      }
    `)
  })
  const image2 = `![](https://some-image.jpg "Some title")`
  test(image2, () => {
    const string = image2
    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(stringResult).toEqual(string)
    expect(astResult).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "alt": "",
                "caption": "Some title",
                "children": [
                  {
                    "text": "",
                    "type": "text",
                  },
                ],
                "type": "img",
                "url": "https://some-image.jpg",
              },
            ],
            "type": "p",
          },
        ],
        "type": "root",
      }
    `)
  })
  const image3 = `![](https://some-image.jpg)`
  test(image3, () => {
    const string = image3
    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(stringResult).toEqual(string)
    expect(astResult).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "alt": "",
                "caption": null,
                "children": [
                  {
                    "text": "",
                    "type": "text",
                  },
                ],
                "type": "img",
                "url": "https://some-image.jpg",
              },
            ],
            "type": "p",
          },
        ],
        "type": "root",
      }
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
      {
        "children": [
          {
            "children": [
              {
                "text": "",
                "type": "text",
              },
            ],
            "lang": null,
            "type": "code_block",
            "value": "const test = 123",
          },
        ],
        "type": "root",
      }
    `)
  })
  test('block of code with language prop', () => {
    const string = `\`\`\`javascript
const test = 123
\`\`\``

    const { astResult, stringResult } = parseThenStringify(string, field)
    expect(stringResult).toEqual(string)
    expect(astResult).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "text": "",
                "type": "text",
              },
            ],
            "lang": "javascript",
            "type": "code_block",
            "value": "const test = 123",
          },
        ],
        "type": "root",
      }
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
      {
        "children": [
          {
            "children": [
              {
                "text": "123 Abc Street",
                "type": "text",
              },
              {
                "children": [
                  {
                    "text": "",
                    "type": "text",
                  },
                ],
                "type": "break",
              },
              {
                "text": "Charlottetown, PEI",
                "type": "text",
              },
            ],
            "type": "p",
          },
        ],
        "type": "root",
      }
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
        {
          "children": [
            {
              "children": [
                {
                  "text": "",
                  "type": "text",
                },
              ],
              "name": "Cta",
              "props": {
                "title": "Hello World!",
              },
              "type": "mdxJsxFlowElement",
            },
          ],
          "type": "root",
        }
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
        {
          "children": [
            {
              "children": [
                {
                  "text": "",
                  "type": "text",
                },
              ],
              "name": "Tags",
              "props": {
                "items": [
                  "cooking",
                  "music",
                ],
              },
              "type": "mdxJsxFlowElement",
            },
          ],
          "type": "root",
        }
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
      {
        "children": [
          {
            "children": [
              {
                "text": "Today's date is ",
                "type": "text",
              },
              {
                "children": [
                  {
                    "text": "",
                    "type": "text",
                  },
                ],
                "name": "Date",
                "props": {
                  "format": "iso",
                },
                "type": "mdxJsxTextElement",
              },
              {
                "text": ".",
                "type": "text",
              },
            ],
            "type": "p",
          },
        ],
        "type": "root",
      }
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
      {
        "children": [
          {
            "children": [
              {
                "text": "Today's date is ",
                "type": "text",
              },
              {
                "children": [
                  {
                    "text": "",
                    "type": "text",
                  },
                ],
                "name": "Date",
                "props": {
                  "format": "iso",
                },
                "type": "mdxJsxTextElement",
              },
              {
                "text": ".",
                "type": "text",
              },
            ],
            "type": "p",
          },
        ],
        "type": "root",
      }
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
        {
          "children": [
            {
              "children": [
                {
                  "text": "",
                  "type": "text",
                },
              ],
              "name": "Blockquote",
              "props": {
                "author": "content/authors/pedro.md",
                "children": {
                  "children": [
                    {
                      "children": [
                        {
                          "text": "Lorem ipsum dolor.",
                          "type": "text",
                        },
                      ],
                      "type": "h1",
                    },
                  ],
                  "type": "root",
                },
              },
              "type": "mdxJsxFlowElement",
            },
          ],
          "type": "root",
        }
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
        {
          "children": [
            {
              "children": [
                {
                  "text": "",
                  "type": "text",
                },
              ],
              "name": "Blockquote",
              "props": {
                "author": "content/authors/pedro.md",
                "quote": {
                  "children": [
                    {
                      "children": [
                        {
                          "text": "Lorem ipsum dolor.",
                          "type": "text",
                        },
                      ],
                      "type": "h1",
                    },
                  ],
                  "type": "root",
                },
              },
              "type": "mdxJsxFlowElement",
            },
          ],
          "type": "root",
        }
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
        {
          "children": [
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "",
                      "type": "text",
                    },
                  ],
                  "name": "MyShortcode",
                  "props": {
                    "text": "rimg href=\\"https://cloud.netlifyusercontent.com/assets/344dbf88-fdf9-42bb-adb4-46f01eedd629/75452ff6-887e-4bc2-baa2-8674f58100cc/1-web-expose-hardware-capabilities.png\\" src=\\"https://cloud.netlifyusercontent.com/assets/344dbf88-fdf9-42bb-adb4-46f01eedd629/75452ff6-887e-4bc2-baa2-8674f58100cc/1-web-expose-hardware-capabilities.png\\" sizes=\\"100vw\\" caption=\\"Permission Prompt. (<a href='https://cloud.netlifyusercontent.com/assets/344dbf88-fdf9-42bb-adb4-46f01eedd629/75452ff6-887e-4bc2-baa2-8674f58100cc/1-web-expose-hardware-capabilities.png'>Large preview</a>)\\" alt=\\"Permission Prompt\\"",
                  },
                  "type": "mdxJsxTextElement",
                },
              ],
              "type": "p",
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "",
                      "type": "text",
                    },
                  ],
                  "name": "MyShortcode",
                  "props": {
                    "text": "rimg here we go",
                  },
                  "type": "mdxJsxTextElement",
                },
              ],
              "type": "p",
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "",
                      "type": "text",
                    },
                  ],
                  "name": "MyShortcode2",
                  "props": {
                    "text": "feature-panel",
                  },
                  "type": "mdxJsxTextElement",
                },
              ],
              "type": "p",
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "",
                      "type": "text",
                    },
                  ],
                  "name": "MyShortcode",
                  "props": {
                    "text": "signature \\"ra, yk, il\\"",
                  },
                  "type": "mdxJsxTextElement",
                },
              ],
              "type": "p",
            },
          ],
          "type": "root",
        }
      `)
      expect(stringResult).toEqual(string)
    })

    const mdxTestImage = `
![](/uploads/image.jpg)

<CustomImage url="/uploads/my-pic.jpg" />`
    test('With an image MDX element', () => {
      const string = mdxTestImage.trim()

      const parseImageCallback = vi.fn((src) => {
        return `some-prefix${src}`
      })
      const stringifyImageCallback = vi.fn((src) => {
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
        {
          "children": [
            {
              "children": [
                {
                  "alt": "",
                  "caption": null,
                  "children": [
                    {
                      "text": "",
                      "type": "text",
                    },
                  ],
                  "type": "img",
                  "url": "some-prefix/uploads/image.jpg",
                },
              ],
              "type": "p",
            },
            {
              "children": [
                {
                  "text": "",
                  "type": "text",
                },
              ],
              "name": "CustomImage",
              "props": {
                "url": "some-prefix/uploads/my-pic.jpg",
              },
              "type": "mdxJsxFlowElement",
            },
          ],
          "type": "root",
        }
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
    test('With rich-text multiline', () => {
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
        {
          "children": [
            {
              "children": [
                {
                  "text": "",
                  "type": "text",
                },
              ],
              "name": "Blockquote",
              "props": {
                "children": {
                  "children": [
                    {
                      "children": [
                        {
                          "text": "Lorem ipsum dolor.",
                          "type": "text",
                        },
                      ],
                      "type": "h1",
                    },
                    {
                      "children": [
                        {
                          "text": "Some child text",
                          "type": "text",
                        },
                      ],
                      "type": "p",
                    },
                  ],
                  "type": "root",
                },
              },
              "type": "mdxJsxFlowElement",
            },
          ],
          "type": "root",
        }
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
