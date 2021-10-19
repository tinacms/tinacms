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

import type { TinaCMS } from '@tinacms/toolkit'

import useGetCollection, { Collection } from '../hooks/useGetCollection'
import GetCMS from '../components/GetCMS'

const GetCollection = ({
  cms,
  collectionName,
  children,
}: {
  cms: TinaCMS
  collectionName: string
  children: any
}) => {
  const collection = useGetCollection(cms, collectionName)
  if (!collection) {
    return null
  }
  return <>{children(collection)}</>
}

const CollectionListPage = () => {
  const location = useLocation()
  const { collectionName } = useParams()

  return (
    <GetCMS>
      {(cms: TinaCMS) => (
        <GetCollection cms={cms} collectionName={collectionName}>
          {(collection: Collection) => (
            <div className="px-6 py-14 h-screen overflow-y-auto flex justify-center">
              <div className="max-w-screen-md w-full">
                <div className="w-full flex justify-between items-end">
                  <h3 className="text-4xl">{collection.label}</h3>
                  <Link
                    to={`${location.pathname}/create`}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base leading-5 font-medium rounded-full text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue focus:border-blue-700 active:bg-blue-700 transition duration-150 ease-in-out"
                  >
                    Create New
                  </Link>
                </div>
              </div>
            </div>
          )}
        </GetCollection>
      )}
    </GetCMS>
  )
}

export default CollectionListPage
