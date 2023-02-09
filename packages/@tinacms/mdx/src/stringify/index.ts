/**



*/

import { toMarkdown } from 'mdast-util-to-markdown'
import {
  mdxJsxToMarkdown,
  MdxJsxTextElement,
  MdxJsxFlowElement,
} from 'mdast-util-mdx-jsx'
import type { RichTypeInner } from '@tinacms/schema-tools'
import type * as Md from 'mdast'
import type * as Plate from '../parse/plate'
import { eat } from './marks'
import { stringifyProps } from './acorn'
import { directiveToMarkdown } from '../extensions/tina-shortcodes/to-markdown'

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

export const stringifyMDX = (
  value: Plate.RootElement,
  field: RichTypeInner,
  imageCallback: (url: string) => string
) => {
  if (!value) {
    return
  }
  if (typeof value === 'string') {
    throw new Error('Expected an object to stringify, but received a string')
  }
  if (value?.children[0]) {
    if (value?.children[0].type === 'invalid_markdown') {
      return value.children[0].value
    }
  }
  const tree = rootElement(value, field, imageCallback)
  return toTinaMarkdown(tree, field)
}

export type Pattern = {
  start: string
  end: string
  name: string
  templateName: string
  type: 'block' | 'leaf'
}

export const toTinaMarkdown = (tree: Md.Root, field: RichTypeInner) => {
  const patterns: Pattern[] = []
  field.templates?.forEach((template) => {
    if (typeof template === 'string') {
      return
    }
    if (template && template.match) {
      const pattern = template.match as Pattern
      pattern.templateName = template.name
      patterns.push(pattern)
    }
  })
  return toMarkdown(tree, {
    extensions: [directiveToMarkdown(patterns), mdxJsxToMarkdown()],
    // extensions: [directiveToMarkdown, mdxJsxToMarkdown()],
    listItemIndent: 'one',
    bullet: '-',
    fences: true, // setting to false results in 4-space tabbed code
    handlers: {
      /**
       * Probably a lot more configuration we can expose here for customization
       *                             https://github.com/syntax-tree/mdast-util-to-markdown/tree/5fa790ee4cdead2a6c11b6a6f73c59eb0f9ca295/lib/util
       *
       * Some context on configuring https://github.com/syntax-tree/mdast-util-to-markdown/issues/31
       *                             https://github.com/remarkjs/remark/issues/720
       *
       * This code is pretty simple to follow
       *                             https://github.com/syntax-tree/mdast-util-to-markdown/blob/5fa790ee4cdead2a6c11b6a6f73c59eb0f9ca295/lib/index.js
       *
       * This was a more thorough example of a workaround
       *                             https://github.com/syntax-tree/mdast-util-to-markdown/issues/31#issuecomment-1346524273
       *
       * This use case is pretty close to ours, our rich-text editor
       * may be responsible for reading in/writing out markdown files
       * but otherwise not involved in the pipeline (eg. Hugo or other
       * static site generators). Theese guys can be stubborn in their
       * openness to needs like this
       *                             https://github.com/syntax-tree/mdast-util-to-markdown/issues/31#issuecomment-853072585
       *
       */
      text(node) {
        // Originally:
        // return safe(context, node.value, safeOptions)
        return node.value
      },
    },
  })
}

export const rootElement = (
  content: Plate.RootElement,
  field: RichTypeInner,
  imageCallback: (url: string) => string
): Md.Root => {
  const children: Md.Content[] = []
  content.children.forEach((child) => {
    const value = blockElement(child, field, imageCallback)
    if (value) {
      children.push(value)
    }
  })
  return {
    type: 'root',
    children,
  }
}

export const blockElement = (
  content: Plate.BlockElement,
  field: RichTypeInner,
  imageCallback: (url: string) => string
): Md.Content | null => {
  switch (content.type) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return {
        type: 'heading',
        // @ts-ignore Type 'number' is not assignable to type '1 | 2 | 3 | 4 | 5 | 6'
        depth: { h1: 1, h2: 2, h3: 3, h4: 4, h5: 5, h6: 6 }[content.type],
        children: eat(content.children, field, imageCallback),
      }
    case 'p':
      // Ignore empty blocks
      if (content.children.length === 1) {
        const onlyChild = content.children[0]
        if (
          onlyChild &&
          // Slate text nodes don't get a `type` property for text nodes
          (onlyChild.type === 'text' || !onlyChild.type) &&
          onlyChild.text === ''
        ) {
          return null
        }
      }
      return {
        type: 'paragraph',
        children: eat(content.children, field, imageCallback),
      }
    case 'code_block':
      return {
        type: 'code',
        lang: content.lang,
        value: content.value,
      }
    case 'mdxJsxFlowElement':
      const { children, attributes, useDirective, directiveType } =
        stringifyProps(content, field, false, imageCallback)
      if (useDirective) {
        const name = content.name
        if (!name) {
          throw new Error(
            `Expective shortcode to have a name but it was not defined`
          )
        }
        const directiveAttributes: Record<string, string> = {}
        attributes.forEach((att) => {
          if (att.value && typeof att.value === 'string') {
            directiveAttributes[att.name] = att.value
          }
        })
        if (directiveType === 'leaf') {
          return {
            type: 'leafDirective',
            name,
            attributes: directiveAttributes,
            children: [],
          }
        } else {
          return {
            type: 'containerDirective',
            name,
            attributes: directiveAttributes,
            children: children,
          }
        }
      }
      return {
        type: 'mdxJsxFlowElement',
        name: content.name,
        attributes,
        children,
      }
    case 'blockquote':
      return {
        type: 'blockquote',
        children: [
          {
            type: 'paragraph',
            children: eat(content.children, field, imageCallback),
          },
        ],
      }
    case 'hr':
      return {
        type: 'thematicBreak',
      }
    case 'ol':
    case 'ul':
      return {
        type: 'list',
        ordered: content.type === 'ol',
        spread: false,
        children: content.children.map((child) =>
          listItemElement(child, field, imageCallback)
        ),
      }
    case 'html': {
      return {
        type: 'html',
        value: content.value,
      }
    }
    case 'img':
      return {
        type: 'image',
        url: imageCallback(content.url),
        alt: content.alt,
        title: content.caption,
      }
    default:
      throw new Error(`BlockElement: ${content.type} is not yet supported`)
  }
}
const listItemElement = (
  content: Plate.ListItemElement,
  field: RichTypeInner,
  imageCallback: (url: string) => string
): Md.ListItem => {
  return {
    type: 'listItem',
    // spread is always false since we don't support block elements in list items
    // good explanation of the difference: https://stackoverflow.com/questions/43503528/extra-lines-appearing-between-list-items-in-github-markdown
    spread: false,
    children: content.children.map((child) => {
      if (child.type === 'lic') {
        return {
          type: 'paragraph',
          children: eat(child.children, field, imageCallback),
        }
      }
      return blockContentElement(child, field, imageCallback)
    }),
  }
}
const blockContentElement = (
  content: Plate.BlockElement,
  field: RichTypeInner,
  imageCallback: (url: string) => string
): Md.BlockContent => {
  switch (content.type) {
    case 'blockquote':
      return {
        type: 'blockquote',
        children: content.children.map((child) =>
          // FIXME: text nodes are probably passed in here by the rich text editor
          // @ts-ignore
          blockContentElement(child, field, imageCallback)
        ),
      }
    case 'p':
      return {
        type: 'paragraph',
        children: eat(content.children, field, imageCallback),
      }
    case 'ol':
    case 'ul':
      return {
        type: 'list',
        ordered: content.type === 'ol',
        spread: false,
        children: content.children.map((child) =>
          listItemElement(child, field, imageCallback)
        ),
      }
    default:
      throw new Error(
        `BlockContentElement: ${content.type} is not yet supported`
      )
  }
}

export type Marks = 'strong' | 'emphasis' | 'inlineCode'

export const getMarks = (content: Plate.InlineElement) => {
  const marks: Marks[] = []
  if (content.type !== 'text') {
    return []
  }
  if (content.bold) {
    marks.push('strong')
  }
  if (content.italic) {
    marks.push('emphasis')
  }
  if (content.code) {
    marks.push('inlineCode')
  }
  return marks
}
