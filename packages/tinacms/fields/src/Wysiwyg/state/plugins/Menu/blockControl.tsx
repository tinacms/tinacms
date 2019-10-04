import * as React from 'react'
import { EditorView } from 'prosemirror-view'
import styled from 'styled-components'
import { MenuOption } from './Menu'

interface BlockTool {
  Component: any
  children: any
  command: Function
  typeName?: string
  attrs?: any
}

export function blockTool(options: BlockTool) {
  const { Component, children, command, typeName, attrs } = options
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
        <MenuOption
          onClick={this.onClick}
          disabled={!this.canDo()}
          active={this.active}
        >
          <Component>{children}</Component>
        </MenuOption>
      )
    }
  }
}
