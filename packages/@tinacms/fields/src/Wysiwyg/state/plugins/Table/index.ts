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
import { DecorationSet, EditorView } from 'prosemirror-view'
import { findParentNodeOfType } from 'prosemirror-utils'
import { TableMap } from 'prosemirror-tables'

import { buildCellSelection, buildExtendedHeaders } from './utils'

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
          const decorations = buildExtendedHeaders(tableNode, selection)
          if (decorations.length)
            return {
              deco: DecorationSet.create(newState.doc, decorations),
              tableMap: TableMap.get(tableNode.node),
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
    /**
     * When extended table header is clicked, corresponding column or row should be selected.
     */
    handleClickOn(
      view: EditorView,
      _1: any,
      _2: any,
      nodePos: number,
      event: any,
      direct: boolean
    ) {
      if (!direct) return false
      const targetClasses = event.target.classList
      const { state, dispatch } = view
      const tablePluginState = blockPluginKey.getState(state)
      const { tableMap: tableMap, selectedTable } = tablePluginState
      const cellSelection = buildCellSelection(
        nodePos,
        targetClasses.value,
        tableMap,
        selectedTable,
        state
      )
      if (cellSelection) dispatch(state.tr.setSelection(cellSelection as any))
      return false
    },
  },
})
