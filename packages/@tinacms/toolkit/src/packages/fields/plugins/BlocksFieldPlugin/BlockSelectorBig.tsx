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
import { AddIcon } from '../../../icons'
import { IconButton } from '../../../styles'
import { Disclosure, Transition } from '@headlessui/react'
import { useFormPortal } from '../../../form-builder'
import { PanelHeader } from '../GroupFieldPlugin'
import { BlockTemplate } from '.'
import { MdKeyboardArrowDown, MdOutlineClear } from 'react-icons/md'
import { BiSearch } from 'react-icons/bi'

export const BlockSelectorBig = ({
  templates,
  addItem,
  label,
}: {
  templates: {
    [key: string]: BlockTemplate
  }
  addItem: any
  label: string
}) => {
  const FormPortal = useFormPortal()
  const [pickerIsOpen, setPickerIsOpen] = React.useState(false)

  const showFilter = React.useMemo(() => {
    return Object.entries(templates).length > 6
  }, [templates])
  const [filter, setFilter] = React.useState('')
  const filteredTemplates = React.useMemo(() => {
    return Object.entries(templates).filter(([name, template]) => {
      return template.label
        ? template.label.toLowerCase().includes(filter.toLowerCase()) ||
            name.toLowerCase().includes(filter.toLowerCase())
        : name.toLowerCase().includes(filter.toLowerCase())
    })
  }, [filter])

  const categories = React.useMemo(() => {
    return [
      //@ts-ignore
      ...new Set(
        Object.entries(templates)
          .filter(([name, template]) => {
            //@ts-ignore
            return template.category ? template.category : false
          })
          .map(([name, template]) => {
            //@ts-ignore
            return template.category
          })
      ),
    ]
  }, [templates])
  const hasUncategorized = React.useMemo(() => {
    return (
      Object.entries(templates).filter(([name, template]) => {
        //@ts-ignore
        return !template.category
      }).length > 0
    )
  }, [templates])
  const uncategorized = React.useMemo(() => {
    return filteredTemplates.filter(([name, template]) => {
      //@ts-ignore
      return !template.category
    })
  }, [filteredTemplates])

  const close = (name, template) => {
    if (name && template) {
      addItem(name, template)
    }
    setFilter('')
    setPickerIsOpen(false)
  }

  return (
    <>
      <IconButton
        variant={pickerIsOpen ? 'secondary' : 'primary'}
        size="small"
        className={`${pickerIsOpen ? `rotate-45 pointer-events-none` : ``}`}
        onClick={() => setPickerIsOpen(!pickerIsOpen)}
      >
        <AddIcon className="w-5/6 h-auto" />
      </IconButton>
      <FormPortal>
        {({ zIndexShift }) => (
          <Transition show={pickerIsOpen}>
            <Transition.Child
              as={React.Fragment}
              enter="transform transition-all ease-out duration-200"
              enterFrom="opacity-0 -translate-x-1/2"
              enterTo="opacity-100 translate-x-0"
              leave="transform transition-all ease-in duration-150"
              leaveFrom="opacity-100 translate-x-0"
              leaveTo="opacity-0 -translate-x-1/2"
            >
              <div
                className="absolute left-0 top-0 z-panel h-full w-full transform bg-gray-50"
                style={{ zIndex: zIndexShift + 1000 }}
              >
                <PanelHeader
                  onClick={() => {
                    setPickerIsOpen(false)
                  }}
                >
                  {label} ⁠– Add New
                </PanelHeader>
                <div className="h-full overflow-y-auto max-h-full bg-gray-50 pt-4 px-6 pb-12">
                  <div className="w-full flex justify-center">
                    <div className="w-full max-w-form">
                      {showFilter && (
                        <div className="block relative group mb-1">
                          <input
                            type="text"
                            className={
                              'shadow-inner focus:shadow-outline focus:border-blue-400 focus:outline-none block text-sm pl-2.5 pr-8 py-1.5 text-gray-600 w-full bg-white border border-gray-200 focus:text-gray-900 rounded-md placeholder-gray-400 hover:placeholder-gray-600 transition-all ease-out duration-150'
                            }
                            onClick={(event: any) => {
                              event.stopPropagation()
                              event.preventDefault()
                            }}
                            value={filter}
                            onChange={(event: any) => {
                              setFilter(event.target.value)
                            }}
                            placeholder="Search"
                          />
                          {filter === '' ? (
                            <BiSearch className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-auto text-blue-500 opacity-70 group-hover:opacity-100 transition-all ease-out duration-150" />
                          ) : (
                            <button
                              onClick={() => {
                                setFilter('')
                              }}
                              className="outline-none focus:outline-none bg-transparent border-0 p-0 m-0 absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-all ease-out duration-150"
                            >
                              <MdOutlineClear className="w-5 h-auto text-gray-600" />
                            </button>
                          )}
                        </div>
                      )}
                      {uncategorized.length === 0 &&
                        categories.length === 0 && (
                          <EmptyState>No blocks to display.</EmptyState>
                        )}
                      {uncategorized.length > 0 && categories.length === 0 && (
                        <CardColumns className="pt-3">
                          {uncategorized.map(([name, template]) => (
                            <BlockCard
                              key={`${template}-${name}`}
                              close={close}
                              name={name}
                              template={template}
                            />
                          ))}
                        </CardColumns>
                      )}
                      {categories.map((category, index) => {
                        return (
                          <BlockGroup
                            key={index}
                            templates={filteredTemplates.filter(
                              ([name, template]) => {
                                //@ts-ignore
                                return template.category &&
                                  //@ts-ignore
                                  template.category === category
                                  ? true
                                  : false
                              }
                            )}
                            category={category}
                            isLast={
                              index === categories.length - 1 &&
                              !hasUncategorized
                            }
                            close={close}
                          />
                        )
                      })}
                      {hasUncategorized && uncategorized.length === 0 && (
                        <div className="relative text-gray-500 block text-left w-full text-base font-bold tracking-wide py-2 truncate pointer-events-none opacity-50">
                          Uncategorized
                        </div>
                      )}
                      {uncategorized.length > 0 && categories.length > 0 && (
                        <BlockGroup
                          templates={uncategorized}
                          category="Uncategorized"
                          close={close}
                          isLast={true}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </Transition>
        )}
      </FormPortal>
    </>
  )
}

const BlockGroup = ({ category, templates, close, isLast = false }) => {
  return (
    <Disclosure
      defaultOpen={true}
      as="div"
      className={`left-0 right-0 relative`}
    >
      {({ open }) => (
        <>
          <Disclosure.Button
            className={`relative block group text-left w-full text-base font-bold tracking-wide py-2 truncate ${
              templates.length === 0 ? `pointer-events-none` : ``
            } ${
              !isLast &&
              (!open || templates.length === 0) &&
              `border-b border-gray-100`
            }`}
          >
            <span
              className={`text-gray-500 group-hover:text-gray-800 transition-all ease-out duration-150 ${
                templates.length === 0 ? `opacity-50` : ``
              }`}
            >
              {category}
            </span>
            {templates.length > 0 && (
              <MdKeyboardArrowDown
                className={`absolute top-1/2 right-0 w-6 h-auto -translate-y-1/2 text-gray-300 origin-center group-hover:text-blue-500 transition-all duration-150 ease-out ${
                  open ? `` : `-rotate-90 opacity-70 group-hover:opacity-100`
                }`}
              />
            )}
          </Disclosure.Button>

          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Disclosure.Panel>
              {templates.length > 0 && (
                <CardColumns>
                  {templates.map(([name, template]) => (
                    <BlockCard close={close} name={name} template={template} />
                  ))}
                </CardColumns>
              )}
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  )
}

const CardColumns = ({ children, className = '' }) => {
  return (
    <div
      className={`w-full mb-1 -mt-2 ${className}`}
      style={{ columns: '320px', columnGap: '16px' }}
    >
      {children}
    </div>
  )
}

const BlockCard = ({ close, name, template }) => {
  return (
    <button
      className="mb-2 mt-2 group relative text-xs font-bold border border-gray-100 w-full outline-none transition-all ease-out duration-150 hover:text-blue-500 focus:text-blue-500 focus:bg-gray-50 hover:bg-gray-50 rounded-md bg-white shadow overflow-hidden"
      style={{ breakInside: 'avoid', transform: 'translateZ(0)' }}
      key={name}
      onClick={() => {
        close(name, template)
      }}
    >
      {template.previewSrc && (
        <img
          src={template.previewSrc}
          className="w-full h-auto transition-all ease-out duration-150 group-hover:opacity-50"
        />
      )}
      <span
        className={`relative flex justify-between items-center gap-4 w-full px-4 text-left ${
          template.previewSrc ? `py-2 border-t border-gray-100 ` : `py-3`
        }`}
      >
        {template.label ? template.label : name}
        <AddIcon className="w-5 h-auto group-hover:text-blue-500 opacity-30 transition-all ease-out duration-150 group-hover:opacity-80" />
      </span>
    </button>
  )
}

const EmptyState = ({ children }) => {
  return (
    <div className="block relative text-gray-300 italic py-1">{children}</div>
  )
}
