import { EditorState } from "prosemirror-state"

export function insertImage(state: EditorState, dispatch: Function, src: string) {
  const nodeType = state.schema.nodes["image"]
  const image = nodeType.createAndFill({ src, alt: "", title: "" })
  if (dispatch) {
    dispatch(state.tr.replaceSelectionWith(image))
  }
  return true
}

export function alignImage(
  state: EditorState,
  dispatch: Function,
  at: number,
  direction: "left" | "right" | "center" | ""
) {
  const node = state.doc.nodeAt(at)
  if (!node || node.type !== state.schema.nodes.image) return false
  const attrs = {
    ...node.attrs,
    align: node.attrs.align === direction ? null : direction,
  }

  if (dispatch) {
    dispatch((state.tr as any).setNodeMarkup(at, node.type, attrs, node.marks) as any)
  }
  return true
}

export function removeImage(state: EditorState, dispatch: Function, at: number) {
  const from = at
  const to = from + 1
  const node = state.doc.nodeAt(from)
  if (!node || node.type != state.schema.nodes.image) return false
  if (dispatch) {
    dispatch(state.tr.delete(from, to) as any)
  }
  return true
}
