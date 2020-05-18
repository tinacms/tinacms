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
import { useEffect, useRef } from 'react'
import styled from 'styled-components'

import { ImageProps } from '../../types'
import { Menubar } from './Menubar'

export interface MarkdownEditorProps {
  toggleEditorMode: () => void
  imageProps?: ImageProps
  onChange: (value: string) => void
  value: string
}

const inputLineHeight = 20

export const MarkdownEditor = ({
  toggleEditorMode,
  imageProps,
  onChange,
  value,
}: MarkdownEditorProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Code below put focus to end of content in text area as component is mounted.
  useEffect(() => {
    const inputElm = inputRef.current
    if (!inputElm) return
    inputElm.focus()
    inputElm.setSelectionRange(inputElm.value.length, inputElm.value.length)
  }, [])

  // Code below resize textarea to its content
  useEffect(() => {
    const inputElm = inputRef.current
    if (!inputElm) return
    inputElm.style.height = '0'
    inputElm.style.height = inputElm.scrollHeight + inputLineHeight + 'px'
  })

  return (
    <>
      <Menubar toggleEditorMode={toggleEditorMode} imageProps={imageProps} />
      <EditingSection
        ref={inputRef}
        autoFocus
        value={value}
        onChange={evt => onChange(evt.target.value)}
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
