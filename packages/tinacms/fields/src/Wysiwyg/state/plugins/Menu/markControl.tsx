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
  size,
  stroke,
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
      let { state } = this.props.view
      let mark = this.markType(markName)
      let { from, $from, to, empty } = state.selection
      if (empty) return !!mark.isInSet(state.storedMarks || $from.marks())
      else return state.doc.rangeHasMark(from, to, mark)
    }

    get disabled(): boolean {
      if (selectionOnly) {
        let { $cursor } = this.props.view.state.selection as any
        return !!$cursor || this.inCodeBlock || this.incompatibleMarksAreActive
      }

      return this.inCodeBlock || this.incompatibleMarksAreActive
    }

    get inCodeBlock(): boolean {
      let view = this.props.view
      let node = view.state.selection.$from.node(
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
