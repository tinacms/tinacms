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

import * as React from 'react'
import { EditorView } from 'prosemirror-view'
import { toggleMark } from 'prosemirror-commands'

export interface Props {
  view: EditorView
}

export interface Options {
  mark: string
  icon: string
  title?: string
  defaultAttrs?: any
  selectionOnly?: boolean
  tooltip?: string
  size: number
  stroke: number
  noMix?: string[]
}

export function markControl({
  mark,
  icon,
  tooltip,
  defaultAttrs,
  selectionOnly = false,
  noMix = [],
}: Options) {
  return class _ extends React.Component<Props, any> {
    static displayName = `${mark}Control`

    markType(markName: string) {
      const schema = this.props.view.state.schema
      return schema.marks[markName]
    }

    get active(): boolean {
      return this.markIsActive(mark)
    }

    markIsActive = (markName: string): boolean => {
      const { state } = this.props.view
      const mark = this.markType(markName)
      const { from, $from, to, empty } = state.selection
      if (empty) return !!mark.isInSet(state.storedMarks || $from.marks())
      else return state.doc.rangeHasMark(from, to, mark)
    }

    get disabled(): boolean {
      if (selectionOnly) {
        const { $cursor } = this.props.view.state.selection as any
        return !!$cursor || this.inCodeBlock || this.incompatibleMarksAreActive
      }

      return this.inCodeBlock || this.incompatibleMarksAreActive
    }

    get inCodeBlock(): boolean {
      const view = this.props.view
      const node = view.state.selection.$from.node(
        view.state.selection.$from.depth
      )
      return node.type === view.state.schema.nodes.code_block
    }

    get incompatibleMarksAreActive(): boolean {
      return noMix
        .map(this.markIsActive)
        .reduce(
          (someMarkActive, nextMarkActive) => nextMarkActive || someMarkActive,
          false
        )
    }

    onClick = () => {
      if (this.disabled) return
      const { state, dispatch } = this.props.view

      if ((state.selection as any).$cursor && selectionOnly) {
        return
      }

      toggleMark(this.markType(mark), defaultAttrs)(state, dispatch)

      this.props.view.focus()
    }

    render() {
      if (!this.markType(mark)) {
        return null
      }
      return (
        <div data-tooltip={tooltip} data-side="top">
          <div
            // className={c('menu-control', {
            //   active: this.active,
            //   disabled: this.disabled,
            // })}
            onClick={this.onClick}
          >
            {icon}
            {/* <Icon name={icon} width={size} height={size} stroke={stroke} /> */}
          </div>
        </div>
      )
    }
  }
}
