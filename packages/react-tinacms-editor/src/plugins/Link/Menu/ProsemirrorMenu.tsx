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
import { isMarkPresent } from '../../../utils'
import { imagePluginKey } from '../../Image'

export const ProsemirrorMenu = markControl({
  mark: 'link',
  Icon: LinkIcon,
  tooltip: 'Link',
  selectionOnly: true,
  defaultAttrs: {
    href: '',
    title: '',
  },
  noMix: ['code'],
  isDisabled: (view: EditorView) => {
    if (view.state.selection.empty) return true
    return (
      isMarkPresent(view.state, view.state.schema.marks.link) ||
      !!imagePluginKey.getState(view.state).selectedImage
    )
  },
  onClick: (view: EditorView) => {
    const { state, dispatch } = view
    return dispatch(state.tr.setMeta('show_link_toolbar', true))
  },
})
