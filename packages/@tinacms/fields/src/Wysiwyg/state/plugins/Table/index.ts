import { Plugin, PluginKey } from 'prosemirror-state'
import { Node } from 'prosemirror-model'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { findParentNodeOfType, findChildren } from 'prosemirror-utils'

export const blockPluginKey = new PluginKey('block')

export const tablePlugin = new Plugin({
  key: blockPluginKey,

  state: {
    init: () => {
      return { deco: DecorationSet.empty }
    },
    apply(_1, _2, _3, newState) {
      const { selection } = newState
      if (selection) {
        const { table, table_header } = newState.schema.nodes
        const tableNode = findParentNodeOfType(table)(selection)
        if (tableNode) {
          const tableHeaders = findChildren(
            tableNode.node,
            (node: Node) => node.type === table_header
          )
          const decorations = tableHeaders.map(({ pos }) => {
            const div = document.createElement('div')
            div.classList.add('tina_table_header_ext_top')
            return Decoration.widget(tableNode.start + pos + 1, div)
          })
          if (decorations.length)
            return {
              deco: DecorationSet.create(newState.doc, decorations),
            }
        }
      }
      return { deco: DecorationSet.empty }
    },
  },
  props: {
    decorations(state) {
      return (this as any).getState(state).deco
    },
  },
})
