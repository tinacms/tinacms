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
import { useSelected } from 'slate-react'
import { insertNodes } from '@udecode/plate-core'
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph'
import { NestedForm } from '../../nested-form'
import { useEmbedHandles, useHotkey } from '../../hooks/embed-hooks'
import { DeleteImageButton } from '../../../../../../components'
import { LoadingDots } from '../../../../../../../form-builder'
import { useCMS } from '../../../../../../../react-core'

const Wrapper = ({ inline, children }) => {
  return (
    <span
      contentEditable={false}
      style={{ userSelect: 'none' }}
      className={`relative ${inline ? 'inline' : 'block'}`}
    >
      {children}
    </span>
  )
}

export const ImgEmbed = ({
  attributes,
  children,
  element,
  editor,
  onChange,
}) => {
  const selected = useSelected()
  const { handleClose, handleRemove, handleSelect, isExpanded } =
    useEmbedHandles(editor, element)

  useHotkey('enter', () => {
    insertNodes(editor, [{ type: ELEMENT_PARAGRAPH, children: [{ text: '' }] }])
  })
  const cms = useCMS()
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    const run = async () => {
      if (element.url) {
        // If it's base64 encoded, that means it came as a result of drag and drop, so upload
        // it to the media source
        if (element.url.startsWith('data')) {
          setIsLoading(true)
          // FIXME: the name "tina-upload" will actually be sent to Cloudinary and stored as part
          // of the name, not currently an easy way to grab the name of the
          // dropped file in the base64 url
          const filename = `tina-upload-${element.id}`
          const file = dataURLtoFile(element.url, filename)
          const allMedia = await cms.media.persist([
            {
              directory: '',
              file,
            },
          ])
          const item = allMedia.find((item) => item.filename === filename)
          // FIXME: if the user submits the form before this is updated they'll get
          // the base64 data url stored in markdown, which would be bad because it's
          // potentially very large. We should probably freeze form submission until
          // this is updated to mitigate that.
          onChange({
            ...element,
            url: item.src || item.previewSrc,
          })
          setIsLoading(false)
        }
      }
    }
    run()
  }, [element.url])

  return (
    <span {...attributes} className="w-full mb-2 block">
      <Wrapper inline={false}>
        <span className="relative w-full inline-flex shadow-sm rounded-md">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <div className="absolute inset-0 bg-white opacity-50" />
              <LoadingDots color="var(--tina-color-primary)" />
            </div>
          )}
          {selected && (
            <span className="z-10 absolute inset-0 ring-2 ring-blue-100 ring-inset rounded-md pointer-events-none" />
          )}
          <span className="z-10 block">
            <DeleteImageButton
              onClick={(e) => {
                e.stopPropagation()
                handleRemove()
              }}
            />
          </span>
          <span
            onMouseDown={handleSelect}
            style={{ minHeight: '50px' }}
            className="cursor-pointer flex items-center justify-center rounded-md w-full relative bg-gray-100 overflow-hidden"
          >
            {element.url ? (
              <img
                className="my-0"
                src={element.url}
                title={element.caption}
                alt={element.alt}
              />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-gray-300 p-4">
                <ImagePlaceholder />
              </span>
            )}
          </span>
        </span>
        {isExpanded && (
          <ImageForm
            onChange={onChange}
            initialValues={element}
            onClose={handleClose}
            element={element}
          />
        )}
      </Wrapper>
      {children}
    </span>
  )
}

const ImagePlaceholder = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-7 w-7 my-2"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export const ImageForm = (props) => {
  return (
    <NestedForm
      id="image-form"
      label="Image"
      fields={[
        {
          label: 'URL',
          name: 'url',
          component: 'image',
          // @ts-ignore Field type doesn't like this
          clearable: true,
        },
        { label: 'Caption', name: 'caption', component: 'text' },
        { label: 'Alt', name: 'alt', component: 'text' },
      ]}
      initialValues={props.initialValues}
      onChange={props.onChange}
      onClose={props.onClose}
    />
  )
}

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
