import { eat } from './marks'
import { stringifyProps } from './acorn'
import type { RichTextField } from '@tinacms/schema-tools'
import type * as Md from 'mdast'
import type * as Plate from '../../parse/plate'
import type { RootElement } from '../../parse/plate'

export const preProcess = (
  tree: RootElement,
  field: RichTextField,
  imageCallback: (url: string) => string
) => {
  const ast = rootElement(tree, field, imageCallback)
  return ast
}

export const rootElement = (
  content: Plate.RootElement,
  field: RichTextField,
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
  field: RichTextField,
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
      return {
        type: 'mdxJsxFlowElement',
        name: content.name,
        attributes: attributes,
        children: children,
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
      // Slate editor treats `img` as a block-level element, wrap
      // it in an empty paragraph
      return {
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
    default:
      throw new Error(`BlockElement: ${content.type} is not yet supported`)
  }
}
const listItemElement = (
  content: Plate.ListItemElement,
  field: RichTextField,
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
  field: RichTextField,
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
