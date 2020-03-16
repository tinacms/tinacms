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

import { redo, undo } from 'prosemirror-history'
import { EditorView } from 'prosemirror-view'
import * as React from 'react'

import { markControl } from './markControl'
import { FormattingDropdown } from './FormattingDropdown'
import {
  toggleBulletList,
  toggleOrderedList,
} from '../../../commands/list-commands'
import { wrapIn, setBlockType } from 'prosemirror-commands'
import { EditorState } from 'prosemirror-state'
// import { ImageControl } from './images'

interface Props {
  bottom?: boolean
  format: 'html' | 'markdown' | 'html-blocks'
  view: EditorView
}

interface State {
  //
}

const BoldControl = markControl({
  mark: 'strong',
  icon: 'Bold',
  tooltip: 'Bold',
  size: 12,
  stroke: 3,
})
const ItalicControl = markControl({
  mark: 'em',
  icon: 'Italic',
  tooltip: 'Italic',
  size: 12,
  stroke: 2,
})
const UnderlineControl = markControl({
  mark: 'underline',
  icon: 'Underline',
  tooltip: 'Underline',
  size: 12,
  stroke: 2,
})
const LinkControl = markControl({
  mark: 'link',
  icon: 'Link',
  tooltip: 'Link',
  size: 14,
  stroke: 2,
  selectionOnly: true,
  defaultAttrs: {
    href: '',
    title: '',
  },
  noMix: ['code'],
})

export class Menu extends React.Component<Props, State> {
  render() {
    const { view, bottom = false } = this.props

    const supportBlocks = true

    return (
      <div>
        <div>
          <UndoControl view={view} />
          <RedoControl view={view} />
        </div>
        <div>
          {supportBlocks && <FormattingDropdown view={view} bottom={bottom} />}
          <BoldControl view={view} />
          <ItalicControl view={view} />
          <UnderlineControl view={view} />
          <LinkControl view={view} />
          {/* <ImageControl view={view} bottom={bottom} /> */}
          {supportBlocks && <QuoteControl view={view} bottom={bottom} />}
          {supportBlocks && <CodeControl view={view} bottom={bottom} />}
          {supportBlocks && <BulletList view={view} bottom={bottom} />}
          {supportBlocks && <OrderedList view={view} bottom={bottom} />}
        </div>
        <div>
          {/*
          <div className={c("menu-control")} title="Fullscreen" data-tooltip="Fullscreen" data-side="left">
            <Icon name="Fullscreen" width={14} height={14} stroke={2} />
          </div>
          */}
        </div>
      </div>
    )
  }
}

const commandContrl = (
  command: any,
  icon: string,
  _title: string,
  tooltip: string,
  size: number,
  stroke: number,
  focusOnCreate: boolean = true
) =>
  class CommandControl extends React.Component<any, any> {
    onClick = () => {
      if (this.canDo()) {
        const { view } = this.props
        command(view.state, view.dispatch)

        if (focusOnCreate) {
          view.focus()
        }
      }
    }
    canDo = () => command(this.props.view.state)
    render() {
      return (
        <div data-tooltip={tooltip}>
          <div
            // className={c('menu-control', {
            //   disabled: !this.canDo(),
            //   bottom: this.props.bottom,
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

function wrapInBlockquote(state: EditorState, dispatch: any) {
  return wrapIn(state.schema.nodes.blockquote)(state, dispatch)
}
function makeCodeBlock(state: EditorState, dispatch: any) {
  return setBlockType(state.schema.nodes.code_block)(state, dispatch)
}
const QuoteControl = commandContrl(
  wrapInBlockquote,
  'Quote',
  'Blockquote',
  'Blockquote',
  14,
  2
)
const CodeControl = commandContrl(
  makeCodeBlock,
  'Code',
  'Codeblock',
  'Codeblock',
  14,
  2,
  false
) //codeblock focusing messes with scroll
const RedoControl = commandContrl(redo, 'Redo', 'Redo', 'Redo', 14, 2)
const UndoControl = commandContrl(undo, 'Undo', 'Undo', 'Undo', 14, 2)
const BulletList = commandContrl(
  toggleBulletList,
  'UnorderedList',
  'Unordered List',
  'Unordered List',
  16,
  2
)
const OrderedList = commandContrl(
  toggleOrderedList,
  'OrderedList',
  'Ordered List',
  'Ordered List',
  16,
  2
)
