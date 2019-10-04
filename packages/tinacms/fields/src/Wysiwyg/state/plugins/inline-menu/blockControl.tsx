import * as React from 'react'
import { EditorView } from 'prosemirror-view'

interface BlockTool {
  children: any
  className: string
  command: Function
  typeName?: string
  attrs?: any
}

export function blockTool(options: BlockTool) {
  const { className, children, command, typeName, attrs } = options
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

      const { state } = this.props.view
      const $from = state.selection.$from
      const node = $from.node($from.depth)
      const correctNodeType = node.type.name === typeName
      // Only works for Heading
      const correctAttrs = attrs ? node.attrs.level === attrs.level : true
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
          {children}
        </li>
      )
    }
  }
}
