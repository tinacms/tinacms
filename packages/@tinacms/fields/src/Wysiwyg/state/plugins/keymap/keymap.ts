/**

Copyright 2019 Forestry.io Inc

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

import {
  baseKeymap,
  chainCommands,
  createParagraphNear,
  exitCode,
  liftEmptyBlock,
  setBlockType,
  splitBlock,
  toggleMark,
  wrapIn,
} from 'prosemirror-commands'
import { Schema, NodeType } from 'prosemirror-model'
import {
  liftListItem,
  sinkListItem,
  splitListItem,
} from 'prosemirror-schema-list'
import { EditorState, Selection } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { insertHr } from '../../../commands'
import {
  deleteEmptyHeading,
  toggleHeader,
} from '../../../commands/heading-commands'
import {
  toggleBulletList,
  toggleOrderedList,
} from '../../../commands/list-commands'
import { liftBlockquote } from '../../../commands/blockquote-commands'

const { undo, redo } = require('prosemirror-history')
const { undoInputRule } = require('prosemirror-inputrules')

const mac =
  typeof navigator != 'undefined' ? /Mac/.test(navigator.platform) : false

export function buildKeymap(schema: Schema, blockContent?: boolean) {
  const keys: any = {
    ...baseKeymap,
    Enter: chainCommands(createParagraphNear, liftEmptyBlock, splitBlock),
  }
  let type: any

  function bind(key: string, cmd: any) {
    if (keys[key]) {
      cmd = chainCommands(cmd, keys[key])
    }
    keys[key] = cmd
  }

  /**
   * Undo
   */
  bind('Mod-z', undo)
  bind('Backspace', undoInputRule)

  /**
   * Redo
   */
  bind('Shift-Mod-z', redo)
  if (!mac) {
    bind('Mod-y', redo)
  }

  /**
   * Tab
   */
  bind('Tab', () => {
    return true
  })

  bind('Shift-Tab', () => {
    return true
  })

  if (blockContent) {
    // bind("Ctrl-Mod-ArrowUp", moveNodeUp)
    // bind("Ctrl-Mod-ArrowDown", moveNodeDown)
  }

  /**
   * Strong – <strong />
   */
  if ((type = schema.marks.strong)) {
    bind('Mod-b', toggleMark(type))
  }

  /**
   * Emphasis – <em />
   */
  if ((type = schema.marks.em)) {
    bind('Mod-i', toggleMark(type))
  }

  /**
   * Link – <a />
   */
  if ((type = schema.marks.link)) {
    const toggleLink = toggleMark(type, {
      href: '',
      title: '',
      creating: 'creating',
      editing: 'editing',
    })

    bind('Mod-k', function(state: any, dispatch: any) {
      if (!(state.selection as any).$cursor) {
        return toggleLink(state as any, dispatch)
      }
      return false
    })
  }

  /**
   * Underline – <span style="text-decoration: underline" />
   */
  if ((type = schema.marks.underline)) {
    bind('Mod-u', toggleMark(type))
  }

  /**
   * Hard Break – <br />
   */
  if ((type = schema.nodes.hard_break)) {
    const br = type,
      cmd = chainCommands(exitCode, (state, dispatch) => {
        dispatch!(state.tr.replaceSelectionWith(br.create()).scrollIntoView())
        return true
      })
    if (!schema.nodes.paragraph) {
      bind('Enter', cmd)
    }
    bind('Mod-Enter', cmd)
    bind('Shift-Enter', cmd)
    if (mac) bind('Ctrl-Enter', cmd)
  }

  /**
   * Headings - <h{n} />
   */
  if ((type = schema.nodes.heading)) {
    bind(
      'Mod-Alt-1',
      toggleHeader(type, { level: 1 }, schema.nodes.paragraph, null)
    )
    bind(
      'Mod-Alt-2',
      toggleHeader(type, { level: 2 }, schema.nodes.paragraph, null)
    )
    bind(
      'Mod-Alt-3',
      toggleHeader(type, { level: 3 }, schema.nodes.paragraph, null)
    )
    bind(
      'Mod-Alt-4',
      toggleHeader(type, { level: 4 }, schema.nodes.paragraph, null)
    )
    bind(
      'Mod-Alt-5',
      toggleHeader(type, { level: 5 }, schema.nodes.paragraph, null)
    )
    bind(
      'Mod-Alt-6',
      toggleHeader(type, { level: 6 }, schema.nodes.paragraph, null)
    )
    bind('Backspace', deleteEmptyHeading)
  }

  /**
   * Ordered List
   */
  if ((type = schema.nodes.ordered_list)) {
    bind('Mod-Alt-7', toggleOrderedList)
  }

  /**
   * Bullet List
   */
  if ((type = schema.nodes.bullet_list)) {
    bind('Mod-Alt-8', toggleBulletList)
  }

  /**
   * Allow lifting lists with
   * paragraph shortcut
   */
  if ((type = schema.nodes.bullet_list) || (type = schema.nodes.ordered_list)) {
    const lift = liftListItem(schema.nodes.list_item)
    bind('Mod-Alt-9', lift)
  }

  /**
   * Code Block - <pre />
   */
  if ((type = schema.nodes.code_block)) {
    bind('Mod-Alt-0', setBlockType(type))
    bind('ArrowLeft', arrowHandler('left'))
    bind('ArrowRight', arrowHandler('right'))
    bind('ArrowUp', arrowHandler('up'))
    bind('ArrowDown', arrowHandler('down'))
  }

  /**
   * Code – <code />
   */
  if ((type = schema.marks.code)) {
    bind('Mod-0', toggleMark(type))
  }

  /**
   * Blockquote
   */
  if ((type = schema.nodes.blockquote)) {
    bind('Mod->', wrapIn(type))
    bind('Mod-<', liftBlockquote)
  }

  /**
   * Paragraph – <p />
   */
  if ((type = schema.nodes.paragraph)) {
    bind('Mod-Alt-9', setBlockType(type))
    bind('Shift-Ctrl-0', setBlockType(type))
  }

  /**
   * Horizontal Rule
   */
  if ((type = schema.nodes.horizontal_rule)) {
    bind('Mod-Enter', insertHr)
  }

  /**
   * Lists
   */
  if ((type = schema.nodes.list_item)) {
    bind('Enter', splitListItem(type))
    bind('Tab', sinkListItem(type))
    bind('Shift-Tab', liftListItem(type))
  }

  return keys
}

function arrowHandler(
  dir: 'left' | 'right' | 'up' | 'down' | 'forward' | 'backward'
) {
  return (state: EditorState, dispatch: any, view: EditorView) => {
    if (state.selection.empty && view.endOfTextblock(dir)) {
      const side = dir == 'left' || dir == 'up' ? -1 : 1
      const $head = state.selection.$head
      const nextPos = (Selection as any).near(
        state.doc.resolve(side > 0 ? $head.after() : $head.before()),
        side
      )
      if (nextPos.$head && nextPos.$head.parent.type.name == 'code_block') {
        dispatch(state.tr.setSelection(nextPos))
        return true
      }
    }
    return false
  }
}

export function isListType(listType: NodeType) {
  return function(state: EditorState) {
    const { $from, $to } = state.selection
    const range = $from.blockRange(
      $to,
      node => !!(node.firstChild && node.firstChild.type == listType)
    )
    return range && state.doc.child(range.start).type == listType
  }
}

export function isNotAList(state: EditorState) {
  const { ordered_list, bullet_list } = state.schema.nodes
  const { $from, $to } = state.selection
  const range = $from.blockRange(
    $to,
    node => !!(
      node.firstChild &&
      (node.firstChild.type == ordered_list ||
        node.firstChild.type == bullet_list)
    )
  )
  return (
    range &&
    state.doc.child(range.start).type != ordered_list &&
    state.doc.child(range.start).type != bullet_list
  )
}

export function switchListType(listType: NodeType) {
  return function(state: EditorState, dispatch: any) {
    const itemType = state.schema.nodes.list_item
    const { $from, $to } = state.selection
    const range = $from.blockRange(
      $to,
      node => !!(node.firstChild && node.firstChild.type == itemType)
    )
    if (!range) return false
    if (!dispatch) return true

    const tr = state.tr
    dispatch((tr as any).setNodeMarkup(range.start - 1, listType))
    return true
  }
}
