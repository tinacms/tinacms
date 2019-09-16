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

interface KeymapPlugin {
  __type: 'wysiwyg:keymap'
  key: string
  command(schema: Schema): any // TODO Command
  ifMark?: string
  ifMac?: boolean
  unlessMac?: boolean
  onCondition?(schema: Schema): boolean
}

let hardBreakCmd = (schema: Schema) => {
  let br = schema.nodes.hard_break
  return chainCommands(exitCode, (state, dispatch) => {
    // @ts-ignore
    dispatch(state.tr.replaceSelectionWith(br.create()).scrollIntoView())
    return true
  })
}

let headingCmd = (level: number) => (schema: Schema) => {
  let heading = schema.nodes.heading
  return toggleHeader(heading, { level: 1 }, schema.nodes.paragraph, null)
}

const KEYMAP_PLUGINS: KeymapPlugin[] = [
  { __type: 'wysiwyg:keymap', key: 'Mod-z', command: () => undo },
  { __type: 'wysiwyg:keymap', key: 'Backspace', command: () => undoInputRule },
  { __type: 'wysiwyg:keymap', key: 'Mod-Shift-z', command: () => redo },
  {
    __type: 'wysiwyg:keymap',
    key: 'Mod-y',
    command: () => redo,
    unlessMac: true,
  },
  { __type: 'wysiwyg:keymap', key: 'Tab', command: () => () => true },
  { __type: 'wysiwyg:keymap', key: 'Shift-Tab', command: () => () => true },
  {
    __type: 'wysiwyg:keymap',
    key: 'Mod-b',
    ifMark: 'strong',
    command: schema => toggleMark(schema.marks.strong),
  },
  {
    __type: 'wysiwyg:keymap',
    key: 'Mod-i',
    ifMark: 'em',
    command: schema => toggleMark(schema.marks.em),
  },
  {
    __type: 'wysiwyg:keymap',
    key: 'Mod-k',
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
    key: 'Mod-Enter',
    command: hardBreakCmd,
    ifMark: 'hard_break',
  },
  {
    __type: 'wysiwyg:keymap',
    key: 'Shift-Enter',
    command: hardBreakCmd,
    ifMark: 'hard_break',
  },
  {
    __type: 'wysiwyg:keymap',
    key: 'Ctrl-Enter',
    command: hardBreakCmd,
    ifMark: 'hard_break',
    ifMac: true,
  },
  {
    __type: 'wysiwyg:keymap',
    key: 'Mod-Alt-1',
    command: headingCmd(1),
    ifMark: 'heading',
  },
  {
    __type: 'wysiwyg:keymap',
    key: 'Mod-Alt-2',
    command: headingCmd(2),
    ifMark: 'heading',
  },
  {
    __type: 'wysiwyg:keymap',
    key: 'Mod-Alt-3',
    command: headingCmd(3),
    ifMark: 'heading',
  },
  {
    __type: 'wysiwyg:keymap',
    key: 'Mod-Alt-4',
    command: headingCmd(4),
    ifMark: 'heading',
  },
  {
    __type: 'wysiwyg:keymap',
    key: 'Mod-Alt-5',
    command: headingCmd(5),
    ifMark: 'heading',
  },
  {
    __type: 'wysiwyg:keymap',
    key: 'Mod-Alt-6',
    command: headingCmd(6),
    ifMark: 'heading',
  },
  {
    __type: 'wysiwyg:keymap',
    key: 'Backspace',
    command: () => deleteEmptyHeading,
    ifMark: 'heading',
  },
  {
    __type: 'wysiwyg:keymap',
    key: 'Mod-Alt-7',
    command: () => toggleOrderedList,
    ifMark: 'ordered_list',
  },
  {
    __type: 'wysiwyg:keymap',
    key: 'Backspace',
    command: () => toggleBulletList,
    ifMark: 'bullet_list',
  },
  {
    __type: 'wysiwyg:keymap',
    key: 'Backspace',
    command: schema => liftListItem(schema.nodes.list_item),
    onCondition(schema) {
      return !!(schema.nodes.bullet_list || schema.nodes.ordered_list)
    },
  },
]

export function buildKeymap(schema: Schema, blockContent?: boolean) {
  let keys: any = {
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

  KEYMAP_PLUGINS.forEach(plugin => {
    let skip = false

    // Exit early if this is a Mac, and it shouldn't be added for Mac.
    if (plugin.unlessMac && mac) skip = true

    // Exit early if it is for a mark that doesn't exist.
    if (plugin.ifMark && !schema.marks[plugin.ifMark]) skip = true

    // Exit if condition not met
    if (plugin.onCondition && !plugin.onCondition(schema)) skip = true

    // Bind the command
    bind(plugin.key, plugin.command(schema))
  })

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
      let side = dir == 'left' || dir == 'up' ? -1 : 1
      let $head = state.selection.$head
      let nextPos = (Selection as any).near(
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
    let { $from, $to } = state.selection
    // @ts-ignore
    let range = $from.blockRange(
      $to,
      // @ts-ignore
      node => node.childCount && node.firstChild.type == listType
    )
    return range && state.doc.child(range.start).type == listType
  }
}

export function isNotAList(state: EditorState) {
  let { ordered_list, bullet_list } = state.schema.nodes
  let { $from, $to } = state.selection
  let range = $from.blockRange(
    $to,
    // @ts-ignore
    node =>
      node.childCount &&
      // @ts-ignore
      (node.firstChild.type == ordered_list ||
        // @ts-ignore
        node.firstChild.type == bullet_list)
  )
  return (
    range &&
    state.doc.child(range.start).type != ordered_list &&
    state.doc.child(range.start).type != bullet_list
  )
}

export function switchListType(listType: NodeType) {
  return function(state: EditorState, dispatch: any) {
    let itemType = state.schema.nodes.list_item
    let { $from, $to } = state.selection
    // @ts-ignore
    let range = $from.blockRange(
      $to,
      // @ts-ignore
      node => node.childCount && node.firstChild.type == itemType
    )
    if (!range) return false
    if (!dispatch) return true

    let tr = state.tr
    let $start = tr.doc.resolve(range.start)
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
