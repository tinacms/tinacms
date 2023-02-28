/**

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
