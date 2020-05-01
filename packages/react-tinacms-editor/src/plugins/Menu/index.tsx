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

import React from 'react'

import { markControl } from './markControl'
import {
  toggleBulletList,
  toggleOrderedList,
} from '../../commands/list-commands'
import { insertTable } from '../../commands/table-commands'
import { setBlockType } from 'prosemirror-commands'
import { EditorState } from 'prosemirror-state'
import { findParentNodeOfType } from 'prosemirror-utils'
import {
  BoldIcon,
  CodeIcon,
  ItalicIcon,
  OrderedListIcon,
  TableIcon,
  UnderlineIcon,
  UnorderedListIcon,
} from '@tinacms/icons'
import { MenuButton } from './MenuComponents'
import { useEditorStateContext } from '../../context/editorState'

export const InlineControl = () => (
  <>
    <BoldControl />
    <ItalicControl />
    <UnderlineControl />
  </>
)

const BoldControl = markControl({
  mark: 'strong',
  Icon: BoldIcon,
  tooltip: 'Bold',
})

const ItalicControl = markControl({
  mark: 'em',
  Icon: ItalicIcon,
  tooltip: 'Italic',
})

const UnderlineControl = markControl({
  mark: 'underline',
  Icon: UnderlineIcon,
  tooltip: 'Underline',
})

export const commandContrl = (
  command: any,
  Icon: any, // Fix type
  _title: string,
  tooltip: string,
  focusOnCreate: boolean = true
) => ({ bottom }: { bottom: boolean }) => {
  const { editorView } = useEditorStateContext()
  const onClick = () => {
    if (canDo()) {
      const view = editorView!.view
      command(view.state, view.dispatch)

      if (focusOnCreate) {
        view.focus()
      }
    }
  }
  const canDo = () => command(editorView!.view.state)

  return (
    <MenuButton
      data-tooltip={tooltip}
      onClick={onClick}
      bottom={bottom}
      disabled={!canDo()}
    >
      <Icon />
    </MenuButton>
  )
}

function insertTableCmd(state: EditorState, dispatch: any) {
  const { table } = state.schema.nodes
  const { selection } = state
  const tableParent = findParentNodeOfType(table)(selection)
  if (tableParent) return false
  return insertTable(state, dispatch)
}
function makeCodeBlock(state: EditorState, dispatch: any) {
  return setBlockType(state.schema.nodes.code_block)(state, dispatch)
}

export const TableControl = commandContrl(
  insertTableCmd,
  TableIcon,
  'Table',
  'Table'
)

export const CodeControl = commandContrl(
  makeCodeBlock,
  CodeIcon,
  'Codeblock',
  'Codeblock',
  false
) //codeblock focusing messes with scroll

export const ListControl = (props: any) => (
  <>
    <BulletList {...props} />
    <OrderedList {...props} />
  </>
)

const BulletList = commandContrl(
  toggleBulletList,
  UnorderedListIcon,
  'Unordered List',
  'Unordered List'
)

const OrderedList = commandContrl(
  toggleOrderedList,
  OrderedListIcon,
  'Ordered List',
  'Ordered List'
)
