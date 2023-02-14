import {fromMarkdown} from 'mdast-util-from-markdown'
import {visit} from 'unist-util-visit'
import {mdxJsx} from './index'
// import {mdxJsxFromMarkdown} from 'mdast-util-mdx-jsx'
import {mdxJsxFromMarkdown} from './mdast'
import * as acorn from 'acorn'

export const toTree = (value: string) => {
  const tree = fromMarkdown(value, {
    extensions: [mdxJsx({acorn: acorn, addResult: true})],
    mdastExtensions: [mdxJsxFromMarkdown()]
  })

  return removePosition(tree)
}

// @ts-ignore
export function removePosition(tree) {
  visit(tree, remove)

  return tree

  // @ts-ignore
  function remove(node) {
    // node?.attributes?.forEach((att) => {
    //   if (att?.value?.data) {
    //     delete att?.value?.data
    //   }
    //   delete att.data
    // })
    delete node.position
  }
}
