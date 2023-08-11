import React from 'react'

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

import * as Popover from '@radix-ui/react-popover'

export const OverflowMenu = ({ toolbarItems, className = 'w-full' }) => {
  return (
    <Popover.Root>
      <Popover.Trigger
        className={`cursor-pointer relative justify-center inline-flex items-center p-3 text-sm font-medium focus:outline-1 focus:outline-blue-200 pointer-events-auto ${
          open ? `text-blue-400` : `text-gray-300 hover:text-blue-500`
        } ${className}}`}
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
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content style={{ zIndex: 20000 }} align="end">
          <div className="mt-0 -mr-1 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1">
            {toolbarItems.map((toolbarItem) => {
              return (
                <span
                  data-test={`${toolbarItem.name}OverflowButton`}
                  key={toolbarItem.name}
                  onMouseDown={(event) => {
                    event.preventDefault()
                    toolbarItem.onMouseDown(event)
                  }}
                  className={classNames(
                    toolbarItem.active
                      ? 'bg-gray-50 text-blue-500'
                      : 'bg-white text-gray-600',
                    'hover:bg-gray-50 hover:text-blue-500 cursor-pointer pointer-events-auto px-4 py-2 text-sm w-full flex items-center whitespace-nowrap'
                  )}
                >
                  <div className="mr-2 opacity-80">{toolbarItem.Icon}</div>{' '}
                  {toolbarItem.label}
                </span>
              )
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
