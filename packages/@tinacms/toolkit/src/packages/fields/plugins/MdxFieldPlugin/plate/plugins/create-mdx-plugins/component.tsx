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
import { Element } from 'slate'
import { useSelected, ReactEditor } from 'slate-react'
import { ELEMENT_PARAGRAPH, insertNodes } from '@udecode/plate-headless'
import { Transition, Popover } from '@headlessui/react'
import { NestedForm } from '../../nested-form'
import { classNames } from '../ui/helpers'
import { ELEMENT_MDX_INLINE } from '.'
import { EllipsisIcon } from '../ui/icons'
import { useEmbedHandles, useHotkey } from '../../hooks/embed-hooks'
import { useTemplates } from '../../editor-context'

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

export const InlineEmbed = ({
  attributes,
  children,
  element,
  onChange,
  editor,
}) => {
  const selected = useSelected()
  const { handleClose, handleRemove, handleSelect, isExpanded } =
    useEmbedHandles(editor, element)
  useHotkey('enter', () => {
    insertNodes(editor, [{ type: ELEMENT_PARAGRAPH, children: [{ text: '' }] }])
  })
  useHotkey('space', () => {
    insertNodes(editor, [{ text: ' ' }], {
      match: (n) => {
        if (Element.isElement(n) && n.type === ELEMENT_MDX_INLINE) {
          return true
        }
      },
      select: true,
    })
  })

  const templates = useTemplates()

  const activeTemplate = templates.find(
    (template) => template.name === element.name
  )

  const formProps = {
    activeTemplate,
    element,
    editor,
    onChange,
    onClose: handleClose,
  }

  if (!activeTemplate) {
    return null
  }

  const label = getLabel(activeTemplate, formProps)
  return (
    <span {...attributes}>
      {children}
      <Wrapper inline={true}>
        <span
          // give just enough margin so that the cursor is visible when adjacent to this node.
          style={{ margin: '0 0.5px' }}
          className="relative inline-flex shadow-sm rounded-md leading-none"
        >
          {selected && (
            <span className="absolute inset-0 ring-2 ring-blue-100 ring-inset rounded-md z-10 pointer-events-none" />
          )}
          <span
            style={{ fontWeight: 'inherit', maxWidth: '275px' }}
            // Tailwind reset puts styles on buttons
            className="truncate cursor-pointer relative inline-flex items-center justify-start px-2 py-0.5 rounded-l-md border border-gray-200 bg-white  hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            onMouseDown={handleSelect}
          >
            {label}
          </span>
          <DotMenu onOpen={handleSelect} onRemove={handleRemove} />
        </span>
        {isExpanded && <EmbedNestedForm {...formProps} />}
      </Wrapper>
    </span>
  )
}

export const BlockEmbed = ({
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

  const templates = useTemplates()

  const activeTemplate = templates.find(
    (template) => template.name === element.name
  )

  const formProps = {
    activeTemplate,
    element,
    editor,
    onChange,
    onClose: handleClose,
  }

  if (!activeTemplate) {
    return null
  }

  const label = getLabel(activeTemplate, formProps)
  return (
    <div {...attributes} className="w-full my-2">
      {children}
      <Wrapper inline={false}>
        <span className="relative w-full inline-flex shadow-sm rounded-md">
          {selected && (
            <span className="absolute inset-0 ring-2 ring-blue-100 ring-inset rounded-md z-10 pointer-events-none" />
          )}
          <span
            onMouseDown={handleSelect}
            className="truncate cursor-pointer w-full relative inline-flex items-center justify-start px-4 py-2 rounded-l-md border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {label}
          </span>
          <DotMenu onOpen={handleSelect} onRemove={handleRemove} />
        </span>
        {isExpanded && <EmbedNestedForm {...formProps} />}
      </Wrapper>
    </div>
  )
}

const getLabel = (activeTemplate, formProps) => {
  const titleField = activeTemplate.fields.find((field) => field.isTitle)
  let label = activeTemplate.label || activeTemplate.name
  if (titleField) {
    const titleValue = formProps.element.props[titleField.name]
    if (titleValue) {
      label = `${label}: ${titleValue}`
    }
  }

  return label
}

const EmbedNestedForm = ({
  editor,
  element,
  activeTemplate,
  onClose,
  onChange,
}) => {
  const path = ReactEditor.findPath(editor, element)
  const id = [...path, activeTemplate.name].join('.')
  return (
    <NestedForm
      id={id}
      label={activeTemplate.label}
      fields={activeTemplate.fields}
      initialValues={element.props}
      onChange={onChange}
      onClose={onClose}
    />
  )
}

const DotMenu = ({ onOpen, onRemove }) => {
  return (
    <Popover as="span" className="-ml-px relative block">
      <Popover.Button
        as="span"
        className="cursor-pointer h-full relative inline-flex items-center px-1 py-0.5 rounded-r-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      >
        <EllipsisIcon title="Open options" />
      </Popover.Button>
      <Transition
        as={React.Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Popover.Panel>
          <div className="z-30 origin-top-right absolute right-0 mt-2 -mr-1 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <span
                onClick={onOpen}
                className={classNames(
                  'cursor-pointer text-left w-full block px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                Edit
              </span>
              <button
                onMouseDown={(e) => {
                  e.preventDefault()
                  onRemove()
                }}
                className={classNames(
                  'cursor-pointer text-left w-full block px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                Remove
              </button>
            </div>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  )
}
