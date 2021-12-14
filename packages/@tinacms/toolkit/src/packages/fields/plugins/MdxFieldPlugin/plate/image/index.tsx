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
import { getPlatePluginTypes, getRenderElement } from '@udecode/plate'
import { Transforms } from 'slate'
import { usePlateEditorRef } from '@udecode/plate'
import { useSelected, useFocused, ReactEditor } from 'slate-react'
import { Form } from '../../../../../forms'
import { useCMS } from '../../../../../react-core'
import { ImageField } from './field'

// Transform encoded data URL to File (for image updloads)
function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

export const Img = (props) => {
  const editor = usePlateEditorRef(props.name)
  const isFocused = useFocused()
  const isSelected = useSelected()
  const cms = useCMS()

  const [localState, setLocalState] = React.useState({
    caption: props.element.caption,
    url: props.element.url,
    alt: props.element.alt,
    children: [{ text: '' }],
  })
  React.useEffect(() => {
    const run = async () => {
      if (props.element.url) {
        // If it's base64 encoded, that means it came as a result of drag and drop, so upload
        // it to the media source
        if (props.element.url.startsWith('data')) {
          // FIXME: the name "tina-upload" will actually be sent to Cloudinary and stored as part
          // of the name, not currently an easy way to grab the name of the
          // dropped file in the base64 url
          const file = dataURLtoFile(props.element.url, 'tina-upload')
          const allMedia = await cms.media.persist([
            {
              directory: '',
              file,
            },
          ])
          // FIXME: if the user submits the form before this is updated they'll get
          // the base64 data url stored in markdown, which would be bad because it's
          // potentially very large. We should probably freeze form submission until
          // this is updated to mitigate that.
          setLocalState({
            ...localState,
            url: allMedia[0].src || allMedia[0].previewSrc,
          })
        }
      }
      Transforms.setNodes(editor, localState, {
        at: ReactEditor.findPath(editor, props.element),
      })
    }
    run()
  }, [editor, JSON.stringify(localState)])
  const id = props.element.name + Math.floor(Math.random() * 100)
  const form = React.useMemo(() => {
    return new Form({
      id,
      label: id,
      initialValues: {
        url: props.element.url,
        caption: props.element.caption,
        alt: props.element.alt,
      },
      onChange: ({ values }) => {
        // @ts-ignore onChange values uses `any` heavily, making typechecking useless
        setLocalState(values)
      },
      onSubmit: () => {},
      fields: [
        {
          name: 'url',
          label: 'Source',
          component: 'image',
        },
        {
          name: 'caption',
          label: 'Caption',
          component: 'text',
        },
        {
          name: 'alt',
          label: 'Alt',
          component: 'text',
        },
      ],
    })
  }, [setLocalState])

  return (
    <span
      {...props.attributes}
      style={{
        display: 'block',
        boxShadow: isSelected && isFocused ? '0 0 0 3px #B4D5FF' : 'none',
      }}
    >
      <span
        style={{
          userSelect: 'none',
        }}
        contentEditable={false}
      >
        <ImageField tinaForm={form}>
          <img
            style={{ width: '100%' }}
            src={localState.url}
            alt={props.element.alt}
          />
          <span
            style={{
              display: 'block',
              margin: '8px auto 0',
              textAlign: 'center',
            }}
          >
            {localState.caption}
          </span>
        </ImageField>
      </span>
      {props.children}
    </span>
  )
}

export const createTinaImagePlugin = () => {
  return {
    pluginKeys: 'img',
    voidTypes: getPlatePluginTypes('img'),
    inlineTypes: getPlatePluginTypes('img'),
    renderElement: getRenderElement('img'),
  }
}
