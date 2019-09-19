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
import styled, { css } from 'styled-components'
import {
  BoldIcon,
  CodeIcon,
  HeadingIcon,
  ItalicIcon,
  LinkIcon,
  OrderedListIcon,
  QuoteIcon,
  RedoIcon,
  UndoIcon,
  UnorderedListIcon,
  UnderlineIcon,
} from '@tinacms/icons'

// import { ImageControl } from './images'

interface Props {
  bottom?: boolean
  format: 'html' | 'markdown' | 'html-blocks'
  view: EditorView
  frame: any
}

interface State {
  //
}

const BoldControl = markControl({
  mark: 'strong',
  Icon: BoldIcon,
  tooltip: 'Bold',
})
const ItalicControl = markControl({
  mark: 'em',
  Icon: ItalicIcon,
  tooltip: 'Italic',
})
const UnderlineControl = markControl({
  mark: 'underline',
  Icon: UnderlineIcon,
  tooltip: 'Underline',
})
const LinkControl = markControl({
  mark: 'link',
  Icon: LinkIcon,
  tooltip: 'Link',
  selectionOnly: true,
  defaultAttrs: {
    href: '',
    title: '',
    editing: 'editing',
    creating: 'creating',
  },
  noMix: ['code'],
})

export class Menu extends React.Component<Props, State> {
  render() {
    const { view, bottom = false, frame } = this.props

    const supportBlocks = true

    return (
      <MenuContainer>
        {supportBlocks && (
          <FormattingDropdown view={view} bottom={bottom} frame={frame} />
        )}
        <BoldControl view={view} />
        <ItalicControl view={view} />
        <UnderlineControl view={view} />
        <LinkControl view={view} />
        {/* <ImageControl view={view} bottom={bottom} /> */}
        {supportBlocks && <QuoteControl view={view} bottom={bottom} />}
        {supportBlocks && <CodeControl view={view} bottom={bottom} />}
        {supportBlocks && <BulletList view={view} bottom={bottom} />}
        {supportBlocks && <OrderedList view={view} bottom={bottom} />}
      </MenuContainer>
    )
  }
}

const commandContrl = (
  command: any,
  Icon: any, // Fix type
  _title: string,
  tooltip: string,
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
        <MenuButton
          data-tooltip={tooltip}
          onClick={this.onClick}
          bottom={this.props.bottom}
          disabled={!this.canDo()}
        >
          <Icon />
        </MenuButton>
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
  QuoteIcon,
  'Blockquote',
  'Blockquote'
)
const CodeControl = commandContrl(
  makeCodeBlock,
  CodeIcon,
  'Codeblock',
  'Codeblock',
  false
) //codeblock focusing messes with scroll
const RedoControl = commandContrl(redo, RedoIcon, 'Redo', 'Redo')
const UndoControl = commandContrl(undo, UndoIcon, 'Undo', 'Undo')
const BulletList = commandContrl(
  toggleBulletList,
  UnorderedListIcon,
  'Unordered List',
  'Unordered List'
)
const OrderedList = commandContrl(
  toggleOrderedList,
  OrderedListIcon,
  'Ordered List',
  'Ordered List'
)

const MenuContainer = styled.div`
  display: flex;
  justify-content: space-between;
  position: sticky;
  top: 0;
  width: 100%;
  border: 1px solid rgba(53, 50, 50, 0.09);
  border-radius: 0.5rem;
  box-shadow: 0px 2px 3px rgba(48, 48, 48, 0.15);
  overflow: visible;
  display: flex;
  flex: 0 0 auto;
  z-index: 10;
  margin: 0 0 0.75rem 0;
`

export const MenuButton = styled.button<{
  active?: boolean
  disabled?: boolean
  bottom?: boolean
}>`
  flex: 1 0 auto;
  background-color: ${p =>
    p.active ? 'rgba(53, 50, 50, 0.05)' : 'transparent'};
  color: ${p => (p.active ? '#0084ff' : '#353232')};
  fill: ${p => (p.active ? '#0084ff' : '#353232')};
  border: none;
  outline: none;
  padding: 0.25rem 0.375rem;
  transition: all 85ms ease-out;
  cursor: pointer;
  &:hover {
    background-color: rgba(53, 50, 50, 0.09);
  }
  &:active {
    color: #0084ff;
    fill: #0084ff;
    background-color: rgba(53, 50, 50, 0.05);
  }
  &:not(:last-child) {
    border-right: 1px solid rgba(53, 50, 50, 0.09);
  }
  &:first-child {
    padding-left: 0.5rem;
    border-radius: 0.5rem 0 0 0.5rem;
  }
  &:last-child {
    padding-right: 0.5rem;
    border-radius: 0 0.5rem 0.5rem 0;
  }
  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
  ${props =>
    props.active &&
    css`
      color: #0084ff;
      fill: #0084ff;
      background-color: rgba(53, 50, 50, 0.05);
    `};
  ${props =>
    props.disabled &&
    css`
      pointer-events: none;
      color: #d1d1d1;
      fill: #d1d1d1;
    `};
`

export const MenuDropdownWrapper = styled.div`
  position: relative;
`

export const MenuButtonDropdown = styled.div<{ open: boolean }>`
  border-radius: 0.5rem;
  border: 1px solid #efefef;
  display: block;
  position: absolute;
  left: 0;
  bottom: -0.5rem;
  transform: translate3d(0, 100%, 0) scale3d(0.5, 0.5, 1);
  opacity: 0;
  pointer-events: none;
  transition: all 85ms ease-out;
  transform-origin: 0 0;
  box-shadow: 0px 2px 3px rgba(48, 48, 48, 0.15),
    0px 4px 8px rgba(48, 48, 48, 0.1);
  background-color: white;
  overflow: hidden;
  ${props =>
    props.open &&
    css`
      opacity: 1;
      pointer-events: all;
      transform: translate3d(0, 100%, 0) scale3d(1, 1, 1);
    `};
`

export const MenuOption = styled.div<{ disabled: boolean; active: boolean }>`
  display: block;
  padding: 0.5rem 1rem;
  transition: all 85ms ease-out;
  cursor: pointer;
  &:first-child {
    padding-top: 0.75rem;
  }
  &:last-child {
    padding-bottom: 0.75rem;
  }
  &:hover {
    background-color: rgba(53, 50, 50, 0.09);
  }
  &:active {
    color: #0084ff;
    fill: #0084ff;
    background-color: rgba(53, 50, 50, 0.05);
  }
`
