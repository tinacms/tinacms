import { EditorState, Selection } from 'prosemirror-state'
import { NodeType, Node } from 'prosemirror-model'

export function deleteEmptyHeading(state: EditorState, dispatch: any) {
  let { $cursor } = state.selection as any
  if (!$cursor) return false
  let node = state.doc.nodeAt(Math.max($cursor.pos - 1, 0))
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
    let { from, to } = state.selection
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

    let $firstPos = state.doc.resolve(firstPos)
    let index = $firstPos.index()

    let setAsParagraph = state.selection.$head.parent.attrs.level == attrs.level
    let nextNodeType = setAsParagraph ? fallBackNodeType : nodeType
    let nextAttrs = setAsParagraph ? fallbackAttrs : attrs

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
