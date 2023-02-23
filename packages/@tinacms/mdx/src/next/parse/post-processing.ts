import { MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx-jsx'
import { visit } from 'unist-util-visit'
import { remarkToSlate } from '../../parse/remarkToPlate'
import { RichTextField } from '@tinacms/schema-tools'
import type { Root } from 'mdast'

export const postProcessor = (
  tree: Root,
  field: RichTextField,
  imageCallback: (s: string) => string
) => {
  // Since were using our own interpretation of MDX, these props
  // don't adhere to the MDAST spec, casting as any
  const addPropsToMdxFlow = (
    node: (MdxJsxFlowElement | MdxJsxTextElement) & {
      props: any
      children: any
    }
  ) => {
    const props: Record<string, any> = {}
    node.attributes.forEach((attribute) => {
      if (attribute.type === 'mdxJsxAttribute') {
        props[attribute.name] = attribute.value
      } else {
        throw new Error('HANDLE mdxJsxExpressionAttribute')
      }
    })
    if (node.children.length) {
      let tree
      if (node.type === 'mdxJsxTextElement') {
        tree = postProcessor(
          {
            type: 'root',
            children: [{ type: 'paragraph', children: node.children }],
          },
          field,
          imageCallback
        )
      } else {
        tree = postProcessor(
          { type: 'root', children: node.children },
          field,
          imageCallback
        )
      }
      props.children = tree
    }
    node.props = props
    // @ts-ignore
    delete node.attributes
    node.children = [{ type: 'text', text: '' }]
  }

  visit(tree, 'mdxJsxFlowElement', addPropsToMdxFlow)
  visit(tree, 'mdxJsxTextElement', addPropsToMdxFlow)

  return remarkToSlate(tree, field, imageCallback, '', true)
}
