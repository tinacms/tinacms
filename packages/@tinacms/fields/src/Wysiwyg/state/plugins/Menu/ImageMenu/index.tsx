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

import React, { useState, useRef, useEffect } from 'react'
import { EditorView } from 'prosemirror-view'
import styled from 'styled-components'
import debounce from 'lodash/debounce'

import { findElementOffsetTop, findElementOffsetLeft } from '../../../../utils'
import { imagePluginKey } from '../../Image'

interface FloatingImageMenu {
  view: EditorView
}

export default ({ view }: FloatingImageMenu) => {
  const { selectedImage } = imagePluginKey.getState(view.state)
  if (!selectedImage) return null
  const { node, pos } = selectedImage
  const [title, setTitle] = useState(node.attrs.title)
  const [alt, setAlt] = useState(node.attrs.alt)
  const { top, left } = view.coordsAtPos(pos)
  const [modalTop, setModalTop] = useState(top)
  const [modalLeft, setModalLeft] = useState(left)
  const wrapperRef = useRef() as React.MutableRefObject<HTMLElement>

  function positionImage() {
    const image = document.getElementsByClassName('tina-selected-image')[0]
    if (image) {
      const imageDimensions = image.getBoundingClientRect()
      const wrapperDimensions = wrapperRef.current.getBoundingClientRect()
      setModalLeft(
        imageDimensions.width / 2 +
          findElementOffsetLeft(image as HTMLElement) -
          wrapperDimensions.width / 2
      )
      setModalTop(
        imageDimensions.height +
          findElementOffsetTop(image as HTMLElement) -
          wrapperDimensions.height
      )
    }
  }

  const debouncedPositionImage = debounce(positionImage, 20)
  window.addEventListener('scroll', debouncedPositionImage)
  useEffect(positionImage, [selectedImage.pos])

  const updateNodeAttrs = () => {
    const { dispatch, state } = view
    const { image } = state.schema.nodes
    dispatch(
      state.tr.setNodeMarkup(pos, image, {
        ...node.attrs,
        alt,
        title,
      })
    )
    view.focus()
  }

  const closeImageSettings = () => {
    const { dispatch, state } = view
    dispatch(state.tr.setMeta('image_clicked', false))
  }

  return (
    <Wrapper top={modalTop} left={modalLeft} ref={wrapperRef}>
      <div>
        <span>Title</span>
        <span>
          <input value={title} onChange={evt => setTitle(evt.target.value)} />
        </span>
      </div>
      <div>
        <span>Alt</span>
        <span>
          <input value={alt} onChange={evt => setAlt(evt.target.value)} />
        </span>
      </div>
      <button onClick={updateNodeAttrs}>Save</button>
      <button onClick={closeImageSettings}>Cancel</button>
    </Wrapper>
  )
}

const Wrapper = styled.span<
  React.HTMLAttributes<HTMLDivElement> & {
    left: number
    top: number
    ref: React.MutableRefObject<HTMLElement>
  }
>`
  background: white;
  border: 1px solid gray;
  border-radius: 4px;
  padding: 20px;
  position: absolute;
  left: ${({ left }) => `${left}px`};
  top: ${({ top }) => `${top}px`};
`
