import { Node } from 'prosemirror-model'
import { Decoration, EditorView, NodeView } from 'prosemirror-view'

import { CodeBlockView } from './CodeBlockView'

type NodeViews = {
  [name: string]: (
    node: Node,
    view: EditorView,
    getPos: () => number,
    decorations: Decoration[]
  ) => NodeView
} | null

export const nodeViews: NodeViews = {
  code_block(node, view, getPos) {
    return new CodeBlockView(node, view, getPos)
  },
}
