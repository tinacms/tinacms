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

import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { useBrowserFocusContext } from '../../context/browserFocus'
import { ImageProps, Plugin } from '../../types'
import { Menubar } from './Menubar'

export interface MarkdownEditorProps {
  imageProps?: ImageProps
  onChange: (value: string) => void
  value: string
  plugins?: Plugin[]
  sticky?: boolean | string
}

const inputLineHeight = 20

export const MarkdownEditor = ({
  imageProps,
  onChange,
  value,
  plugins,
  sticky,
}: MarkdownEditorProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [val, setVal] = useState(value)
  const { browserFocused } = useBrowserFocusContext()

  // Code below put focus to end of content in text area as component is mounted.
  useEffect(() => {
    const inputElm = inputRef.current
    if (!inputElm) return
    inputElm.focus({ preventScroll: true })
    inputElm.setSelectionRange(inputElm.value.length, inputElm.value.length)
  }, [])

  // Code below resize textarea to its content
  useEffect(() => {
    const inputElm = inputRef.current
    if (!inputElm) return
    inputElm.style.height = '0'
    inputElm.style.height = inputElm.scrollHeight + inputLineHeight + 'px'
  })

  // Code below update component content if new value is received when editor is not focused.
  useEffect(() => {
    const editorElementFocused = inputRef.current === document.activeElement
    if (browserFocused && editorElementFocused) return
    setVal(value)
  }, [value])

  return (
    <>
      <Menubar
        sticky={sticky}
        uploadImages={imageProps?.upload}
        plugins={plugins}
      />
      <EditingSection
        data-testid="markdown-editing-textarea"
        ref={inputRef}
        value={val}
        onChange={evt => {
          const v = evt.target.value
          setVal(v)
          onChange(v)
        }}
        onFocus={e => {
          e.preventDefault()
          e.target.focus({ preventScroll: true })
        }}
      />
    </>
  )
}

const EditingSection = styled.textarea`
  border: none;
  font-family: monospace;
  font-size: 16px;
  margin: 10px 0;
  resize: none;
  width: 100%;
  &:focus {
    outline: none;
  }
`
