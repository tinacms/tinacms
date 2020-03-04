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

import { EditorView } from 'prosemirror-view'
import * as React from 'react'
import { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react'

import { markControl } from './markControl'
import { FormattingDropdown } from './FormattingDropdown'
import { FloatingTableMenu } from './FloatingTableMenu'
import ImageMenu from './ImageMenu'
import {
  toggleBulletList,
  toggleOrderedList,
} from '../../../commands/list-commands'
import { insertTable } from '../../../commands/table-commands'
import { imagePluginKey } from '../Image'
import { wrapIn, setBlockType } from 'prosemirror-commands'
import { EditorState } from 'prosemirror-state'
import { findParentNodeOfType } from 'prosemirror-utils'
import styled, { css, ThemeProvider } from 'styled-components'
import {
  BoldIcon,
  CodeIcon,
  ItalicIcon,
  LinkIcon,
  OrderedListIcon,
  QuoteIcon,
  TableIcon,
  UnderlineIcon,
  UnorderedListIcon,
} from '@tinacms/icons'
import { radius, color, padding } from '@tinacms/styles'
import { UndoControl, RedoControl } from './historyControl'
import { MenuPortalProvider, useMenuPortal } from './MenuPortal'

interface Props {
  bottom?: boolean
  format: 'html' | 'markdown' | 'html-blocks'
  editorView: { view: EditorView }
  theme: any
  sticky?: boolean | string
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
  isDisabled: (view: EditorView) => {
    return !!imagePluginKey.getState(view.state).selectedImage
  },
})

export const Menu = (props: Props) => {
  const { editorView, bottom = false, theme, sticky = true } = props
  const [menuFixed, setMenuFixed] = useState(false)
  const isBrowser = typeof window !== `undefined`
  const menuRef: any = useRef<HTMLDivElement>(null)
  const [menuBoundingBox, setMenuBoundingBox] = useState<any>(null)
  const menuFixedTopOffset = typeof sticky === 'string' ? sticky : '0'

  useEffect(() => {
    if (menuRef.current && sticky) {
      setMenuBoundingBox(menuRef.current.getBoundingClientRect())
    }
  }, [menuRef])

  useLayoutEffect(() => {
    if (!isBrowser || !menuRef.current || !sticky) {
      return
    }

    const handleScroll = () => {
      const wysiwygWrapper = menuRef.current.parentElement
      const startPosition = wysiwygWrapper ? wysiwygWrapper.offsetTop : 0
      const endPosition = wysiwygWrapper
        ? startPosition + wysiwygWrapper.offsetHeight
        : 0

      if (window.scrollY > startPosition && window.scrollY < endPosition) {
        setMenuFixed(true)
      } else {
        setMenuFixed(false)
      }
    }

    const handleResize = () => {
      if (menuRef.current) {
        const wasMenuFixed = menuFixed
        setMenuFixed(false)
        setMenuBoundingBox(menuRef.current.getBoundingClientRect())
        setMenuFixed(wasMenuFixed)
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [menuRef, menuBoundingBox])

  const supportBlocks = true

  const preventProsemirrorFocusLoss = React.useCallback((e: any) => {
    e.stopPropagation()
    e.preventDefault()
  }, [])

  const { view } = editorView
  return (
    <ThemeProvider theme={theme}>
      <>
        {menuFixed && (
          <MenuPlaceholder menuBoundingBox={menuBoundingBox}></MenuPlaceholder>
        )}
        <MenuWrapper
          menuFixedTopOffset={menuFixedTopOffset}
          menuFixed={menuFixed}
          menuBoundingBox={menuBoundingBox}
          ref={menuRef}
        >
          <MenuPortalProvider>
            <MenuContainer onMouseDown={preventProsemirrorFocusLoss}>
              {supportBlocks && <FormattingDropdown view={view} />}
              <BoldControl view={view} />
              <ItalicControl view={view} />
              <UnderlineControl view={view} />
              <LinkControl view={view} />
              {/* <ImageControl view={view} bottom={bottom} /> */}
              {supportBlocks && <TableControl view={view} bottom={bottom} />}
              {supportBlocks && <QuoteControl view={view} bottom={bottom} />}
              {supportBlocks && <CodeControl view={view} bottom={bottom} />}
              {supportBlocks && <BulletList view={view} bottom={bottom} />}
              {supportBlocks && <OrderedList view={view} bottom={bottom} />}
              <UndoControl view={view} />
              <RedoControl view={view} />
            </MenuContainer>
          </MenuPortalProvider>
        </MenuWrapper>
        <FloatingTableMenu editorView={editorView} />
        <ImageMenu editorView={editorView} />
      </>
    </ThemeProvider>
  )
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
  const { blockquote } = state.schema.nodes
  const { start, node } =
    findParentNodeOfType(blockquote)(state.selection) || {}
  if (start && node) {
    const { tr } = state
    const nodeRange = tr.doc
      .resolve(start + 1)
      .blockRange(tr.doc.resolve(start + node.nodeSize - 2))
    if (nodeRange) {
      if (dispatch) return dispatch(tr.lift(nodeRange, 0))
      else return true
    }
  }
  return wrapIn(state.schema.nodes.blockquote)(state, dispatch)
}
function insertTableCmd(state: EditorState, dispatch: any) {
  const { table } = state.schema.nodes
  const { selection } = state
  const tableParent = findParentNodeOfType(table)(selection)
  if (tableParent) return false
  return insertTable(state, dispatch)
}
function makeCodeBlock(state: EditorState, dispatch: any) {
  return setBlockType(state.schema.nodes.code_block)(state, dispatch)
}
const TableControl = commandContrl(insertTableCmd, TableIcon, 'Table', 'Table')

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

type MenuPlaceholderProps = {
  menuBoundingBox: any
}

const MenuPlaceholder = styled.div<MenuPlaceholderProps>`
  color: transparent;
  background: transparent;
  pointer-events: none;
  position: relative;
  display: block;
  height: ${props => props.menuBoundingBox.height}px;
  width: ${props => props.menuBoundingBox.width}px;
`

type MenuWrapperProps = {
  menuFixed: boolean
  menuBoundingBox: any
  menuFixedTopOffset: string
}

const MenuWrapper = styled.div<MenuWrapperProps>`
  position: relative;
  margin-bottom: 14px;
  z-index: 10000;

  ${props =>
    props.menuFixed &&
    css`
      position: fixed;
      width: ${props.menuBoundingBox.width}px;
      top: ${props.menuFixedTopOffset};
    `};
`

const MenuContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: wrap;
  justify-content: space-between;
  position: relative;
  top: 0;
  width: 100%;
  background-color: white;
  border-radius: ${radius()};
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.12);
  border: 1px solid ${color.grey(2)};
  overflow: hidden;
  z-index: 100;
`

const MenuItem = css`
  flex: 1 1 24px;
`

export const MenuButton = styled.button<{
  active?: boolean
  disabled?: boolean
  bottom?: boolean
  ref?: any
}>`
  ${MenuItem}
  background-color: ${p =>
    p.active ? 'rgba(53, 50, 50, 0.05)' : 'transparent'};
  color: ${p => (p.active ? '#0084ff' : color.grey(8))};
  fill: ${p => (p.active ? '#0084ff' : color.grey(8))};
  border: 1px solid ${color.grey(2)};
  margin: -1px;
  outline: none;
  padding: 6px 4px;
  transition: all 85ms ease-out;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  &:hover {
    background-color: rgba(53, 50, 50, 0.09);
  }
  &:active {
    color: #0084ff;
    fill: #0084ff;
    background-color: rgba(53, 50, 50, 0.05);
  }
  svg {
    width: 20px;
    height: 20px;
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
  ${MenuItem}
  position: relative;

  ${MenuButton} {
    width: 100%;
  }
`

export const MenuButtonDropdown = styled(
  ({ children, open, triggerRef, ...styleProps }) => {
    const MenuPortal = useMenuPortal()
    const menuPortalRef = React.useRef<HTMLDivElement | null>(null)

    const menuOffset = useMemo(() => {
      if (!triggerRef.current || !menuPortalRef.current) return 0
      const menuDropdownBoundingBox = triggerRef.current.getBoundingClientRect()
      const menuPortalBoundingBox = menuPortalRef.current.getBoundingClientRect()
      return menuDropdownBoundingBox.x - menuPortalBoundingBox.x
    }, [triggerRef.current, menuPortalRef.current])

    return (
      <MenuPortal>
        <Offset offset={menuOffset}>
          <div ref={menuPortalRef} {...styleProps}>
            {children}
          </div>
        </Offset>
      </MenuPortal>
    )
  }
)`
  border-radius: ${radius()};
  border: 1px solid #efefef;
  display: block;
  position: absolute;
  bottom: -4px;
  left: 0;
  transform: translate3d(0, 100%, 0) scale3d(0.5, 0.5, 1);
  opacity: 0;
  pointer-events: none;
  transition: all 85ms ease-out;
  transform-origin: 0 0;
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.12), 0px 4px 8px rgba(48, 48, 48, 0.1);
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

const Offset = styled.div<{ offset: number }>`
  position: absolute;
  left: ${props => props.offset}px;
`

export const MenuOption = styled.div<{ disabled: boolean; active: boolean }>`
  display: block;
  padding: 8px 16px;
  transition: all 85ms ease-out;
  cursor: pointer;
  &:first-child {
    padding-top: ${padding('small')};
  }
  &:last-child {
    padding-bottom: ${padding('small')};
  }
  &:hover {
    background-color: ${color.grey(1)};
    color: ${color.primary()};
  }
  &:active {
    color: ${color.primary()};
    fill: ${color.primary()};
    background-color: rgba(53, 50, 50, 0.05);
  }
  ${props =>
    props.active &&
    css`
      color: #0084ff;
      fill: #0084ff;
      background-color: rgba(53, 50, 50, 0.05);
    `};
`
