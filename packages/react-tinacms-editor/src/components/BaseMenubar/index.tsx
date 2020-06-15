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

import React, { ReactElement } from 'react'
import { useState, useRef, useEffect, useLayoutEffect } from 'react'

import { useEditorStateContext } from '../../context/editorState'
import { useEditorModeContext } from '../../context/editorMode'
import { MenuPortalProvider } from '../../context/MenuPortal'
import { Plugin } from '../../types'

import {
  MenuPlaceholder,
  MenuWrapper,
  MenuContainer,
} from '../MenuHelpers/styledComponents'

interface Props {
  sticky?: boolean | string
  menus?: ReactElement[]
  plugins?: Plugin[]
  popups?: ReactElement[]
}

export const BaseMenubar = ({
  sticky = true,
  menus,
  plugins,
  popups,
}: Props) => {
  const [menuFixed, setMenuFixed] = useState(false)
  const isBrowser = typeof window !== `undefined`
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuBoundingBox, setMenuBoundingBox] = useState<any>(null)
  const menuFixedTopOffset = typeof sticky === 'string' ? sticky : '0'
  const { editorView } = useEditorStateContext()
  const { mode } = useEditorModeContext()

  useEffect(() => {
    if (menuRef.current && sticky) {
      setMenuBoundingBox(menuRef.current.getBoundingClientRect())
    }
    // todo: cleanup use of editor view here
  }, [menuRef, editorView, mode])

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

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [menuRef, menuBoundingBox])

  const preventProsemirrorFocusLoss = React.useCallback((e: any) => {
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
        data-testid="base-menubar"
      >
        <MenuPortalProvider>
          <MenuContainer onMouseDown={preventProsemirrorFocusLoss}>
            {menus}
            {plugins?.map(({ MenuItem }) => (
              <MenuItem mode={mode} editorView={editorView} />
            ))}
          </MenuContainer>
        </MenuPortalProvider>
      </MenuWrapper>
      {popups}
    </>
  )
}

// todo: sub-menus to return null if schema does not have related type of node / mark.
