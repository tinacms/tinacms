import { EditorState, Selection } from 'prosemirror-state'
import { NodeType, Node } from 'prosemirror-model'

export function deleteEmptyHeading(state: EditorState, dispatch: any) {
  const { $cursor } = state.selection as any
  if (!$cursor) return false
  const node = state.doc.nodeAt(Math.max($cursor.pos - 1, 0))
  if (!node) return false
  if (node.type != state.schema.nodes.heading) return false
  if (node.textContent.length) return false
  if (dispatch) {
    dispatch(
      state.tr
        // Replace the entire heading with an empty paragraph
        .replaceRangeWith(
          $cursor.pos - 1,
          $cursor.pos + node.nodeSize - 1,
          state.schema.nodes.paragraph.create()
        )
        // Set the seleciton to be at the start of the paragram
        .setSelection(Selection.near(state.doc.resolve($cursor.pos - 1)))
    )
  }
  return true
}

export function toggleHeader(
  nodeType: NodeType,
  attrs: any,
  fallBackNodeType: NodeType,
  fallbackAttrs: any
) {
  return function(state: EditorState, dispatch: Function) {
    const { from, to } = state.selection
    let firstTextblock: Node | null = null
    let firstPos = -1
    // Find the first textblock
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (firstTextblock) return false
      if (node.isTextblock) {
        firstTextblock = node
        firstPos = pos
      }
      return true
    })

    if (!firstTextblock || firstPos < 0) return false

    const $firstPos = state.doc.resolve(firstPos)
    const index = $firstPos.index()

    const setAsParagraph = state.selection.$head.parent.attrs.level == attrs.level
    const nextNodeType = setAsParagraph ? fallBackNodeType : nodeType
    const nextAttrs = setAsParagraph ? fallbackAttrs : attrs

    if (!$firstPos.parent.canReplaceWith(index, index + 1, nextNodeType))
      return false

    if (dispatch) {
      dispatch(
        (state.tr.setBlockType(
          from,
          to,
          nextNodeType,
          nextAttrs
        ) as any).scrollIntoView()
      )
    }

    return true
  }
}
