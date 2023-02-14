import {it, expect, describe} from 'vitest'
import {toTree} from './test-utils'

const patterns = [
  {start: '$', end: '$', type: 'flow', leaf: true},
  {start: '%', end: '%', type: 'flow', leaf: false}
]
describe('tinaShortcodes', () => {
  it('Expressions dont trigger errors', () => {
    const value = `
{

import { foo } from 'bar.js'

const a = "ok"

Hello, {world!}

{{< okok >}}
`

    expect(() => toTree(value, patterns)).not.toThrow()
  })

  it('parses leaf nodes properly', () => {
    const value = `$ someLeaf $`
    expect(toTree(value, patterns)).toMatchInlineSnapshot(`
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
    expect(toTree(value, patterns)).toMatchInlineSnapshot(`
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
    expect(toTree(value, patterns)).toMatchInlineSnapshot(`
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
    expect(() => toTree(value, patterns)).toThrowErrorMatchingInlineSnapshot(
      '"Expected a closing tag for `<someLeaf>` (2:1-2:19)"'
    )
  })
  it('throws a helpful error when a container shortcode is closed, but no opened', () => {
    const value = `a
% /someLeaf a="b" %
    `
    expect(() => toTree(value, patterns)).toThrowErrorMatchingInlineSnapshot(
      '"Unexpected closing slash `/` in tag, expected an open tag first"'
    )
  })
  it('does not throw an error when tokenization fails due to attributes not making sense', () => {
    const value = `
% someLeaf and more text %
    `
    expect(() => toTree(value, patterns)).not.toThrow()
    expect(toTree(value, patterns)).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "type": "text",
                "value": "% someLeaf and more text %",
              },
            ],
            "type": "paragraph",
          },
        ],
        "type": "root",
      }
    `)
  })

  it('does not throw an error when tokenization fails due a missing closing tag', () => {
    const value = `
% someLeaf
    `
    expect(() => toTree(value, patterns)).not.toThrow()
    expect(toTree(value, patterns)).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "type": "text",
                "value": "% someLeaf",
              },
            ],
            "type": "paragraph",
          },
        ],
        "type": "root",
      }
    `)
  })

  it('does not throw an error when tokenization fails due a missing name', () => {
    const value = `
%
    `
    expect(() => toTree(value, patterns)).not.toThrow()
    expect(toTree(value, patterns)).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "type": "text",
                "value": "%",
              },
            ],
            "type": "paragraph",
          },
        ],
        "type": "root",
      }
    `)
  })

  it('does not throw an error when tokenization fails due a missing closing tag name', () => {
    const value = `
%/
    `
    expect(() => toTree(value, patterns)).not.toThrow()
    expect(toTree(value, patterns)).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "type": "text",
                "value": "%/",
              },
            ],
            "type": "paragraph",
          },
        ],
        "type": "root",
      }
    `)
  })

  it('does not throw an error when tokenization fails due weird characters in the name', () => {
    const value = `
% some&Leaf %
    `
    expect(() => toTree(value, patterns)).not.toThrow()
    expect(toTree(value, patterns)).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "type": "text",
                "value": "% some&Leaf %",
              },
            ],
            "type": "paragraph",
          },
        ],
        "type": "root",
      }
    `)
  })

  it('does not throw an error when tokenization fails due unexpected characters before a "."', () => {
    const value = `
% someLeaf. %
    `
    expect(() => toTree(value, patterns)).not.toThrow()
    expect(toTree(value, patterns)).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "type": "text",
                "value": "% someLeaf. %",
              },
            ],
            "type": "paragraph",
          },
        ],
        "type": "root",
      }
    `)
  })
  it('does not throw an error when tokenization fails due unexpected characters after a "."', () => {
    const value = `
% someLeaf .$ %
    `
    expect(() => toTree(value, patterns)).not.toThrow()
    expect(toTree(value, patterns)).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "type": "text",
                "value": "% someLeaf .$ %",
              },
            ],
            "type": "paragraph",
          },
        ],
        "type": "root",
      }
    `)
  })

  it('does not throw an error when tokenization fails due unexpected characters in a member name', () => {
    const value = `
% someLeaf.some$id %
    `
    expect(() => toTree(value, patterns)).not.toThrow()
    expect(toTree(value, patterns)).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "type": "text",
                "value": "% someLeaf.some$id %",
              },
            ],
            "type": "paragraph",
          },
        ],
        "type": "root",
      }
    `)
  })

  it('does not throw an error when tokenization fails due unexpected characters in an attribute name', () => {
    const value = `
% someLeaf a+x="c" %
    `
    expect(() => toTree(value, patterns)).not.toThrow()
    expect(toTree(value, patterns)).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "type": "text",
                "value": "% someLeaf a+x=\\"c\\" %",
              },
            ],
            "type": "paragraph",
          },
        ],
        "type": "root",
      }
    `)
  })

  it('does not throw an error when tokenization fails due unexpected characters after an attribute name', () => {
    const value = `
% someLeaf ax=z %
    `
    expect(() => toTree(value, patterns)).not.toThrow()
    expect(toTree(value, patterns)).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "type": "text",
                "value": "% someLeaf ax=z %",
              },
            ],
            "type": "paragraph",
          },
        ],
        "type": "root",
      }
    `)
  })
  it('does not throw an error when tokenization fails due an unclosed attribute value', () => {
    const value = `
% someLeaf ax="a ok %
    `
    expect(() => toTree(value, patterns)).not.toThrow()
    expect(toTree(value, patterns)).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "type": "text",
                "value": "% someLeaf ax=\\"a ok %",
              },
            ],
            "type": "paragraph",
          },
        ],
        "type": "root",
      }
    `)
  })

  it('detects unkeyed attricutes', () => {
    const value = `
$ someLeaf "some string ok ok" $
    `
    const tree = toTree(value, patterns)
    expect(tree).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "attributes": [
              {
                "name": "_value",
                "type": "mdxJsxAttribute",
                "value": "some string ok ok",
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
})
