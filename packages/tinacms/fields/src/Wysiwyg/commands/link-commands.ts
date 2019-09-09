import { Mark, MarkType, ResolvedPos } from "prosemirror-model"
import { EditorState } from "prosemirror-state"
import { EditorView } from "prosemirror-view"

export function renderLinkForm(view: EditorView, link: Element) {
  const tr = view.state.tr
  tr.setMeta("type", "forestry/render")
  tr.setMeta("clickTarget", link)
  view.dispatch(tr)
}

export function insertLinkToFile(state: EditorState, dispatch: Function, url: string) {
  url = url || ""
  let filenamePath = url.split("/")
  let filename = decodeURI(filenamePath[filenamePath.length - 1]) || "Download File"
  let attrs = { title: filename, href: url, editing: "", creating: "" }
  let schema = state.schema
  let node = schema.text(attrs.title, [schema.marks.link.create(attrs)])
  dispatch(state.tr.replaceSelectionWith(node, false))
  return true
}

export function unmountLinkForm(view: EditorView) {
  const tr = view.state.tr
  tr.setMeta("type", "forestry/unmount")
  view.dispatch(tr)
}

/**
 * Sets `editing="editing"` on the link at the current cursor position
 * so that the LinkForm will be shown.
 *
 * @param {EditorState} state
 * @param {(tr: Transaction) => void} dispatch
 */
export function startEditingLink(state: EditorState, dispatch: Function) {
  const linkMarkType = state.schema.marks["link"]

  const $cursor: ResolvedPos = (state.selection as any).$cursor
  const tr = state.tr

  if (!$cursor) return false
  let node = state.doc.nodeAt($cursor.pos)
  if (!node || !linkMarkType.isInSet(node.marks)) return false

  if (dispatch) {
    const { from, to, mark } = markExtend($cursor, linkMarkType)
    const attrs = {
      ...(mark ? mark.attrs : {}),
      editing: "editing",
      creating: "",
    }
    tr.addMark(from, to, linkMarkType.create(attrs))
    dispatch(tr.scrollIntoView())
  }

  return true
}

declare let window: any

function markExtend($cursor: ResolvedPos, markType: MarkType) {
  window.$cursor = $cursor
  let startIndex = $cursor.index()
  let endIndex = $cursor.indexAfter()

  // Clicked outside edge of tag.
  if (startIndex === $cursor.parent.childCount) {
    startIndex--
    endIndex--
  }

  const mark = markType.isInSet($cursor.parent.child(startIndex).marks)
  // TODO: This might be a problem.
  const hasMark = (index: number) => mark!.isInSet($cursor.parent.child(index).marks)

  while (startIndex > 0 && hasMark(startIndex - 1)) {
    startIndex--
  }
  while (endIndex < $cursor.parent.childCount && hasMark(endIndex)) {
    endIndex++
  }

  let startPos = $cursor.start()
  let endPos = startPos

  for (let i = 0; i < endIndex; i++) {
    let size = $cursor.parent.child(i).nodeSize
    if (i < startIndex) startPos += size
    endPos += size
  }

  return { from: startPos, to: endPos, mark }
}

/**
 * Finds all Links in the document and makes sure they're not being edited.
 *
 * @param {EditorState} state
 * @param {(tr: Transaction) => void} dispatch
 * @returns {boolean}
 */
export function stopEditingLink(state: EditorState, dispatch: Function) {
  let changes: { from: number; to: number; mark: Mark }[] = []

  const linkMarkType = state.schema.marks["link"]
  state.doc.descendants((node, i) => {
    let linkMark = linkMarkType.isInSet(node.marks)

    if (linkMark && linkMark.attrs.editing == "editing") {
      const attrs = {
        ...linkMark.attrs,
        editing: "",
        creating: "",
      }
      changes.push({
        from: i,
        to: i + node.nodeSize,
        mark: linkMarkType.create(attrs),
      })
    }
  })

  if (!changes.length) return false

  if (dispatch) {
    const tr = state.tr
    changes.forEach(({ from, to, mark }) => tr.addMark(from, to, mark))
    dispatch(tr)
  }

  return true
}

/**
 * Finds the Link currently being edited and sets it's attributes.
 *
 * @param {EditorState} state
 * @param {(tr: Transaction) => void} dispatch
 * @param {Object} attrs
 */
export function updateLinkBeingEdited(state: EditorState, dispatch: Function, attrs: object) {
  if (dispatch) {
    const linkMarkType = state.schema.marks["link"]
    const tr = state.tr

    state.doc.descendants((node, i) => {
      const linkMark = linkMarkType.isInSet(node.marks)

      if (linkMark && linkMark.attrs.editing) {
        const from = i
        const to = from + node.nodeSize
        tr.addMark(from, to, linkMarkType.create(attrs))
      }
    })

    dispatch(tr.scrollIntoView())
  }
  return true
}

export function removeLinkBeingEdited(state: EditorState, dispatch: Function) {
  if (dispatch) {
    const linkMarkType = state.schema.marks["link"]
    const tr = state.tr

    state.doc.descendants((node, i) => {
      const linkMark = linkMarkType.isInSet(node.marks)

      if (linkMark && linkMark.attrs.editing) {
        const from = i
        const to = from + node.nodeSize
        tr.removeMark(from, to, linkMark)
      }
    })

    dispatch(tr.scrollIntoView())
  }
  return true
}
