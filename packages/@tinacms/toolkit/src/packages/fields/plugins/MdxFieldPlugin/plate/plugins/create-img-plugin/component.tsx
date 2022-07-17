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
import { insertNodes, ELEMENT_PARAGRAPH } from '@udecode/plate-headless'
import { NestedForm } from '../../nested-form'
import { useEmbedHandles, useHotkey } from '../../hooks/embed-hooks'
import { DeleteImageButton } from '../../../../../components'

const Wrapper = ({ inline, children }) => {
  const Component = inline ? 'span' : 'div'
  return (
    <Component
      contentEditable={false}
      style={{ userSelect: 'none' }}
      className="relative"
    >
      {children}
    </Component>
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

  return (
    <div {...attributes} className="w-full mb-2">
      {children}
      <Wrapper inline={false}>
        <span className="relative w-full inline-flex shadow-sm rounded-md">
          {selected && (
            <span className="z-10 absolute inset-0 ring-2 ring-blue-100 ring-inset rounded-md pointer-events-none" />
          )}
          <div className="z-10">
            <DeleteImageButton
              onClick={(e) => {
                e.stopPropagation()
                handleRemove()
              }}
            />
          </div>
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
              <span className="absolute inset-0 flex items-center justify-center text-gray-300">
                <span>Click to add an image</span>
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
    </div>
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
