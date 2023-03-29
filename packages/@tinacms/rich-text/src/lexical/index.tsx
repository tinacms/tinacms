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
import { TabIndentationPlugin } from './tab-indentation'
import { exampleTheme } from './theme'
import { TinaQuoteNode } from './quote'
import { TinaHeadingNode } from './header'
import React from 'react'
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical'

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

function prepopulatedRichText() {
  const root = $getRoot()
  if (root.getFirstChild() === null) {
    // ast.children.forEach(child => {
    //   const childNodes = []
    //   if(child.type === 'heading') {
    //     childNodes.push($createHeadingNode(`h${child.depth}`))
    //   }
    // })
    // Trying to recreate the bug that happens on weird copy/paste
    // root.append($createListNode('bullet').append($createListItemNode().append($createParagraphNode().append($createTextNode('First line')), ($createParagraphNode().append($createTextNode('Testing')))), $createListItemNode().append($createParagraphNode().append($createTextNode('First line')), ($createParagraphNode().append($createTextNode('again'))))))
    // root.append($createCodeNode().append($createCodeHighlightNode("const meh = 'ok'")))
    root.append($createParagraphNode().append($createTextNode('Testing')))
    // root.append(
    //   ...ast.children.map((child) => {
    //     if (child.type === "heading") {
    //       return $createTinaHeadingNode(`h${child.depth}`).append(
    //         ...child.children.map((child) => {
    //           if (child.type === "text") {
    //             return $createTextNode(child.value);
    //           }
    //           return $createTextNode();
    //         })
    //       );
    //     }
    //     if (child.type === "paragraph") {
    //       return $createTinaParagraphNode().append(
    //         ...child.children.map((child) => {
    //           if (child.type === "text") {
    //             return $createTextNode(child.value);
    //           }
    //           return $createTextNode();
    //         })
    //       );
    //     }
    //     return $createParagraphNode();
    //   })
    // );
    // const paragraph = $createParagraphNode();
    // // const heading = $createHeadingNode("h1");
    // // paragraph.insertNewAfter();
    // const paragraph2 = $createParagraphNode();
    // paragraph.append($createTextNode(`Check out the code on our `));
    // paragraph2.append($createTextNode(`leggo`));
    // const list = $createListNode("bullet").append(
    // $createListItemNode().append($createParagraphNode())
    // $createListItemNode()
    // );
    // $createTinaListItemNode()
    // $createTinaListItemNode().append(
    //   $createParagraphNode().append($createTextNode("okok"))
    // )
    // $createTinaListItemNode().append(
    //   $createParagraphNode().append($createTextNode("again"))
    // ),
    // $createTinaListItemNode().append(
    //   $createParagraphNode().append($createTextNode("and again"))
    // )
    // const p = $createParagraphNode().append($createTextNode("and again"));
    // root.append(list);
    // root.append(paragraph);
  }
}

export const LexicalEditor = () => {
  return (
    <div className="lexical-editor">
      <LexicalComposer
        initialConfig={{
          namespace: 'MyEditor',
          editorState: prepopulatedRichText,
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
                // const json = editorState.toJSON();
                // console.log(json)
              }}
            />
          </div>
        </div>
        <TabIndentationPlugin />
        <CodeHighlightPlugin />
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
