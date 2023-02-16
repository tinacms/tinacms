import { visit } from 'unist-util-visit'
import { Root, Content } from 'mdast'
import { MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx-jsx'
import { remarkToSlate } from '../../parse/remarkToPlate'
import { RichTypeInner } from '@tinacms/schema-tools'

export const postProcessor = (tree: Root, field: RichTypeInner) => {
  // visit(tree, '', (node) => {
  //   return true
  // })
  visit(tree, 'mdxJsxFlowElement', addPropsToMdxFlow)

  return tree
}

const addPropsToMdxFlow = (node: MdxJsxFlowElement | MdxJsxTextElement) => {
  const props = {}
  node.attributes.forEach((attribute) => {
    if (attribute.type === 'mdxJsxAttribute') {
      props[attribute.name] = attribute.value
    } else {
      throw new Error('HANDLE mdxJsxExpressionAttribute')
    }
  })
  if (node.children.length) {
    props.children = node.children
  }
  node.props = props
  delete node.attributes
  node.children = [{ type: 'text', text: '' }]
}
