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

import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view'
import { findParentNodeOfType } from 'prosemirror-utils'
import { TableMap, CellSelection } from 'prosemirror-tables'

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
              selectedTableMap: tableMap,
              selectedTable: tableNode,
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
    handleClickOn(
      view: EditorView,
      pos: number,
      node: any,
      nodePos: number,
      event: any,
      direct: boolean
    ) {
      if (!direct) return false
      console.log(nodePos)
      const targetClasses = event.target.classList
      const { state, dispatch } = view
      const tablePluginState = blockPluginKey.getState(state)
      let cellSelection
      if (targetClasses.contains('tina_table_header_ext_left')) {
        const { width } = tablePluginState.selectedTableMap
        cellSelection = new CellSelection(
          state.doc.resolve(nodePos + (width - 1) * 2),
          state.doc.resolve(nodePos)
        )
      }
      if (targetClasses.contains('tina_table_header_ext_top')) {
        const { height, width } = tablePluginState.selectedTableMap
        cellSelection = new CellSelection(
          state.doc.resolve(
            nodePos + width * (height - 1) * 2 + (height - 1) * 2
          ),
          state.doc.resolve(nodePos)
        )
      }
      if (targetClasses.contains('tina_table_header_ext_top_left')) {
        const { height, width } = tablePluginState.selectedTableMap

        console.log(nodePos, nodePos + height * width * 2 + height - 1)
        cellSelection = new CellSelection(
          state.doc.resolve(nodePos + height * width * 2 + height - 1),
          state.doc.resolve(nodePos)
        )
      }
      if (cellSelection) dispatch(state.tr.setSelection(cellSelection as any))
      return false
    },
  },
})
