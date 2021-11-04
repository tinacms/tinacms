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
import { BiEdit, BiLinkExternal } from 'react-icons/bi'
import { useParams, useLocation, Link } from 'react-router-dom'
import { Menu, Transition } from '@headlessui/react'

import GetCMS from '../components/GetCMS'
import GetCollection, {
  Collection,
  Template,
} from '../components/GetCollection'

import type { TinaCMS } from '@tinacms/toolkit'
import { RouteMappingPlugin } from '../plugins/route-mapping'

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
      {(cms: TinaCMS) => {
        /**
         * Retrieve the Route Mapping Plugin, if any.
         */
        const plugins = cms.plugins.all<RouteMappingPlugin>('tina-admin')
        const routeMapping = plugins.find(
          ({ name }) => name === 'route-mapping'
        )

        return (
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
                            {documents.map((document) => {
                              const livesiteRoute = routeMapping
                                ? routeMapping.mapper(collection, document.node)
                                : undefined

                              return (
                                <tr key={document.node.sys.relativePath}>
                                  <td className="px-5 py-3 whitespace-nowrap">
                                    <span className="block text-xs mb-0.5 text-gray-400 uppercase">
                                      Filename
                                    </span>
                                    <Link
                                      to={`${location.pathname}/${document.node.sys.filename}`}
                                      className="h-5 leading-5 block"
                                    >
                                      <span className="leading-5 font-medium text-base overflow-ellipsis overflow-hidden whitespace-nowrap text-gray-700">
                                        {document.node.sys.filename}
                                      </span>
                                      <span className="leading-5 text-base font-medium text-gray-300">
                                        {document.node.sys.extension}
                                      </span>
                                    </Link>
                                  </td>
                                  <td className="px-5 py-3 whitespace-nowrap">
                                    <span className="block text-xs mb-0.5 text-gray-400 uppercase">
                                      Template
                                    </span>
                                    <span className="h-5 block leading-5 font-regular text-base overflow-ellipsis overflow-hidden whitespace-nowrap text-gray-500">
                                      {document.node.sys.template}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3 whitespace-nowrap flex gap-3 items-center justify-end">
                                    {livesiteRoute && (
                                      <a
                                        href={livesiteRoute}
                                        className="flex gap-1.5 items-center px-4 py-1.5 rounded-full transition-all ease-out duration-150 text-gray-500 hover:text-blue-500"
                                      >
                                        <BiLinkExternal className="inline-block h-5 w-auto opacity-70" />{' '}
                                        View
                                      </a>
                                    )}
                                    <Link
                                      to={`${location.pathname}/${document.node.sys.filename}`}
                                      className="flex gap-1.5 items-center px-4 py-1.5 rounded-full border border-gray-150 transition-all ease-out duration-150 text-gray-700  hover:bg-gray-50 hover:text-blue-500"
                                    >
                                      <BiEdit className="inline-block h-5 w-auto opacity-70" />{' '}
                                      Edit
                                    </Link>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )
            }}
          </GetCollection>
        )
      }}
    </GetCMS>
  )
}

export default CollectionListPage
