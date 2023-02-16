import { visit } from 'unist-util-visit'
import { Root } from 'mdast'

export const postProcessor = (tree: Root) => {
  visit(tree, 'mdxJsxFlowElement', addPropsToMdxFlow)

  return tree
}

const addPropsToMdxFlow = (node) => {
  node.children = [{ type: 'text', text: '' }]
}
