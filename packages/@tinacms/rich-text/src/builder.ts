import { $createLineBreakNode, ElementNode, RootNode } from 'lexical'
import { $createCodeHighlightNode, $createCodeNode } from '@lexical/code'
import { $createLinkNode } from '@lexical/link'
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import { $createListNode } from '@lexical/list'
import { $createTinaListItemNode } from './list-item'
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical'
import { $createHorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode'
import {
  $createTableCellNode,
  $createTableNode,
  $createTableRowNode,
} from '@lexical/table'
import type {
  BlockContent,
  DefinitionContent,
  PhrasingContent,
  StaticPhrasingContent,
  Root,
  Text,
} from '@tinacms/mdx'
import type * as M from 'mdast'

const populateStaticPhrasingContent = (
  value: StaticPhrasingContent,
  node: ElementNode
) => {
  switch (value.type) {
    case 'break': {
      node.append($createLineBreakNode())
      break
    }
    case 'html': {
      // TODO: this should probably be a custom node of some sort.
      const textNode = $createTextNode(value.value)
      node.append(textNode)
      break
    }
    case 'text': {
      const textNode = $createTextNode(value.value)
      if (value.code) {
        textNode.setFormat('code')
      }
      if (value.delete) {
        textNode.setFormat('strikethrough')
      }
      if (value.emphasis) {
        textNode.setFormat('italic')
      }
      if (value.strong) {
        textNode.setFormat('bold')
      }
      node.append(textNode)
      break
    }
  }
}

const populatePhrasingContent = (value: PhrasingContent, node: ElementNode) => {
  switch (value.type) {
    case 'link': {
      const linkNode = $createLinkNode(value.url)
      flattenMdPhrasingContentArray(value.children, linkNode)
      node.append(linkNode)
      break
    }
    case 'linkReference': {
      const linkNode = $createLinkNode(`url from ${value.identifier}`)
      flattenMdPhrasingContentArray(value.children, linkNode)
      node.append(linkNode)
      break
    }
    default:
      populateStaticPhrasingContent(value, node)
  }
}

const flattenMdPhrasingContentArray = (
  items: PhrasingContent[],
  node: ElementNode
) => {
  const flattenMdStaticPhrasingContent = (
    items: M.StaticPhrasingContent[],
    accumulator: StaticPhrasingContent[] = [],
    parentMarks: Partial<Text>
  ): void => {
    return flattenMdPhrasingContent(items, accumulator, parentMarks)
  }
  const flattenMdPhrasingContent = (
    items: M.PhrasingContent[],
    accumulator: PhrasingContent[] = [],
    parentMarks: Partial<Text>
  ): void => {
    const marks: Partial<Text> = parentMarks
    items.forEach((item) => {
      switch (item.type) {
        case 'footnote':
          /**
           * It doesn't actually seem like this is supported. But
           * the spec says that this is a footnote:
           *
           * ^[alpha bravo]
           *
           * And it's picked up as as paragraph element so not sure
           */
          console.warn(`Not implemented ${item.type}`)
          break
        case 'delete':
          flattenMdPhrasingContent(item.children, accumulator, {
            ...marks,
            delete: true,
          })
          break
        case 'inlineCode':
          accumulator.push({ type: 'text', value: item.value, code: true })
          break
        case 'break':
          accumulator.push({ type: 'break' })
          break
        case 'emphasis':
          flattenMdPhrasingContent(item.children, accumulator, {
            ...marks,
            emphasis: true,
          })
          break
        case 'footnoteReference':
          accumulator.push(item)
          break
        case 'html':
          accumulator.push({ type: 'html', value: item.value })
          break
        case 'image':
          accumulator.push(item)
          break
        case 'imageReference':
          accumulator.push(item)
          break
        case 'linkReference':
          {
            const linkChildren: Text[] = []
            flattenMdStaticPhrasingContent(item.children, linkChildren, marks)
            accumulator.push({
              ...item,
              children: linkChildren,
            })
          }
          break
        case 'link':
          const linkChildren: Text[] = []
          flattenMdStaticPhrasingContent(item.children, linkChildren, marks)
          accumulator.push({
            ...item,
            children: linkChildren,
          })
          break
        case 'text':
          accumulator.push({ type: 'text', value: item.value, ...marks })
          break
        case 'strong':
          flattenMdPhrasingContent(item.children, accumulator, {
            ...marks,
            strong: true,
          })
          break
      }
    })
  }

  const accumulator: PhrasingContent[] = []
  flattenMdPhrasingContent(items, accumulator, {})
  return accumulator.forEach((item) => {
    populatePhrasingContent(item, node)
  })
}

const populateBlockOrDefinitionContent = (
  value: BlockContent | DefinitionContent,
  node: ElementNode
) => {
  switch (value.type) {
    case 'table': {
      const tableNode = $createTableNode()
      value.children.forEach((row) => {
        const rowNode = $createTableRowNode()
        row.children.forEach((cell) => {
          const cellNode = $createTableCellNode(0) // All cells are the same, no <th>
          // const alignment = value.align ? value.align[columnIndex] : 'center'
          // const alignmentClasses = {
          //   left: 'text-left',
          //   center: 'text-center',
          //   right: 'text-right',
          // }
          flattenMdPhrasingContentArray(cell.children, cellNode)
          rowNode.append(cellNode)
        })
        tableNode.append(rowNode)
      })
      node.append(tableNode)
      break
    }
    case 'list': {
      const listNode = $createListNode(value.ordered ? 'number' : 'bullet')
      value.children.forEach((subChild) => {
        const listItemNode = $createTinaListItemNode()
        subChild.children.forEach((listItemChild) => {
          if (
            listItemChild.type === 'definition' ||
            listItemChild.type === 'footnoteDefinition'
          ) {
            // not sure
          } else {
            populateBlockOrDefinitionContent(listItemChild, listItemNode)
          }
        })
        listNode.append(listItemNode)
      })
      node.append(listNode)
      break
    }
    case 'thematicBreak': {
      node.append($createHorizontalRuleNode())
      break
    }
    case 'blockquote': {
      const blockQuoteNode = $createQuoteNode()
      value.children.forEach((child) =>
        populateBlockOrDefinitionContent(child, blockQuoteNode)
      )
      node.append(blockQuoteNode)
      break
    }
    case 'code': {
      const codeNode = $createCodeNode(value.lang)
      const codeHighlightNode = $createCodeHighlightNode(value.value)
      codeNode.append(codeHighlightNode)
      node.append(codeNode)
      break
    }
    case 'heading': {
      const headingNode = $createHeadingNode(`h${value.depth}`)
      flattenMdPhrasingContentArray(value.children, headingNode)
      node.append(headingNode)
      break
    }
    case 'paragraph': {
      const paragraph = $createParagraphNode()
      flattenMdPhrasingContentArray(value.children, paragraph)
      node.append(paragraph)
    }
  }
}

const populateTopLevelContent = (value: Root, root: RootNode) => {
  value.children.forEach((child) => {
    switch (child.type) {
      case 'table':
      case 'list':
      case 'thematicBreak':
      case 'blockquote':
      case 'code':
      case 'heading':
      case 'html':
      case 'paragraph': {
        populateBlockOrDefinitionContent(child, root)
        break
      }
      default:
        console.warn(`No builder for ${child.type}`)
    }
  })
}

export const buildInitialContent = (value: Root) => {
  const root = $getRoot()
  populateTopLevelContent(value, root)
}
