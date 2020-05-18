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

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'

import { MarkdownMenu as BlockMenu } from '../../plugins/Block'
import { MarkdownMenu as InlineMenu } from '../../plugins/Inline'
import { MarkdownMenu as LinkMenu } from '../../plugins/Link'
import { MarkdownMenu as ImageMenu } from '../../plugins/Image'
import { MarkdownMenu as TableMenu } from '../../plugins/Table'
import { MarkdownMenu as QuoteMenu } from '../../plugins/Blockquote'
import { MarkdownMenu as CodeBlockMenu } from '../../plugins/CodeBlock'
import { MarkdownMenu as ListMenu } from '../../plugins/List'
import { MarkdownMenu as HistoryMenu } from '../../plugins/History'
import { MenuPortalProvider } from '../../context/MenuPortal'
import { ImageProps } from '../../types'
import {
  MenuPlaceholder,
  MenuWrapper,
  MenuContainer,
} from '../MenuHelpers/styledComponents'
import { EditorModeMenu } from '../EditorModeMenu'

interface Props {
  sticky?: boolean | string
  toggleEditorMode: () => void
  imageProps?: ImageProps
}

export const Menubar = ({
  sticky = true,
  toggleEditorMode,
  imageProps,
}: Props) => {
  const [menuFixed, setMenuFixed] = useState(false)
  const isBrowser = typeof window !== `undefined`
  const menuRef = useRef<HTMLDivElement>(null)
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
      const wysiwygWrapper = menuRef.current!.parentElement
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

  const stopEvent = React.useCallback((e: any) => {
    e.stopPropagation()
    e.preventDefault()
  }, [])

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
          <MenuContainer onMouseDown={stopEvent}>
            <BlockMenu />
            <InlineMenu />
            <LinkMenu />
            {imageProps && <ImageMenu />}
            <TableMenu />
            <QuoteMenu />
            <CodeBlockMenu />
            <ListMenu />
            <HistoryMenu />
            <EditorModeMenu toggleEditorMode={toggleEditorMode} />
          </MenuContainer>
        </MenuPortalProvider>
      </MenuWrapper>
    </>
  )
}
