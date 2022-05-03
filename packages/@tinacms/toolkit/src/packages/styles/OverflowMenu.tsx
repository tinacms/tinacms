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

// Copied form packages/@tinacms/toolkit/src/packages/fields/plugins/MdxFieldPlugin/updated/plate/plugins/ui/toolbar/overflow-menu.tsx but used in a different way

import React, { Fragment } from 'react'
import { Popover, Transition } from '@headlessui/react'

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export const OverflowMenu = ({ toolbarItems }) => {
  return (
    <Popover as="div" className="relative block w-full">
      {({ open }) => (
        <>
          <Popover.Button
            data-test="popoverRichTextButton"
            className={`cursor-pointer relative w-full justify-center inline-flex border items-center p-3 text-sm font-medium focus:outline-none pointer-events-auto ${
              open ? `text-blue-400` : `text-gray-300 hover:text-blue-500`
            }`}
            onMouseDown={(e) => {
              e.preventDefault()
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
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
                <div className="z-20 origin-top-right absolute right-0 mt-0 -mr-1 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none py-1">
                  {toolbarItems.map((toolbarItem) => {
                    return (
                      <span
                        data-test={`${toolbarItem.name}OverflowButton`}
                        key={toolbarItem.name}
                        onMouseDown={(event) => {
                          event.preventDefault()
                          close()
                          toolbarItem.onMouseDown(event)
                        }}
                        className={classNames(
                          toolbarItem.active
                            ? 'bg-gray-50 text-blue-500'
                            : 'bg-white text-gray-600',
                          'hover:bg-gray-50 hover:text-blue-500 cursor-pointer pointer-events-auto px-4 py-2 text-sm w-full flex items-center whitespace-nowrap'
                        )}
                      >
                        <div className="mr-2 opacity-80">
                          {toolbarItem.Icon}
                        </div>{' '}
                        {toolbarItem.label}
                      </span>
                    )
                  })}
                </div>
              )}
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
