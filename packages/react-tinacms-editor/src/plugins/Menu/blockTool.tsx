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
import { MenuOption } from './MenuComponents'

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
