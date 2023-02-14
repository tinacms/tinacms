import {it, expect, describe} from 'vitest'
import {toTree} from './test-utils'

describe('tinaShortcodes', () => {
  it('Expressions dont trigger errors', () => {
    const value = `
{

import { foo } from 'bar.js'

Hello, {world!}

{{< okok >}}
`

    expect(() => toTree(value)).not.toThrow()
  })

  it('parses leaf nodes properly', () => {
    const value = `$ someLeaf $`
    expect(toTree(value)).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "attributes": [],
            "children": [],
            "name": "someLeaf",
            "type": "mdxJsxFlowElement",
          },
        ],
        "type": "root",
      }
    `)
  })

  it('parses leaf nodes with properties properly', () => {
    const value = `$ someLeaf a="b" $`
    expect(toTree(value)).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "attributes": [
              {
                "name": "a",
                "type": "mdxJsxAttribute",
                "value": "b",
              },
            ],
            "children": [],
            "name": "someLeaf",
            "type": "mdxJsxFlowElement",
          },
        ],
        "type": "root",
      }
    `)
  })

  it('parses container nodes with properties properly', () => {
    const value = `% someLeaf a="b" %
Hello, world!

% /someLeaf %
    `
    expect(toTree(value)).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "attributes": [
              {
                "name": "a",
                "type": "mdxJsxAttribute",
                "value": "b",
              },
            ],
            "children": [
              {
                "children": [
                  {
                    "type": "text",
                    "value": "Hello, world!",
                  },
                ],
                "type": "paragraph",
              },
            ],
            "name": "someLeaf",
            "type": "mdxJsxFlowElement",
          },
        ],
        "type": "root",
      }
    `)
  })
  it('does not throw an error when it cant complete', () => {
    const value = `% someLeaf a="b" %
    `
    expect(() => toTree(value)).not.toThrow()
  })
})
