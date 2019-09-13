import { EditorState } from "prosemirror-state"
import { liftListItem, wrapInList } from "prosemirror-schema-list"

export function toggleBulletList(state: EditorState, dispatch: any) {
  let lift = liftListItem(state.schema.nodes.list_item)
  let wrap = wrapInList(state.schema.nodes.bullet_list)
  let canDo = wrap(state, dispatch) || lift(state, dispatch)
  return canDo
}

export function toggleOrderedList(state: EditorState, dispatch: any) {
  let lift = liftListItem(state.schema.nodes.list_item)
  let wrap = wrapInList(state.schema.nodes.ordered_list)
  return wrap(state, dispatch) || lift(state, dispatch)
}
