import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import TreeViewPlugin from './plugins/treeView'
import CodeHighlightPlugin from './plugins/codeHighlight'
import {
  $createLineBreakNode,
  EditorState,
  ElementNode,
  ParagraphNode,
  RootNode,
} from 'lexical'
import {
  $createCodeHighlightNode,
  $createCodeNode,
  CodeHighlightNode,
  CodeNode,
} from '@lexical/code'
import {
  $createTableCellNode,
  $createTableNode,
  $createTableRowNode,
  TableCellNode,
  TableNode,
  TableRowNode,
} from '@lexical/table'
import { $createLinkNode, AutoLinkNode, LinkNode } from '@lexical/link'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingNode,
  QuoteNode,
} from '@lexical/rich-text'
import { $createListNode, ListItemNode, ListNode } from '@lexical/list'
import { TinaParagraphNode } from './paragraph'
import { $createTinaListItemNode, TinaListItemNode } from './list-item'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { TRANSFORMERS } from './transformers'
import { Toolbar } from './toolbar'
import { TabIndentationPlugin } from './tab-indentation'
import { exampleTheme } from './theme'
import { TinaQuoteNode } from './quote'
import { TinaHeadingNode } from './header'
import React from 'react'
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical'
import type {
  BlockContent,
  DefinitionContent,
  PhrasingContent,
  SlateRootType,
  StaticPhrasingContent,
} from '@tinacms/mdx'
import {
  $createHorizontalRuleNode,
  HorizontalRuleNode,
} from '@lexical/react/LexicalHorizontalRuleNode'
import TableActionMenuPlugin from './plugins/tableActionMenuPlugin'

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

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
      const textNode = $createTextNode(value.text)
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
        row.children.forEach((cell, columnIndex) => {
          const cellNode = $createTableCellNode(0) // All cells are the same, no <th>
          const alignment = value.align ? value.align[columnIndex] : 'center'
          const alignmentClasses = {
            left: 'text-left',
            center: 'text-center',
            right: 'text-right',
          }
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

const buildInitialContent = (value: SlateRootType) => {
  const root = $getRoot()
  console.log(value)
  populateTopLevelContent(value, root)
  // const listNode = $createListNode("bullet")
  // const listItemNode = $createTinaListItemNode()
  // const paragraphNode = $createParagraphNode()
  // const textNode = $createTextNode("hi there")
  // // paragraphNode.append(textNode)
  // listItemNode.append(paragraphNode)
  // listNode.append(listItemNode)

  // root.append(listNode)

  // root.append($createParagraphNode().append($createTextNode('Testing')))
}

export const LexicalEditor = (props: {
  input: { value: SlateRootType; onChange: (value: unknown) => void }
}) => {
  return (
    <div className="lexical-editor">
      <LexicalComposer
        initialConfig={{
          namespace: 'MyEditor',
          editorState: () => buildInitialContent(props.input.value),
          onError: (e: Error) => {
            throw e
          },
          theme: exampleTheme,
          nodes: [
            TinaHeadingNode,
            HeadingNode,
            {
              replace: HeadingNode,
              with: (node: HeadingNode) => {
                return new TinaHeadingNode(node.__tag)
              },
            },
            ListNode,
            // This causes errors, and may not be necessary. The main reason
            // for it was to ensure that when children are added we keep
            // the paragraph element between list items and text
            // TinaListNode,
            // {
            //   replace: ListNode,
            //   with: (node: ListNode) => {
            //     return new TinaListNode(node.__listType, node.__start);
            //   },
            // },
            ListItemNode,
            QuoteNode,
            {
              replace: QuoteNode,
              with: () => {
                return new TinaQuoteNode()
              },
            },
            TinaQuoteNode,
            CodeNode,
            HorizontalRuleNode,
            CodeHighlightNode,
            TableNode,
            TableCellNode,
            TableRowNode,
            AutoLinkNode,
            LinkNode,
            TinaListItemNode,
            {
              replace: ListItemNode,
              with: () => new TinaListItemNode(),
            },
            TinaParagraphNode,
            {
              replace: ParagraphNode,
              with: () => new TinaParagraphNode(),
            },
          ],
        }}
      >
        <div className="relative mt-8">
          <div
            className={classNames(
              // checked ? 'border-transparent' : 'border-gray-300',
              true ? 'border-indigo-500 ring-2 ring-indigo-500' : '',
              'relative block rounded-lg border bg-white shadow-sm'
            )}
          >
            <div className="sticky z-10 top-2 mt-2 w-full px-2 pb-3">
              <Toolbar />
            </div>
            <div
              className={classNames(
                // checked ? 'border-transparent' : 'border-gray-300',
                'relative'
              )}
            >
              <div className="relative px-2 md:px-3 pb-2">
                <RichTextPlugin
                  contentEditable={
                    <div className="editor relative">
                      <ContentEditable
                        className={classNames(
                          'editor-root relative outline-none py-2'
                        )}
                      />
                    </div>
                  }
                  ErrorBoundary={(e) => {
                    // FIXME: this is triggered during image insertion
                    return <div>{e.children}</div>
                  }}
                  placeholder={<Placeholder />}
                />
              </div>
            </div>
            <HistoryPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <ListPlugin />
            <OnChangePlugin
              onChange={(editorState: EditorState) => {
                const json = editorState.toJSON()
                console.log(json)
              }}
            />
          </div>
        </div>
        <TabIndentationPlugin />
        <CodeHighlightPlugin />
        <TableActionMenuPlugin />
        <TreeViewPlugin />
      </LexicalComposer>
    </div>
  )
}

function Placeholder() {
  return (
    // Padding should match rich-text component padding
    <div className="py-2 px-2 md:px-3 absolute inset-0 text-gray-400 pointer-events-none truncate prose">
      Type something...
    </div>
  )
}
