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
import { BiEdit } from 'react-icons/bi'
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
                  <div className="mt-8 shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full">
                      <tbody className="bg-white divide-y divide-gray-150">
                        {documents.map((document) => (
                          <tr key={document.node.sys.relativePath}>
                            <td className="px-6 py-2 whitespace-nowrap">
                              <Link
                                to={`${location.pathname}/edit/${document.node.sys.filename}`}
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
