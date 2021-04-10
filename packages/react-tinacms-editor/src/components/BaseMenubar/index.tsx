/**

Copyright 2021 Forestry.io Holdings, Inc.

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

import React, { ReactElement, useState, useRef, useEffect } from 'react'
import debounce from 'lodash.debounce'

import { useEditorStateContext } from '../../context/editorState'
import { useEditorModeContext } from '../../context/editorMode'
import { MenuPortalProvider } from '../../context/MenuPortal'
import { Plugin } from '../../types'
import { findElementOffsetTop } from '../../utils'

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
  const [menuOffsetTop, setMenuOffsetTop] = useState<number | null>(null)
  const stickyOffset = typeof sticky === 'string' ? sticky : '0'
  const scrollY = useRef<number>(0)
  const scrollAnimationRef = useRef<number>(0)
  const { editorView } = useEditorStateContext()
  const { mode } = useEditorModeContext()

  useEffect(() => {
    if (menuRef.current && sticky) {
      setMenuBoundingBox(menuRef.current.getBoundingClientRect())
    }
    // todo: cleanup use of editor view here
  }, [menuRef, editorView, mode])

  useEffect(() => {
    if (!isBrowser || !menuRef.current || !sticky) {
      return
    }
    const wysiwygWrapper = menuRef.current!.parentElement
    let ticking = false

    const handleStickyMenu = () => {
      if (typeof menuOffsetTop === 'number') {
        const btmBound = menuOffsetTop + (wysiwygWrapper?.offsetHeight || 0)

        if (scrollY.current > menuOffsetTop && scrollY.current < btmBound) {
          setMenuFixed(true)
        } else {
          setMenuFixed(false)
        }
      }
      scrollAnimationRef.current = window.requestAnimationFrame(
        handleStickyMenu
      )
    }

    const handleResize = () => {
      if (menuRef.current) {
        const wasMenuFixed = menuFixed
        setMenuFixed(false)
        setMenuBoundingBox(menuRef.current.getBoundingClientRect())
        setMenuFixed(wasMenuFixed)
      }
    }

    /**
     * ensures the animation frames start and stop while
     * actively scrolling. To avoid unnecessary layout calcs
     *  */
    const handleScrollStart = debounce(
      () => {
        scrollY.current = window.scrollY
        requestTick()
      },
      10,
      { leading: true, trailing: false }
    )

    const handleScrollStop = debounce(() => {
      cancelAnimationFrame(scrollAnimationRef.current)
      ticking = false
    }, 10)

    function requestTick() {
      if (!ticking) {
        scrollAnimationRef.current = window.requestAnimationFrame(
          handleStickyMenu
        )
      }
      ticking = true
    }

    function calculateOffset() {
      if (wysiwygWrapper) {
        const stickyOffsetInt = parseInt(stickyOffset, 10)
        const offsetTop = findElementOffsetTop(wysiwygWrapper) - stickyOffsetInt

        setMenuOffsetTop(offsetTop)
      }
    }

    document.readyState !== 'complete'
      ? window.addEventListener('load', calculateOffset)
      : setTimeout(calculateOffset, 10) // handles slight discrepancy with load event in chrome
    window.addEventListener('scroll', handleScrollStart)
    window.addEventListener('scroll', handleScrollStop)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('scroll', handleScrollStart)
      window.removeEventListener('scroll', handleScrollStop)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(scrollAnimationRef.current)
    }
  }, [menuRef, menuBoundingBox, menuOffsetTop])

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
        menuFixedTopOffset={stickyOffset}
        menuFixed={menuFixed}
        menuBoundingBox={menuBoundingBox}
        ref={menuRef}
        data-testid="base-menubar"
      >
        <MenuPortalProvider>
          <MenuContainer onMouseDown={preventProsemirrorFocusLoss}>
            {menus}
            {plugins?.map(({ name, MenuItem }) => (
              <MenuItem key={name} mode={mode} editorView={editorView} />
            ))}
          </MenuContainer>
        </MenuPortalProvider>
      </MenuWrapper>
      {popups}
    </>
  )
}

// todo: sub-menus to return null if schema does not have related type of node / mark.
