/**

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
// import { createSlashPlugin } from './plugins/create-slash-plugin'
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
          // This is a bit buggy
          // createSlashPlugin(),
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
