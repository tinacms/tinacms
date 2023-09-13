import * as React from 'react'
import { Fragment } from 'react'
import { ToolbarIcon } from '../icons'
import { Popover, Transition } from '@headlessui/react'
import { classNames } from '../helpers'

export const OverflowMenu = ({ toolbarItems, itemsShown, showEmbed }) => {
  return (
    <Popover as="span" className="relative z-10 block w-full">
      <Popover.Button
        data-test="popoverRichTextButton"
        as="span"
        className={`cursor-pointer relative w-full justify-center inline-flex border border-gray-200 focus:border-blue-500 items-center px-2 py-2 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 pointer-events-auto ${
          showEmbed ? `rounded-none` : `rounded-r-md`
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
            <div className="origin-top-right absolute right-0 mt-2 -mr-1 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none py-1">
              {toolbarItems.map((toolbarItem, index) => {
                if (index < itemsShown - 1) {
                  return null
                }
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
                      'hover:bg-gray-50 hover:text-blue-500 cursor-pointer pointer-events-auto px-4 py-2 text-sm w-full flex items-center'
                    )}
                  >
                    <div className="mr-2 opacity-80">
                      <ToolbarIcon name={toolbarItem.name} />
                    </div>{' '}
                    {toolbarItem.label}
                  </span>
                )
              })}
            </div>
          )}
        </Popover.Panel>
      </Transition>
    </Popover>
  )
}
