/**



*/
import type { MdxJsxTextElement, MdxJsxFlowElement } from 'mdast-util-mdx-jsx'
import type { RichTextType } from '@tinacms/schema-tools'
import type * as Plate from './plate'
import { extractAttributes } from './acorn'
import { remarkToSlate, RichTextParseError } from './remarkToPlate'
import { ContainerDirective } from 'mdast-util-directive'
import { toTinaMarkdown } from '../stringify'
import { source } from 'unist-util-source'
import { LeafDirective } from 'mdast-util-directive/lib'

export function mdxJsxElement(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  node: MdxJsxTextElement,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  field: RichTextType,
  imageCallback: (url: string) => string,
  context?: Record<string, unknown>
): Plate.MdxInlineElement
export function mdxJsxElement(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  node: MdxJsxFlowElement,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  field: RichTextType,
  imageCallback: (url: string) => string,
  context?: Record<string, unknown>
): Plate.MdxBlockElement
export function mdxJsxElement(
  node: MdxJsxTextElement | MdxJsxFlowElement,
  field: RichTextType,
  imageCallback: (url: string) => string,
  context?: Record<string, unknown>
):
  | Plate.MdxInlineElement
  | Plate.MdxBlockElement
  | Plate.HTMLInlineElement
  | Plate.HTMLElement {
  try {
    const template = field.templates?.find((template) => {
      const templateName =
        typeof template === 'string' ? template : template.name
      return templateName === node.name
    })
    if (typeof template === 'string') {
      throw new Error('Global templates not yet supported')
    }
    if (!template) {
      const string = toTinaMarkdown({ type: 'root', children: [node] }, field)
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
      imageCallback,
      context
    )
    const childField = template.fields.find(
      (field) => field.name === 'children'
    )
    if (childField) {
      if (childField.type === 'rich-text') {
        if (node.type === 'mdxJsxTextElement') {
          // @ts-ignore FIXME: frontend rich-text needs top-level elements to be wrapped in `paragraph`
          node.children = [{ type: 'paragraph', children: node.children }]
        }
        props.children = remarkToSlate(node, childField, imageCallback)
      }
    }
    return {
      type: node.type,
      name: node.name,
      children: [{ type: 'text', text: '' }],
      props,
    }
  } catch (e) {
    if (e instanceof Error) {
      throw new RichTextParseError(e.message, node.position)
    }
    throw e
  }
}

export const directiveElement = (
  node: ContainerDirective | LeafDirective,
  field: RichTextType,
  imageCallback: (url: string) => string,
  raw?: string
): Plate.BlockElement | Plate.ParagraphElement => {
  let template
  template = field.templates?.find((template) => {
    const templateName = typeof template === 'string' ? template : template.name
    return templateName === node.name
  })
  if (typeof template === 'string') {
    throw new Error('Global templates not yet supported')
  }
  if (!template) {
    template = field.templates?.find((template) => {
      const templateName = template?.match?.name
      return templateName === node.name
    })
  }
  if (!template) {
    return {
      type: 'p',
      children: [{ type: 'text', text: source(node, raw || '') || '' }],
    }
  }
  if (typeof template === 'string') {
    throw new Error(`Global templates not supported`)
  }
  const props = (node.attributes || {}) as typeof node.attributes & {
    children: Plate.RootElement | undefined
  }
  const childField = template.fields.find((field) => field.name === 'children')
  if (childField) {
    if (childField.type === 'rich-text') {
      if (node.type === 'containerDirective') {
        props.children = remarkToSlate(node, childField, imageCallback, raw)
      }
    }
  }
  return {
    type: 'mdxJsxFlowElement',
    name: template.name,
    props: props,
    children: [{ type: 'text', text: '' }],
  }
}
