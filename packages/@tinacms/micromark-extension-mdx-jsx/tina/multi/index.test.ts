import {it, expect, describe} from 'vitest'
import {toTree} from '../test-utils'

describe('tinaShortcodes', () => {
  it('with multistring patterns and no attributes', () => {
    const value = `
{{< hello >}}
    `
    const patterns = [{start: '{{<', end: '>}}', type: 'flow', leaf: true}]
    const tree = toTree(value, patterns)
    expect(tree).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "attributes": [],
            "children": [],
            "name": "hello",
            "type": "mdxJsxFlowElement",
          },
        ],
        "type": "root",
      }
    `)
  })
  it('with multistring patterns', () => {
    const value = `
{{< hello a="b" >}}
    `
    const patterns = [{start: '{{<', end: '>}}', type: 'flow', leaf: true}]
    const tree = toTree(value, patterns)
    // console.dir(tree, {depth: null})
    expect(tree).toMatchInlineSnapshot(`
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
            "name": "hello",
            "type": "mdxJsxFlowElement",
          },
        ],
        "type": "root",
      }
    `)
  })

  it('with multistring patterns', () => {
    const value = `
{{< hello a="b" >}}
Hello, world!
{{< /hello >}}
    `
    const patterns = [{start: '{{<', end: '>}}', type: 'flow', leaf: false}]
    const tree = toTree(value, patterns)
    // console.dir(tree, {depth: null})
    expect(tree).toMatchInlineSnapshot(`
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
            "name": "hello",
            "type": "mdxJsxFlowElement",
          },
        ],
        "type": "root",
      }
    `)
  })

  it('when the opening tag cant be parsed it displays a helpful error message', () => {
    const value = `
  {{< hello a=invalid-formatting >}}
  Hello, world!
  {{< /hello >}}
      `
    const patterns = [{start: '{{<', end: '>}}', type: 'flow', leaf: false}]
    expect(() => toTree(value, patterns)).toThrowErrorMatchingInlineSnapshot(
      '"Unexpected closing slash `/` in tag, expected an open tag first, be sure your opening tag is formatted properly"'
    )
  })
  it('when the closing tag cant be parsed it displays a helpful error message', () => {
    const value = `
  {{< hello a="b" >}}
  Hello, world!
  {{< /hello something="here" >}}
      `
    const patterns = [{start: '{{<', end: '>}}', type: 'flow', leaf: false}]
    expect(() => toTree(value, patterns)).toThrowErrorMatchingInlineSnapshot(
      '"Unexpected attribute in closing tag, expected the end of the tag"'
    )
  })
})
