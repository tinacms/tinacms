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

import { NodeType, Schema } from 'prosemirror-model'
import { EditorState } from 'prosemirror-state'
import {
  setBlockType,
  toggleMark,
  wrapIn,
  chainCommands,
  exitCode,
} from 'prosemirror-commands'
import { insertHr } from '../commands'
import {
  splitListItem,
  sinkListItem,
  liftListItem,
} from 'prosemirror-schema-list'
import { EditorView } from 'prosemirror-view'
import { liftBlockquote } from '../commands/blockquote-commands'
import { toggleBulletList, toggleOrderedList } from '../commands/list-commands'
import { deleteEmptyHeading, toggleHeader } from '../commands/heading-commands'
import { undo, redo } from 'prosemirror-history'
import { undoInputRule } from 'prosemirror-inputrules'
import { KeymapPlugin } from '.'

const hardBreakCmd = (schema: Schema) => {
  const br = schema.nodes.hard_break
  return chainCommands(exitCode, (state, dispatch) => {
    dispatch!(state.tr.replaceSelectionWith(br.create()).scrollIntoView())
    return true
  })
}

const headingCmd = (level: number) => (schema: Schema) => {
  const heading = schema.nodes.heading
  return toggleHeader(heading, { level }, schema.nodes.paragraph, null)
}

export const KEYMAP_PLUGINS: KeymapPlugin[] = [
  { __type: 'wysiwyg:keymap', name: 'Mod-z', command: () => undo },
  { __type: 'wysiwyg:keymap', name: 'Backspace', command: () => undoInputRule },
  { __type: 'wysiwyg:keymap', name: 'Mod-Shift-z', command: () => redo },
  {
    __type: 'wysiwyg:keymap',
    name: 'Mod-y',
    command: () => redo,
    unlessMac: true,
  },
  { __type: 'wysiwyg:keymap', name: 'Tab', command: () => () => true },
  { __type: 'wysiwyg:keymap', name: 'Shift-Tab', command: () => () => true },
  {
    __type: 'wysiwyg:keymap',
    name: 'Mod-b',
    ifMark: 'strong',
    command: schema => toggleMark(schema.marks.strong),
  },
  {
    __type: 'wysiwyg:keymap',
    name: 'Mod-i',
    ifMark: 'em',
    command: schema => toggleMark(schema.marks.em),
  },
  {
    __type: 'wysiwyg:keymap',
    name: 'Mod-k',
    ifMark: 'link',
    command: schema => {
      const toggleLink = toggleMark(schema.marks.link, {
        href: '',
        title: '',
        creating: 'creating',
        editing: 'editing',
      })

      return function(state: any, dispatch: any) {
        if (!(state.selection as any).$cursor) {
          return toggleLink(state as any, dispatch)
        }
        return false
      }
    },
  },
  {
    __type: 'wysiwyg:keymap',
    name: 'Mod-Enter',
    command: hardBreakCmd,
    ifNode: 'hard_break',
  },
  {
    __type: 'wysiwyg:keymap',
    name: 'Shift-Enter',
    command: hardBreakCmd,
    ifNode: 'hard_break',
  },
  {
    __type: 'wysiwyg:keymap',
    name: 'Ctrl-Enter',
    command: hardBreakCmd,
    ifNode: 'hard_break',
    ifMac: true,
  },
  {
    __type: 'wysiwyg:keymap',
    name: 'Mod-Alt-1',
    command: headingCmd(1),
    ifNode: 'heading',
  },
  {
    __type: 'wysiwyg:keymap',
    name: 'Mod-Alt-2',
    command: headingCmd(2),
    ifNode: 'heading',
  },
  {
    __type: 'wysiwyg:keymap',
    name: 'Mod-Alt-3',
    command: headingCmd(3),
    ifNode: 'heading',
  },
  {
    __type: 'wysiwyg:keymap',
    name: 'Mod-Alt-4',
    command: headingCmd(4),
    ifNode: 'heading',
  },
  {
    __type: 'wysiwyg:keymap',
    name: 'Mod-Alt-5',
    command: headingCmd(5),
    ifNode: 'heading',
  },
  {
    __type: 'wysiwyg:keymap',
    name: 'Mod-Alt-6',
    command: headingCmd(6),
    ifNode: 'heading',
  },

  {
    // TODO: NOT WORKING
    __type: 'wysiwyg:keymap',
    name: 'Backspace',
    command: () => deleteEmptyHeading,
    ifNode: 'heading',
  },
  {
    __type: 'wysiwyg:keymap',
    name: 'Mod-Alt-7',
    command: () => toggleOrderedList,
    ifNode: 'ordered_list',
  },
  {
    __type: 'wysiwyg:keymap',
    name: 'Mod-Alt-8',
    command: () => toggleBulletList,
    ifNode: 'bullet_list',
  },
  {
    __type: 'wysiwyg:keymap',
    name: 'Mod-Alt-9',
    command: schema => liftListItem(schema.nodes.list_item),
    onCondition(schema) {
      return !!(schema.nodes.bullet_list || schema.nodes.ordered_list)
    },
  },
  {
    __type: 'wysiwyg:keymap',
    name: 'Mod-Alt-0',
    command: schema => setBlockType(schema.nodes.code_block),
    ifNode: 'code_block',
  },
  {
    __type: 'wysiwyg:keymap',
    name: 'ArrowLeft',
    command: () => arrowHandler('left'),
    ifNode: 'code_block',
  },
  {
    __type: 'wysiwyg:keymap',
    name: 'ArrowRight',
    command: () => arrowHandler('right'),
    ifNode: 'code_block',
  },
  {
    __type: 'wysiwyg:keymap',
    name: 'ArrowUp',
    command: () => arrowHandler('up'),
    ifNode: 'code_block',
  },
  {
    __type: 'wysiwyg:keymap',
    name: 'ArrowDown',
    command: () => arrowHandler('down'),
    ifNode: 'code_block',
  },
  {
    __type: 'wysiwyg:keymap',
    name: 'Mod-0',
    ifMark: 'code',
    command: schema => toggleMark(schema.marks.code),
  },
  {
    __type: 'wysiwyg:keymap',
    name: 'Mod->',
    ifNode: 'blockquote',
    command: schema => wrapIn(schema.nodes.blockquote),
  },
  {
    __type: 'wysiwyg:keymap',
    name: 'Mod-<',
    ifNode: 'blockquote',
    command: () => liftBlockquote,
  },
  {
    __type: 'wysiwyg:keymap',
    name: 'Mod-Alt-9',
    ifNode: 'paragraph',
    command: schema => setBlockType(schema.nodes.paragraph),
  },
  {
    __type: 'wysiwyg:keymap',
    name: 'Shift-Ctrl-0',
    ifNode: 'paragraph',
    command: schema => setBlockType(schema.nodes.paragraph),
  },
  {
    __type: 'wysiwyg:keymap',
    name: 'Mod-Enter',
    ifNode: 'horizontal_rule',
    command: () => insertHr,
  },
  {
    __type: 'wysiwyg:keymap',
    name: 'Enter',
    ifNode: 'list_item',
    command: schema => splitListItem(schema.nodes.list_item),
  },
  {
    __type: 'wysiwyg:keymap',
    name: 'Tab',
    ifNode: 'list_item',
    command: schema => sinkListItem(schema.nodes.list_item),
  },
  {
    __type: 'wysiwyg:keymap',
    name: 'Shift-Tab',
    ifNode: 'list_item',
    command: schema => liftListItem(schema.nodes.list_item),
  },
]

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
    const $start = tr.doc.resolve(range.start)
    // Get the
    console.log({
      range,
      $start,
      parent: range.parent,
    })
    dispatch((tr as any).setNodeMarkup(range.start - 1, listType))
    return true
  }
}
