import { EditorState } from 'prosemirror-state'
import { setBlockType } from 'prosemirror-commands'
import { findParentNode } from 'prosemirror-utils'

export function textAlign(state: EditorState, dispatch: any, className: string) {
  const { heading, paragraph } = state.schema.nodes
  const predicate = (node: any) => node.type === heading || node.type === paragraph
  const parent = findParentNode(predicate)(state.selection)
  if (!parent) return
  const { name } = parent.node.type
  return setBlockType(state.schema.nodes[name], { class: className })(state, dispatch)
}