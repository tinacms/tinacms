import { it, expect, describe } from 'vitest'
import { visit } from 'unist-util-visit'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { toMarkdown } from 'mdast-util-to-markdown'
import { mdxJsx } from 'micromark-extension-mdx-jsx'
import { mdxJsxFromMarkdown, mdxJsxToMarkdown } from 'mdast-util-mdx-jsx'
import * as acorn from 'acorn'

describe('tinaShortcodes', () => {
  it('parses leaf shortcodes as directives', () => {
    const value = `<Box>
    - a list
  </Box>

  <MyComponent {...props} />

  <abbr title="Hypertext Markup Language">HTML</abbr> is a lovely language.
`

    const tree = fromMarkdown(value, {
      extensions: [mdxJsx({ acorn: acorn, addResult: true })],
      mdastExtensions: [mdxJsxFromMarkdown()],
    })
    console.dir(removePosition(tree, { force: true }), { depth: null })
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
