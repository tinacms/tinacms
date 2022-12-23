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

import * as React from 'react'
import { AddIcon } from '../../../../icons'
import { IconButton } from '../../../../styles'
import { Popover, Transition } from '@headlessui/react'
import { Template } from '@tinacms/schema-tools'

export const BlockSelector = ({
  templates,
  addItem,
}: {
  templates: Template[]
  addItem: any
}) => {
  const showFilter = React.useMemo(() => {
    return Object.entries(templates).length > 6
  }, [templates])
  const [filter, setFilter] = React.useState('')
  const filteredBlocks = React.useMemo(() => {
    return templates.filter((template) => {
      return template.label
        ? template.label.toLowerCase().includes(filter.toLowerCase()) ||
            template.name.toLowerCase().includes(filter.toLowerCase())
        : template.name.toLowerCase().includes(filter.toLowerCase())
    })
  }, [filter])

  return (
    <Popover>
      {({ open }) => (
        <div className="relative">
          <Popover.Button as={'span'}>
            <IconButton
              variant={open ? 'secondary' : 'primary'}
              size="small"
              className={`${open ? `rotate-45 pointer-events-none` : ``}`}
            >
              <AddIcon className="w-5/6 h-auto" />
            </IconButton>
          </Popover.Button>
          <div className="transform translate-y-full absolute -bottom-1 right-0 z-50">
            <Transition
              enter="transition duration-150 ease-out"
              enterFrom="transform opacity-0 -translate-y-2"
              enterTo="transform opacity-100 translate-y-0"
              leave="transition duration-75 ease-in"
              leaveFrom="transform opacity-100 translate-y-0"
              leaveTo="transform opacity-0 -translate-y-2"
            >
              <Popover.Panel className="relative overflow-hidden rounded-lg shadow-lg bg-white border border-gray-100">
                {({ close }) => (
                  <div className="min-w-[192px] max-h-[24rem] overflow-y-auto flex flex-col w-full h-full">
                    {showFilter && (
                      <div className="sticky top-0 bg-gray-50 p-2 border-b border-gray-100 z-10">
                        <input
                          type="text"
                          className="bg-white text-xs rounded-sm border border-gray-100 shadow-inner py-1 px-2 w-full block placeholder-gray-200"
                          onClick={(event: any) => {
                            event.stopPropagation()
                            event.preventDefault()
                          }}
                          value={filter}
                          onChange={(event: any) => {
                            setFilter(event.target.value)
                          }}
                          placeholder="Filter..."
                        />
                      </div>
                    )}
                    {filteredBlocks.length === 0 && (
                      <span className="relative text-center text-xs px-2 py-3 text-gray-300 bg-gray-50 italic">
                        No matches found
                      </span>
                    )}
                    {filteredBlocks.length > 0 &&
                      filteredBlocks.map((template) => (
                        <button
                          className="relative text-center text-xs py-2 px-4 border-l-0 border-t-0 border-r-0 border-b border-gray-50 w-full outline-none transition-all ease-out duration-150 hover:text-blue-500 focus:text-blue-500 focus:bg-gray-50 hover:bg-gray-50"
                          key={template.name}
                          onClick={() => {
                            addItem(template)
                            setFilter('')
                            close()
                          }}
                        >
                          {template.label ? template.label : template.name}
                        </button>
                      ))}
                  </div>
                )}
              </Popover.Panel>
            </Transition>
          </div>
        </div>
      )}
    </Popover>
  )
}
