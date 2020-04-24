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
import React from 'react'
import { useState, useRef, useEffect, useLayoutEffect } from 'react'

import { markControl } from './markControl'
import { FormattingDropdown } from './FormattingDropdown'
import { FloatingTableMenu } from './FloatingTableMenu'
import {
  toggleBulletList,
  toggleOrderedList,
} from '../../../commands/list-commands'
import { insertTable } from '../../../commands/table-commands'
import { imagePluginKey } from '../Image'
import { wrapIn, setBlockType } from 'prosemirror-commands'
import { EditorState } from 'prosemirror-state'
import { findParentNodeOfType } from 'prosemirror-utils'
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
import { UndoControl, RedoControl } from './historyControl'
import { MenuPortalProvider } from './MenuPortal'
import { FloatingLinkForm } from '../links/FloatingLinkForm'
import FloatingImageMenu from './Image/FloatingImageMenu'
import {
  MenuButton,
  MenuPlaceholder,
  MenuWrapper,
  MenuContainer,
} from './MenuComponents'
import { isMarkPresent } from '../../../utils'
import ImageMenu from './Image/ImageMenu'
import ImageLoaders from './Image/ImageLoaders'
import { useEditorStateContext } from '../../../context/editorState'

interface Props {
  bottom?: boolean
  sticky?: boolean | string
  uploadImages?: (files: File[]) => Promise<string[]>
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
  },
  noMix: ['code'],
  isDisabled: (view: EditorView) =>
    isMarkPresent(view.state, view.state.schema.marks.link) ||
    !!imagePluginKey.getState(view.state).selectedImage,
  onClick: (view: EditorView) => {
    const { state, dispatch } = view
    return dispatch(state.tr.setMeta('show_link_toolbar', true))
  },
})

export const Menu = (props: Props) => {
  const { bottom = false, sticky = true, uploadImages } = props
  const [menuFixed, setMenuFixed] = useState(false)
  const isBrowser = typeof window !== `undefined`
  const menuRef: any = useRef<HTMLDivElement>(null)
  const [menuBoundingBox, setMenuBoundingBox] = useState<any>(null)
  const menuFixedTopOffset = typeof sticky === 'string' ? sticky : '0'
  const { editorView } = useEditorStateContext()

  useEffect(() => {
    if (menuRef.current && sticky) {
      setMenuBoundingBox(menuRef.current.getBoundingClientRect())
    }
  }, [menuRef, editorView])

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

  if (!editorView) return null

  return (
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
            {supportBlocks && <FormattingDropdown />}
            <BoldControl />
            <ItalicControl />
            <UnderlineControl />
            <LinkControl />
            {uploadImages && <ImageMenu uploadImages={uploadImages} />}
            {supportBlocks && <TableControl bottom={bottom} />}
            {supportBlocks && <QuoteControl bottom={bottom} />}
            {supportBlocks && <CodeControl bottom={bottom} />}
            {supportBlocks && <BulletList bottom={bottom} />}
            {supportBlocks && <OrderedList bottom={bottom} />}
            <UndoControl />
            <RedoControl />
          </MenuContainer>
        </MenuPortalProvider>
      </MenuWrapper>
      <FloatingTableMenu />
      <ImageLoaders />
      <FloatingImageMenu />
      <FloatingLinkForm />
    </>
  )
}

const commandContrl = (
  command: any,
  Icon: any, // Fix type
  _title: string,
  tooltip: string,
  focusOnCreate: boolean = true
) => ({ bottom }: { bottom: boolean }) => {
  const { editorView } = useEditorStateContext()
  const onClick = () => {
    if (canDo()) {
      const view = editorView!.view
      command(view.state, view.dispatch)

      if (focusOnCreate) {
        view.focus()
      }
    }
  }
  const canDo = () => command(editorView!.view.state)

  return (
    <MenuButton
      data-tooltip={tooltip}
      onClick={onClick}
      bottom={bottom}
      disabled={!canDo()}
    >
      <Icon />
    </MenuButton>
  )
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
