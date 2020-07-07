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

import { TextSelection } from 'prosemirror-state'
import { TranslatorClass } from '../../../translator'
import { EditorView } from 'prosemirror-view'

export function updateEditorState(
  view: EditorView,
  translator: TranslatorClass,
  value: string
) {
  const doc = translator.nodeFromString(value)
  if (!doc) return
  const { state, dispatch } = view
  const { tr } = state
  dispatch(
    tr
      .setSelection(
        new TextSelection(
          tr.doc.resolve(0),
          tr.doc.resolve(state.doc.nodeSize - 2)
        )
      )
      .replaceSelectionWith(doc)
      .setMeta('input-update', true)
  )
}
