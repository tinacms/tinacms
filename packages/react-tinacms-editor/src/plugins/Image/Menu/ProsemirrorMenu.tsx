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

import React, { useRef } from 'react'

import { useCMS, Media } from '@einsteinindustries/tinacms'
import { MediaIcon } from '@einsteinindustries/tinacms-icons'

import { MenuButton } from '../../../components/MenuHelpers'
import { useEditorStateContext } from '../../../context/editorState'
import { insertImage } from '../commands'
import { ImageProps } from '../../../types'

export interface MenuProps {
  imageProps?: ImageProps
}

export const ProsemirrorMenu = ({ imageProps }: MenuProps) => {
  const cms = useCMS()
  const menuButtonRef = useRef()
  const { editorView } = useEditorStateContext()

  if (!imageProps || !imageProps.upload) return null

  const { parse, mediaDir } = imageProps

  const insertImageInEditor = (src: string) => {
    if (!editorView) return
    const { state, dispatch } = editorView.view
    insertImage(state, dispatch, src)
    editorView.view.focus()
  }

  async function onMediaSelect(media?: Media) {
    if (media) {
      insertImageInEditor(parse(media))
    }
  }

  return (
    <>
      <MenuButton
        title="Image"
        ref={menuButtonRef}
        onClick={() => {
          cms.media.open({
            directory: mediaDir || '/',
            onSelect: onMediaSelect,
          })
        }}
      >
        <MediaIcon />
      </MenuButton>
    </>
  )
}
