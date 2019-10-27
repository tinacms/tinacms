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

import { exitCode } from 'prosemirror-commands'
import { redo, undo } from 'prosemirror-history'
import { Node } from 'prosemirror-model'
import { Selection, TextSelection } from 'prosemirror-state'
import { EditorView, NodeView } from 'prosemirror-view'
import {
  deleteEmptyCodeblock,
  exitCodeUp,
  exitCodeHard,
} from '../../commands/codeblock-commands'

// TODO
type CodeMirrorEditor = any

const ssr = typeof navigator == 'undefined'
const mac =
  typeof navigator != 'undefined' ? /Mac/.test(navigator.platform) : false

let CodeMirror: any = null

if (!ssr) {
  CodeMirror = require('codemirror')
}

export class CodeBlockView implements NodeView {
  cm: CodeMirrorEditor
  dom?: HTMLElement
  updating: boolean = false

  constructor(
    protected node: Node,
    protected view: EditorView,
    protected getPos: () => number
  ) {
    if (ssr) return
    this.cm = this.setupCodeMirror(node)
    this.dom = this.cm.getWrapperElement()
    setTimeout(() => this.cm.refresh(), 20)
    this.cm.on('cursorActivity', this.onCursorActivity)
    this.cm.on('changes', this.onChange)
    this.cm.on('focus', this.forwardSelection)
  }

  onCursorActivity = () => {
    if (!this.updating) {
      this.forwardSelection()
    }
  }

  /**
   * When CodeMirror's Selection is changed, a transaction is dispatched to
   * update the ProseMirror editor's Selection.
   */
  forwardSelection = () => {
    if (!this.cm.hasFocus()) return
    const state = this.view.state
    const selection = this.asProseMirrorSelection(state.doc)
    if (!selection.eq(state.selection as any)) {
      this.view.dispatch(state.tr.setSelection(selection as any))
    }
  }

  onChange = () => {
    if (!this.updating) {
      this.valueChanged()
    }
  }

  /**
   * If the code block is changed, a ProseMirror transaction is dispatched
   * to keep the two editors in sync.
   */
  valueChanged() {
    const change = computeChange(this.node.textContent, this.cm.getValue())
    if (change) {
      const codeBlockStart = this.getPos() + 1
      const schema = this.view.state.schema
      const tr = this.view.state.tr.replaceWith(
        codeBlockStart + change.from,
        codeBlockStart + change.to,
        change.text ? schema.text(change.text) : null
      )
      this.view.dispatch(tr as any) // Damn typings :(
    }
  }

  /**
   * Creates a ProseMirror TextSelection based off the CodeMirror selection.
   */
  asProseMirrorSelection(doc: Node): Selection {
    const offset = this.getPos() + 1
    const anchor = this.cm.indexFromPos(this.cm.getCursor('anchor')) + offset
    const head = this.cm.indexFromPos(this.cm.getCursor('head')) + offset
    return TextSelection.create(doc, anchor, head)
  }

  /**
   * Set's the CodeMirror selection given the anchor and head.
   */
  setSelection(anchor: number, head: number) {
    this.cm.focus()
    this.updating = true
    this.cm.setSelection(
      this.cm.posFromIndex(anchor),
      this.cm.posFromIndex(head)
    )
    this.updating = false
  }

  /**
   * Creates a new instance of CodeMirror from a ProseMirror Node
   */
  setupCodeMirror(node: Node): CodeMirrorEditor {
    return CodeMirror(null, {
      value: node.textContent,
      lineNumbers: true,
      extraKeys: this.codeMirrorKeymap(),
      mode: node.attrs.params,
      theme: 'forestry',
    }) as CodeMirrorEditor
  }

  /**
   * Generates a Keymap for the CodeMirror instance.
   */
  codeMirrorKeymap() {
    const view = this.view
    const mod = mac ? 'Cmd' : 'Ctrl'
    return CodeMirror.normalizeKeyMap({
      Up: () => this.maybeEscape('line', -1),
      Left: () => this.maybeEscape('char', -1),
      Down: () => this.maybeEscape('line', 1),
      Right: () => this.maybeEscape('char', 1),
      Backspace: () => {
        if (
          !deleteEmptyCodeblock(this.cm)(this.view.state, this.view.dispatch)
        ) {
          return CodeMirror.Pass
        }
        this.view.focus()
      },
      [`${mod}-Z`]: () => undo(view.state as any, view.dispatch as any),
      [`Shift-${mod}-Z`]: () => redo(view.state as any, view.dispatch as any),
      [`${mod}-Shift-Enter`]: () => {
        const pos = this.cm.getCursor()

        if (this.cm.somethingSelected() || pos.line != this.cm.firstLine()) {
          return CodeMirror.Pass
        }

        if (view.state.selection.$anchor.parentOffset) {
          const pos = view.state.selection.$anchor.pos
          view.dispatch(
            view.state.tr.setSelection(Selection.near(
              this.view.state.doc.resolve(pos - 1),
              -1
            ) as any)
          )
        }

        if (exitCodeUp(view.state, view.dispatch)) {
          view.focus()
        }
        return true
      },
      ['Shift-Enter']: () => {
        const pos = this.cm.getCursor()

        if (this.cm.somethingSelected() || pos.line != this.cm.lastLine()) {
          return CodeMirror.Pass
        }

        if (view.state.selection.$anchor.parentOffset) {
          const pos = view.state.selection.$anchor.pos
          view.dispatch(
            view.state.tr.setSelection(Selection.near(
              this.view.state.doc.resolve(pos - 1),
              -1
            ) as any)
          )
        }

        if (exitCode(view.state, view.dispatch)) {
          return view.focus()
        } else if (exitCodeHard(view.state, view.dispatch)) {
          return view.focus()
        }
      },
    })
  }

  maybeEscape(unit: string, dir: number) {
    const pos = this.cm.getCursor()
    if (
      this.cm.somethingSelected() ||
      pos.line != (dir < 0 ? this.cm.firstLine() : this.cm.lastLine()) ||
      (unit == 'char' &&
        pos.ch != (dir < 0 ? 0 : this.cm.getLine(pos.line).length))
    ) {
      return CodeMirror.Pass
    }

    const targetPos = this.getPos() + (dir < 0 ? 0 : this.node.nodeSize)
    const selection = Selection.near(this.view.state.doc.resolve(targetPos), dir)
    const atEndOfDocument = !(
      selection.$from.pos + 1 <
      (this.view.state.doc.content as any).size
    )

    if (atEndOfDocument) {
      return CodeMirror.Pass
    }

    this.view.dispatch(this.view.state.tr.setSelection(selection as any))
    this.view.focus()
  }

  /**
   * When the Prosemirror Node is updated, compute the change between the
   * ProseMirror and CodeMirror. Then update CodeMirror to match ProseMirror.
   */
  update(node: Node) {
    if (node.type != this.node.type) return false
    this.node = node
    const change = computeChange(this.cm.getValue(), node.textContent)
    if (change) {
      this.updating = true
      this.cm.replaceRange(
        change.text,
        this.cm.posFromIndex(change.from),
        this.cm.posFromIndex(change.to)
      )
      this.updating = false
    }
    return true
  }

  /**
   * Called by ProseMirror when the CodeView is clicked.
   */
  selectNode() {
    this.cm.focus()
  }

  /**
   * Prevents Events in here from bubbling.
   */
  stopEvent() {
    return true
  }
}

interface Change {
  from: number
  to: number
  text: string
}

function computeChange(oldVal: string, newVal: string): Change | null {
  if (oldVal == newVal) return null

  let start = 0
  let oldEnd = oldVal.length
  let newEnd = newVal.length

  while (start < oldEnd && oldVal.charCodeAt(start) == newVal.charCodeAt(start))
    ++start
  while (
    oldEnd > start &&
    newEnd > start &&
    oldVal.charCodeAt(oldEnd - 1) == newVal.charCodeAt(newEnd - 1)
  ) {
    oldEnd--
    newEnd--
  }
  return { from: start, to: oldEnd, text: newVal.slice(start, newEnd) }
}
