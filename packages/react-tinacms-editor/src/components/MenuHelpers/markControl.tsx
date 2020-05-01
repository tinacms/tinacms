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

import * as React from 'react'
import { EditorView } from 'prosemirror-view'
import { toggleMark } from 'prosemirror-commands'

import { useEditorStateContext } from '../../context/editorState'
import { MenuButton } from './MenuButton'

export interface Options {
  mark: string
  Icon: any // Fix type
  title?: string
  defaultAttrs?: any
  selectionOnly?: boolean
  tooltip?: string
  noMix?: string[]
  isDisabled?: (view: EditorView) => boolean
  onClick?: (view: EditorView) => void
}

export function markControl({
  mark,
  Icon,
  tooltip,
  defaultAttrs,
  selectionOnly = false,
  noMix = [],
  isDisabled,
  onClick,
}: Options) {
  return () => {
    const { editorView } = useEditorStateContext()
    const view = editorView!.view

    const markType = (markName: string) => {
      const schema = view.state.schema
      return schema.marks[markName]
    }

    const isActive = () => markIsActive(mark)

    const markIsActive = (markName: string): boolean => {
      const { state } = view
      const mark = markType(markName)
      const { from, $from, to, empty } = state.selection
      if (empty) return !!mark.isInSet(state.storedMarks || $from.marks())
      else return state.doc.rangeHasMark(from, to, mark)
    }

    const isOptionDisabled = () => {
      if (isDisabled) return isDisabled(view)
      if (mark === 'image')
        if (selectionOnly) {
          const { $cursor } = view.state.selection as any
          return !!$cursor || isInCodeBlock() || isIncompatibleMarksAreActive()
        }

      return isInCodeBlock() || isIncompatibleMarksAreActive()
    }

    const isInCodeBlock = () => {
      const node = view.state.selection.$from.node(
        view.state.selection.$from.depth
      )
      return node.type === view.state.schema.nodes.code_block
    }

    const isIncompatibleMarksAreActive = () => {
      return noMix
        .map(markIsActive)
        .reduce(
          (someMarkActive, nextMarkActive) => nextMarkActive || someMarkActive,
          false
        )
    }

    const onOptionClick = () => {
      if (onClick) {
        onClick(view)
      }
      if (isOptionDisabled()) return
      const { state, dispatch } = view

      if ((state.selection as any).$cursor && selectionOnly) {
        return
      }

      toggleMark(markType(mark), defaultAttrs)(state, dispatch)
    }

    if (!markType(mark)) {
      return null
    }
    return (
      <MenuButton
        data-tooltip={tooltip}
        data-side="top"
        onClick={onOptionClick}
        active={!isOptionDisabled() && isActive()}
        disabled={isOptionDisabled()}
      >
        <Icon />
      </MenuButton>
    )
  }
}
