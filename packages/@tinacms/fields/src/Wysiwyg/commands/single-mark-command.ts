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

import { EditorState } from "prosemirror-state"
import { MarkType } from "prosemirror-model"

export function singleMarkCommand(markType: MarkType, getAttrs: any) {
  // Version 1
  return function command(state: EditorState, dispatch: any, match: any, start: number, end: number) {
    const attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs
    const tr = state.tr

    const offset = match[1].length
    const textGroup = 2

    if (match[textGroup]) {
      const textStart = start + 1 + offset
      const textEnd = textStart + match[textGroup].length

      const deleteStart: [number, number] = [textStart - 1, textStart]
      const nextChar = getNextChar(state, textEnd)
      const deleteEndEnd = nextChar ? 0 : 1
      const deleteEnd: [number, number] = [textEnd, textEnd + deleteEndEnd]
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
      tr.delete(...deleteEnd)
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
