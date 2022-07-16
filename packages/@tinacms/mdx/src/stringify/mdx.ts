/**

Copyright 2021 Forestry.io Holdings, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/
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
