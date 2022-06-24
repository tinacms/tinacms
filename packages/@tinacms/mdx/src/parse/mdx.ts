import type { MdxJsxTextElement, MdxJsxFlowElement } from 'mdast-util-mdx-jsx'
import type { RichTypeInner } from '@tinacms/schema-tools'
import type * as Plate from './plate'
import { extractAttributes } from './acorn'
import { parseMDX } from '.'
import { remarkToSlate } from './remarkToPlate'

export function mdxJsxElement(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  node: MdxJsxTextElement,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  field: RichTypeInner
): Plate.MdxInlineElement
export function mdxJsxElement(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  node: MdxJsxFlowElement,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  field: RichTypeInner
): Plate.MdxBlockElement
export function mdxJsxElement(
  node: MdxJsxTextElement | MdxJsxFlowElement,
  field: RichTypeInner
): Plate.MdxInlineElement | Plate.MdxBlockElement {
  const template = field.templates?.find((template) => {
    const templateName = typeof template === 'string' ? template : template.name
    return templateName === node.name
  })
  if (typeof template === 'string') {
    throw new Error('Global templates not yet supported')
  }
  if (!template) {
    throw new Error(
      `Found unregistered JSX or HTML: <${node.name}>. Please ensure all structured elements have been registered with your schema. https://tina.io/docs/editing/mdx/`
    )
  }
  // FIXME: these should be passed through to the field resolver in @tinacms/graphql (via dependency injection)
  const props = extractAttributes(node.attributes, template.fields)
  const childField = template.fields.find((field) => field.name === 'children')
  const childProps = remarkToSlate(node, childField)
  if (childField) {
    props.children = childProps
  }
  return {
    type: node.type,
    name: node.name,
    children: [{ type: 'text', text: '' }],
    props,
  }
}
