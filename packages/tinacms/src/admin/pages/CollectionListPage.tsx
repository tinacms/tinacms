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
import { BiEdit, BiPlus } from 'react-icons/bi'
import { useParams, useLocation, Link } from 'react-router-dom'
import { Menu, Transition } from '@headlessui/react'

import GetCMS from '../components/GetCMS'
import GetCollection from '../components/GetCollection'
import type { Collection, Template } from '../types'

import type { TinaCMS } from '@tinacms/toolkit'
import { RouteMappingPlugin } from '../plugins/route-mapping'
import { PageWrapper, PageHeader, PageBody } from '../components/Page'

const TemplateMenu = ({ templates }: { templates: Template[] }) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      {({ open }) => (
        <div>
          <div>
            <Menu.Button className="icon-parent inline-flex items-center font-medium focus:outline-none focus:ring-2 focus:shadow-outline text-center rounded-full justify-center transition-all duration-150 ease-out  shadow text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-500 text-sm h-10 px-6">
              Create New <BiPlus className="w-5 h-full ml-1 opacity-70" />
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
                <PageWrapper>
                  <>
                    <PageHeader>
                      <>
                        <h3 className="text-2xl text-gray-700">
                          {collection.label}
                        </h3>
                        {!collection.templates && (
                          <Link
                            to={`${location.pathname}/new`}
                            className="icon-parent inline-flex items-center font-medium focus:outline-none focus:ring-2 focus:shadow-outline text-center rounded-full justify-center transition-all duration-150 ease-out  shadow text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-500 text-sm h-10 px-6"
                          >
                            Create New{' '}
                            <BiPlus className="w-5 h-full ml-1 opacity-70" />
                          </Link>
                        )}
                        {collection.templates && (
                          <TemplateMenu templates={collection.templates} />
                        )}
                      </>
                    </PageHeader>
                    <PageBody>
                      <div className="w-full mx-auto max-w-screen-xl">
                        {totalCount > 0 && (
                          <table className="shadow overflow-hidden border-b border-gray-200 w-full max-w-full rounded-lg">
                            <tbody className="bg-white divide-y divide-gray-150">
                              {documents.map((document) => {
                                // const documentRoute = routeMapping
                                //   ? routeMapping.mapper(
                                //       collection,
                                //       document.node
                                //     )
                                //   : `${document.node.sys.filename}`
                                return (
                                  <tr
                                    key={`document-${document.node.sys.filename}`}
                                  >
                                    <td className="px-6 py-2 whitespace-nowrap">
                                      <Link
                                        className="text-blue-600 hover:text-blue-400 flex items-center gap-3"
                                        to={`${document.node.sys.filename}`}
                                      >
                                        <BiEdit className="inline-block h-6 w-auto opacity-70" />
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
                                )
                              })}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </PageBody>
                  </>
                </PageWrapper>
              )
            }}
          </GetCollection>
        )
      }}
    </GetCMS>
  )
}

export default CollectionListPage
