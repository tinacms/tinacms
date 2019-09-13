import { EditorState, Selection } from "prosemirror-state"

export function exitCodeHard(state: EditorState, dispatch: any) {
  let { $head } = state.selection
  let above = $head.node(-1) as any
  let after = $head.indexAfter(-1)
  let type = above.defaultContentType(after)
  if (dispatch) {
    let pos = $head.before()
    let tr: any = state.tr.replaceWith(pos, pos, type.createAndFill())
    tr.setSelection(Selection.near(tr.doc.resolve(pos), 1))
    dispatch(tr.scrollIntoView())
  }
  return true
}

export function exitCodeUp(state: EditorState, dispatch: any) {
  let { $head, $anchor } = state.selection
  if (!$head.parent.type.spec.code || !$head.sameParent($anchor)) return false
  let above: any = $head.node(-1)
  let after = $head.indexAfter(-1)
  let type = above.defaultContentType(after)
  if (!above.canReplaceWith(after, after, type)) return false
  if (dispatch) {
    let pos = $head.before()
    let tr: any = state.tr.replaceWith(pos, pos, type.createAndFill())
    tr.setSelection(Selection.near(tr.doc.resolve(pos), -1))
    dispatch(tr.scrollIntoView())
  }
  return true
}

export function deleteEmptyCodeblock(cm: any) {
  return (state: any, dispatch: any) => {
    // Todo: It would be nice to have a way to get this without CodeMirror being passed in.
    let pos = cm.getCursor()
    let code = cm.getValue()
    let codeWithoutInvisibles = code.replace(/[ \r\n]/g, "")
    let shouldRemove = !codeWithoutInvisibles
    if (!(pos.line == 0 && pos.ch == 0 && shouldRemove)) {
      return false
    }

    let { $from } = state.selection

    if (dispatch) {
      // I hate my life
      dispatch(
        (state.tr
          // Replace the entire codeblock with an empty paragraph
          .replaceRangeWith($from.pos - 1, $from.pos + code.length + 1, state.schema.nodes.paragraph.create()) as any) // <- Fucking types are wrong
          // Set the seleciton to be at the start of the paragram
          .setSelection(Selection.near(state.doc.resolve($from.pos - 1)))
      )
    }

    return true
  }
}
