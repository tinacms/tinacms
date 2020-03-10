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

import { lift, wrapIn } from 'prosemirror-commands'
import { EditorState } from 'prosemirror-state'
import { blockTool } from './blockControl'

// TODO: Move this into this module?
import { toggleHeader as th } from '../../../commands/heading-commands'

interface State {
  active: boolean
}

export class FormattingDropdown extends React.Component<any, State> {
  state = {
    active: false,
  }
  toggle = () => this.setState(({ active }) => ({ active: !active }))
  blockQuote = () =>
    wrapIn(this.props.view.state.schema.nodes.blockquote)(
      this.props.view.state,
      this.props.view.dispatch
    )
  lift = () => lift(this.props.view.state, this.props.view.dispatch)
  render() {
    const { view } = this.props
    return (
      <div
        // className={c('headings-toggle', 'menu-control')}
        onClick={this.toggle}
      >
        <span>
          H1
          {/* {bottom ? (
            <Icon name="HeadingsDown" width={14} height={14} />
          ) : (
            <Icon name="HeadingsUp" width={14} height={14} />
          )} */}
        </span>
        {/* <Dismissible onDismiss={this.toggle} active={active} escape> */}
        <ul
        // className={c('formatting-dropdown', {
        //   top: !bottom,
        //   bottom,
        //   active,
        // })}
        >
          <H1 view={view} onClick={this.toggle} />
          <H2 view={view} onClick={this.toggle} />
          <H3 view={view} onClick={this.toggle} />
          <H4 view={view} onClick={this.toggle} />
          <H5 view={view} onClick={this.toggle} />
          <H6 view={view} onClick={this.toggle} />
        </ul>
        {/* </Dismissible> */}
      </div>
    )
  }
}

function makeToggleHeader(level: number) {
  return function toggleHeader(state: EditorState, dispatch: Function) {
    const tn = th(
      state.schema.nodes.heading,
      { level },
      state.schema.nodes.paragraph,
      null
    )

    return tn(state, dispatch)
  }
}

const H1 = blockTool({
  className: 'h1',
  children: 'Heading 1',
  command: makeToggleHeader(1),
  typeName: 'heading',
  attrs: { level: 1 },
})
const H2 = blockTool({
  className: 'h2',
  children: 'Heading 2',
  command: makeToggleHeader(2),
  typeName: 'heading',
  attrs: { level: 2 },
})
const H3 = blockTool({
  className: 'h3',
  children: 'Heading 3',
  command: makeToggleHeader(3),
  typeName: 'heading',
  attrs: { level: 3 },
})
const H4 = blockTool({
  className: 'h4',
  children: 'Heading 4',
  command: makeToggleHeader(4),
  typeName: 'heading',
  attrs: { level: 4 },
})
const H5 = blockTool({
  className: 'h5',
  children: 'Heading 5',
  command: makeToggleHeader(5),
  typeName: 'heading',
  attrs: { level: 5 },
})
const H6 = blockTool({
  className: 'h6',
  children: 'Heading 6',
  command: makeToggleHeader(6),
  typeName: 'heading',
  attrs: { level: 6 },
})
