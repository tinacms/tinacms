/**



*/

import { Handlers, toMarkdown } from 'mdast-util-to-markdown'
import { text } from 'mdast-util-to-markdown/lib/handle/text'
import { gfmToMarkdown } from 'mdast-util-gfm'
import {
  mdxJsxToMarkdown,
  MdxJsxTextElement,
  MdxJsxFlowElement,
} from 'mdast-util-mdx-jsx'
import { stringifyMDX as stringifyMDXNext } from '../next'
import type { RichTextType } from '@tinacms/schema-tools'
import type * as Md from 'mdast'
import type * as Plate from '../parse/plate'
import { eat } from './marks'
import { stringifyProps } from './acorn'
import { directiveToMarkdown } from '../extensions/tina-shortcodes/to-markdown'
import { stringifyShortcode } from './stringifyShortcode'

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
  field: RichTextType,
  imageCallback: (url: string) => string
) => {
  if (field.parser?.type === 'markdown') {
    return stringifyMDXNext(value, field, imageCallback)
  }
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
  const res = toTinaMarkdown(tree, field)
  const templatesWithMatchers = field.templates?.filter(
    (template) => template.match
  )
  let preprocessedString = res
  templatesWithMatchers?.forEach((template) => {
    if (typeof template === 'string') {
      throw new Error('Global templates are not supported')
    }
    if (template.match) {
      preprocessedString = stringifyShortcode(preprocessedString, template)
    }
  })
  return preprocessedString
}

export type Pattern = {
  start: string
  end: string
  name: string
  templateName: string
  type: 'block' | 'leaf'
}

export const toTinaMarkdown = (tree: Md.Root, field: RichTextType) => {
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
  /**
   *
   * Escaping elements which we can't accound for (eg. `<`) is usually good. But when the rich-text other tooling
   * is responsible for parsing markdown, and Tina's only job is to provide a rich-text editor, we need to avoid
   * escaping so things like shortcodes continue to work (eg. '{{<' would become '{{\<').
   *
   * We can probably be more fine-grained with this, but for now, if you've provided a `match` property on your
   * templates, we're assuming you'll need to escape
   *
   */
  // @ts-ignore
  const handlers: Handlers = {}
  handlers['text'] = (node, parent, context, safeOptions) => {
    // Empty spaces before/after strings
    context.unsafe = context.unsafe.filter((unsafeItem) => {
      if (
        unsafeItem.character === ' ' &&
        unsafeItem.inConstruct === 'phrasing'
      ) {
        return false
      }
      return true
    })
    if (field.parser?.type === 'markdown') {
      if (field.parser.skipEscaping === 'all') {
        return node.value
      }
      if (field.parser.skipEscaping === 'html') {
        // Remove this character from the unsafe list, and then
        // proceed with the original text handler
        context.unsafe = context.unsafe.filter((unsafeItem) => {
          if (unsafeItem.character === '<') {
            return false
          }
          return true
        })
      }
    }
    return text(node, parent, context, safeOptions)
  }
  return toMarkdown(tree, {
    extensions: [
      directiveToMarkdown(patterns),
      mdxJsxToMarkdown(),
      gfmToMarkdown(),
    ],
    listItemIndent: 'one',
    handlers,
  })
}

export const rootElement = (
  content: Plate.RootElement,
  field: RichTextType,
  imageCallback: (url: string) => string
): Md.Root => {
  const children: Md.Content[] = []
  content.children?.forEach((child) => {
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
  field: RichTextType,
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
      const children2 = eat(content.children, field, imageCallback)
      function removeLastSpaceNodes(arr: Md.PhrasingContent[]) {
        for (let i = arr.length - 1; i >= 0; i--) {
          const item = arr[i]
          if (item?.type === 'text' && item.value.trim() === '') {
            arr.splice(i, 1)
          } else {
            break
          }
        }

        return arr
      }

      return {
        type: 'paragraph',
        children: removeLastSpaceNodes(children2),
      }
    case 'mermaid':
      return {
        type: 'code',
        lang: 'mermaid',
        value: content.value,
      }
    case 'code_block':
      return {
        type: 'code',
        lang: content.lang,
        value: content.value,
      }
    case 'mdxJsxFlowElement':
      if (content.name === 'table') {
        const table = content.props as {
          align: Md.AlignType[] | undefined
          tableRows: { tableCells: { value: any }[] }[]
        }
        return {
          type: 'table',
          align: table.align,
          children: table.tableRows.map((tableRow) => {
            const tr: Md.TableRow = {
              type: 'tableRow',
              children: tableRow.tableCells.map(({ value }) => {
                return {
                  type: 'tableCell',
                  children: eat(
                    value?.children?.at(0)?.children || [],
                    field,
                    imageCallback
                  ),
                }
              }),
            }
            return tr
          }),
        }
      }
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
        attributes?.forEach((att) => {
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
        // Slate editor treats `img` as a block-level element, wrap
        // it in an empty paragraph
        type: 'paragraph',
        children: [
          {
            type: 'image',
            url: imageCallback(content.url),
            alt: content.alt,
            title: content.caption,
          },
        ],
      }
    case 'table':
      const table = content.props as
        | {
            align: Md.AlignType[] | undefined
          }
        | undefined
      return {
        type: 'table',
        align: table?.align,
        children: content.children.map((tableRow) => {
          return {
            type: 'tableRow',
            children: tableRow.children.map((tableCell) => {
              return {
                type: 'tableCell',
                children: eat(
                  tableCell.children?.at(0)?.children || [],
                  field,
                  imageCallback
                ),
              }
            }),
          }
        }),
      }
    default:
      throw new Error(`BlockElement: ${content.type} is not yet supported`)
  }
}
const listItemElement = (
  content: Plate.ListItemElement,
  field: RichTextType,
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
  field: RichTextType,
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
