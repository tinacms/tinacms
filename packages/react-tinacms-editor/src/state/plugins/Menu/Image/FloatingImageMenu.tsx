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

import React, { useState, useRef, useEffect, FunctionComponent } from 'react'
import debounce from 'lodash.debounce'
import styled from 'styled-components'
import { TinaReset } from '@tinacms/styles'

import { findElementOffsetTop, findElementOffsetLeft } from '../../../../utils'
import { imagePluginKey } from '../../Image'
import { NodeSelection } from 'prosemirror-state'
import { Mark } from 'prosemirror-model'
import { useEditorStateContext } from '../../../../context/editorState'

export const FloatingImageMenu: FunctionComponent = () => {
  const { editorView } = useEditorStateContext()
  const view = editorView!.view
  const { selectedImage } = imagePluginKey.getState(view.state)
  if (!selectedImage) return null
  const { node, pos } = selectedImage
  const { link } = view.state.schema.marks
  const linkMark = node.marks.find((mark: Mark) => mark.type === link)
  const [title, setTitle] = useState(node.attrs.title)
  const [alt, setAlt] = useState(node.attrs.alt)
  const [linkTitle, setLinkTitle] = useState(linkMark && linkMark.attrs.title)
  const [linkSrc, setLinkSrc] = useState(linkMark && linkMark.attrs.href)
  const { top, left } = view.coordsAtPos(pos)
  const [modalTop, setModalTop] = useState(top)
  const [modalLeft, setModalLeft] = useState(left)
  const wrapperRef = useRef() as React.MutableRefObject<HTMLElement>
  const inputRef = useRef() as React.MutableRefObject<HTMLInputElement>
  const imageRef = useRef() as React.MutableRefObject<HTMLImageElement>
  const [linked, toggleLinked] = useState(!!linkMark)

  function positionImage(scroll?: boolean) {
    const image = document.getElementsByClassName('tina-selected-image')[0]
    const wysiwygWrapper = document.getElementsByClassName('wysiwyg-wrapper')[0]
    if (image && (imageRef.current !== image || scroll) && wrapperRef.current) {
      imageRef.current = image as any
      const wrapperDimensions = wrapperRef.current.getBoundingClientRect()
      setModalLeft(
        image.clientWidth / 2 +
          findElementOffsetLeft(
            image as HTMLElement,
            wysiwygWrapper as HTMLElement
          ) -
          wrapperDimensions.width / 2
      )
      setModalTop(
        findElementOffsetTop(
          image as HTMLElement,
          wysiwygWrapper as HTMLElement
        )
      )
    }
  }

  useEffect(() => {
    const debouncedPositionImage = debounce(() => positionImage(true), 10)
    window.addEventListener('scroll', debouncedPositionImage)
    return () => {
      window.removeEventListener('scroll', debouncedPositionImage)
    }
  })

  useEffect(() => {
    setLinkTitle(linkMark ? linkMark.attrs.title : '')
    setLinkSrc(linkMark ? linkMark.attrs.href : '')
    toggleLinked(!!linkMark)
  }, [linkMark])

  useEffect(() => {
    setTitle(node.attrs.title)
    setAlt(node.attrs.alt)
  }, [selectedImage.node])

  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus()
    })
  }, [inputRef])

  useEffect(positionImage)

  const updateNodeAttrs = () => {
    const { dispatch, state } = view
    const { image } = state.schema.nodes
    const { link } = state.schema.marks
    const { tr } = state
    if (linked && (linkSrc || linkTitle)) {
      tr.addMark(pos, pos + 1, link.create({ href: linkSrc, title: linkTitle }))
    } else {
      tr.removeMark(pos, pos + 1, link)
    }
    tr.setNodeMarkup(pos, image, {
      ...node.attrs,
      alt,
      title,
    }).setSelection(new NodeSelection(tr.doc.resolve(pos)))
    dispatch(tr)
    closeImageSettings()
  }

  const closeImageSettings = () => {
    const { dispatch, state } = view
    dispatch(state.tr.setMeta('image_clicked', false))
    setTitle('')
    setAlt('')
    setLinkTitle('')
    setLinkSrc('')
  }

  const handleKeyPress = (evt: React.KeyboardEvent) => {
    if (evt.key === 'Escape') closeImageSettings()
    if (evt.key === 'Enter') updateNodeAttrs()
  }

  return (
    <TinaReset>
      <LinkPopup
        top={modalTop}
        left={modalLeft}
        ref={wrapperRef}
        onKeyDown={handleKeyPress}
      >
        <LinkLabel>Title</LinkLabel>
        <LinkInput
          placeholder="Enter Title"
          type={'text'}
          ref={inputRef}
          value={title}
          onChange={evt => setTitle(evt.target.value)}
        />
        <LinkLabel>Alt</LinkLabel>
        <LinkInput
          placeholder="Enter Alt Text"
          type={'text'}
          value={alt}
          onChange={evt => setAlt(evt.target.value)}
        />
        <ToggleElement>
          <ToggleInput
            id="toggleImageLink"
            onChange={() => {
              toggleLinked(!linked)
              if (!linked) {
                setLinkTitle('')
                setLinkSrc('')
              }
            }}
            type="checkbox"
          />
          <ToggleLabel htmlFor="toggleImageLink" role="switch">
            Insert Link
            <ToggleSwitch checked={linked}>
              <span></span>
            </ToggleSwitch>
          </ToggleLabel>
        </ToggleElement>
        {linked && (
          <>
            <LinkLabel>Link Title</LinkLabel>
            <LinkInput
              placeholder="Enter Link Title"
              type={'text'}
              value={linkTitle}
              onChange={evt => setLinkTitle(evt.target.value)}
            />
            <LinkLabel>Link URL</LinkLabel>
            <LinkInput
              placeholder="Enter Link URL"
              type={'text'}
              value={linkSrc}
              onChange={evt => setLinkSrc(evt.target.value)}
            />
          </>
        )}
        <LinkActions>
          <CancelLink onClick={closeImageSettings}>Cancel</CancelLink>
          <SaveLink onClick={updateNodeAttrs}>Save</SaveLink>
        </LinkActions>
      </LinkPopup>
    </TinaReset>
  )
}

const LinkPopup = styled.span<{
  left: number
  top: number
}>`
  background-color: #f6f6f9;
  position: absolute;
  border-radius: var(--tina-radius-small);
  border: 1px solid var(--tina-color-grey-2);
  filter: drop-shadow(0px 4px 8px rgba(48, 48, 48, 0.1))
    drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.12));
  transform-origin: 50% 0;
  overflow: visible;
  padding: 12px;
  z-index: 10;
  width: 16rem;
  left: ${({ left }) => `${left}px`};
  top: ${({ top }) => `${top}px`};
`

const LinkLabel = styled.label`
  display: block;
  font-size: var(--tina-font-size-1);
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--tina-color-grey-8);
  margin-bottom: 3px;
`

const LinkInput = styled.input`
  position: relative;
  background-color: white;
  border-radius: var(--tina-radius-small);
  font-size: var(--tina-font-size-1);
  line-height: 1.35;
  transition: all 85ms ease-out;
  padding: 8px 12px;
  border: 1px solid var(--tina-color-grey-2);
  width: 100%;
  margin: 0 0 8px 0;
  outline: none;
  box-shadow: 0 0 0 2px transparent;

  &:hover {
    box-shadow: 0 0 0 2px var(--tina-color-grey-3);
  }

  &:focus {
    box-shadow: 0 0 0 2px var(--tina-color-primary);
  }

  &::placeholder {
    font-size: var(--tina-font-size-2);
    color: #cfd3d7;
  }
`

const LinkActions = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 4px;
`

const SaveLink = styled.button`
  text-align: center;
  border: 0;
  border-radius: var(--tina-radius-big);
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.12);
  background-color: var(--tina-color-primary);
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 85ms ease-out;
  font-size: var(--tina-font-size-0);
  padding: 8px 20px;
  margin-left: 8px;
  &:hover {
    background-color: var(--tina-color-primary-light);
  }
  &:active {
    background-color: var(--tina-color-primary-dark);
  }
`

const CancelLink = styled(SaveLink)`
  background-color: white;
  border: 1px solid var(--tina-color-grey-2);
  color: var(--tina-color-primary);
  &:hover {
    background-color: var(--tina-color-grey-1);
    opacity: 1;
  }
`

const ToggleElement = styled.div`
  display: block;
  position: relative;
  margin: 0 0 0.5rem 0;
`

const ToggleLabel = styled.label<{ disabled?: boolean }>`
  background: none;
  color: inherit;
  padding: 0;
  opacity: ${props => (props.disabled ? '0.4' : '1')};
  outline: none;
  height: 28px;
  pointer-events: ${props => (props.disabled ? 'none' : 'inherit')};
  font-size: var(--tina-font-size-1);
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1.35;
  color: var(--tina-color-grey-8);
`

const ToggleSwitch = styled.div<{ checked: boolean }>`
  position: relative;
  width: 48px;
  height: 28px;
  border-radius: var(--tina-radius-big);
  background-color: white;
  border: 1px solid var(--tina-color-grey-2);
  pointer-events: none;
  margin-left: -2px;
  span {
    position: absolute;
    border-radius: var(--tina-radius-big);
    left: 2px;
    top: 50%;
    width: calc(28px - 6px);
    height: calc(28px - 6px);
    background: ${p =>
      p.checked ? 'var(--tina-color-primary)' : 'var(--tina-color-grey-3)'};
    transform: translate3d(${p => (p.checked ? '20px' : '0')}, -50%, 0);
    transition: all 150ms ease-out;
  }
`

const ToggleInput = styled.input`
  position: absolute;
  left: 0;
  top: 0;
  width: 48px;
  height: 28px;
  opacity: 0;
  margin: 0;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
`
