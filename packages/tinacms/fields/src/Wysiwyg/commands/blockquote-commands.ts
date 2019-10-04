import { EditorState } from "prosemirror-state"
import { liftTarget } from "prosemirror-transform"
import { NodeType } from "prosemirror-model"

export function liftBlockquote(state: EditorState, dispatch: Function) {
  const range = getRangeForType(state, state.schema.nodes.blockquote)
  if (!range) return false

  const target = liftTarget(range)
  if (!target) return false

  if (dispatch) {
    dispatch(state.tr.lift(range, target)) //dont lift lists
  }
  return true
}

const getRangeForType = (state: EditorState, listType: NodeType) => {
  const { $from, $to } = state.selection
  const range = $from.blockRange($to, node => {
    return node.type == listType
  })
  return range
}
