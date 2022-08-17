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
import type { MdxJsxTextElement, MdxJsxFlowElement } from 'mdast-util-mdx-jsx'
import type { RichTypeInner } from '@tinacms/schema-tools'
import type * as Plate from './plate'
import { extractAttributes } from './acorn'
import { remarkToSlate, RichTextParseError } from './remarkToPlate'
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

    if (template.match) {
      const firstChild = node?.children[0]
      if (firstChild?.type === 'inlineCode') {
        const value = firstChild.value
        if (node.type === 'mdxJsxFlowElement') {
          // NOTE: Since we cast the children to `inline code`
          // I don't think this code will ever run.
          // And I'm not sure care either way
          return {
            type: node.type,
            name: node.name,
            children: [{ type: 'text', text: '' }],
            props: { text: value },
          }
        } else {
          return {
            type: node.type,
            name: node.name,
            children: [{ type: 'text', text: '' }],
            props: { text: value },
          }
        }
      } else {
        throw new Error(
          `Unable to parse value for template match pattern -  start: ${template.match.start}, end: ${template.match.end}`
        )
      }
    }
    // FIXME: these should be passed through to the field resolver in @tinacms/graphql (via dependency injection)
    const props = extractAttributes(
      node.attributes,
      template.fields,
      imageCallback
    )
    const childField = template.fields.find(
      (field) => field.name === 'children'
    )
    if (childField) {
      if (childField.type === 'rich-text') {
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
