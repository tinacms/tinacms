import {it, expect, describe} from 'vitest'
import {toTree} from '../test-utils'

describe('tinaShortcodes', () => {
  it('with multistring patterns and no attributes', () => {
    const value = `
As part of a {{< hello >}} line of text
    `
    const patterns = [{start: '{{<', end: '>}}', type: 'text', leaf: true}]
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
    const patterns = [{start: '{{<', end: '>}}', type: 'text', leaf: false}]
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
})
