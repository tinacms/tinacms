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
import { FunctionComponent, useRef, useState } from 'react'

import { EditorState } from 'prosemirror-state'
import { blockTool } from './blockTool'
import { Dismissible } from 'react-dismissible'

// TODO: Move this into this module?
import { toggleHeader as th } from '../../../commands/heading-commands'
import { useEditorStateContext } from '../../../context/editorState'
import { MenuButton, MenuButtonDropdown } from './MenuComponents'
import styled, { css } from 'styled-components'
import { HeadingIcon } from '@tinacms/icons'
import { EditorView } from 'prosemirror-view'

export const BlockControl: FunctionComponent = () => {
  const [active, setActive] = useState(false)
  const menuButtonRef = useRef()
  const { editorView } = useEditorStateContext()
  const view = editorView!.view

  const toggle = () => setActive(!active)

  return (
    <>
      <MenuButton
        ref={menuButtonRef}
        data-tooltip={'Heading'}
        onClick={toggle}
        active={active}
      >
        <HeadingIcon />
      </MenuButton>
      <MenuButtonDropdown triggerRef={menuButtonRef} open={active}>
        <Dismissible click escape disabled={!active} onDismiss={toggle}>
          <H1 view={view} onClick={toggle} />
          <H2 view={view} onClick={toggle} />
          <H3 view={view} onClick={toggle} />
          <H4 view={view} onClick={toggle} />
          <H5 view={view} onClick={toggle} />
          <H6 view={view} onClick={toggle} />
        </Dismissible>
      </MenuButtonDropdown>
    </>
  )
}

function makeToggleHeader(level: number) {
  return function toggleHeader(
    state: EditorState,
    dispatch: typeof EditorView.prototype.dispatch
  ) {
    const tn = th(
      state.schema.nodes.heading,
      { level },
      state.schema.nodes.paragraph,
      null
    )

    return tn(state, dispatch)
  }
}

const BaseHeading = css`
  white-space: nowrap;
  line-height: 1;
  display: block;
  margin: 0;
`

const HeadingOne = styled.h1`
  ${BaseHeading}
`
const HeadingTwo = styled.h2`
  ${BaseHeading}
`
const HeadingThree = styled.h3`
  ${BaseHeading}
`
const HeadingFour = styled.h4`
  ${BaseHeading}
`
const HeadingFive = styled.h5`
  ${BaseHeading}
`
const HeadingSix = styled.h6`
  ${BaseHeading}
`

const H1 = blockTool({
  Component: HeadingOne,
  children: 'Heading 1',
  command: makeToggleHeader(1),
  typeName: 'heading',
  attrs: { level: 1 },
})
const H2 = blockTool({
  Component: HeadingTwo,
  children: 'Heading 2',
  command: makeToggleHeader(2),
  typeName: 'heading',
  attrs: { level: 2 },
})
const H3 = blockTool({
  Component: HeadingThree,
  children: 'Heading 3',
  command: makeToggleHeader(3),
  typeName: 'heading',
  attrs: { level: 3 },
})
const H4 = blockTool({
  Component: HeadingFour,
  children: 'Heading 4',
  command: makeToggleHeader(4),
  typeName: 'heading',
  attrs: { level: 4 },
})
const H5 = blockTool({
  Component: HeadingFive,
  children: 'Heading 5',
  command: makeToggleHeader(5),
  typeName: 'heading',
  attrs: { level: 5 },
})
const H6 = blockTool({
  Component: HeadingSix,
  children: 'Heading 6',
  command: makeToggleHeader(6),
  typeName: 'heading',
  attrs: { level: 6 },
})
