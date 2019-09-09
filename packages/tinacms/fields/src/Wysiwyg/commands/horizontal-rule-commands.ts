import { EditorState } from "prosemirror-state"

export function insertHr(state: EditorState, dispatch: Function) {
  const type = state.schema.nodes.horizontal_rule
  if (dispatch) {
    dispatch(state.tr.replaceSelectionWith(type.create()).scrollIntoView())
  }
  return true
}
