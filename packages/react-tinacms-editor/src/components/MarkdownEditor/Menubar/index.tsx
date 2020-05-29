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

import { MarkdownMenu as BlockMenu } from '../../../plugins/Block'
import { MarkdownMenu as CodeBlockMenu } from '../../../plugins/CodeBlock'
import { MarkdownMenu as HistoryMenu } from '../../../plugins/History'
import { MarkdownMenu as InlineMenu } from '../../../plugins/Inline'
import { MarkdownMenu as ListMenu } from '../../../plugins/List'
import { MarkdownMenu as QuoteMenu } from '../../../plugins/Blockquote'
import { MarkdownMenu as TableMenu } from '../../../plugins/Table'
import { MarkdownMenu as ImageMenu } from '../../../plugins/Image'
import { MarkdownMenu as LinkMenu } from '../../../plugins/Link'

import { Plugin } from '../../../types'
import { BaseMenubar } from '../../BaseMenubar'

interface Props {
  sticky?: boolean | string
  uploadImages?: (files: File[]) => Promise<string[]>
  plugins?: Plugin[]
}

export const Menubar = ({ plugins, uploadImages, ...rest }: Props) => (
  <BaseMenubar
    {...rest}
    menus={[
      <BlockMenu />,
      <InlineMenu />,
      <LinkMenu />,
      <ImageMenu uploadImages={uploadImages} />,
      <TableMenu />,
      <QuoteMenu />,
      <CodeBlockMenu />,
      <ListMenu />,
      <HistoryMenu />,
    ]}
    plugins={plugins}
  />
)
