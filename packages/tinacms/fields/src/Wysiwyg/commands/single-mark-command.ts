import { EditorState } from "prosemirror-state"
import { MarkType } from "prosemirror-model"

export function singleMarkCommand(markType: MarkType, getAttrs: any) {
  // Version 1
  return function command(state: EditorState, dispatch: any, match: any, start: number, end: number) {
    let attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs
    let tr = state.tr

    let offset = match[1].length
    let textGroup = 2

    if (match[textGroup]) {
      let textStart = start + 1 + offset
      let textEnd = textStart + match[textGroup].length

      let deleteStart = [textStart - 1, textStart]
      const nextChar = getNextChar(state, textEnd)
      const deleteEndEnd = nextChar ? 0 : 1
      let deleteEnd = [textEnd, textEnd + deleteEndEnd]
      // console.log({
      //   match,
      //   start,
      //   end,
      //   offset,
      //   textStart,
      //   textEnd,
      //   deleteStart,
      //   deleteEnd,
      // })
      //@ts-ignore
      tr.delete(...deleteEnd)
      //@ts-ignore
      tr.delete(...deleteStart)
      end = start + match[textGroup].length + offset
    }

    tr.addMark(start + offset, end, markType.create(attrs))
    tr.removeStoredMark(markType)
    if (dispatch) {
      dispatch(tr)
    }
    return tr
  }
}

function getNextChar(state: EditorState, textEnd: number) {
  try {
    return state.doc.textBetween(textEnd + 1, textEnd + 2)
  } catch (e) {
    return ""
  }
}
