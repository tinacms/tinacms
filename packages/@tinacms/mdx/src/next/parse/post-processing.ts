import { visit } from 'unist-util-visit'
import { Root } from 'mdast'
import { BuildVisitor } from 'unist-util-visit/complex-types'
import { MdxBlockElement } from '../../parse/plate'
import { MdxJsxFlowElement } from 'mdast-util-mdx-jsx'

export const postProcessor = (tree: Root) => {
  visit(tree, 'mdxJsxFlowElement', addPropsToMdxFlow)

  return tree
}

const addPropsToMdxFlow = (node: MdxJsxFlowElement): MdxBlockElement => {
  node.children = [{ type: 'text', text: '' }]
}
