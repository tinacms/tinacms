import * as React from 'react'
import { EditorView } from 'prosemirror-view'

interface BlockTool {
  Component: any
  children: any
  command: Function
  typeName?: string
  attrs?: any
}

export function blockTool(options: BlockTool) {
  let { Component, children, command, typeName, attrs } = options
  return class extends React.Component<
    { view: EditorView; onClick(): void },
    any
  > {
    canDo = () => command(this.props.view.state)
    onClick = () => {
      command(this.props.view.state, this.props.view.dispatch)
      this.props.view.focus()
      this.props.onClick()
    }
    get active(): boolean {
      if (!typeName) return false

      let { state } = this.props.view
      let $from = state.selection.$from
      let node = $from.node($from.depth)
      let correctNodeType = node.type.name === typeName
      // Only works for Heading
      let correctAttrs = attrs ? node.attrs.level === attrs.level : true
      return correctNodeType && correctAttrs
    }
    render() {
      return (
        <li
          // className={c(
          //   'formatting-item',
          //   { disabled: !this.canDo(), active: this.active },
          //   className
          // )}
          onClick={this.onClick}
        >
          <Component>{children}</Component>
        </li>
      )
    }
  }
}
