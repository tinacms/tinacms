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

import React, { Fragment } from 'react'
import { PlusIcon, HeadingIcon, ToolbarIcon } from '../icons'
import { Popover, Transition } from '@headlessui/react'
import { useEditorState, isCollapsed } from '@udecode/plate-headless'
import { insertMDX } from '../../create-mdx-plugins'
import {
  LinkForm,
  wrapOrRewrapLink,
  isLinkActive,
} from '../../create-link-plugin'

import type { PlateEditor } from '@udecode/plate-headless'
import type { MdxTemplate } from '../../../types'
import { insertImg } from '../../create-img-plugin'

export type ToolbarItemType = {
  label: string
  name: string
  inlineOnly?: boolean
  hidden?: boolean
  active?: boolean
  onMouseDown?: (event: any) => void
  icon?: string
  options?: {}[]
  isLastItem?: boolean
}

export const ToolbarItem = ({
  hidden,
  label,
  active,
  onMouseDown,
  icon,
  options,
  name,
  isLastItem = false,
}: ToolbarItemType) => {
  const editor = useEditorState()!
  const [selection, setSelection] = React.useState(null)

  React.useEffect(() => {
    if (editor.selection) {
      setSelection(editor.selection)
    }
  }, [JSON.stringify(editor.selection)])

  const [isExpanded, setIsExpanded] = React.useState(false)
  if (options) {
    return (
      <Popover as="div" className="relative z-10 w-full">
        <Popover.Button
          as="span"
          className={`cursor-pointer w-full inline-flex justify-center items-center px-2 py-2 rounded-l-md border-l border-b border-t border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
            isLastItem ? 'border-r rounded-r-md' : 'border-r-0'
          }`}
          onMouseDown={(e) => {
            e.preventDefault()
          }}
        >
          <span className="sr-only">Open options</span>
          <HeadingIcon />
        </Popover.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Popover.Panel>
            {({ close }) => (
              <div className="origin-top-left absolute left-0 mt-2 -mr-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-2 tina-prose">
                  {/* FIXME: this close() should be handled from within the options callback that are passed in */}
                  <span onMouseDown={() => close()}>{options}</span>
                </div>
              </div>
            )}
          </Popover.Panel>
        </Transition>
      </Popover>
    )
  }
  if (icon === 'image') {
    return (
      <span className="relative">
        <span
          data-test={`${name}Button`}
          className={`cursor-pointer w-full inline-flex relative justify-center items-center px-2 py-2 border-l border-b border-t border-r-0 border-gray-200 text-sm font-medium  hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
            active ? 'bg-gray-50 text-blue-500' : 'bg-white text-gray-600'
          } ${isLastItem ? 'border-r rounded-r-md' : 'border-r-0'}`}
          style={{
            visibility: hidden ? 'hidden' : 'visible',
            pointerEvents: hidden ? 'none' : 'auto',
          }}
          onMouseDown={(e) => {
            e.preventDefault()
            insertImg(editor)
          }}
        >
          <span className="sr-only">{label}</span>
          <ToolbarIcon name={icon} />
        </span>
      </span>
    )
  }
  if (icon === 'link') {
    const isDisabled =
      !editor.selection ||
      // If selection is collapsed and the cursor is _not_ inside a link
      (isCollapsed(editor.selection) && !isLinkActive(editor))
    return (
      <span className="relative">
        <span
          data-test={`${name}Button`}
          className={`cursor-pointer w-full inline-flex relative justify-center items-center px-2 py-2 border-l border-b border-t border-r-0 border-gray-200 text-sm font-medium  hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
            active
              ? 'bg-gray-50 text-blue-500'
              : isDisabled
              ? 'bg-gray-50 text-gray-300'
              : 'bg-white text-gray-600'
          } ${isLastItem ? 'border-r rounded-r-md' : 'border-r-0'}`}
          style={{
            visibility: hidden ? 'hidden' : 'visible',
            pointerEvents: hidden ? 'none' : 'auto',
          }}
          onMouseDown={(e) => {
            e.preventDefault()
            if (isDisabled) {
              return
            }
            wrapOrRewrapLink(editor)
            setIsExpanded((isExpanded) => !isExpanded)
          }}
        >
          <span className="sr-only">{label}</span>
          <ToolbarIcon name={icon} />
        </span>

        {isExpanded && (
          <LinkForm
            selection={selection}
            onClose={() => {
              setIsExpanded(false)
            }}
            onChange={(v) => console.log(v)}
          />
        )}
      </span>
    )
  }

  return (
    <span
      data-test={`${name}Button`}
      className={`cursor-pointer w-full inline-flex relative justify-center items-center px-2 py-2 border-l border-b border-t border-r-0 border-gray-200 text-sm font-medium  hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
        active ? 'bg-gray-50 text-blue-500' : 'bg-white text-gray-600'
      } ${isLastItem ? 'border-r rounded-r-md' : 'border-r-0'}`}
      style={{
        visibility: hidden ? 'hidden' : 'visible',
        pointerEvents: hidden ? 'none' : 'auto',
      }}
      onMouseDown={onMouseDown}
    >
      <span className="sr-only">{label}</span>
      <ToolbarIcon name={icon} />
    </span>
  )
}

export const EmbedButton = ({
  editor,
  templates,
}: {
  editor: PlateEditor
  templates: MdxTemplate[]
}) => {
  return (
    <Popover
      as="span"
      className="relative z-10 block"
      style={{ width: '85px' }}
    >
      {({ open }) => (
        <>
          <Popover.Button
            as="span"
            onMouseDown={(e) => {
              e.preventDefault()
            }}
            className={`cursor-pointer relative inline-flex items-center px-2 py-2 rounded-r-md border  text-sm font-medium transition-all ease-out duration-150 hover:bg-blue-500 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
              open
                ? `bg-gray-50 border-gray-200 text-blue-500`
                : `text-white border-blue-500 bg-blue-500`
            }`}
          >
            <span className="text-sm font-semibold tracking-wide align-baseline mr-1">
              Embed
            </span>
            <PlusIcon
              className={`origin-center transition-all ease-out duration-150 ${
                open ? `rotate-45` : ``
              }`}
            />
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Popover.Panel>
              {({ close }) => (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none py-1 max-h-[10rem] overflow-y-auto">
                  {templates.map((template) => (
                    <span
                      key={template.name}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        close()
                        insertMDX(editor, template)
                      }}
                      className={`hover:bg-gray-50 hover:text-blue-500 cursor-pointer pointer-events-auto px-4 py-2 text-sm w-full flex items-center`}
                    >
                      {template.label || template.name}
                    </span>
                  ))}
                </div>
              )}
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
