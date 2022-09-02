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

import { flatten } from 'lodash-es'
import { mdxJsxElement } from './mdx'
import type * as Md from 'mdast'
import type * as Plate from './plate'
import type { RichTypeInner } from '@tinacms/schema-tools'
import type { MdxJsxTextElement, MdxJsxFlowElement } from 'mdast-util-mdx-jsx'

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

export const remarkToSlate = (
  root: Md.Root | MdxJsxFlowElement | MdxJsxTextElement,
  field: RichTypeInner,
  imageCallback: (url: string) => string
): Plate.RootElement => {
  const content = (content: Md.Content): Plate.BlockElement => {
    switch (content.type) {
      case 'blockquote':
        const children: Plate.InlineElement[] = []
        content.children.map((child) => {
          const inlineElements = unwrapBlockContent(child)
          inlineElements.forEach((child) => {
            children.push(child)
          })
        })
        return {
          type: 'blockquote',
          children,
        }
      case 'heading':
        return heading(content)
      case 'code':
        return code(content)
      case 'paragraph':
        return paragraph(content)
      case 'mdxJsxFlowElement':
        return mdxJsxElement(content, field, imageCallback)
      case 'thematicBreak':
        return {
          type: 'hr',
          children: [{ type: 'text', text: '' }],
        }
      case 'listItem':
        return {
          type: 'li',
          children: [
            {
              type: 'lic',
              children: flatten(
                content.children.map((child) => unwrapBlockContent(child))
              ),
            },
          ],
        }
      case 'list':
        return list(content)
      case 'html':
        return html(content)
      // @ts-ignore
      case 'mdxFlowExpression':
      // @ts-ignore
      case 'mdxjsEsm':
        // @ts-ignore
        throw new RichTextParseError(
          // @ts-ignore
          `Unexpected expression ${content.value}.`,
          // @ts-ignore
          content.position
        )
      default:
        throw new RichTextParseError(
          `Content: ${content.type} is not yet supported`,
          // @ts-ignore
          content.position
        )
    }
  }

  const html = (content: Md.HTML): Plate.HTMLElement => {
    return {
      type: 'html',
      value: content.value,
      children: [{ type: 'text', text: '' }],
    }
  }

  const html_inline = (content: Md.HTML): Plate.HTMLInlineElement => {
    return {
      type: 'html_inline',
      value: content.value,
      children: [{ type: 'text', text: '' }],
    }
  }

  const list = (content: Md.List): Plate.List => {
    return {
      type: content.ordered ? 'ol' : 'ul',
      children: content.children.map((child) => listItem(child)),
    }
  }

  const listItem = (content: Md.ListItem): Plate.ListItemElement => {
    /**
     * lic (list item content) maps 1-1 with a paragraph element
     * but in plate we don't support other block-level elements from being list items
     * In remark, a list item contains "FlowContent" https://github.com/syntax-tree/mdast#flowcontent
     * Blockquote | Code | Heading | HTML | List | ThematicBreak | Content
     *
     * But we only support paragraph-like blocks ("LIC"), other and text nodes
     *
     * Another thing is that in remark nested lists are wrapped in their ul/li `List` parent
     * but in Plate we don't have that, so we can't have a ol inside a ul in plate
     */

    return {
      type: 'li',
      children: content.children.map((child) => {
        switch (child.type) {
          case 'list':
            return list(child)
          case 'heading':
          case 'paragraph':
            return {
              type: 'lic',
              children: flatten(
                child.children.map((child) => phrasingContent(child))
              ),
            }
          case 'blockquote': {
            return {
              ...blockquote(child),
              type: 'lic',
            }
          }
          case 'mdxJsxFlowElement':
            return {
              type: 'lic',
              children: [
                // @ts-ignore casting a flow element to a paragraph
                mdxJsxElement(
                  { ...child, type: 'mdxJsxTextElement' as const },
                  field,
                  imageCallback
                ),
              ],
            }
          case 'code':
          case 'thematicBreak':
          case 'table':
          case 'html':
            throw new RichTextParseError(
              `${child.type} inside list item is not supported`,
              child.position
            )
          default:
            throw new RichTextParseError(
              // @ts-expect-error child.type should be 'never'
              `Unknown list item of type ${child.type}`,
              // @ts-expect-error child.type should be 'never'
              child.position
            )
        }
      }),
    }
  }

  const unwrapBlockContent = (
    content: Md.BlockContent
  ): Plate.InlineElement[] => {
    const flattenPhrasingContent = (
      children: Md.PhrasingContent[]
    ): Plate.LicElement[] => {
      const children2 = children.map((child) => phrasingContent(child))
      return flatten(Array.isArray(children2) ? children2 : [children2])
    }
    switch (content.type) {
      case 'heading':
      case 'paragraph':
        return flattenPhrasingContent(content.children)
      default:
        throw new Error(
          `UnwrapBlock: Unknown block content of type ${content.type}`
        )
    }
  }

  const code = (content: Md.Code): Plate.CodeBlockElement => {
    const extra: Record<string, string> = {}
    if (content.lang) extra['lang'] = content.lang
    return {
      type: 'code_block',
      ...extra,
      value: content.value,
      children: [{ type: 'text', text: '' }],
    }
  }
  const link = (content: Md.Link): Plate.LinkElement => {
    return {
      type: 'a',
      url: content.url,
      title: content.title,
      children: flatten(
        content.children.map((child) => staticPhrasingContent(child))
      ),
    }
  }
  const heading = (content: Md.Heading): Plate.HeadingElement => {
    return {
      type: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'][
        content.depth - 1
      ] as Plate.HeadingElement['type'],
      children: flatten(content.children.map(phrasingContent)),
    }
  }
  const staticPhrasingContent = (
    content: Md.StaticPhrasingContent
  ): Plate.InlineElement | Plate.InlineElement[] => {
    switch (content.type) {
      case 'mdxJsxTextElement':
        return mdxJsxElement(content, field, imageCallback)
      case 'text':
        return text(content)
      case 'inlineCode':
      case 'emphasis':
      case 'image':
      case 'strong':
        return phrashingMark(content)
      default:
        throw new Error(
          `StaticPhrasingContent: ${content.type} is not yet supported`
        )
    }
  }
  const phrasingContent = (
    content: Md.PhrasingContent
  ): Plate.InlineElement | Plate.InlineElement[] => {
    switch (content.type) {
      case 'text':
        return text(content)
      case 'link':
        return link(content)
      case 'image':
        return image(content)
      case 'mdxJsxTextElement':
        return mdxJsxElement(content, field, imageCallback)
      case 'emphasis':
        return phrashingMark(content)
      case 'strong':
        return phrashingMark(content)
      case 'break':
        return breakContent()
      case 'inlineCode':
        return phrashingMark(content)
      case 'html':
        return html_inline(content)
      // @ts-ignore
      case 'mdxTextExpression':
        throw new RichTextParseError(
          // @ts-ignore
          `Unexpected expression ${content.value}.`,
          // @ts-ignore
          content.position
        )
      default:
        throw new Error(`PhrasingContent: ${content.type} is not yet supported`)
    }
  }
  const breakContent = (): Plate.BreakElement => {
    return {
      type: 'break',
      children: [
        {
          type: 'text',
          text: '',
        },
      ],
    }
  }

  const phrashingMark = (
    node: Md.PhrasingContent,
    marks: ('bold' | 'italic' | 'code')[] = []
  ): Plate.InlineElement[] => {
    const accum: Plate.InlineElement[] = []
    switch (node.type) {
      case 'emphasis': {
        const children = flatten(
          node.children.map((child) =>
            phrashingMark(child, [...marks, 'italic'])
          )
        )
        children.forEach((child) => {
          accum.push(child)
        })
        break
      }
      case 'inlineCode': {
        const markProps: { [key: string]: boolean } = {}
        marks.forEach((mark) => (markProps[mark] = true))
        accum.push({
          type: 'text',
          text: node.value,
          code: true,
          ...markProps,
        })
        break
      }
      case 'strong': {
        const children = flatten(
          node.children.map((child) => phrashingMark(child, [...marks, 'bold']))
        )
        children.forEach((child) => {
          accum.push(child)
        })
        break
      }
      case 'image': {
        accum.push(image(node))
        break
      }
      case 'link': {
        const children = flatten(
          node.children.map((child) => phrashingMark(child, marks))
        )
        accum.push({ type: 'a', url: node.url, title: node.title, children })
        break
      }
      case 'text':
        const markProps: { [key: string]: boolean } = {}
        marks.forEach((mark) => (markProps[mark] = true))
        accum.push({ type: 'text', text: node.value, ...markProps })
        break
      default:
        throw new Error(`Unexpected inline element of type ${node.type}`)
    }
    return accum
  }

  const image = (content: Md.Image): Plate.ImageElement => {
    return {
      type: 'img',
      url: imageCallback(content.url),
      alt: content.alt,
      caption: content.title,
      children: [{ type: 'text', text: '' }],
    }
  }
  const text = (content: Md.Text): Plate.TextElement => {
    return {
      type: 'text',
      text: content.value,
    }
  }
  const blockquote = (content: Md.Blockquote): Plate.BlockquoteElement => {
    const children: Plate.InlineElement[] = []
    content.children.map((child) => {
      const inlineElements = unwrapBlockContent(child)
      inlineElements.forEach((child) => {
        children.push(child)
      })
    })
    return {
      type: 'blockquote',
      children,
    }
  }
  const paragraph = (
    content: Md.Paragraph
  ): Plate.ParagraphElement | Plate.HTMLElement => {
    const children = flatten(content.children.map(phrasingContent))
    // MDX treats <div>Hello</div> is inline even if it's isolated on one line
    // If that's the case, swap it out with html
    // TODO: probably need to do the same with JSX
    if (children.length === 1) {
      if (children[0]) {
        if (children[0].type === 'html_inline') {
          return {
            ...children[0],
            type: 'html',
          }
        }
      }
    }
    return {
      type: 'p',
      children,
    }
  }

  return {
    type: 'root',
    children: root.children.map((child) => {
      // @ts-ignore child from MDX elements aren't shared with MDAST types
      return content(child)
    }),
  }
}

export type PositionItem = {
  line?: number | null
  column?: number | null
  offset?: number | null
  _index?: number | null
  _bufferIndex?: number | null
}
export type Position = {
  start: PositionItem
  end: PositionItem
}

export class RichTextParseError extends Error {
  public position?: Position
  constructor(message: string, position?: Position) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(message)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RichTextParseError)
    }

    this.name = 'RichTextParseError'
    // Custom debugging information
    this.position = position
  }
}
