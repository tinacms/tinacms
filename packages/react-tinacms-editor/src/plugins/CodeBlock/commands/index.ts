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

import { EditorState, Selection, TextSelection } from 'prosemirror-state'

export function exitCodeHard(state: EditorState, dispatch: any) {
  const { $head } = state.selection
  const above = $head.node(-1) as any
  const after = $head.indexAfter(-1)
  const type = above.defaultContentType(after)
  if (dispatch) {
    const pos = $head.before()
    const tr: any = state.tr.replaceWith(pos, pos, type.createAndFill())
    tr.setSelection(Selection.near(tr.doc.resolve(pos), 1))
    dispatch(tr.scrollIntoView())
  }
  return true
}

export function exitCodeUp(state: EditorState, dispatch: any) {
  const { $head, $anchor } = state.selection
  if (!$head.parent.type.spec.code || !$head.sameParent($anchor)) return false
  const above: any = $head.node(-1)
  const after = $head.indexAfter(-1)
  const type = above.defaultContentType(after)
  if (!above.canReplaceWith(after, after, type)) return false
  if (dispatch) {
    const pos = $head.before()
    const tr: any = state.tr.replaceWith(pos, pos, type.createAndFill())
    tr.setSelection(Selection.near(tr.doc.resolve(pos), -1))
    dispatch(tr.scrollIntoView())
  }
  return true
}

export function deleteEmptyCodeblock(cm: any) {
  return (state: any, dispatch: any) => {
    // Todo: It would be nice to have a way to get this without CodeMirror being passed in.
    const pos = cm.getCursor()
    const code = cm.getValue()
    const codeWithoutInvisibles = code.replace(/[ \r\n]/g, '')
    const shouldRemove = !codeWithoutInvisibles
    if (!(pos.line == 0 && pos.ch == 0 && shouldRemove)) {
      return false
    }

    const { $from } = state.selection

    if (dispatch) {
      // I hate my life
      const { schema, tr } = state
      dispatch(
        (tr
          // Replace the entire codeblock with an empty paragraph
          .replaceRangeWith(
            $from.pos - 1,
            $from.pos + code.length + 1,
            schema.nodes.paragraph.create()
          ) as any)
          // Set the seleciton to be at the start of the paragram
          .setSelection(new TextSelection(tr.doc.resolve($from.pos)))
      )
    }

    return true
  }
}
