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
import { EditorState } from 'prosemirror-state'
import { MarkType, Mark } from 'prosemirror-model'

export const findElementOffsetTop = (
  element: HTMLElement,
  parent?: HTMLElement
) => {
  let target = element
  let offsetTop = target.offsetTop
  while (target.offsetParent && (!parent || target.offsetParent !== parent)) {
    target = target.offsetParent as HTMLElement
    offsetTop += target.offsetTop
  }
  return offsetTop
}

export const findElementOffsetLeft = (
  element: HTMLElement,
  parent?: HTMLElement
) => {
  let target = element
  let offsetLeft = target.offsetLeft
  while (target.offsetParent && (!parent || target.offsetParent !== parent)) {
    target = target.offsetParent as HTMLElement
    offsetLeft += target.offsetLeft
  }
  return offsetLeft
}

/**
 * Function will check if mark is present in selection.
 */
export const isMarkPresent = (state: EditorState, markType: MarkType) =>
  !!getMarkPresent(state, markType)

/**
 * Function will check if mark is present in selection.
 */
export const getMarkPresent = (state: EditorState, markType: MarkType) => {
  const { selection } = state
  const { anchor, head } = selection
  let start
  let end
  if (anchor < head) {
    start = anchor
    end = head
  } else {
    start = head
    end = anchor
  }
  start = selection.empty ? start : start + 1
  const mark = markType.isInSet(state.doc.resolve(start).marks())

  if (!mark) return false
  let markPresent: Mark | undefined = mark

  for (; start < end && markPresent; start += 1) {
    if (!markType.isInSet(state.doc.resolve(start).marks()))
      markPresent = undefined
  }

  return markPresent
}
