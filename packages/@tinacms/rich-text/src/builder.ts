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
  SlateRootType,
  StaticPhrasingContent,
} from '@tinacms/mdx'

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
      value.children.forEach((child) =>
        populateStaticPhrasingContent(child, linkNode)
      )
      node.append(linkNode)
      break
    }
    case 'linkReference': {
      const linkNode = $createLinkNode(`url from ${value.identifier}`)
      value.children.forEach((child) =>
        populateStaticPhrasingContent(child, linkNode)
      )
      node.append(linkNode)
      break
    }
    default:
      populateStaticPhrasingContent(value, node)
  }
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
          cell.children.forEach((cellChild) => {
            populatePhrasingContent(cellChild, cellNode)
          })
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
      value.children.forEach((subChild) => {
        populatePhrasingContent(subChild, headingNode)
      })
      node.append(headingNode)
      break
    }
    case 'paragraph': {
      const paragraph = $createParagraphNode()
      value.children.forEach((subChild) => {
        populatePhrasingContent(subChild, paragraph)
      })
      node.append(paragraph)
    }
  }
}

const populateTopLevelContent = (value: SlateRootType, root: RootNode) => {
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

export const buildInitialContent = (value: SlateRootType) => {
  const root = $getRoot()
  populateTopLevelContent(value, root)
}
