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

import { EditorView } from 'prosemirror-view'
import { LinkIcon } from '@tinacms/icons'

import { markControl } from '../../../components/MenuHelpers'
import { isMarkPresent, formatKeymap } from '../../../utils'
import { imagePluginKey } from '../../Image'

export const ProsemirrorMenu = markControl({
  mark: 'link',
  Icon: LinkIcon,
  tooltip: formatKeymap('Link Mod-K'),
  selectionOnly: true,
  defaultAttrs: {
    href: '',
    title: '',
  },
  noMix: ['code'],
  isDisabled: (view: EditorView) => {
    const { schema, selection } = view.state
    const { marks, nodes } = schema
    if (selection.empty) return true
    const selectedNode = selection.$from.node()
    const imagePluginState = imagePluginKey.getState(view.state)
    return (
      isMarkPresent(view.state, marks.link) ||
      !!imagePluginState?.selectedImage ||
      (selectedNode && selectedNode.type === nodes.code_block)
    )
  },
  onClick: (view: EditorView) => {
    const { state, dispatch } = view
    return dispatch(state.tr.setMeta('show_link_toolbar', true))
  },
})
