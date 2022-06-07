import { markdownToAst, parseMDX } from './parse'
import { stringifyMDX } from './stringify'

const field = { name: 'body', type: 'rich-text' }

expect.addSnapshotSerializer({
  test: () => true,
  print: (value) => {
    // @ts-ignore assumes {type: 'root', children: [...]}
    return JSON.stringify(value.children, null, 2)
  },
})

const parseThenStringify = (string, field) => {
  const astResult = parseMDX(string, field)
  // Trim newlines for readability
  const stringResult = stringifyMDX(astResult, field).trim()
  return { astResult, stringResult }
}

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

    const linkInNestedMark2 =
      '**Hello [*world*](https://example.com "Example Site") ok**'
    test(linkInNestedMark2, () => {
      const string = linkInNestedMark2

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
      expect(stringResult).toEqual(string)
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
        "caption": "Some Title"
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
        "caption": "Some title"
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
        "caption": null
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
    "children": [
      {
        "type": "code_line",
        "children": [
          {
            "type": "text",
            "text": "const test = 123"
          }
        ]
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
    "children": [
      {
        "type": "code_line",
        "children": [
          {
            "type": "text",
            "text": "const test = 123"
          }
        ]
      }
    ]
  }
]
`)
  })
})

describe('Broken tests', () => {
  const brokenTest1 = '*Hello `some code`, again*'
  describe('Inline code within marks', () => {
    test.skip(brokenTest1, () => {
      const string = brokenTest1

      const { astResult, stringResult } = parseThenStringify(string, field)
      expect(stringResult).toEqual(string)
      expect(astResult).toMatchInlineSnapshot()
    })
  })
  const brokenTest2 =
    '*Hello ![Some Alt](https://example.com/image.jpg "Some Title"), again*'
  describe('Inline image within marks', () => {
    test.skip(brokenTest2, () => {
      const string = brokenTest2

      const { astResult, stringResult } = parseThenStringify(string, field)
      expect(stringResult).toEqual(string)
      expect(astResult).toMatchInlineSnapshot()
    })
  })
})
