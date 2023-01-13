/**

Copyright 2021 Forestry.io Holdings, Inc.

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
import { MarkType, Mark, Fragment } from 'prosemirror-model'

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
  return offsetTop < 0 ? 0 : offsetTop
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

const getOS = () => {
  // @ts-ignore
  if (typeof global['navigator'] === 'undefined') return 'Windows'
  const nAgt = navigator.userAgent
  const clientStrings = [
    { s: 'Windows', r: /Win16/ },
    { s: 'Windows', r: /(Windows 95|Win95|Windows_95)/ },
    { s: 'Windows', r: /(Win 9x 4.90|Windows ME)/ },
    { s: 'Windows', r: /(Windows 98|Win98)/ },
    { s: 'Windows', r: /Windows CE/ },
    { s: 'Windows', r: /(Windows NT 5.0|Windows 2000)/ },
    { s: 'Windows', r: /(Windows NT 5.1|Windows XP)/ },
    { s: 'Windows', r: /Windows NT 5.2/ },
    { s: 'Windows', r: /Windows NT 6.0/ },
    { s: 'Windows', r: /(Windows 7|Windows NT 6.1)/ },
    { s: 'Windows', r: /(Windows 8.1|Windows NT 6.3)/ },
    { s: 'Windows', r: /(Windows 8|Windows NT 6.2)/ },
    { s: 'Windows', r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/ },
    { s: 'Linux', r: /(Linux|X11)/ },
    { s: 'iOS', r: /(iPhone|iPad|iPod)/ },
    { s: 'Mac OS X', r: /Mac OS X/ },
    { s: 'Mac OS', r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/ },
    { s: 'QNX', r: /QNX/ },
    { s: 'UNIX', r: /UNIX/ },
    { s: 'BeOS', r: /BeOS/ },
  ]

  const keys: { [key: number]: any } = Object.keys(clientStrings)
  for (let i = 0; i < clientStrings.length; i += 1) {
    const clientObj = clientStrings[keys[i]]
    if (clientObj.r.test(nAgt)) {
      return clientObj.s
    }
  }

  return ''
}

export const formatKeymap = (keymapStr: string) => {
  const os = getOS()
  const mod = os === 'Windows' ? '^' : '⌘'

  let formattedKeymap = keymapStr
  formattedKeymap = formattedKeymap.replace('Mod', mod)
  formattedKeymap = formattedKeymap.replace('Shift', '⇧')
  formattedKeymap = formattedKeymap.replace('Alt', '⌥')
  return formattedKeymap
}

export const getAllMarkOccurrences = (content: Fragment, markName: string, allAnchors: string[] = []) => {
  content.forEach(item => {
    if (item.marks.length > 0) {
      item.marks.forEach((mark: any) => {
        if (mark.type?.name === markName) {
          allAnchors.push(mark.attrs.name)
        }
      })
    } else if (item.content.size > 0) getAllMarkOccurrences(item.content, markName, allAnchors)
  })
  return allAnchors
}
