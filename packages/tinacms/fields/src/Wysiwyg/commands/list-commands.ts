import { EditorState } from "prosemirror-state"
import { liftListItem, wrapInList } from "prosemirror-schema-list"

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
