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

import { EditorState } from 'prosemirror-state'
import { liftListItem, wrapInList } from 'prosemirror-schema-list'

export function toggleBulletList(state: EditorState, dispatch: any) {
  const lift = liftListItem(state.schema.nodes.list_item)
  const wrap = wrapInList(state.schema.nodes.bullet_list)
  const canDo = wrap(state, dispatch) || lift(state, dispatch)
  return canDo
}

export function toggleOrderedList(state: EditorState, dispatch: any) {
  const lift = liftListItem(state.schema.nodes.list_item)
  const wrap = wrapInList(state.schema.nodes.ordered_list)
  return wrap(state, dispatch) || lift(state, dispatch)
}
