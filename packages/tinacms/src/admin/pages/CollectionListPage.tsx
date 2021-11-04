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
import { BiEdit } from 'react-icons/bi'
import { useParams, useLocation, Link } from 'react-router-dom'
import { Menu, Transition } from '@headlessui/react'

import GetCMS from '../components/GetCMS'
import GetCollection, {
  Collection,
  Template,
} from '../components/GetCollection'

import type { TinaCMS } from '@tinacms/toolkit'

const TemplateMenu = ({ templates }: { templates: Template[] }) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      {({ open }) => (
        <div>
          <div>
            <Menu.Button
              className="inline-flex items-center px-8 py-2.5 shadow-sm border border-transparent text-sm leading-4 font-medium rounded-full text-white hover:opacity-80 focus:outline-none focus:shadow-outline-blue  transition duration-150 ease-out"
              style={{ background: '#0084FF' }}
            >
              Create New
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`ml-1 flex-0 inline-block opacity-50 group-hover:opacity-80 transition-all duration-300 ease-in-out transform ${
                  open ? `rotate-90 opacity-100` : `rotate-0`
                }`}
              >
                <g opacity="1.0">
                  <path
                    d="M7.91675 13.8086L9.16675 15.0586L14.2253 10L9.16675 4.9414L7.91675 6.1914L11.7253 10L7.91675 13.8086Z"
                    fill="currentColor"
                  />
                </g>
              </svg>
            </Menu.Button>
          </div>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                {templates.map((template) => (
                  <Menu.Item key={`${template.label}-${template.name}`}>
                    {({ active }) => (
                      <Link
                        to={`${location.pathname}/${template.name}/new`}
                        className={`w-full text-md px-4 py-2 tracking-wide flex items-center opacity-80 text-gray-600 ${
                          active && 'text-gray-800 opacity-100'
                        }`}
                      >
                        {template.label}
                      </Link>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Transition>
        </div>
      )}
    </Menu>
  )
}

const CollectionListPage = () => {
  const location = useLocation()
  const { collectionName } = useParams()

  return (
    <GetCMS>
      {(cms: TinaCMS) => (
        <GetCollection
          cms={cms}
          collectionName={collectionName}
          includeDocuments
        >
          {(collection: Collection) => {
            const totalCount = collection.documents.totalCount
            const documents = collection.documents.edges

            return (
              <div className="px-6 py-14 h-screen overflow-y-auto flex justify-center">
                <div className="max-w-screen-md w-full">
                  <div className="w-full flex justify-between items-end">
                    <h3 className="text-3xl">{collection.label}</h3>
                    {!collection.templates && (
                      <Link
                        to={`${location.pathname}/new`}
                        className="inline-flex items-center px-8 py-3 shadow-sm border border-transparent text-sm leading-4 font-medium rounded-full text-white hover:opacity-80 focus:outline-none focus:shadow-outline-blue  transition duration-150 ease-out"
                        style={{ background: '#0084FF' }}
                      >
                        Create New
                      </Link>
                    )}
                    {collection.templates && (
                      <TemplateMenu templates={collection.templates} />
                    )}
                  </div>

                  {totalCount > 0 && (
                    <div className="mt-8 shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                      <table className="min-w-full">
                        <tbody className="bg-white divide-y divide-gray-150">
                          {documents.map((document) => (
                            <tr key={document.node.sys.relativePath}>
                              <td className="px-6 py-2 whitespace-nowrap">
                                <Link
                                  to={`${location.pathname}/${document.node.sys.filename}`}
                                  className="text-blue-600 hover:text-blue-400 flex items-center gap-3"
                                >
                                  <BiEdit className="inline-block h-6 w-auto opacity-70" />{' '}
                                  <span>
                                    <span className="block text-xs text-gray-400 mb-1 uppercase">
                                      Filename
                                    </span>
                                    <span className="h-5 leading-5 block whitespace-nowrap">
                                      {document.node.sys.filename}
                                    </span>
                                  </span>
                                </Link>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="block text-xs text-gray-400 mb-1 uppercase">
                                  Extension
                                </span>
                                <span className="h-5 leading-5 block text-sm font-medium text-gray-900">
                                  {document.node.sys.extension}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="block text-xs text-gray-400 mb-1 uppercase">
                                  Template
                                </span>
                                <span className="h-5 leading-5 block text-sm font-medium text-gray-900">
                                  {document.node.sys.template}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )
          }}
        </GetCollection>
      )}
    </GetCMS>
  )
}

export default CollectionListPage
