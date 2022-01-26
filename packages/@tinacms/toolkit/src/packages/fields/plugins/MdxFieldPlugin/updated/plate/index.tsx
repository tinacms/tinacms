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
import { Plate, createPlugins } from '@udecode/plate-core'
import { wrapFieldsWithMeta } from '../../../wrapFieldWithMeta'
import { components } from './plugins/ui/components'
import { Toolbar, FloatingToolbar, FloatingLink } from './plugins/ui/toolbar'
import { formattingPlugins, commonPlugins } from './plugins/core'
import { helpers } from './plugins/core/common'
import {
  createMdxBlockPlugin,
  createMdxInlinePlugin,
} from './plugins/create-mdx-plugins'
import { createImgPlugin } from './plugins/create-img-plugin'
import { createSlashPlugin } from './plugins/create-slash-plugin'
import { createLinkPlugin } from './plugins/create-link-plugin'
import { EditorContext } from './editor-context'

import type { MdxTemplate } from './types'
import type { InputProps } from '../../../../components'
import { uuid } from './plugins/ui/helpers'

export const RichEditor = wrapFieldsWithMeta<
  InputProps,
  { templates: MdxTemplate[] }
>((props) => {
  const [value, setValue] = React.useState(
    props.input.value?.children?.length
      ? props.input.value.children.map(helpers.normalize)
      : [{ type: 'p', children: [{ type: 'text', text: '' }] }]
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
          createLinkPlugin(),
          createSlashPlugin(),
        ],
        {
          components: components(),
        }
      ),
    []
  )

  React.useEffect(() => {
    props.input.onChange({ type: 'root', children: value })
  }, [JSON.stringify(value)])

  // This should be a plugin customization
  const withToolbar = true
  // const withToolbar = false
  const tempId = [props.tinaForm.id, props.input.name].join('.')
  const id = React.useMemo(() => uuid(), [tempId])
  return (
    <EditorContext.Provider value={{ templates: props.field.templates }}>
      <div className={withToolbar ? 'with-toolbar' : ''}>
        <div
          className="prose relative shadow-inner focus:shadow-outline focus:border-blue-500 block w-full bg-white border border-gray-200 text-gray-600 focus:text-gray-900 rounded-md px-3 py-2 mb-5"
          style={{
            minHeight: withToolbar ? '100px' : 'auto',
            maxWidth: `100%`,
          }}
        >
          <Plate
            id={id}
            initialValue={value}
            plugins={plugins}
            normalizeInitialValue={true}
            onChange={(value) => {
              // console.log(JSON.stringify(value, null, 2))
              setValue(value)
            }}
          >
            {withToolbar ? (
              <Toolbar templates={props.field.templates} inlineOnly={false} />
            ) : (
              <FloatingToolbar templates={props.field.templates} />
            )}
            <FloatingLink />
          </Plate>
        </div>
      </div>
    </EditorContext.Provider>
  )
})
