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

import React from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'

import GetCMS from '../components/GetCMS'
import GetCollection, { Collection } from '../components/GetCollection'

import type { TinaCMS } from '@tinacms/toolkit'

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
              <>
                <div className="w-full flex justify-between items-end">
                  <h3 className="text-4xl">{collection.label}</h3>
                  <Link
                    to={`${location.pathname}/new`}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base leading-5 font-medium rounded-full text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue focus:border-blue-700 active:bg-blue-700 transition duration-150 ease-in-out"
                  >
                    Create New
                  </Link>
                </div>

                {totalCount > 0 && (
                  <div className="mt-5 flex flex-col">
                    <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                      <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Filename
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Extension
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                  <span className="sr-only">Edit</span>
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {documents.map((document) => (
                                <tr key={document.node.sys.relativePath}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {document.node.sys.filename}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {document.node.sys.extension}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link
                                      to={`${location.pathname}/edit/${document.node.sys.filename}`}
                                      className="text-indigo-600 hover:text-indigo-900"
                                    >
                                      Edit
                                    </Link>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )
          }}
        </GetCollection>
      )}
    </GetCMS>
  )
}

export default CollectionListPage
