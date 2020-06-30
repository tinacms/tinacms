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

import React from 'react'

import { useEditorStateContext } from '../../context/editorState'
import { MenuButton } from './MenuButton'

export const commandControl = (
  command: any,
  Icon: any, // Fix type
  _title: string,
  tooltip: string,
  focusOnCreate: boolean = true
) => () => {
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
      disabled={!canDo()}
      onMouseDown={evt => {
        evt.preventDefault()
        evt.stopPropagation()
      }}
    >
      <Icon />
    </MenuButton>
  )
}
