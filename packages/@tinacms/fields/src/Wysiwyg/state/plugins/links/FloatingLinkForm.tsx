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
import { createRef, useState, useEffect } from 'react'

import { LinkForm } from './LinkForm'
import {
  removeLinkBeingEdited,
  unmountLinkForm,
  updateLinkBeingEdited,
} from '../../../commands'
import { findElementOffsetTop, findElementOffsetLeft } from '../../../utils'
import styled from 'styled-components'
import { TinaReset } from '@tinacms/styles'
import { linkPluginKey } from './index'

const width = 240

export const FloatingLinkForm = ({
  editorView,
}: {
  editorView: { view: EditorView }
}) => {
  const { view } = editorView
  const linkPluginState = linkPluginKey.getState(view.state)
  const clickTarget = view.domAtPos(view.state.selection.anchor).node
    .parentElement

  const onChange = (attrs: any) => {
    updateLinkBeingEdited(view.state, view.dispatch, attrs)
  }

  const onCancel = () => {
    unmountLinkForm(view)
  }

  const [position, setPosition] = useState<any>(undefined)
  const wrapperRef = createRef<any>()

  useEffect(() => {
    if (!clickTarget || !wrapperRef.current) {
      setPosition(undefined)
      return
    }
    const left = calcLeftOffset(clickTarget!, wrapperRef.current, width)
    const top = `calc(32px + ${findElementOffsetTop(clickTarget) -
      findElementOffsetTop(wrapperRef.current)}px)`
    const arrowOffset = calcArrowLeftOffset(
      clickTarget,
      wrapperRef.current,
      width
    )
    setPosition({ arrowOffset, left, top })
  }, [linkPluginState])

  if (!linkPluginState.show_link_toolbar) {
    return null
  }

  const { arrowOffset, left, top } = position || {}
  const { state, dispatch } = view
  let href = ''
  let title = ''
  const linkMark = state.selection.$anchor
    .marks()
    .find(mark => mark.type === state.schema.marks.link)
  if (linkMark) {
    href = linkMark.attrs.href
    title = linkMark.attrs.title
  }

  return (
    <div ref={wrapperRef} style={{ position: 'absolute' }}>
      {position && (
        <TinaReset>
          <LinkFormWrapper>
            <LinkArrow offset={arrowOffset} top={top}></LinkArrow>
            <LinkForm
              style={{
                left,
                top,
                width: `${width}px`,
              }}
              removeLink={() => removeLinkBeingEdited(state, dispatch)}
              onChange={onChange}
              href={href}
              title={title}
              cancel={onCancel}
            />
          </LinkFormWrapper>
        </TinaReset>
      )}
    </div>
  )
}

const LinkFormWrapper = styled.div`
  position: relative;
`

const LinkArrow = styled.div<{ offset: string; top: string }>`
  position: absolute;
  top: ${p => p.top};
  left: ${p => p.offset};
  margin-top: 3px;
  transform: translate3d(-50%, -100%, 0);
  width: 16px;
  height: 13px;
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  background-color: #f6f6f9;
  z-index: 100;
`

/**
 * Calculates the leftOffset of the form.
 *
 * It centers the form on the link, unless the form would
 * show up outside of the window, in which case the offset is the edge
 * of the editor.
 *
 * @param {HTMLElement} clickTarget
 * @param {HTMLElement} renderTarget
 * @param {number} minWidth
 * @returns {string}
 */
function calcLeftOffset(
  clickTarget: HTMLElement,
  renderTarget: HTMLElement,
  minWidth: number
) {
  const ow_ct = clickTarget.offsetWidth
  const ol_ct = findElementOffsetLeft(clickTarget)
  const ow_rt = renderTarget.parentElement!.offsetWidth
  const ol_rt = findElementOffsetLeft(renderTarget)
  const ol = ol_ct - ol_rt + ow_ct / 2 - minWidth / 2

  const leftEdgeOutsideView = ol < -ol_rt
  if (leftEdgeOutsideView) {
    return `-8px`
  }

  const rightEdgeOutsideView = ol + minWidth > ow_rt
  if (rightEdgeOutsideView) {
    return `calc(${ol - (ol + minWidth - ow_rt)}px + 8px)`
  }

  return `${ol}px`
}

function calcArrowLeftOffset(
  clickTarget: HTMLElement,
  renderTarget: HTMLElement,
  _minWidth: number
) {
  const ow_ct = clickTarget.offsetWidth
  const ol_ct = findElementOffsetLeft(clickTarget)
  const ol_rt = findElementOffsetLeft(renderTarget)
  const ol = ol_ct - ol_rt + ow_ct / 2
  return `${ol}px`
}
