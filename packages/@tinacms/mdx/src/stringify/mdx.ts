import type {
  MdxJsxTextElement,
  MdxJsxFlowElement,
  MdxJsxAttribute,
} from 'mdast-util-mdx-jsx'
import type { RichTypeInner } from '@tinacms/schema-tools'
import type * as Plate from '../parse/plate'
import type * as Md from 'mdast'

declare module 'mdast' {
  interface StaticPhrasingContentMap {
    mdxJsxTextElement: MdxJsxTextElement
  }
  interface PhrasingContentMap {
    mdxJsxTextElement: MdxJsxTextElement
  }

  interface BlockContentMap {
    mdxJsxFlowElement: MdxJsxFlowElement
  }
  interface ContentMap {
    mdxJsxFlowElement: MdxJsxFlowElement
  }
}

export function mdxJsxInlineElement(
  node: Plate.MdxInlineElement,
  field: RichTypeInner
): MdxJsxTextElement {
  const attributes = processAttributes(node, field)
  const children = processInlineChildren(node, field)
  return {
    type: 'mdxJsxTextElement',
    name: node.name,
    attributes,
    children,
  }
}

export function processAttributes(
  node: Plate.MdxInlineElement | Plate.MdxBlockElement,
  field: RichTypeInner
): MdxJsxAttribute[] {
  const attributes: MdxJsxAttribute[] = []
  const template = field.templates?.find((template) => {
    if (typeof template === 'string') {
      throw new Error('Global templates not supported')
    }
    return template.name === node.name
  })
  if (typeof template === 'string') {
    throw new Error('Global templates not supported')
  }
  if (!template) {
    throw new Error(`Unable to find template for node ${node.name}`)
  }
  Object.entries(node.props).forEach(([name, value]) => {
    const field = template.fields.find((field) => field.name === name)
    if (!field) {
      throw new Error(`Unable to find field for property ${name}`)
    }
    switch (field.type) {
      case 'string':
        if (field.list) {
        } else {
          attributes.push({
            type: 'mdxJsxAttribute',
            name,
            value: value,
          })
        }

        break

      default:
        break
    }
  })
  return attributes
}

function processInlineChildren(
  node: Plate.MdxInlineElement,
  field: RichTypeInner
): Md.PhrasingContent[] {
  return []
}

export function processBlockChildren(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  node: Plate.MdxBlockElement,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  field: RichTypeInner
): Md.BlockContent[] {
  return []
}
