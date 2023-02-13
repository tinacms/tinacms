import { it, expect, describe } from 'vitest'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { tinaDirective } from './extension'
import { directiveFromMarkdown } from './from-markdown'
import { visit } from 'unist-util-visit'

describe('tinaShortcodes', () => {
  it('parses leaf shortcodes as directives', () => {
    const value = `# Hello

{{< ad-panel "testing" >}}

{{< ad-panel a=b >}}

{{< ad-panel a="b" >}}

{{< ad-panel a='b' >}}

Here we go
`
    const tree = fromMarkdown(value, {
      extensions: [
        tinaDirective([
          {
            start: '{{<',
            name: 'ad-panel',
            end: '>}}',
            type: 'leaf',
            templateName: 'adPanel',
          },
        ]),
      ],
      mdastExtensions: [directiveFromMarkdown],
    })
    removePosition(tree, { force: true })
    expect(tree).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "type": "text",
                "value": "Hello",
              },
            ],
            "depth": 1,
            "type": "heading",
          },
          {
            "attributes": {
              "_value": "testing",
            },
            "children": [],
            "name": "ad-panel",
            "type": "leafDirective",
          },
          {
            "attributes": {
              "a": "b",
            },
            "children": [],
            "name": "ad-panel",
            "type": "leafDirective",
          },
          {
            "attributes": {
              "a": "b",
            },
            "children": [],
            "name": "ad-panel",
            "type": "leafDirective",
          },
          {
            "attributes": {
              "a": "b",
            },
            "children": [],
            "name": "ad-panel",
            "type": "leafDirective",
          },
          {
            "children": [
              {
                "type": "text",
                "value": "Here we go",
              },
            ],
            "type": "paragraph",
          },
        ],
        "type": "root",
      }
    `)
  })

  it('parses container shortcodes as directives', () => {
    const value = `# Hello

{{< ad-panel "testing" >}}

Testing

{{< \\ad-panel >}}

Here we go
`
    const tree = fromMarkdown(value, {
      extensions: [
        tinaDirective([
          {
            start: '{{<',
            name: 'ad-panel',
            end: '>}}',
            type: 'block',
            templateName: 'adPanel',
          },
        ]),
      ],
      mdastExtensions: [directiveFromMarkdown],
    })
    removePosition(tree, { force: true })
    expect(tree).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "type": "text",
                "value": "Hello",
              },
            ],
            "depth": 1,
            "type": "heading",
          },
          {
            "attributes": {
              "_value": "testing",
            },
            "children": [
              {
                "children": [
                  {
                    "type": "text",
                    "value": "Testing",
                  },
                ],
                "type": "paragraph",
              },
            ],
            "name": "ad-panel",
            "type": "containerDirective",
          },
          {
            "children": [
              {
                "type": "text",
                "value": "Here we go",
              },
            ],
            "type": "paragraph",
          },
        ],
        "type": "root",
      }
    `)
  })

  it.only('parses container shortcodes as directives and nested directives', () => {
    const value = `# Hello

{{< ad-panel "testinga" >}}

Testing A

{{< bad-panel "testingb" >}}

Testing B

{{< \\bad-panel >}}

{{< \\ad-panel >}}

Here we go
`
    const tree = fromMarkdown(value, {
      extensions: [
        tinaDirective([
          {
            start: '{{<',
            name: 'ad-panel',
            end: '>}}',
            type: 'block',
            templateName: 'adPanel',
          },
          {
            start: '{{<',
            name: 'bad-panel',
            end: '>}}',
            type: 'block',
            templateName: 'badPanel',
          },
        ]),
      ],
      mdastExtensions: [directiveFromMarkdown],
    })
    removePosition(tree, { force: true })
    console.dir(tree, { depth: null })
    // expect(tree).toMatchInlineSnapshot()
  })
})

// @ts-ignore
export function removePosition(tree, options) {
  const force =
    typeof options === 'boolean' ? options : options ? options.force : false

  visit(tree, remove)

  return tree

  // @ts-ignore
  function remove(node) {
    if (force) {
      delete node.position
    } else {
      node.position = undefined
    }
  }
}
