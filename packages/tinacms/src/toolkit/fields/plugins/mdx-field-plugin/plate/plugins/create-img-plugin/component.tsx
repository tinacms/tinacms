import React from 'react'
import { useSelected } from 'slate-react'
import { insertNodes, ELEMENT_PARAGRAPH } from '@udecode/plate-headless'
import { NestedForm } from '../../nested-form'
import { useEmbedHandles, useHotkey } from '../../hooks/embed-hooks'
import { useTemplates } from '../../editor-context'
import {
  DeleteImageButton,
  StyledFile,
  StyledImage,
} from '../../../../../components'
import { isImage } from '@toolkit/components/media/utils'

export const ImgEmbed = ({
  attributes,
  children,
  element,
  editor,
  onChange,
}) => {
  const selected = useSelected()
  const { fieldName } = useTemplates()
  const { handleClose, handleRemove, handleSelect, isExpanded } =
    useEmbedHandles(editor, element, fieldName)

  useHotkey('enter', () => {
    insertNodes(editor, [{ type: ELEMENT_PARAGRAPH, children: [{ text: '' }] }])
  })

  return (
    <span {...attributes} className="">
      {children}
      {element.url ? (
        <div
          className={`relative w-full max-w-full flex justify-start ${
            isImage(element.url) ? `items-start gap-3` : `items-center gap-2`
          }`}
        >
          <button
            className={`flex-shrink min-w-0 focus-within:shadow-outline focus-within:border-blue-500 rounded outline-none overflow-visible cursor-pointer border-none hover:opacity-60 transition ease-out duration-100 ${
              selected ? 'shadow-outline border-blue-500' : ''
            }`}
            onClick={handleSelect}
          >
            {isImage(element.url) ? (
              <StyledImage src={element.url} />
            ) : (
              <StyledFile src={element.url} />
            )}
          </button>
          <DeleteImageButton
            onClick={(e) => {
              e.stopPropagation()
              handleRemove()
            }}
          />
        </div>
      ) : (
        <button
          className="outline-none relative hover:opacity-60 w-full"
          onClick={handleSelect}
        >
          <div className="text-center rounded-[5px] bg-gray-100 text-gray-300 leading-[1.35] py-3 text-[15px] font-normal transition-all ease-out duration-100 hover:opacity-60">
            Click to select an image
          </div>
        </button>
      )}
      {isExpanded && (
        <ImageForm
          onChange={onChange}
          initialValues={element}
          onClose={handleClose}
          element={element}
        />
      )}
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
