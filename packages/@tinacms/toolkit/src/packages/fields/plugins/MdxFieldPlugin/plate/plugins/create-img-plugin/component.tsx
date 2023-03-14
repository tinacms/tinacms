/**

*/

import React from 'react'
import { useSelected } from 'slate-react'
import { insertNodes, ELEMENT_PARAGRAPH } from '@udecode/plate-headless'
import { NestedForm } from '../../nested-form'
import { useEmbedHandles, useHotkey } from '../../hooks/embed-hooks'
import { DeleteImageButton } from '../../../../../components'

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
    <span {...attributes} className="">
      {children}
      <span className="relative">
        <span className="relative inline-flex shadow-sm rounded-md">
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
            className="min-w-[200px] max-w-[400px] cursor-pointer rounded-md relative bg-gray-100 overflow-hidden relative"
          >
            {element.url ? (
              <img
                src={element.url}
                title={element.caption}
                alt={element.alt}
                className="my-0 min-h-[100px]"
              />
            ) : (
              <span className="min-h-[100px] min-w-[200px] flex items-center justify-center text-gray-300">
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
      </span>
    </span>
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
