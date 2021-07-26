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

import React from 'react'

import { ProsemirrorMenu as BlockMenu } from '../../../plugins/Block'
import { ProsemirrorMenu as CodeBlockMenu } from '../../../plugins/CodeBlock'
import { ProsemirrorMenu as HistoryMenu } from '../../../plugins/History'
import { ProsemirrorMenu as InlineMenu } from '../../../plugins/Inline'
import { ProsemirrorMenu as ListMenu } from '../../../plugins/List'
import { ProsemirrorMenu as QuoteMenu } from '../../../plugins/Blockquote'
import { ProsemirrorMenu as TableMenu } from '../../../plugins/Table'
import { ProsemirrorMenu as ImageMenu } from '../../../plugins/Image'
import { ProsemirrorMenu as LinkMenu } from '../../../plugins/Link'

import { TablePopups } from '../../../plugins/Table/Popup'
import {
  // ImageEdit as ImageEditPopup,
  Loader as ImageLoader,
} from '../../../plugins/Image'
import { LinkForm as LinkFormPopup } from '../../../plugins/Link'

import { ImageProps, Plugin } from '../../../types'
import { useEditorStateContext } from '../../../context/editorState'
import { BaseMenubar } from '../../BaseMenubar'

interface Props {
  sticky?: boolean | string
  imageProps?: ImageProps
  plugins?: Plugin[]
}

export const Menubar = ({ plugins, imageProps, ...rest }: Props) => {
  const { editorView } = useEditorStateContext()

  if (!editorView) return null

  return (
    <BaseMenubar
      {...rest}
      menus={[
        <BlockMenu key="BlockMenu" />,
        <InlineMenu key="InlineMenu" />,
        <LinkMenu key="LinkMenu" />,
        <ImageMenu key="ImageMenu" imageProps={imageProps} />,
        <TableMenu key="TableMenu" />,
        <QuoteMenu key="QuoteMenu" />,
        <CodeBlockMenu key="CodeBlockMenu" />,
        <ListMenu key="ListMenu" />,
        <HistoryMenu key="HistoryMenu" />,
      ]}
      popups={[
        <TablePopups key="TablePopups" />,
        // <ImageEditPopup key="ImageEditPopup" />,
        <LinkFormPopup key="LinkFormPopup" />,
        <ImageLoader key="ImageLoader" />,
      ]}
      plugins={plugins}
    />
  )
}
