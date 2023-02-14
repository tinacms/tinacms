import { it, expect, describe } from 'vitest'
import { toTree } from '../util'

describe('tinaShortcodes', () => {
  it('with multistring patterns and no attributes', () => {
    const value = `
As part of a {{< hello >}} line of text
    `
    const patterns = [{ start: '{{<', end: '>}}', type: 'text', leaf: true }]
    const tree = toTree(value, patterns)
    expect(tree).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "type": "text",
                "value": "As part of a ",
              },
              {
                "attributes": [],
                "children": [],
                "name": "hello",
                "type": "mdxJsxTextElement",
              },
              {
                "type": "text",
                "value": " line of text",
              },
            ],
            "type": "paragraph",
          },
        ],
        "type": "root",
      }
    `)
  })
  it('with multistring patterns and no attributes', () => {
    const value = `
As part of a {{< hello >}} line of {{< /hello >}} text
    `
    const patterns = [{ start: '{{<', end: '>}}', type: 'text', leaf: false }]
    const tree = toTree(value, patterns)
    expect(tree).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "type": "text",
                "value": "As part of a ",
              },
              {
                "attributes": [],
                "children": [
                  {
                    "type": "text",
                    "value": " line of ",
                  },
                ],
                "name": "hello",
                "type": "mdxJsxTextElement",
              },
              {
                "type": "text",
                "value": " text",
              },
            ],
            "type": "paragraph",
          },
        ],
        "type": "root",
      }
    `)
  })
  it('when the shortcode starts immediately next to another alphanumeric character', () => {
    const value = `
As part of a{{< hello >}} end.
    `
    const patterns = [{ start: '{{<', end: '>}}', type: 'text', leaf: true }]
    const tree = toTree(value, patterns)
    expect(tree).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "type": "text",
                "value": "As part of a",
              },
              {
                "attributes": [],
                "children": [],
                "name": "hello",
                "type": "mdxJsxTextElement",
              },
              {
                "type": "text",
                "value": " end.",
              },
            ],
            "type": "paragraph",
          },
        ],
        "type": "root",
      }
    `)
  })

  it('when another alphanumeric character starts immediately after a shortcode', () => {
    const value = `
As part of a {{< hello >}}end.
    `
    const patterns = [{ start: '{{<', end: '>}}', type: 'text', leaf: true }]
    const tree = toTree(value, patterns)
    expect(tree).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "type": "text",
                "value": "As part of a ",
              },
              {
                "attributes": [],
                "children": [],
                "name": "hello",
                "type": "mdxJsxTextElement",
              },
              {
                "type": "text",
                "value": "end.",
              },
            ],
            "type": "paragraph",
          },
        ],
        "type": "root",
      }
    `)
  })

  it('when the shortcode is inside a link item', () => {
    const value = `
As part of a [testing]({{< hello >}}) end.
    `
    const patterns = [{ start: '{{<', end: '>}}', type: 'text', leaf: true }]
    const tree = toTree(value, patterns)
    expect(tree).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "type": "text",
                "value": "As part of a [testing](",
              },
              {
                "attributes": [],
                "children": [],
                "name": "hello",
                "type": "mdxJsxTextElement",
              },
              {
                "type": "text",
                "value": ") end.",
              },
            ],
            "type": "paragraph",
          },
        ],
        "type": "root",
      }
    `)
  })

  it('when the shortcode cant be parsed', () => {
    const value = `
As part of a {{< hello a=b >}} end.
    `
    const patterns = [{ start: '{{<', end: '>}}', type: 'text', leaf: true }]
    const tree = toTree(value, patterns)
    // console.dir(tree, {depth: null})
    expect(tree).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "type": "text",
                "value": "As part of a {{< hello a=b >}} end.",
              },
            ],
            "type": "paragraph",
          },
        ],
        "type": "root",
      }
    `)
  })
})
