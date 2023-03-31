import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import TreeViewPlugin from './plugins/treeView'
import CodeHighlightPlugin from './plugins/codeHighlight'
import { EditorState, ParagraphNode } from 'lexical'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListItemNode, ListNode } from '@lexical/list'
import { TinaParagraphNode } from './paragraph'
import { TinaListItemNode } from './list-item'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { TRANSFORMERS } from './transformers'
import { Toolbar } from './toolbar'
import { TabIndentationPlugin } from './plugins/tab-indentation'
import { exampleTheme } from './theme'
import { TinaQuoteNode } from './quote'
import { TinaHeadingNode } from './header'
import React from 'react'
import type { SlateRootType } from '@tinacms/mdx'
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode'
import TableActionMenuPlugin from './plugins/tableActionMenuPlugin'
import { buildInitialContent } from './builder'
import { LexicalRoot } from './schema'
import { exportToMarkdownAst } from './exporter'

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
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
                exportToMarkdownAst(json)
                /**
                 * calling this on every change seems heavy-handed, but the value
                 * we get from the out-of-the-box exportJSON values from all of our nodes
                 * doesn't match the type we need. This is probably not an issue for a lot
                 * of editors because they don't need to support live preview...
                 */
                // const result = LexicalRoot.safeParse(json.root)
                // console.log(json)
                // if (result.success) {
                //   console.log(result.data)
                // } else {
                //   console.log(result.error.format())
                // }
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
