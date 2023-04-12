/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, it, test, beforeEach, expect } from 'vitest'
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  TextNode,
} from 'lexical'
import { initializeUnitTest } from './util'

import { ListItemNode, ListNode } from '@lexical/list/LexicalList.dev'
import { $createListItemNode, $isListItemNode, TinaListItemNode } from '../..'
import { expectHtmlToBeEqual, html, prettifyHtml } from './utils'
import { createEditorConfig } from '../../../lexical'
import { buildInitialContent } from '../../../builder'
import { $createListNode } from '@lexical/list'
import { TinaParagraphNode } from '../../../paragraph'

// @ts-ignore https://github.com/testing-library/react-testing-library/issues/1061#issuecomment-1117450890
global.IS_REACT_ACT_ENVIRONMENT = true

const editorConfig = Object.freeze({
  namespace: '',
  theme: {
    list: {
      listitem: 'list-item',
      nested: {
        listitem: 'nested-list-item',
      },
    },
  },
})

describe('LexicalListItemNode tests', () => {
  initializeUnitTest(
    (testEnv) => {
      test('ListItemNode.constructor', async () => {
        const { editor } = testEnv

        if (!editor) {
          throw new Error(`No editor found`)
        }
        await editor.update(() => {
          const listItemNode = new TinaListItemNode()

          expect(listItemNode.getType()).toBe('tina-listitem')

          expect(listItemNode.getTextContent()).toBe('')
        })

        expect(() => new TinaListItemNode()).toThrow()
      })

      test('ListItemNode.createDOM()', async () => {
        const { editor } = testEnv
        if (!editor) {
          throw new Error(`No editor found`)
        }

        await editor.update(() => {
          const listItemNode = new TinaListItemNode()

          // expect(listItemNode.createDOM(editorConfig).outerHTML)
          //   .html`<li value="1" class="list-item"></li>`
          // expect(listItemNode.createDOM(editorConfig).outerHTML).html``
        })
      })

      test('nested list', async () => {
        const { editor } = testEnv

        if (!editor) {
          throw new Error(`No editor found`)
        }

        await editor.update(() => {
          const parentListNode = new ListNode('bullet', 1)
          const parentlistItemNode = new ListItemNode()

          parentListNode.append(parentlistItemNode)
          const domElement = parentlistItemNode.createDOM(editorConfig)

          expectHtmlToBeEqual(
            domElement.outerHTML,
            html` <li value="1" class="list-item"></li> `
          )

          const nestedListNode = new ListNode('bullet', 1)
          nestedListNode.append(new ListItemNode())
          parentlistItemNode.append(nestedListNode)
          const result = parentlistItemNode.updateDOM(
            parentlistItemNode,
            domElement,
            editorConfig
          )

          expect(result).toBe(false)

          expectHtmlToBeEqual(
            domElement.outerHTML,
            html` <li value="1" class="list-item nested-list-item"></li> `
          )
        })
      })

      describe('listItem.setIndent for indenting', () => {
        let listNode: ListNode
        let listItemNode1: TinaListItemNode
        let listItemNode2: TinaListItemNode
        let listItemNode1Paragraph: TinaParagraphNode

        beforeEach(async () => {
          const { editor } = testEnv

          if (!editor) {
            throw new Error(`No editor found`)
          }

          await editor.update(() => {
            const root = $getRoot()
            listNode = $createListNode('bullet')
            listItemNode1 = $createListItemNode()
            listItemNode2 = $createListItemNode()
            listItemNode1Paragraph = $createParagraphNode()

            listItemNode1.append(
              listItemNode1Paragraph.append($createTextNode('one'))
            )
            listItemNode2.append(
              $createParagraphNode().append($createTextNode('two'))
            )

            root.append(listNode)
            listNode.append(listItemNode1, listItemNode2)
          })
        })
        it('indents list items properly with multiple nodes', async () => {
          const { editor } = testEnv
          if (!editor) {
            throw new Error(`No editor found`)
          }

          await editor.update(() => {
            listItemNode1.append(
              $createParagraphNode().append($createTextNode('one sibling'))
            )
          })

          expect(
            prettifyHtml(editor.getRootElement()?.innerHTML || '')
          ).toMatchFileSnapshot('./snaps/indent2/in.html')

          await editor.update(() => {
            listItemNode1Paragraph.setIndent(1)
          })

          expect(
            prettifyHtml(editor.getRootElement()?.innerHTML || '')
          ).toMatchFileSnapshot('./snaps/indent2/out.html')
        })
        it('indents list items properly', async () => {
          const { editor } = testEnv
          if (!editor) {
            throw new Error(`No editor found`)
          }

          expect(
            prettifyHtml(editor.getRootElement()?.innerHTML || '')
          ).toMatchFileSnapshot('./snaps/indent1/in.html')

          await editor.update(() => {
            listItemNode1Paragraph.setIndent(1)
          })

          expect(
            prettifyHtml(editor.getRootElement()?.innerHTML || '')
          ).toMatchFileSnapshot('./snaps/indent1/out.html')
        })
      })

      describe('listItem.setIndent for outdenting', () => {
        let listNode: ListNode
        let listItemNode1: TinaListItemNode
        let nestedListItemParagraph: TinaParagraphNode

        beforeEach(async () => {
          const { editor } = testEnv

          if (!editor) {
            throw new Error(`No editor found`)
          }

          await editor.update(() => {
            const root = $getRoot()
            listNode = $createListNode('bullet')
            root.append(listNode)
            listItemNode1 = $createListItemNode()
            listNode.append(listItemNode1)
            const nestedList = $createListNode('bullet')
            listItemNode1.append(nestedList)
            const nestedListItem = $createListItemNode()
            nestedList.append(nestedListItem)
            nestedListItemParagraph = $createParagraphNode()
            nestedListItem.append(nestedListItemParagraph)
            nestedListItemParagraph.append($createTextNode('nested one'))
          })
        })
        it('outdent list items properly', async () => {
          const { editor } = testEnv
          if (!editor) {
            throw new Error(`No editor found`)
          }

          expect(
            prettifyHtml(editor.getRootElement()?.innerHTML || '')
          ).toMatchFileSnapshot('./snaps/outdent/in.html')

          await editor.update(() => {
            nestedListItemParagraph.setIndent(0)
          })

          expect(
            prettifyHtml(editor.getRootElement()?.innerHTML || '')
          ).toMatchFileSnapshot('./snaps/outdent/out.html')
        })
      })

      describe('listItem.setIndent for outdenting 2', () => {
        let listNode: ListNode
        let listItemNode1: TinaListItemNode
        let nestedListItemParagraph: TinaParagraphNode

        beforeEach(async () => {
          const { editor } = testEnv

          if (!editor) {
            throw new Error(`No editor found`)
          }

          await editor.update(() => {
            const root = $getRoot()
            listNode = $createListNode('bullet')
            root.append(listNode)
            listItemNode1 = $createListItemNode()
            listNode.append(listItemNode1)
            const nestedList = $createListNode('bullet')
            listItemNode1.append(
              $createParagraphNode().append($createTextNode('previous sibling'))
            )
            listItemNode1.append(nestedList)
            const nestedListItem = $createListItemNode()
            nestedList.append(nestedListItem)
            nestedListItemParagraph = $createParagraphNode()
            nestedListItem.append(nestedListItemParagraph)
            nestedListItemParagraph.append($createTextNode('nested one'))
          })
        })
        it.only('outdent list items properly', async () => {
          const { editor } = testEnv
          if (!editor) {
            throw new Error(`No editor found`)
          }

          expect(
            prettifyHtml(editor.getRootElement()?.innerHTML || '')
          ).toMatchFileSnapshot('./snaps/outdent2/in.html')

          await editor.update(() => {
            nestedListItemParagraph.setIndent(0)
          })

          expect(
            prettifyHtml(editor.getRootElement()?.innerHTML || '')
          ).toMatchFileSnapshot('./snaps/outdent2/out.html')
        })
      })
    },
    createEditorConfig(() => {})
  )
})
