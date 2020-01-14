import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { findParentNodeOfType } from 'prosemirror-utils'
import { TableMap } from 'prosemirror-tables'

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
        const { table } = newState.schema.nodes
        const tableNode = findParentNodeOfType(table)(selection)
        if (tableNode) {
          const tableMap = TableMap.get(tableNode.node)
          const cellMap = tableMap.map
          const decorations = []
          const div = document.createElement('div')
          div.classList.add('tina_table_header_ext_top_left')
          decorations.push(Decoration.widget(tableNode.start + 2, div))
          for (let i = 0; i < tableMap.width; i++) {
            const div = document.createElement('div')
            div.classList.add('tina_table_header_ext_top')
            decorations.push(
              Decoration.widget(tableNode.start + cellMap[i] + 1, div)
            )
          }
          for (let i = 0; i < tableMap.height; i++) {
            const div = document.createElement('div')
            div.classList.add('tina_table_header_ext_left')
            decorations.push(
              Decoration.widget(
                tableNode.start + cellMap[i * tableMap.width] + 1,
                div
              )
            )
          }
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
