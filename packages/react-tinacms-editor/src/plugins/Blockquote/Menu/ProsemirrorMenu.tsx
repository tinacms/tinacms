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

import { wrapIn } from 'prosemirror-commands'
import { EditorState } from 'prosemirror-state'
import { findParentNodeOfType } from 'prosemirror-utils'
import { QuoteIcon } from '@tinacms/icons'

import { commandControl } from '../../../components/MenuHelpers'

function wrapInBlockquote(state: EditorState, dispatch: any) {
  const { blockquote } = state.schema.nodes
  const { start, node } =
    findParentNodeOfType(blockquote)(state.selection) || {}
  if (start && node) {
    const { tr } = state
    const nodeRange = tr.doc
      .resolve(start + 1)
      .blockRange(tr.doc.resolve(start + node.nodeSize - 2))
    if (nodeRange) {
      if (dispatch) return dispatch(tr.lift(nodeRange, 0))
      else return true
    }
  }
  return wrapIn(state.schema.nodes.blockquote)(state, dispatch)
}

export const ProsemirrorMenu = commandControl(
  wrapInBlockquote,
  QuoteIcon,
  'Blockquote',
  'Blockquote'
)
