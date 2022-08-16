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
import { Plate, createPlugins } from '@udecode/plate-headless'
import { components } from './plugins/ui/components'
import { Toolbar, FloatingToolbar, FloatingLink } from './plugins/ui/toolbar'
import { formattingPlugins, commonPlugins } from './plugins/core'
import { helpers } from './plugins/core/common'
import {
  createMdxBlockPlugin,
  createMdxInlinePlugin,
} from './plugins/create-mdx-plugins'
import { createImgPlugin } from './plugins/create-img-plugin'
import { createInvalidMarkdownPlugin } from './plugins/create-invalid-markdown-plugin'
import { createSlashPlugin } from './plugins/create-slash-plugin'
import { createLinkPlugin } from './plugins/create-link-plugin'
import { uuid } from './plugins/ui/helpers'
import { RichTextType } from '..'

export const RichEditor = (props: RichTextType) => {
  const initialValue = React.useMemo(
    () =>
      props.input.value?.children?.length
        ? props.input.value.children.map(helpers.normalize)
        : [{ type: 'p', children: [{ type: 'text', text: '' }] }],
    []
  )

  const plugins = React.useMemo(
    () =>
      createPlugins(
        [
          ...formattingPlugins,
          ...commonPlugins,
          createMdxBlockPlugin(),
          createMdxInlinePlugin(),
          createImgPlugin(),
          createInvalidMarkdownPlugin(),
          createLinkPlugin(),
          createSlashPlugin(),
        ],
        {
          components: components(),
        }
      ),
    []
  )

  // This should be a plugin customization
  const withToolbar = true
  const tempId = [props.tinaForm.id, props.input.name].join('.')
  const id = React.useMemo(() => uuid() + tempId, [tempId])

  return (
    <div className={withToolbar ? 'with-toolbar' : ''}>
      <Plate
        id={id}
        initialValue={initialValue}
        plugins={plugins}
        onChange={(value) => {
          props.input.onChange({ type: 'root', children: value })
        }}
        firstChildren={
          <>
            {withToolbar ? (
              <Toolbar templates={props.field.templates} inlineOnly={false} />
            ) : (
              <FloatingToolbar templates={props.field.templates} />
            )}
            <FloatingLink />
          </>
        }
      ></Plate>
    </div>
  )
}
