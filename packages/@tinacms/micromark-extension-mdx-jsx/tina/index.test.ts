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
  it('throws a helpful error when a container shortcode is not closed', () => {
    const value = `a
% someLeaf a="b" %
    `
    expect(() => toTree(value)).toThrowErrorMatchingInlineSnapshot(
      '"Expected a closing tag for `<someLeaf>` (2:1-2:19)"'
    )
  })
  it('throws a helpful error when a container shortcode is closed, but no opened', () => {
    const value = `a
% /someLeaf a="b" %
    `
    expect(() => toTree(value)).toThrowErrorMatchingInlineSnapshot(
      '"Unexpected closing slash `/` in tag, expected an open tag first"'
    )
  })
})
