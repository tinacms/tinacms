/**

Copyright 2021 Forestry.io Holdings, Inc.

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

import { EditorView } from 'prosemirror-view'
// @ts-ignore
import { FlagIcon } from '@einsteinindustries/tinacms-icons'

import { markControl } from '../../../components/MenuHelpers'
import { isMarkPresent } from '../../../utils'
import { imagePluginKey } from '../../Image'
import { openAnchorPopup } from '../commands'

export const ProsemirrorMenu = markControl({
  mark: 'anchor',
  Icon: FlagIcon,
  tooltip: 'Anchor',
  selectionOnly: true,
  noMix: ['code'],
  isDisabled: (view: EditorView) => {
    const { schema, selection } = view.state
    const { marks, nodes } = schema
    if (selection.empty && !isMarkPresent(view.state, marks.anchor)) return true
    const selectedNode = selection.$from.node()
    const imagePluginState = imagePluginKey.getState(view.state)
    return (
      !!imagePluginState?.selectedImage ||
      (selectedNode && selectedNode.type === nodes.code_block)
    )
  },
  onMenuOptionClick: (view: EditorView) => {
    const { state, dispatch } = view
    return openAnchorPopup(state, dispatch)
  },
})
