import type { MdxJsxTextElement, MdxJsxFlowElement } from 'mdast-util-mdx-jsx'
import type { RichTypeInner } from '@tinacms/schema-tools'
import type * as Plate from './plate'
import { extractAttributes } from './acorn'
import { parseMDX } from '.'
import { remarkToSlate } from './remarkToPlate'
import { stringifyMDX } from '../stringify'
import { toMarkdown } from 'mdast-util-to-markdown'
import { mdxJsxToMarkdown } from 'mdast-util-mdx-jsx'

export function mdxJsxElement(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  node: MdxJsxTextElement,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  field: RichTypeInner,
  imageCallback: (url: string) => string
): Plate.MdxInlineElement
export function mdxJsxElement(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  node: MdxJsxFlowElement,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  field: RichTypeInner,
  imageCallback: (url: string) => string
): Plate.MdxBlockElement
export function mdxJsxElement(
  node: MdxJsxTextElement | MdxJsxFlowElement,
  field: RichTypeInner,
  imageCallback: (url: string) => string
): Plate.MdxInlineElement | Plate.MdxBlockElement {
  const template = field.templates?.find((template) => {
    const templateName = typeof template === 'string' ? template : template.name
    return templateName === node.name
  })
  if (typeof template === 'string') {
    throw new Error('Global templates not yet supported')
  }
  if (!template) {
    const string = toMarkdown(
      { type: 'root', children: [node] },
      {
        extensions: [mdxJsxToMarkdown()],
        listItemIndent: 'one',
      }
    )
    return {
      type: node.type === 'mdxJsxFlowElement' ? 'html' : 'html_inline',
      value: string.trim(),
      children: [{ type: 'text', text: '' }],
    }
  }
  // FIXME: these should be passed through to the field resolver in @tinacms/graphql (via dependency injection)
  const props = extractAttributes(
    node.attributes,
    template.fields,
    imageCallback
  )
  const childField = template.fields.find((field) => field.name === 'children')
  const childProps = remarkToSlate(node, childField, imageCallback)
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
