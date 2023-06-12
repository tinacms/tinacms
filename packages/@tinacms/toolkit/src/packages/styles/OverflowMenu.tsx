/**



*/

// Copied form packages/@tinacms/toolkit/src/packages/fields/plugins/MdxFieldPlugin/updated/plate/plugins/ui/toolbar/overflow-menu.tsx but used in a different way

import React, { Fragment } from 'react'
import { Popover, Transition } from '@headlessui/react'

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export const OverflowMenu = ({ toolbarItems, className = 'w-full' }) => {
  return (
    <Popover as="div" className={`relative block ${className}`}>
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
            <Popover.Panel className="absolute z-20 origin-top-right right-0">
              {({ close }) => (
                <div className="mt-0 -mr-1 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none py-1">
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
